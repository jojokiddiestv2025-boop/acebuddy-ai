

export enum AppSection {
  WELCOME = 'WELCOME',
  HOMEWORK_HELP = 'HOMEWORK_HELP',
  PRACTICE_TEST = 'PRACTICE_TEST',
  EXAM_PLANNER = 'EXAM_PLANNER',
}

export enum Country {
  UK = 'United Kingdom',
  NIGERIA = 'Nigeria',
  USA = 'United States',
  INDIA = 'India',
  GLOBAL = 'Global / International', // For generic international exams
}

export enum ExamLevel {
  // UK Levels
  GCSE = 'GCSE',
  ALEVEL = 'A-Level',
  KEYSTAGE3 = 'Key Stage 3',
  PRIMARY = 'Primary School (UK)',
  // Nigerian Levels
  JUNIOR_WAEC = 'Junior WAEC (Nigeria)',
  JUNIOR_NECO = 'Junior NECO (Nigeria)',
  WAEC = 'WAEC (Nigeria)',
  NECO = 'NECO (Nigeria)',
  JAMB = 'JAMB (Nigeria)',
  // US Levels (examples)
  SAT = 'SAT (USA)',
  ACT = 'ACT (USA)',
  AP = 'AP Exams (USA)',
  // Indian Levels (examples)
  CBSE = 'CBSE (India)',
  ICSE = 'ICSE (India)',
  JEE_NEET = 'JEE / NEET (India)',
  // Generic / Other
  GENERIC_HIGH_SCHOOL = 'Generic High School',
  GENERIC_UNIVERSITY_ENTRANCE = 'Generic University Entrance',
  OTHER = 'Other',
}

export enum Subject {
  MATH = 'Mathematics',
  ENGLISH = 'English Language/Literature',
  SCIENCE = 'Science (Biology, Chemistry, Physics)',
  HISTORY = 'History',
  GEOGRAPHY = 'Geography',
  COMPUTING = 'Computer Science',
  ART = 'Art & Design',
  MUSIC = 'Music',
  LANGUAGES = 'Modern Foreign Languages',
  PSHE = 'PSHE',
  BUSINESS = 'Business Studies',
  ECONOMICS = 'Economics',
  DRAMA = 'Drama',
  PE = 'Physical Education',
  RELIGION = 'Religious Studies',
  CLASSICS = 'Classics',
  OTHER = 'Other',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'Multiple Choice',
  SHORT_ANSWER = 'Short Answer',
  TRUE_FALSE = 'True/False',
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  imageUrl?: string; // Optional image URL for multimodal input
}

export interface PracticeQuestion {
  id: string;
  question: string;
  type?: QuestionType; // New field for question type
  options?: string[]; // Options for multiple choice/true-false
  correctAnswer?: string; // AI might suggest this for review
  subject: Subject;
  topic: string;
  examLevel?: ExamLevel;
  country?: Country; // Add country to question context
}

export interface UserPracticeAnswer {
  questionId: string;
  userAnswer: string;
}

export interface PracticeTestResultItem {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
}

export interface ExamPlan {
  country: Country;
  examLevel: ExamLevel;
  subject: Subject;
  planDetails: string; // Markdown formatted study plan
  isPremium: boolean; // Indicate if it's a premium plan
}

// Define the AIStudio interface to avoid conflicts with potential global declarations
// This interface is now purely conceptual for payment simulation.
export interface AIStudio {
  // These functions are no longer backed by actual `window.aistudio` for API key selection
  // but are kept as placeholders if a similar global interface were to exist for payment.
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// Removed the 'declare global' block for window.aistudio.
// As per Google GenAI coding guidelines and application logic, `window.aistudio` is not used
// for API key management in this app. Removing this resolves the "subsequent property declarations" type error.