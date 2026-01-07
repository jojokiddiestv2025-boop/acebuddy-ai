
import React from 'react';
import { AI_COMPANION_NAME } from '../constants';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-indigo-200 to-purple-200 text-center p-8 animate-fade-in-full">
      <div className="relative mb-8">
        <img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccLZlAAAACXBIWXMAAsTAAALEwEAmpwYAAAFNUlEQVR4AteQPYxUUQCG/y1d0w3CiooIKrYQE9l8wMImJgiCRmJiwgIhoKgoLgwP2A+g/mB1tB2tLEICwMDiJ/EwtLwBBMb2Cq3+X+37e6d7pvV3e38PZk753dmdnbvC+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj"
          alt="Ace Buddy AI mascot logo"
          className="w-48 h-48 rounded-full object-cover shadow-xl border-4 border-white transform scale-0 animate-scale-in"
          style={{ animationDelay: '0.3s' }}
        />
        <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-white text-4xl rounded-full p-4 shadow-lg animate-bounce-slow"
             style={{ animationDelay: '0.8s' }}>
          ✨
        </div>
      </div>
      <h1 className="text-5xl font-extrabold text-indigo-800 mb-4 transform -translate-y-full opacity-0 animate-slide-down-fade"
          style={{ animationDelay: '1.2s' }}>
        Welcome to <span className="text-purple-700">{AI_COMPANION_NAME}</span>!
      </h1>
      <p className="text-xl text-gray-700 opacity-0 animate-fade-in" style={{ animationDelay: '1.8s' }}>
        Your super learning adventure begins...
      </p>

      <p className="mt-10 text-md text-gray-600 opacity-0 animate-fade-in" style={{ animationDelay: '2.0s' }}>
        Powered by <span className="font-semibold text-indigo-700">Jojo Kiddies Smile School</span>
      </p>

      <style>{`
        @keyframes fade-in-full {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        @keyframes slide-down-fade {
          0% { transform: translateY(-50px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in-full { animation: fade-in-full 0.5s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-bounce-slow { animation: bounce-slow 2s infinite ease-in-out; }
        .animate-slide-down-fade { animation: slide-down-fade 0.7s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SplashScreen;