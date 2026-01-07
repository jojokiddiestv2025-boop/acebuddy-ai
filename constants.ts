

import { ExamLevel, Subject, Country, QuestionType } from './types';

export const COUNTRIES: { value: Country; label: string }[] = [
  { value: Country.UK, label: 'United Kingdom' },
  { value: Country.NIGERIA, label: 'Nigeria' },
  { value: Country.USA, label: 'United States' },
  { value: Country.INDIA, label: 'India' },
  { value: Country.GLOBAL, label: 'Global / International' },
];

export const EXAM_LEVELS_BY_COUNTRY: Record<Country, { value: ExamLevel; label: string }[]> = {
  [Country.UK]: [
    { value: ExamLevel.PRIMARY, label: 'Primary School (UK)' },
    { value: ExamLevel.KEYSTAGE3, label: 'Key Stage 3' },
    { value: ExamLevel.GCSE, label: 'GCSE' },
    { value: ExamLevel.ALEVEL, label: 'A-Level' },
    { value: ExamLevel.OTHER, label: 'Other UK Exams' },
  ],
  [Country.NIGERIA]: [
    { value: ExamLevel.JUNIOR_WAEC, label: 'Junior WAEC' },
    { value: ExamLevel.JUNIOR_NECO, label: 'Junior NECO' },
    { value: ExamLevel.WAEC, label: 'WAEC' },
    { value: ExamLevel.NECO, label: 'NECO' },
    { value: ExamLevel.JAMB, label: 'JAMB' },
    { value: ExamLevel.OTHER, label: 'Other Nigerian Exams' },
  ],
  [Country.USA]: [
    { value: ExamLevel.SAT, label: 'SAT' },
    { value: ExamLevel.ACT, label: 'ACT' },
    { value: ExamLevel.AP, label: 'AP Exams' },
    { value: ExamLevel.GENERIC_HIGH_SCHOOL, label: 'High School (USA)' },
    { value: ExamLevel.OTHER, label: 'Other US Exams' },
  ],
  [Country.INDIA]: [
    { value: ExamLevel.CBSE, label: 'CBSE' },
    { value: ExamLevel.ICSE, label: 'ICSE' },
    { value: ExamLevel.JEE_NEET, label: 'JEE / NEET' },
    { value: ExamLevel.OTHER, label: 'Other Indian Exams' },
  ],
  [Country.GLOBAL]: [
    { value: ExamLevel.GENERIC_HIGH_SCHOOL, label: 'Generic High School' },
    { value: ExamLevel.GENERIC_UNIVERSITY_ENTRANCE, label: 'Generic University Entrance' },
    { value: ExamLevel.OTHER, label: 'Other International Exams' },
  ],
};

// Default exam levels, if country not selected
export const DEFAULT_EXAM_LEVELS = EXAM_LEVELS_BY_COUNTRY[Country.UK];


export const SUBJECTS: { value: Subject; label: string }[] = [
  { value: Subject.MATH, label: 'Mathematics' },
  { value: Subject.ENGLISH, label: 'English Language & Literature' },
  { value: Subject.SCIENCE, label: 'Science (Bio, Chem, Phys)' },
  { value: Subject.HISTORY, label: 'History' },
  { value: Subject.GEOGRAPHY, label: 'Geography' },
  { value: Subject.COMPUTING, label: 'Computer Science' },
  { value: Subject.LANGUAGES, label: 'Modern Foreign Languages' },
  { value: Subject.BUSINESS, label: 'Business Studies' },
  { value: Subject.ECONOMICS, label: 'Economics' },
  { value: Subject.ART, label: 'Art & Design' },
  { value: Subject.MUSIC, label: 'Music' },
  { value: Subject.DRAMA, label: 'Drama' },
  { value: Subject.PE, label: 'Physical Education' },
  { value: Subject.RELIGION, label: 'Religious Studies' },
  { value: Subject.CLASSICS, label: 'Classics' },
  { value: Subject.PSHE, label: 'PSHE' },
  { value: Subject.OTHER, label: 'Other Subject' },
];

export const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: QuestionType.SHORT_ANSWER, label: 'Short Answer' },
  { value: QuestionType.MULTIPLE_CHOICE, label: 'Multiple Choice' },
  { value: QuestionType.TRUE_FALSE, label: 'True/False' },
];

export const AI_COMPANION_NAME = "Ace Buddy";

export const HOMEWORK_TOPICS = [
  'Math problem solving',
  'Essay writing tips',
  'Science project ideas',
  'History event explanations',
  'General study questions'
];

