import React from 'react';
import './DebugPanel.css';

/**
 * Debug panel component that displays real-time information about the wheel's state
 * and the computation used to determine the winning slice
 */
const DebugPanel = ({ 
  rotation, 
  wheelSlices, 
  isSpinning, 
  showResult, 
  resultIndex, 
  resultText,
  getRotatedSlicePositions,
  onHideDebug 
}) => {
  // Normalize the rotation to be between 0 and 360 degrees
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  
  // Get the current positions of all slices after rotation
  const slicePositions = getRotatedSlicePositions();
  
  // Find the winning slice (the one containing 0°)
  const winningSlice = slicePositions.find(slice => slice.containsZeroDegree);
  
  // Create a simplified representation of the computation
  const computationSteps = winningSlice ? [
    {
      label: "Original Position",
      value: `${wheelSlices[winningSlice.index].rotate.toFixed(2)}°`,
      description: "Initial angle of the slice before rotation"
    },
    {
      label: "Wheel Rotation",
      value: `${normalizedRotation.toFixed(2)}°`,
      description: "How much the wheel rotated clockwise"
    },
    {
      label: "Calculation",
      value: `(${wheelSlices[winningSlice.index].rotate.toFixed(2)}° - ${normalizedRotation.toFixed(2)}°) % 360`,
      description: "Formula to find slice position after rotation"
    },
    {
      label: "Final Position",
      value: `${winningSlice.startAngle}° to ${winningSlice.endAngle}°`,
      description: "Where the slice ended up after rotation"
    },
    {
      label: "Contains 0°",
      value: "YES",
      description: "This slice contains the indicator position (0°)"
    }
  ] : [];
  
  return (
    <div className="debug-panel">
      <h3>Debug Panel</h3>
      
      {/* Wheel State */}
      <div className="debug-section">
        <h4>Wheel State</h4>
        <div className="debug-grid">
          <div className="debug-item">
            <span>Current Rotation:</span>
            <span className="debug-value">{rotation.toFixed(2)}°</span>
          </div>
          <div className="debug-item">
            <span>Normalized (0-360°):</span>
            <span className="debug-value">{normalizedRotation.toFixed(2)}°</span>
          </div>
          <div className="debug-item">
            <span>State:</span>
            <span className="debug-value debug-state">
              {isSpinning ? "Spinning" : (showResult ? "Result Shown" : "Ready")}
            </span>
          </div>
        </div>
      </div>
      
      {/* Result Information (when available) */}
      {showResult && (
        <div className="debug-section">
          <h4>Result</h4>
          <div className="debug-grid">
            <div className="debug-item">
              <span>Winning Index:</span>
              <span className="debug-value">{resultIndex}</span>
            </div>
            <div className="debug-item">
              <span>Winning Text:</span>
              <span className="debug-value">{resultText}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Computation Visualization */}
      {winningSlice && (
        <div className="debug-section">
          <h4>Winner Computation</h4>
          <div className="computation-steps">
            {computationSteps.map((step, index) => (
              <div key={index} className="computation-step">
                <div className="step-header">
                  <span className="step-number">{index + 1}</span>
                  <span className="step-label">{step.label}</span>
                </div>
                <div className="step-value">{step.value}</div>
                <div className="step-description">{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Slice Positions */}
      <div className="debug-section">
        <h4>Slice Positions After Rotation</h4>
        <div className="slice-debug-container">
          {slicePositions.map((data) => (
            <div 
              key={data.index} 
              className={`debug-info ${data.containsZeroDegree ? 'debug-active' : ''}`}
            >
              <div className="debug-slice-header">
                <span>Slice {data.index}</span>
                <span className="debug-slice-text">{data.text}</span>
              </div>
              <div className="debug-slice-position">
                <span>Position: {data.startAngle}° → {data.endAngle}°</span>
              </div>
              <div className="debug-slice-indicator">
                <span>At indicator (0°):</span>
                <span className={`debug-indicator-value ${data.containsZeroDegree ? 'positive' : 'negative'}`}>
                  {data.containsZeroDegree ? 'YES ✓' : 'NO'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Explanation */}
      <div className="debug-explanation">
        <p>
          <strong>How it works:</strong> The wheel rotates clockwise by {rotation.toFixed(2)}°. 
          The slice that contains the indicator (0°) after rotation stops is the winner.
        </p>
        <p>
          <strong>Computation:</strong> For each slice, we calculate its position after rotation by 
          subtracting the normalized rotation from its original position. This is because when the wheel 
          rotates clockwise (positive rotation), the slices move backward relative to the fixed indicator.
        </p>
        <p>
          <strong>Direction consistency:</strong> Both the visual animation and the mathematical computation 
          use the same direction convention: positive rotation values = clockwise rotation.
        </p>
      </div>
      
      <button 
        className="debug-hide-button"
        onClick={onHideDebug}
      >
        Hide Debug Panel
      </button>
    </div>
  );
};

export default DebugPanel;
