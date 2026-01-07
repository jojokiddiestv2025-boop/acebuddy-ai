
import React, { useState, useEffect, useCallback } from 'react';
import WelcomeScreen from './components/WelcomeScreen'; // Changed to default import
import ChatInterface from './components/ChatInterface';
import PracticeTest from './components/PracticeTest';
import ExamPlanner from './components/ExamPlanner';
import SplashScreen from './components/SplashScreen'; // Import new SplashScreen component
import { AppSection } from './types';
import Button from './components/Button';

// AIStudio interface is now purely conceptual for payment simulation in types.ts.
// No specific `window.aistudio` functionality for API key selection is used here.

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.WELCOME);
  const [showSplashScreen, setShowSplashScreen] = useState<boolean>(true); // New state for splash screen

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplashScreen(false);
    }, 2500); // Show splash screen for 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  const renderSection = () => {
    switch (currentSection) {
      case AppSection.WELCOME:
        return <WelcomeScreen onNavigate={setCurrentSection} />;
      case AppSection.HOMEWORK_HELP:
        return <ChatInterface onBack={() => setCurrentSection(AppSection.WELCOME)} />;
      case AppSection.PRACTICE_TEST:
        return <PracticeTest onBack={() => setCurrentSection(AppSection.WELCOME)} />;
      case AppSection.EXAM_PLANNER:
        return <ExamPlanner onBack={() => setCurrentSection(AppSection.WELCOME)} />;
      default:
        return <WelcomeScreen onNavigate={setCurrentSection} />;
    }
  };

  if (showSplashScreen) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 min-h-screen">
        <SplashScreen />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-white rounded-lg shadow-xl animate-fade-in">
      {/* Sidebar / Navigation for larger screens */}
      <nav className="hidden md:flex flex-col w-64 bg-gradient-to-b from-indigo-700 to-purple-800 text-white p-6 justify-between rounded-l-lg shadow-lg">
        <div>
          <h1 className="text-3xl font-bold mb-8 text-center animate-pulse-light">Ace Buddy AI</h1>
          <ul className="space-y-4">
            <li>
              <Button
                variant={currentSection === AppSection.WELCOME ? 'secondary' : 'ghost'}
                size="md"
                fullWidth
                className={`justify-start px-4 ${currentSection === AppSection.WELCOME ? 'bg-purple-600' : 'text-indigo-100 hover:bg-indigo-600'}`}
                onClick={() => setCurrentSection(AppSection.WELCOME)}
              >
                🏠 Home
              </Button>
            </li>
            <li>
              <Button
                variant={currentSection === AppSection.HOMEWORK_HELP ? 'secondary' : 'ghost'}
                size="md"
                fullWidth
                className={`justify-start px-4 ${currentSection === AppSection.HOMEWORK_HELP ? 'bg-purple-600' : 'text-indigo-100 hover:bg-indigo-600'}`}
                onClick={() => setCurrentSection(AppSection.HOMEWORK_HELP)}
              >
                📚 Homework Help
              </Button>
            </li>
            <li>
              <Button
                variant={currentSection === AppSection.PRACTICE_TEST ? 'secondary' : 'ghost'}
                size="md"
                fullWidth
                className={`justify-start px-4 ${currentSection === AppSection.PRACTICE_TEST ? 'bg-purple-600' : 'text-indigo-100 hover:bg-indigo-600'}`}
                onClick={() => setCurrentSection(AppSection.PRACTICE_TEST)}
              >
                📝 Practice & Full Exams
              </Button>
            </li>
            <li>
              <Button
                variant={currentSection === AppSection.EXAM_PLANNER ? 'secondary' : 'ghost'}
                size="md"
                fullWidth
                className={`justify-start px-4 ${currentSection === AppSection.EXAM_PLANNER ? 'bg-purple-600' : 'text-indigo-100 hover:bg-indigo-600'}`}
                onClick={() => setCurrentSection(AppSection.EXAM_PLANNER)}
              >
                🗓️ Exam Planner
              </Button>
            </li>
          </ul>
        </div>
        <div className="text-sm text-indigo-200 text-center mt-6">
          Powered by <span className="font-semibold">Jojo Kiddies Smile School</span>
        </div>
      </nav>

      {/* Main content area */}
      <main className="flex-grow h-full bg-white flex flex-col relative">
        {renderSection()}
      </main>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-light {
          0% { text-shadow: 0 0 5px rgba(255,255,255,0.4); }
          50% { text-shadow: 0 0 10px rgba(255,255,255,0.8); }
          100% { text-shadow: 0 0 5px rgba(255,255,255,0.4); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-pulse-light { animation: pulse-light 2s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default App;