// All subjects for easier iteration and ensuring type completeness
const ALL_SUBJECTS: Subject[] = Object.values(Subject);
// All exam levels for exhaustive type checking
const ALL_EXAM_LEVELS: ExamLevel[] = Object.values(ExamLevel);

// Helper to create a default subject mapping for a given exam level
// This ensures that all subjects are present in the object, even if they have no specific topics defined.
const createDefaultSubjectTopics = (specificTopics: Partial<Record<Subject, string[]>>): Record<Subject, string[]> => {
  // Fix: Initialize with a type assertion, as the object will be fully populated within the loop.
  const defaultTopics: Record<Subject, string[]> = {} as Record<Subject, string[]>;
  for (const sub of ALL_SUBJECTS) {
    // If a specific topic exists for the subject, use it.
    // Otherwise, if it's the 'OTHER' subject, provide a 'General Topics' fallback.
    // For all other subjects without specific topics, provide an empty array.
    defaultTopics[sub] = specificTopics[sub] || (sub === Subject.OTHER ? ['General Topics'] : []);
  }
  return defaultTopics;
};

// New: Helper to create a full exam level mapping for a given country, filling in missing exam levels.
const createFullExamLevelTopics = (
  specificExamLevelConfigs: Partial<Record<ExamLevel, Partial<Record<Subject, string[]>>>>
): Record<ExamLevel, Record<Subject, string[]>> => {
  // Fix: Initialize with a type assertion, as the object will be fully populated within the loop.
  const fullExamLevelMapping: Record<ExamLevel, Record<Subject, string[]>> = {} as Record<ExamLevel, Record<Subject, string[]>>;

  for (const examLevel of ALL_EXAM_LEVELS) {
    if (specificExamLevelConfigs[examLevel]) {
      // If there are specific subject topics for this exam level,
      // create a complete subject mapping using `createDefaultSubjectTopics`.
      fullExamLevelMapping[examLevel] = createDefaultSubjectTopics(specificExamLevelConfigs[examLevel]!);
    } else {
      // If no specific subject topics are provided for this exam level (e.g., an exam level
      // from another country), provide a default subject mapping with mostly empty topic arrays.
      fullExamLevelMapping[examLevel] = createDefaultSubjectTopics({});
    }
  }
  return fullExamLevelMapping;
};


