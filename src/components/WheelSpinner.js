import React, { useState, useEffect, useCallback } from 'react';
import Wheel from './Wheel';
import ChoicesList from './ChoicesList';
import { 
  isDuplicateChoice, 
  createChoice,
  calculateWheelSlices,
  calculateSpinResult
} from '../utils/wheelUtils';
import { DEFAULTS } from '../utils/constants';
import './WheelSpinner.css';

const WheelSpinner = () => {
  // State
  const [choices, setChoices] = useState([]);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [wheelSlices, setWheelSlices] = useState([]);
  
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
        console.warn('Invalid choices parameter in URL');
      }
    }
  }, []);
  
  // Choice management handlers
  const handleChoiceAdd = useCallback((text) => {
    if (isDuplicateChoice(text, choices)) {
      return false; // Don't add duplicate
    }
    
    setChoices(prevChoices => [...prevChoices, createChoice(text)]);
    setRotation(0); // Reset rotation
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
    
    setRotation(0); // Reset rotation
  }, []);
  
  const handleChoiceDelete = useCallback((index) => {
    setChoices(prevChoices => prevChoices.filter((_, i) => i !== index));
    setRotation(0); // Reset rotation
  }, []);
  
  // Spinning functionality
  const spinWheel = useCallback(() => {
    if (isSpinning || choices.length === 0) return;
    
    setIsSpinning(true);
    setResult('');
    setShowResult(false);
    
    // Random rotation between MIN_SPINS and MAX_SPINS full rotations
    const randomSpins = DEFAULTS.MIN_SPINS + Math.random() * (DEFAULTS.MAX_SPINS - DEFAULTS.MIN_SPINS);
    const newRotation = rotation + (randomSpins * 360);
    
    setRotation(newRotation);
    
    // Calculate the result after spinning
    setTimeout(() => {
      const spinResult = calculateSpinResult(newRotation, wheelSlices);
      setResult(spinResult);
      setShowResult(true);
      setIsSpinning(false);
    }, DEFAULTS.SPIN_DURATION);
  }, [isSpinning, choices.length, rotation, wheelSlices]);
  
  return (
    <div className="container">
      <h1>Wheel Spinner</h1>
      
      <div className="app-layout">
        {/* Wheel Section */}
        <div className="wheel-section">
          <div className="wheel-container">
            <div className="wheel-indicator"></div>
            <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }}>
              <Wheel wheelSlices={wheelSlices} rotation={0} />
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
              Result: <strong>{result}</strong>
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
    </div>
  );
};

export default WheelSpinner; 