

import React, { useState, useCallback, useEffect } from 'react';
import Button from './Button';
import Select from './Select';
import LoadingSpinner from './LoadingSpinner';
import { ExamLevel, Subject, ExamPlan, Country } from '../types';
import { generateStudyPlan } from '../services/geminiService';
import { EXAM_LEVELS_BY_COUNTRY, SUBJECTS, AI_COMPANION_NAME, COUNTRIES, CURRICULUM_TOPICS } from '../constants';
import ReactMarkdown from 'react-markdown';

interface ExamPlannerProps {
  onBack: () => void;
  // `isPremium` and `onActivatePremium` props are removed as premium features are no longer present.
}

const ExamPlanner: React.FC<ExamPlannerProps> = ({ onBack }) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(Country.UK);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(Subject.MATH);
  const [selectedExamLevel, setSelectedExamLevel] = useState<ExamLevel>(ExamLevel.GCSE);
  const [examPlan, setExamPlan] = useState<ExamPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const availableExamLevels = React.useMemo(() => {
    return EXAM_LEVELS_BY_COUNTRY[selectedCountry] || [];
  }, [selectedCountry]);

  // Dynamically get topics based on country, exam level, and subject for context in prompt
  const currentCurriculumTopics = React.useMemo(() => {
    return CURRICULUM_TOPICS[selectedCountry]?.[selectedExamLevel]?.[selectedSubject] || [];
  }, [selectedCountry, selectedExamLevel, selectedSubject]);

  // Update selectedExamLevel when country changes to a valid default for that country
  React.useEffect(() => {
    if (availableExamLevels.length > 0) {
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
      setSelectedExamLevel(ExamLevel.OTHER);
    }
  }, [selectedCountry, availableExamLevels, selectedExamLevel]);

  const handleGeneratePlan = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    setExamPlan(null);

    try {
      // Pass currentCurriculumTopics as context to generateStudyPlan
      const planDetails = await generateStudyPlan(
        selectedExamLevel,
        selectedSubject,
        selectedCountry,
        currentCurriculumTopics // Pass the relevant topics for a more specific plan
      );
      setExamPlan({
        country: selectedCountry,
        examLevel: selectedExamLevel,
        subject: selectedSubject,
        planDetails: planDetails,
        isPremium: false, // This field is effectively deprecated but kept for type compatibility
      });
    } catch (err: any) {
      setError(`Failed to generate study plan: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedExamLevel, selectedSubject, selectedCountry, currentCurriculumTopics]);


  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-xl relative">
      <div className="p-4 bg-indigo-600 text-white flex items-center justify-between rounded-t-lg shadow-md sticky top-0 z-10">
        <Button variant="ghost" className="text-white hover:bg-indigo-700 p-2 -ml-2" onClick={onBack} aria-label="Back to main menu">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <h2 className="text-xl font-bold flex-grow text-center mr-8">🗓️ Exam Planner with {AI_COMPANION_NAME}</h2>
      </div>

      <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
          <Select
            label="Country"
            options={COUNTRIES}
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value as Country)}
            disabled={isLoading}
            aria-label="Select country"
          />
          <Select
            label="Subject"
            options={SUBJECTS}
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as Subject)}
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
        </div>

        <div className="flex flex-col items-center mb-6">
          <Button onClick={handleGeneratePlan} disabled={isLoading || !selectedExamLevel} size="lg" variant="primary">
            {isLoading && !examPlan ? <LoadingSpinner /> : 'Generate Study Plan'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {examPlan && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Your Study Plan for {examPlan.subject} ({examPlan.examLevel}):
            </h3>
            <div className="prose max-w-none">
              <ReactMarkdown>{examPlan.planDetails}</ReactMarkdown>
            </div>
            <div className="flex justify-center mt-6">
              <Button onClick={() => setExamPlan(null)} size="md" variant="primary">
                Generate New Plan
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

export default ExamPlanner;