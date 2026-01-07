

import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { PracticeQuestion, PracticeTestResultItem, Subject, ExamLevel, Country, QuestionType } from '../types';

// Ensure API key is available in the environment where the server-side code runs
// The client-side UI no longer manages or prompts for the API key directly.
if (!process.env.API_KEY) {
  console.warn('API_KEY is not set in the environment. AI services may not function.');
}

// Function to initialize GoogleGenAI. Assumes process.env.API_KEY is available.
const getGeminiClient = () => {
  if (!process.env.API_KEY) {
    // In a real Android/iOS app, this error would be handled by the backend or a more robust client-side error mechanism.
    throw new Error("AI service backend is not configured. Please contact support.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

interface GenerateTextOptions {
  prompt: string;
  model?: string;
  imageData?: string; // base64 image data
  imageMimeType?: string; // e.g., 'image/png', 'image/jpeg'
}

// Generic function for text generation, now supporting multimodal input
export async function generateText({ prompt, model = 'gemini-3-flash-preview', imageData, imageMimeType }: GenerateTextOptions): Promise<string> {
  try {
    const ai = getGeminiClient();
    const contents: any[] = [{ text: prompt }];

    if (imageData && imageMimeType) {
      contents.unshift({ // Add image at the beginning of contents
        inlineData: {
          mimeType: imageMimeType,
          data: imageData,
        },
      });
      // Use a more capable model for multimodal input if not explicitly specified
      if (model === 'gemini-3-flash-preview') { // Default to flash, upgrade if image is present
        model = 'gemini-3-pro-preview'; // Pro model for better multimodal understanding
      }
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: { parts: contents }, // Ensure it's passed as parts for multimodal
    });
    return response.text || 'No response generated.';
  } catch (error: any) {
    console.error('Error generating text from Gemini:', error);
    // Generic error message for the user, as API key management is no longer client-side.
    throw new Error(`Failed to get AI response. Please try again. If the issue persists, contact support. (${error.message || 'Unknown error'})`);
  }
}

// Function to generate practice questions in JSON format
export async function generatePracticeQuestions(
  subject: Subject,
  topic: string,
  examLevel: ExamLevel,
  country: Country,
  questionType: QuestionType, // New parameter for question type
  numQuestions: number = 3,
): Promise<PracticeQuestion[]> {
  let prompt = `Generate ${numQuestions} practice questions for a child studying ${subject} for the ${examLevel} exam in ${country}, specifically on the topic of ${topic}.
  The questions should be appropriate for this age group, subject difficulty, and exam context.`;

  const questionSchemaProperties: { [key: string]: any } = {
    id: { type: Type.STRING },
    question: { type: Type.STRING },
    subject: { type: Type.STRING },
    topic: { type: Type.STRING },
    examLevel: { type: Type.STRING },
    country: { type: Type.STRING },
    type: { type: Type.STRING }, // Always include type
  };
  const questionSchemaRequired: string[] = ['id', 'question', 'subject', 'topic', 'examLevel', 'country', 'type'];

  if (questionType === QuestionType.MULTIPLE_CHOICE) {
    prompt += ` Generate them as multiple-choice questions with 4 distinct options each.`;
    questionSchemaProperties.options = {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'An array of 4 distinct answer options for multiple choice questions.',
    };
    questionSchemaRequired.push('options');
  } else if (questionType === QuestionType.TRUE_FALSE) {
    prompt += ` Generate them as True/False questions.`;
    questionSchemaProperties.options = {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'An array containing "True" and "False" as options.',
    };
    questionSchemaRequired.push('options');
  } else { // Short Answer
    prompt += ` Generate them as short-answer questions.`;
  }

  prompt += ` Return the questions as a JSON array where each object has the necessary fields. Do NOT include correct answers.`;

  try {
    const ai = getGeminiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro model for better question generation
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: questionSchemaProperties,
            required: questionSchemaRequired,
          },
        },
      },
    });

    const jsonStr = response.text.trim();
    const parsedQuestions = JSON.parse(jsonStr) as PracticeQuestion[];

    // Ensure 'type' is correctly set for all parsed questions
    return parsedQuestions.map(q => ({
      ...q,
      type: questionType, // Force the type based on user selection
      // For True/False, ensure options are always ["True", "False"] if model sometimes deviates
      options: questionType === QuestionType.TRUE_FALSE ? ["True", "False"] : q.options,
    }));

  } catch (error: any) {
    console.error('Error generating practice questions:', error);
    throw new Error(`Failed to generate practice questions. Please try again. If the issue persists, contact support. (${error.message || 'Unknown error'})`);
  }
}

// Function to review practice answers and provide solutions
export async function reviewPracticeAnswer(
  question: string,
  userAnswer: string,
  subject: Subject,
  examLevel: ExamLevel,
  country: Country,
): Promise<{ correctAnswer: string; explanation: string; isCorrect: boolean }> {
  const prompt = `Review the following practice question and user answer for a ${subject} student preparing for ${examLevel} in ${country}.
  Question: "${question}"
  User's Answer: "${userAnswer}"

  Please provide:
  1. The correct answer.
  2. A clear, child-friendly explanation for the correct answer, considering the ${examLevel} level.
  3. A boolean indicating if the user's answer is correct (true/false).
  Return this as a JSON object with keys: 'correctAnswer', 'explanation', 'isCorrect'.`;

  try {
    const ai = getGeminiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro model for detailed explanations
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            isCorrect: { type: Type.BOOLEAN },
          },
          required: ['correctAnswer', 'explanation', 'isCorrect'],
        },
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as { correctAnswer: string; explanation: string; isCorrect: boolean };
  } catch (error: any) {
    console.error('Error reviewing practice answer:', error);
    throw new Error(`Failed to review answer. Please try again. If the issue persists, contact support. (${error.message || 'Unknown error'})`);
  }
}

// Function to generate an exam study plan
export async function generateStudyPlan(
  examLevel: ExamLevel,
  subject: Subject,
  country: Country,
  curriculumTopics: string[] = [] // New optional parameter for specific curriculum topics
): Promise<string> {
  // All plans are now comprehensive and use the pro model
  const model = 'gemini-3-pro-preview';
  const planDetailLevel = 'comprehensive and highly detailed';
  let prompt = `Create a ${planDetailLevel}, child-friendly study plan for a student preparing for ${examLevel} in ${subject} in ${country}.`;

  if (curriculumTopics && curriculumTopics.length > 0) {
    prompt += ` The plan should focus on these key topics: ${curriculumTopics.join(', ')}.`;
  }

  prompt += `
  The plan should include:
  - Key topics to cover relevant to this exam and country.
  - Suggested activities (e.g., flashcards, practice questions, reading).
  - A suggested weekly structure or timeline.
  - Tips for effective revision.
  - Encouraging words!
  Present the plan in an easy-to-read Markdown format.`;

  try {
    const ai = getGeminiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || 'Could not generate a study plan.';
  } catch (error: any) {
    console.error('Error generating study plan:', error);
    throw new Error(`Failed to generate study plan. Please try again. If the issue persists, contact support. (${error.message || 'Unknown error'})`);
  }
}

// Helper to convert Blob to Base64
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // The result will be a Data URL (e.g., "data:image/png;base64,...")
      // We only need the base64 part, so split it.
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}