// New structure for curriculum-specific topics
export const CURRICULUM_TOPICS: Record<Country, Record<ExamLevel, Record<Subject, string[]>>> = {
  [Country.UK]: createFullExamLevelTopics({
    [ExamLevel.PRIMARY]: {
      [Subject.MATH]: ['Counting & Numbers', 'Basic Shapes', 'Addition & Subtraction', 'Time & Money'],
      [Subject.ENGLISH]: ['Phonics', 'Story Writing Basics', 'Reading Comprehension (Primary)', 'Alphabet & Spelling'],
      [Subject.SCIENCE]: ['Plants & Animals', 'Weather', 'Human Body Basics', 'Materials'],
      [Subject.HISTORY]: ['Local History', 'Famous People (UK)', 'Historical Events (Simple)'],
      [Subject.GEOGRAPHY]: ['Maps & Globes (Primary)', 'UK Geography Basics', 'Environments'],
    },
    [ExamLevel.KEYSTAGE3]: {
      [Subject.MATH]: ['Algebra Fundamentals', 'Geometry & Measure', 'Ratio & Proportion', 'Probability'],
      [Subject.ENGLISH]: ['Literary Analysis (KS3)', 'Creative Writing (Narrative)', 'Argumentative Writing', 'Poetry Analysis'],
      [Subject.SCIENCE]: ['Cells & Systems (Biology)', 'Atomic Structure (Chemistry)', 'Forces & Motion (Physics)', 'Ecosystems'],
      [Subject.HISTORY]: ['Medieval England', 'British Empire', 'World Wars Overview', 'Industrial Revolution'],
      [Subject.GEOGRAPHY]: ['Plate Tectonics', 'Rivers & Coasts', 'Population & Migration', 'Global Development'],
      [Subject.COMPUTING]: ['Programming with Python', 'Computational Thinking', 'Networking Basics', 'Cyber Security'],
    },
    [ExamLevel.GCSE]: {
      [Subject.MATH]: ['Algebra (Advanced)', 'Quadratic Equations', 'Trigonometry', 'Statistics & Probability (GCSE)'],
      [Subject.ENGLISH]: ['Shakespeare Study', 'Modern Texts Analysis', 'Unseen Poetry', 'Transactional Writing'],
      [Subject.SCIENCE]: ['Cell Biology & Disease', 'Organic Chemistry', 'Electricity & Magnetism (Physics)', 'Genetic Inheritance'],
      [Subject.HISTORY]: ['Norman Conquest', 'Cold War (GCSE)', 'Germany 1918-1939', 'Elizabethan England'],
      [Subject.GEOGRAPHY]: ['Hazardous Earth', 'Urban Issues & Challenges', 'Changing Economic World', 'Resource Management'],
      [Subject.COMPUTING]: ['Algorithms & Data Structures', 'Logic Gates', 'Computer Systems', 'Ethical Hacking Basics'],
      [Subject.BUSINESS]: ['Business Operations', 'Marketing Mix', 'Financial Performance', 'Business in the Global Economy'],
      [Subject.LANGUAGES]: ['French: Daily Life', 'Spanish: Free Time', 'German: Future Plans', 'Grammar & Vocabulary'],
    },
    [ExamLevel.ALEVEL]: {
      [Subject.MATH]: ['Pure Mathematics (Calculus, Functions)', 'Statistics (Hypothesis Testing)', 'Mechanics (Forces, Kinematics)'],
      [Subject.ENGLISH]: ['Critical Literary Theory', 'Genre Studies', 'Shakespeare: In-depth', 'Creative Writing Portfolio'],
      [Subject.SCIENCE]: ['Advanced Cell Biology', 'Physical Chemistry', 'Quantum Physics', 'Genetics & Evolution'],
      [Subject.HISTORY]: ['Early Modern Britain', 'Russian Revolution', 'USA Civil Rights', 'European Integration'],
      [Subject.GEOGRAPHY]: ['Water & Carbon Cycles', 'Geophysical Hazards', 'Changing Places', 'Global Governance'],
      [Subject.COMPUTING]: ['Object-Oriented Programming', 'Data Structures & Algorithms', 'Databases', 'Networking Advanced'],
      [Subject.ECONOMICS]: ['Microeconomics', 'Macroeconomics', 'Global Economy', 'Government Intervention'],
    },
    [ExamLevel.OTHER]: { // Catch-all for other UK exams
      [Subject.MATH]: ['General Math Topics'],
      [Subject.ENGLISH]: ['General English Topics'],
      [Subject.SCIENCE]: ['General Science Topics'],
    }
  }),
  [Country.NIGERIA]: createFullExamLevelTopics({
    [ExamLevel.JUNIOR_WAEC]: {
      [Subject.MATH]: ['Basic Algebra', 'Fractions & Decimals', 'Mensuration', 'Statistics (Basic)'],
      [Subject.ENGLISH]: ['Reading Skills', 'Essay Writing (Junior)', 'Grammar & Punctuation', 'Spelling'],
      [Subject.SCIENCE]: ['Basic Biology', 'Basic Chemistry', 'Basic Physics', 'Health Education'],
    },
    [ExamLevel.JUNIOR_NECO]: { // Added JUNIOR_NECO topics
      [Subject.MATH]: ['Number Bases', 'Approximation', 'Set Theory', 'Algebraic Fractions'],
      [Subject.ENGLISH]: ['Comprehension', 'Composition', 'Tenses', 'Parts of Speech'],
      [Subject.SCIENCE]: ['Matter', 'Energy', 'Living Things', 'Environment'],
    },
    [ExamLevel.WAEC]: {
      [Subject.MATH]: ['Calculus (WAEC)', 'Vectors (WAEC)', 'Probability & Statistics (WAEC)', 'Trigonometry (WAEC)'],
      [Subject.ENGLISH]: ['Summary Writing', 'Letter Writing', 'Comprehension & Lexis', 'Oral English'],
      [Subject.SCIENCE]: ['Human Physiology', 'Organic Chemistry (WAEC)', 'Electricity & Waves (Physics)', 'Ecology'],
      [Subject.HISTORY]: ['Nigerian History', 'West African History', 'World History (WAEC)'],
      [Subject.GEOGRAPHY]: ['Map Reading (WAEC)', 'Population Geography', 'Climatology (WAEC)', 'Economic Geography'],
    },
    [ExamLevel.NECO]: { // Added NECO topics
      [Subject.MATH]: ['Coordinate Geometry', 'Differentiation', 'Integration', 'Sequences & Series'],
      [Subject.ENGLISH]: ['Literary Appreciation', 'Idioms', 'Phonetics', 'Speech Writing'],
      [Subject.SCIENCE]: ['Ecology', 'Genetics', 'Electrolysis', 'Nuclear Physics'],
    },
    [ExamLevel.JAMB]: {
      [Subject.MATH]: ['JAMB Algebra', 'JAMB Calculus', 'JAMB Statistics'],
      [Subject.ENGLISH]: ['JAMB Comprehension', 'JAMB Lexis & Structure'],
      [Subject.SCIENCE]: ['JAMB Biology', 'JAMB Chemistry', 'JAMB Physics'],
    },
    [ExamLevel.OTHER]: { // Catch-all for other Nigerian exams
      [Subject.MATH]: ['General Math Topics (Nigeria)'],
      [Subject.ENGLISH]: ['General English Topics (Nigeria)'],
    }
  }),
  [Country.USA]: createFullExamLevelTopics({
    [ExamLevel.GENERIC_HIGH_SCHOOL]: {
      [Subject.MATH]: ['Algebra I', 'Geometry', 'Algebra II', 'Pre-Calculus'],
      [Subject.ENGLISH]: ['American Literature', 'World Literature', 'Composition & Rhetoric'],
      [Subject.SCIENCE]: ['Biology', 'Chemistry', 'Physics'],
      [Subject.HISTORY]: ['US History', 'World History'],
    },
    [ExamLevel.SAT]: {
      [Subject.MATH]: ['SAT Algebra', 'SAT Problem Solving & Data Analysis', 'SAT Passport to Advanced Math'],
      [Subject.ENGLISH]: ['SAT Reading Comprehension', 'SAT Writing & Language'],
    },
    [ExamLevel.ACT]: {
      [Subject.MATH]: ['ACT Algebra', 'ACT Geometry', 'ACT Trigonometry'],
      [Subject.ENGLISH]: ['ACT English', 'ACT Reading'],
      [Subject.SCIENCE]: ['ACT Science Reasoning'],
    },
    [ExamLevel.AP]: {
      [Subject.MATH]: ['AP Calculus AB', 'AP Statistics'],
      [Subject.ENGLISH]: ['AP English Language', 'AP English Literature'],
      [Subject.SCIENCE]: ['AP Biology', 'AP Chemistry', 'AP Physics'],
      [Subject.HISTORY]: ['AP US History', 'AP World History', 'AP European History'],
    },
    [ExamLevel.OTHER]: {
      [Subject.MATH]: ['General Math Topics (USA)'],
    }
  }),
  [Country.INDIA]: createFullExamLevelTopics({
    [ExamLevel.CBSE]: {
      [Subject.MATH]: ['CBSE Algebra', 'CBSE Geometry', 'CBSE Calculus'],
      [Subject.ENGLISH]: ['CBSE Reading', 'CBSE Writing', 'CBSE Grammar'],
      [Subject.SCIENCE]: ['CBSE Physics', 'CBSE Chemistry', 'CBSE Biology'],
    },
    [ExamLevel.ICSE]: {
      [Subject.MATH]: ['ICSE Algebra', 'ICSE Geometry', 'ICSE Trigonometry'],
      [Subject.ENGLISH]: ['ICSE Language', 'ICSE Literature'],
      [Subject.SCIENCE]: ['ICSE Physics', 'ICSE Chemistry', 'ICSE Biology'],
    },
    [ExamLevel.JEE_NEET]: {
      [Subject.MATH]: ['JEE Math', 'JEE Physics', 'JEE Chemistry'],
      [Subject.SCIENCE]: ['NEET Biology', 'NEET Physics', 'NEET Chemistry'],
    },
    [ExamLevel.OTHER]: {
      [Subject.MATH]: ['General Math Topics (India)'],
    }
  }),
  [Country.GLOBAL]: createFullExamLevelTopics({
    [ExamLevel.GENERIC_HIGH_SCHOOL]: {
      [Subject.MATH]: ['Fundamentals of Algebra', 'Introduction to Geometry', 'Probability Basics'],
      [Subject.ENGLISH]: ['Paragraph Structure', 'Descriptive Writing', 'Grammar Essentials'],
      [Subject.SCIENCE]: ['Basic Scientific Method', 'Matter & Energy', 'Life Cycles'],
    },
    [ExamLevel.GENERIC_UNIVERSITY_ENTRANCE]: {
      [Subject.MATH]: ['Advanced Algebra', 'Pre-Calculus Concepts', 'Statistics for Exams'],
      [Subject.ENGLISH]: ['Essay Argumentation', 'Critical Reading', 'Vocabulary Building'],
      [Subject.SCIENCE]: ['Advanced Biology', 'Advanced Chemistry', 'Advanced Physics'],
    },
    [ExamLevel.OTHER]: {
      [Subject.MATH]: ['Miscellaneous Math Topics'],
      [Subject.ENGLISH]: ['Miscellaneous English Topics'],
      [Subject.SCIENCE]: ['Miscellaneous Science Topics'],
    }
  })
};