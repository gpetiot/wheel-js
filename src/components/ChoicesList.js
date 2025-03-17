import React, { useState, useRef, useEffect } from 'react';

// Choice item component for each row in the choices list
const ChoiceItem = ({ choice, index, onEdit, onUpdate, onDelete }) => {
  const [editValue, setEditValue] = useState(choice.text);
  const inputRef = useRef(null);
  
  // Focus input when entering edit mode
  useEffect(() => {
    if (choice.editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [choice.editing]);
  
  const handleKeyUp = (e) => {
    if (e.key === 'Enter') {
      onUpdate(index, editValue);
    } else if (e.key === 'Escape') {
      onUpdate(index, choice.text); // Cancel edit by restoring original value
    }
  };
  
  if (choice.editing) {
    return (
      <li className="choice-item" data-index={index}>
        <input
          ref={inputRef}
          type="text"
          className="edit-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyUp={handleKeyUp}
          onBlur={() => onUpdate(index, editValue)}
        />
      </li>
    );
  }
  
  return (
    <li className="choice-item" data-index={index}>
      <div className="choice-content" onClick={() => onEdit(index)}>
        <span className="choice-text">{choice.text}</span>
        <span className="edit-hint">Click to edit</span>
      </div>
      <button 
        className="delete-button" 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(index);
        }}
        aria-label={`Delete ${choice.text}`}
      >
        &times;
      </button>
    </li>
  );
};

// Empty choices message component
const EmptyChoicesMessage = () => (
  <li className="empty-message">No choices added yet</li>
);

// Main ChoicesList component
const ChoicesList = ({ choices, onChoiceEdit, onChoiceUpdate, onChoiceDelete, onChoiceAdd }) => {
  const newChoiceInputRef = useRef(null);
  const [newChoice, setNewChoice] = useState('');
  
  const handleAddChoice = () => {
    if (newChoice.trim()) {
      onChoiceAdd(newChoice);
      setNewChoice('');
    }
  };
  
  const handleKeyUp = (e) => {
    if (e.key === 'Enter') {
      handleAddChoice();
    }
  };
  
  return (
    <div className="table-section">
      <h2 className="choices-heading">Your Choices</h2>
      
      <div className="choices-container">
        <ul className="choices-list">
          {choices.length === 0 ? (
            <EmptyChoicesMessage />
          ) : (
            choices.map((choice, index) => (
              <ChoiceItem
                key={choice.id || index}
                choice={choice}
                index={index}
                onEdit={onChoiceEdit}
                onUpdate={onChoiceUpdate}
                onDelete={onChoiceDelete}
              />
            ))
          )}
        </ul>
        
        <div className="new-choice-row">
          <div className="new-choice-input-container">
            <span className="plus-icon">+</span>
            <input
              ref={newChoiceInputRef}
              type="text"
              placeholder="Add a new choice and press Enter"
              className="new-choice-input"
              value={newChoice}
              onChange={(e) => setNewChoice(e.target.value)}
              onKeyUp={handleKeyUp}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoicesList;
