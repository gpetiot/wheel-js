import React, { useState, useRef, useEffect } from 'react';

// Choice item component for each row in the choices list
const ChoiceItem = ({ choice, index, onEdit, onUpdate, onDelete, sliceColor }) => {
  const [editValue, setEditValue] = useState(choice.text);
  const inputRef = useRef(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (choice.editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [choice.editing]);

  const handleKeyUp = e => {
    if (e.key === 'Enter') {
      onUpdate(index, editValue);
    } else if (e.key === 'Escape') {
      onUpdate(index, choice.text); // Cancel edit by restoring original value
    }
  };

  if (choice.editing) {
    return (
      <li
        className="flex items-center justify-between p-3 border-b border-gray-200"
        data-index={index}
      >
        <input
          ref={inputRef}
          type="text"
          className="w-full p-2 border border-gray-300 rounded text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300/30"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyUp={handleKeyUp}
          onBlur={() => onUpdate(index, editValue)}
        />
      </li>
    );
  }

  // Create a custom style with the slice color
  const customStyle = {
    borderLeft: `8px solid ${sliceColor || '#e5e7eb'}`,
  };

  return (
    <li
      className="flex items-center justify-between p-3 border-b border-gray-200 transition-all duration-200 hover:bg-gray-50/80 relative overflow-hidden group"
      style={customStyle}
      data-index={index}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
        style={{ backgroundColor: sliceColor || 'transparent' }}
        aria-hidden="true"
      ></div>
      <div
        className="flex items-center gap-2 cursor-pointer flex-1 group z-10"
        onClick={() => onEdit(index)}
      >
        <span className="font-medium">{choice.text}</span>
        <span className="text-xs text-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Click to edit
        </span>
      </div>
      <button
        className="relative z-10 bg-transparent text-red-500 border-none text-xl cursor-pointer p-1 rounded-full hover:bg-red-50 transition-colors duration-200 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
        onClick={e => {
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
  <li className="py-8 px-4 text-center text-slate-400 italic">
    <div className="flex flex-col items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 text-slate-200 mb-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <span>No choices added yet</span>
    </div>
  </li>
);

// Main ChoicesList component
const ChoicesList = ({
  choices,
  onChoiceEdit,
  onChoiceUpdate,
  onChoiceDelete,
  onChoiceAdd,
  wheelSlices = [],
}) => {
  const newChoiceInputRef = useRef(null);
  const [newChoice, setNewChoice] = useState('');

  const handleAddChoice = () => {
    if (newChoice.trim()) {
      onChoiceAdd(newChoice);
      setNewChoice('');
    }
  };

  const handleKeyUp = e => {
    if (e.key === 'Enter') {
      handleAddChoice();
    }
  };

  return (
    <div className="flex flex-col gap-4 md:flex-1">
      <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500 mb-2">
        Your Choices
      </h2>

      <div className="bg-white rounded-lg shadow-md border border-gray-200/50 overflow-hidden">
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
                sliceColor={wheelSlices[index]?.color}
              />
            ))
          )}
        </ul>

        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-2 relative">
            <span className="absolute left-3 text-gradient-to-r from-blue-600 to-purple-500 text-blue-600 font-bold text-lg z-10">
              +
            </span>
            <input
              ref={newChoiceInputRef}
              type="text"
              placeholder="Add a new choice and press Enter"
              className="flex-1 p-2 pl-8 border border-gray-300 rounded-full text-base shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300/30 transition-all duration-200"
              value={newChoice}
              onChange={e => setNewChoice(e.target.value)}
              onKeyUp={handleKeyUp}
            />
            <button
              onClick={handleAddChoice}
              disabled={!newChoice.trim()}
              className="py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-full font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoicesList;
