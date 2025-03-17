import React, { useState, useEffect, useCallback, useRef } from 'react';
import Wheel from './Wheel';
import ChoicesList from './ChoicesList';
import DebugPanel from './DebugPanel';
import { 
  isDuplicateChoice, 
  createChoice,
  calculateWheelSlices,
  calculateRotatedSlicePositions,
  calculateRotatedSliceAtIndicator
} from '../utils/wheelUtils';
import { DEFAULTS } from '../utils/constants';
import './WheelSpinner.css';

const WheelSpinner = () => {
  // State
  const [choices, setChoices] = useState([]);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState('');
  const [resultIndex, setResultIndex] = useState(-1);
  const [showResult, setShowResult] = useState(false);
  const [wheelSlices, setWheelSlices] = useState([]);
  const [showDebug, setShowDebug] = useState(true); // Debug mode enabled by default
  
  // Flag to track if rotation change is from a reset (not a spin)
  const isResetRef = useRef(false);
  
  // Wheel reference to handle transition end
  const wheelRef = useRef(null);
  
  // Calculate wheel slices whenever choices change
  useEffect(() => {
    setWheelSlices(calculateWheelSlices(choices));
  }, [choices]);
  
  // Initialize choices from URL parameters if available
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const choicesParam = urlParams.get('choices');
    
    if (choicesParam) {
      try {
        // Parse JSON array from URL parameter
        const initialChoices = JSON.parse(decodeURIComponent(choicesParam));
        if (Array.isArray(initialChoices)) {
          setChoices(initialChoices.map(text => createChoice(text)));
        }
      } catch (e) {
        // Silently handle invalid choices parameter
      }
    }
  }, []);
  
  // Choice management handlers
  const handleChoiceAdd = useCallback((text) => {
    if (isDuplicateChoice(text, choices)) {
      return false; // Don't add duplicate
    }
    
    // Apply no-transition class before changing rotation
    if (wheelRef.current) {
      wheelRef.current.classList.add('wheel-no-transition');
    }
    
    setChoices(prevChoices => [...prevChoices, createChoice(text)]);
    
    // Mark this rotation change as a reset, not a spin
    isResetRef.current = true;
    setRotation(0); // Reset rotation
    
    // Remove the class after a short delay to allow the DOM to update
    setTimeout(() => {
      if (wheelRef.current) {
        wheelRef.current.classList.remove('wheel-no-transition');
      }
    }, 50);
    
    return true;
  }, [choices]);
  
  const handleChoiceEdit = useCallback((index) => {
    setChoices(prevChoices => 
      prevChoices.map((choice, i) => {
        if (i === index) {
          return { ...choice, editing: true };
        } else if (choice.editing) {
          // Close any other editing fields
          return { ...choice, editing: false };
        }
        return choice;
      })
    );
  }, []);
  
  const handleChoiceUpdate = useCallback((index, newText) => {
    setChoices(prevChoices => {
      const updatedChoices = [...prevChoices];
      const trimmedText = newText.trim();
      
      // If text is empty, just turn off editing
      if (!trimmedText) {
        updatedChoices[index] = { ...updatedChoices[index], editing: false };
        return updatedChoices;
      }
      
      // Check for duplicates
      if (isDuplicateChoice(trimmedText, prevChoices, index)) {
        updatedChoices[index] = { ...updatedChoices[index], editing: false };
        return updatedChoices;
      }
      
      // Update text and turn off editing
      updatedChoices[index] = { 
        ...updatedChoices[index],
        text: trimmedText,
        editing: false
      };
      
      return updatedChoices;
    });
    
    // Apply no-transition class before changing rotation
    if (wheelRef.current) {
      wheelRef.current.classList.add('wheel-no-transition');
    }
    
    // Mark this rotation change as a reset, not a spin
    isResetRef.current = true;
    setRotation(0); // Reset rotation
    
    // Remove the class after a short delay to allow the DOM to update
    setTimeout(() => {
      if (wheelRef.current) {
        wheelRef.current.classList.remove('wheel-no-transition');
      }
    }, 50);
  }, []);
  
  const handleChoiceDelete = useCallback((index) => {
    setChoices(prevChoices => prevChoices.filter((_, i) => i !== index));
    
    // Apply no-transition class before changing rotation
    if (wheelRef.current) {
      wheelRef.current.classList.add('wheel-no-transition');
    }
    
    // Mark this rotation change as a reset, not a spin
    isResetRef.current = true;
    setRotation(0); // Reset rotation
    
    // Remove the class after a short delay to allow the DOM to update
    setTimeout(() => {
      if (wheelRef.current) {
        wheelRef.current.classList.remove('wheel-no-transition');
      }
    }, 50);
  }, []);
  
  // Spinning functionality
  const spinWheel = useCallback(() => {
    // Don't spin if already spinning or if there are no choices
    if (isSpinning || choices.length === 0) return;
    
    // Reset states
    setIsSpinning(true);
    setResult('');
    setResultIndex(-1);
    setShowResult(false);
    
    // This is a real spin, not a reset
    isResetRef.current = false;
    
    // Calculate random rotation - ALWAYS POSITIVE for clockwise rotation
    const randomSpins = DEFAULTS.MIN_SPINS + Math.random() * (DEFAULTS.MAX_SPINS - DEFAULTS.MIN_SPINS);
    const newRotation = rotation + (randomSpins * 360); // Positive = clockwise
    
    // Apply the rotation visually (this will animate in CSS)
    setRotation(newRotation);
    
    // The actual result will be calculated when the transition ends
    // (see the useEffect that handles the transitionend event)
  }, [isSpinning, choices.length, rotation]);
  
  // Function to calculate all slices' positions for the debug panel
  const getRotatedSlicePositions = useCallback(() => {
    const positions = calculateRotatedSlicePositions(wheelSlices, rotation);
    
    // Format the positions for display
    return positions.map(pos => ({
      ...pos,
      startAngle: pos.startAngle.toFixed(2),
      endAngle: pos.endAngle.toFixed(2)
    }));
  }, [rotation, wheelSlices]);
  
  // Handle transition end to calculate the result when wheel stops spinning
  useEffect(() => {
    const wheelElement = wheelRef.current;
    
    const handleTransitionEnd = () => {
      // Skip result calculation if this was just a reset, not a spin
      if (!isSpinning || isResetRef.current) {
        isResetRef.current = false;
        return;
      }
      
      // Calculate the winning slice based on the current wheel position
      const positions = calculateRotatedSlicePositions(wheelSlices, rotation);
      const winningIndex = calculateRotatedSliceAtIndicator(positions);
      setResultIndex(winningIndex);
      
      // Get the result text from the winning slice (if valid)
      const resultText = winningIndex >= 0 && winningIndex < wheelSlices.length 
        ? wheelSlices[winningIndex].text 
        : 'No result';
      
      // Update states to show result
      setResult(resultText);
      setShowResult(true);
      setIsSpinning(false);
    };
    
    if (wheelElement) {
      wheelElement.addEventListener('transitionend', handleTransitionEnd);
    }
    
    return () => {
      if (wheelElement) {
        wheelElement.removeEventListener('transitionend', handleTransitionEnd);
      }
    };
  }, [rotation, isSpinning, wheelSlices]);
  
  // Update debug info during animation
  useEffect(() => {
    if (!showDebug || !isSpinning) return;

    // Use requestAnimationFrame to update debug panel during spin
    let animationFrameId;
    
    const updateDebug = () => {
      if (isSpinning) {
        // Force a re-render to update debug info
        // This small state update triggers React to re-render without affecting the animation
        setShowDebug(prev => prev);
        animationFrameId = requestAnimationFrame(updateDebug);
      }
    };
    
    animationFrameId = requestAnimationFrame(updateDebug);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isSpinning, showDebug]);
  
  return (
    <div className="container">
      <h1>Wheel Spinner</h1>
      
      <div className={`app-layout ${showDebug ? 'content-with-debug-panel' : 'content-without-debug-panel'}`}>
        {/* Wheel Section */}
        <div className="wheel-section">
          <div className="wheel-container">
            <div className="wheel-indicator"></div>
            <div 
              ref={wheelRef}
              className="wheel" 
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <Wheel 
                wheelSlices={wheelSlices} 
                rotation={rotation} 
                highlightIndex={showResult ? resultIndex : -1} 
              />
            </div>
            <button 
              className="spin-button"
              onClick={spinWheel}
              disabled={isSpinning || choices.length === 0}
            >
              {isSpinning ? "Spinning..." : "Spin"}
            </button>
          </div>
          
          {showResult && (
            <div className="result-message">
              The wheel has chosen:
              <strong>{result}</strong>
            </div>
          )}
        </div>
        
        {/* Choices List */}
        <ChoicesList 
          choices={choices}
          onChoiceEdit={handleChoiceEdit}
          onChoiceUpdate={handleChoiceUpdate}
          onChoiceDelete={handleChoiceDelete}
          onChoiceAdd={handleChoiceAdd}
        />
      </div>
      
      {/* Debug Panel - now rendered outside the main layout */}
      {DEFAULTS.DEBUG && (
        <DebugPanel
          rotation={rotation}
          wheelSlices={wheelSlices}
          isSpinning={isSpinning}
          showResult={showResult}
          resultIndex={resultIndex}
          resultText={result}
        getRotatedSlicePositions={getRotatedSlicePositions}
        onHideDebug={() => setShowDebug(!showDebug)}
        isVisible={showDebug}
      />)}
    </div>
  );
};

export default WheelSpinner;
