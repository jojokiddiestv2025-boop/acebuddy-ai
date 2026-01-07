
import React from 'react';
import Button from './Button';
import { AppSection } from '../types';
import { AI_COMPANION_NAME } from '../constants';

interface WelcomeScreenProps {
  onNavigate: (section: AppSection) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 md:p-8 lg:p-12 bg-gradient-to-br from-indigo-50 to-purple-50 animate-fade-in">
      <div className="relative mb-6 md:mb-8">
        <img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccLZlAAAACXBIWXMAAsTAAALEwEAmpwYAAAFNUlEQVR4AteQPYxUUQCG/y1d0w3CiooIKrYQE9l8wMImJgiCRmJiwgIhoKgoLgwP2A+g/mB1tB2tLEICwMDiJ/EwtLwBBMb2Cq3+X+37e6d7pvV3e38PZk753dmdnbvC+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj"
          alt="Ace Buddy AI mascot"
          className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover shadow-lg border-4 border-white animate-pop-in"
        />
        <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-white text-3xl md:text-4xl rounded-full p-4 shadow-md animate-bounce-in">
          🌟
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-4 animate-slide-up">
        Hi there! I'm {AI_COMPANION_NAME}!
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl animate-slide-up delay-100">
        Your super helpful AI buddy for all your school adventures!
        Let's make learning fun, easy, and super effective.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 w-full max-w-md animate-slide-up delay-200">
        <Button
          onClick={() => onNavigate(AppSection.HOMEWORK_HELP)}
          variant="primary"
          size="lg"
          fullWidth
          className="transform hover:scale-105"
        >
          📚 Homework Help
        </Button>
        <Button
          onClick={() => onNavigate(AppSection.PRACTICE_TEST)}
          variant="secondary"
          size="lg"
          fullWidth
          className="transform hover:scale-105"
        >
          📝 Practice & Full Exams
        </Button>
        <Button
          onClick={() => onNavigate(AppSection.EXAM_PLANNER)}
          variant="primary"
          size="lg"
          fullWidth
          className="transform hover:scale-105"
        >
          🗓️ Exam Planner
        </Button>
        <Button
          onClick={() => alert("Explore more exciting features coming soon!")}
          variant="outline"
          size="lg"
          fullWidth
          className="transform hover:scale-105"
        >
          💡 Discover More
        </Button>
      </div>

      <p className="mt-8 text-sm text-gray-500 animate-fade-in delay-300">
        Powered by <span className="font-semibold text-indigo-600">Jojo Kiddies Smile School</span>
      </p>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pop-in {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-pop-in { animation: pop-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-bounce-in { animation: bounce-in 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.7s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
};

export default WelcomeScreen;