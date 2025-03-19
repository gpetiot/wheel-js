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
      <li className="flex items-center justify-between p-3 border-b border-gray-200" data-index={index}>
        <input
          ref={inputRef}
          type="text"
          className="w-full p-2 border border-gray-300 rounded text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300/30"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyUp={handleKeyUp}
          onBlur={() => onUpdate(index, editValue)}
        />
      </li>
    );
  }
  
  return (
    <li className="flex items-center justify-between p-3 border-b border-gray-200 transition-colors duration-200 hover:bg-gray-50" data-index={index}>
      <div className="flex items-center gap-2 cursor-pointer flex-1 group" onClick={() => onEdit(index)}>
        <span className="font-medium">{choice.text}</span>
        <span className="text-xs text-gray-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">Click to edit</span>
      </div>
      <button 
        className="bg-transparent text-red-500 border-none text-xl cursor-pointer p-1 rounded hover:bg-red-50 transition-colors duration-200"
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
  <li className="py-6 px-4 text-center text-gray-500 italic">No choices added yet</li>
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
    <div className="flex flex-col gap-4 md:flex-1">
      <h2 className="text-xl font-medium text-gray-900 m-0">Your Choices</h2>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <ul className="list-none m-0 p-0 max-h-[400px] overflow-y-auto">
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
        
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-xl font-bold">+</span>
            <input
              ref={newChoiceInputRef}
              type="text"
              placeholder="Add a new choice and press Enter"
              className="flex-1 p-2 border border-gray-300 rounded text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300/30"
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
