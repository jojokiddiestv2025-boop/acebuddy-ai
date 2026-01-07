

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Button from './Button';
import Select from './Select';
import Input from './Input';
import LoadingSpinner from './LoadingSpinner';
import { PracticeQuestion, Subject, ExamLevel, UserPracticeAnswer, PracticeTestResultItem, Country, QuestionType } from '../types';
import { generatePracticeQuestions, reviewPracticeAnswer } from '../services/geminiService';
import { EXAM_LEVELS_BY_COUNTRY, SUBJECTS, CURRICULUM_TOPICS, AI_COMPANION_NAME, COUNTRIES, QUESTION_TYPES } from '../constants';
import ReactMarkdown from 'react-markdown';

interface PracticeTestProps {
  onBack: () => void;
  // `isPremium` and `onActivatePremium` props are removed as premium features are no longer present.
}

const PracticeTest: React.FC<PracticeTestProps> = ({ onBack }) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(Country.UK);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(Subject.MATH);
  const [selectedExamLevel, setSelectedExamLevel] = useState<ExamLevel>(ExamLevel.GCSE); // Default to GCSE
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType>(QuestionType.SHORT_ANSWER); // New state for question type
  const [numQuestions, setNumQuestions] = useState<number>(10); // Default to a reasonable number for all tests

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [testResults, setTestResults] = useState<PracticeTestResultItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const availableExamLevels = useMemo(() => {
    return EXAM_LEVELS_BY_COUNTRY[selectedCountry] || [];
  }, [selectedCountry]);

  // Dynamically get topics based on country, exam level, and subject
  const availableTopics = useMemo(() => {
    const topics = CURRICULUM_TOPICS[selectedCountry]?.[selectedExamLevel]?.[selectedSubject] || [];
    return topics.map(topic => ({ value: topic, label: topic }));
  }, [selectedCountry, selectedExamLevel, selectedSubject]);

  // Update selectedExamLevel when country changes to a valid default for that country
  useEffect(() => {
    if (availableExamLevels.length > 0) {
      // Find a default if current selected level is not in the new country's list
      const currentLevelExistsInNewCountry = availableExamLevels.some(level => level.value === selectedExamLevel);
      if (!currentLevelExistsInNewCountry) {
        let newDefaultLevel: ExamLevel = availableExamLevels[0].value;
        // Prioritize specific defaults if available for a smoother UX
        if (selectedCountry === Country.NIGERIA && availableExamLevels.some(l => l.value === ExamLevel.JUNIOR_WAEC)) {
          newDefaultLevel = ExamLevel.JUNIOR_WAEC;
        } else if (selectedCountry === Country.USA && availableExamLevels.some(l => l.value === ExamLevel.GENERIC_HIGH_SCHOOL)) {
          newDefaultLevel = ExamLevel.GENERIC_HIGH_SCHOOL;
        } else if (selectedCountry === Country.INDIA && availableExamLevels.some(l => l.value === ExamLevel.CBSE)) {
          newDefaultLevel = ExamLevel.CBSE;
        } else if (selectedCountry === Country.UK && availableExamLevels.some(l => l.value === ExamLevel.GCSE)) {
          newDefaultLevel = ExamLevel.GCSE;
        }
        setSelectedExamLevel(newDefaultLevel);
      }
    } else {
      setSelectedExamLevel(ExamLevel.OTHER); // Fallback if no levels for a country
    }
  }, [selectedCountry, availableExamLevels, selectedExamLevel]);


  // Set default topic when subject, exam level, or country changes
  useEffect(() => {
    // Check if the currently selected topic is still valid for the new selection
    const currentTopicIsValid = availableTopics.some(t => t.value === selectedTopic);

    if (availableTopics.length > 0 && !currentTopicIsValid) {
      setSelectedTopic(availableTopics[0].value); // Set to the first available topic
    } else if (availableTopics.length === 0) {
      setSelectedTopic(''); // Clear if no topics are available
    }
  }, [selectedCountry, selectedExamLevel, selectedSubject, availableTopics, selectedTopic]);

  const handleGenerateTest = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    setQuestions([]);
    setTestResults([]);
    setUserAnswers({});

    if (!selectedTopic) {
      setError('Please select a topic.');
      setIsLoading(false);
      return;
    }
    if (!selectedExamLevel) {
      setError('Please select an exam level.');
      setIsLoading(false);
      return;
    }

    try {
      const generatedQuestions = await generatePracticeQuestions(
        selectedSubject,
        selectedTopic,
        selectedExamLevel,
        selectedCountry,
        selectedQuestionType, // Pass new question type
        numQuestions
      );
      setQuestions(generatedQuestions);
    } catch (err: any) {
      setError(`Failed to generate questions: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubject, selectedTopic, selectedExamLevel, selectedCountry, selectedQuestionType, numQuestions]);

  const handleAnswerChange = useCallback((questionId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  const handleSubmitTest = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    const results: PracticeTestResultItem[] = [];

    for (const question of questions) {
      const userAnswer = userAnswers[question.id] || '';
      try {
        const review = await reviewPracticeAnswer(
          question.question,
          userAnswer,
          selectedSubject,
          selectedExamLevel,
          selectedCountry // Pass country
        );
        results.push({
          questionId: question.id,
          question: question.question,
          userAnswer: userAnswer,
          correctAnswer: review.correctAnswer,
          explanation: review.explanation,
          isCorrect: review.isCorrect,
        });
      } catch (err: any) {
        setError(`Failed to review answer for question ${question.id}: ${err.message}`);
        console.error(err);
        setIsLoading(false);
        return;
      }
    }
    setTestResults(results);
    setIsLoading(false);
  }, [questions, userAnswers, selectedSubject, selectedExamLevel, selectedCountry]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-xl relative">
      <div className="p-4 bg-indigo-600 text-white flex items-center justify-between rounded-t-lg shadow-md sticky top-0 z-10">
        <Button variant="ghost" className="text-white hover:bg-indigo-700 p-2 -ml-2" onClick={onBack} aria-label="Back to main menu">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <h2 className="text-xl font-bold flex-grow text-center mr-8">📝 Practice & Full Exams with {AI_COMPANION_NAME}</h2>
      </div>

      <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 border border-indigo-200 rounded-lg bg-indigo-50">
          <Select
            label="Country"
            options={COUNTRIES}
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value as Country)}
            className="col-span-1"
            disabled={isLoading}
            aria-label="Select country"
          />
          <Select
            label="Subject"
            options={SUBJECTS}
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as Subject)}
            className="col-span-1"
            disabled={isLoading}
            aria-label="Select subject"
          />
          <Select
            label="Exam Level"
            options={availableExamLevels.length > 0 ? availableExamLevels : [{ value: '', label: 'No levels available' }]}
            value={selectedExamLevel}
            onChange={(e) => setSelectedExamLevel(e.target.value as ExamLevel)}
            className="col-span-1"
            disabled={isLoading || availableExamLevels.length === 0}
            aria-label="Select exam level"
          />
          <Select
            label="Topic"
            options={availableTopics.length > 0 ? availableTopics : [{ value: '', label: 'No topics available' }]}
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="col-span-1"
            disabled={isLoading || availableTopics.length === 0}
            aria-label="Select topic"
          />
          <Select
            label="Question Type"
            options={QUESTION_TYPES}
            value={selectedQuestionType}
            onChange={(e) => setSelectedQuestionType(e.target.value as QuestionType)}
            className="col-span-1"
            disabled={isLoading}
            aria-label="Select question type"
          />
        </div>

        <div className="flex flex-col items-center p-4 border border-green-200 bg-green-50 rounded-lg shadow-sm w-full mx-auto max-w-md">
          <h3 className="text-xl font-bold text-green-800 mb-2">Generate Practice Questions</h3>
          <p className="text-sm text-green-700 mb-4">Create tailored practice tests for your chosen topic and exam.</p>
          <Input
            label="Number of Questions"
            type="number"
            min="5"
            max="20" // Increased max for more flexibility
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            className="w-full max-w-[200px]"
            disabled={isLoading}
            aria-label="Number of practice questions"
          />
          <Button
            onClick={handleGenerateTest}
            disabled={isLoading || !selectedTopic || !selectedExamLevel || !selectedQuestionType}
            size="lg"
            variant="primary"
            className="mt-4"
          >
            {isLoading ? <LoadingSpinner /> : 'Generate Questions'}
          </Button>
        </div>


        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {questions.length > 0 && testResults.length === 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Your Test Questions:</h3>
            {questions.map((q, index) => (
              <div key={q.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 animate-fade-in">
                <p className="text-lg font-semibold text-gray-700 mb-3">
                  {index + 1}. <ReactMarkdown>{q.question}</ReactMarkdown>
                </p>
                {/* Render input based on question type */}
                {(q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.TRUE_FALSE) && q.options ? (
                  <div className="flex flex-col space-y-2 mt-3">
                    {q.options.map((option, optIndex) => (
                      <label key={optIndex} className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4 text-indigo-600"
                          name={`question-${q.id}`}
                          value={option}
                          checked={userAnswers[q.id] === option}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          disabled={isLoading}
                          aria-label={`Option ${option} for question ${index + 1}`}
                        />
                        <span className="ml-2 text-gray-700"><ReactMarkdown>{option}</ReactMarkdown></span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <Input
                    label="Your Answer"
                    value={userAnswers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Type your answer here..."
                    disabled={isLoading}
                    aria-label={`Answer for question ${index + 1}`}
                  />
                )}
              </div>
            ))}
            <div className="flex justify-center mt-6">
              <Button onClick={handleSubmitTest} disabled={isLoading} size="lg" variant="secondary">
                {isLoading ? <LoadingSpinner /> : 'Submit Test for Review'}
              </Button>
            </div>
          </div>
        )}

        {testResults.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Test Results & Solutions:</h3>
            <div className="flex justify-center items-center gap-4 mb-6">
              <p className="text-xl font-bold text-gray-700">
                Score: <span className="text-indigo-600">{testResults.filter(r => r.isCorrect).length}</span> / {testResults.length}
              </p>
            </div>
            {testResults.map((result, index) => (
              <div key={result.questionId} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 animate-fade-in">
                <p className="text-lg font-semibold text-gray-700 mb-3">
                  {index + 1}. <ReactMarkdown>{result.question}</ReactMarkdown>
                </p>
                <p className="mb-2">
                  <span className="font-medium text-gray-600">Your Answer:</span>{' '}
                  <span className={`${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {result.userAnswer || '[No Answer Provided]'}
                  </span>
                  {result.isCorrect ? ' ✅' : ' ❌'}
                </p>
                {!result.isCorrect && (
                  <p className="mb-2">
                    <span className="font-medium text-gray-600">Correct Answer:</span>{' '}
                    <span className="text-green-600"><ReactMarkdown>{result.correctAnswer}</ReactMarkdown></span>
                  </p>
                )}
                <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-md mt-3">
                  <p className="font-medium text-blue-800 mb-1">Explanation from {AI_COMPANION_NAME}:</p>
                  <p className="text-blue-700 text-sm"><ReactMarkdown>{result.explanation}</ReactMarkdown></p>
                </div>
              </div>
            ))}
            <div className="flex justify-center mt-6">
              <Button onClick={() => { setQuestions([]); setTestResults([]); setError(null); setUserAnswers({}); }} size="md" variant="primary">
                Take Another Test
              </Button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PracticeTest;