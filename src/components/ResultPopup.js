import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

const ResultPopup = ({ result, show, sliceColor, onClose }) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  // Update confetti canvas size when window resizes
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [show, onClose]);
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm animate-fade-in">
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={200}
        gravity={0.15}
        colors={['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#6366f1']}
      />
      
      <div 
        className="bg-white rounded-xl shadow-xl p-8 max-w-md mx-4 relative overflow-hidden opacity-0 scale-50 motion-safe:animate-bounce-in"
        style={{ boxShadow: `0 10px 25px -5px ${sliceColor || 'rgba(59, 130, 246, 0.5)'}` }}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold transition-colors"
          aria-label="Close popup"
        >
          ×
        </button>
        
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-rose-500 rounded-br-lg"></div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">🎉 Congratulations! 🎉</h2>
          <p className="text-slate-600 mb-4">The wheel has chosen:</p>
          <div className="bg-gradient-to-r from-blue-600 to-purple-500 p-[1px] rounded-lg mb-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
                {result}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPopup;
