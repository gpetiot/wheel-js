import React from 'react';

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
  onHideDebug,
  isVisible
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
    <>
      {/* Debug Panel */}
      <div 
        className={`
          fixed top-0 left-0 h-screen w-[350px] overflow-y-auto z-[1000]
          bg-slate-50 border-r border-slate-200 p-4 shadow-md
          text-sm text-slate-700
          transition-transform duration-300 ease-in-out
          ${!isVisible ? 'transform -translate-x-full' : ''}
        `}
      >
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 m-0">Debug Panel</h3>
          <button 
            className="bg-transparent border-0 p-0 text-xl text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
            onClick={onHideDebug}
            aria-label="Hide debug panel"
          >
            ×
          </button>
        </div>
        
        {/* Wheel State */}
        <div className="mb-4">
          <h4 className="text-base font-medium text-slate-600 mb-2">Wheel State</h4>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
              <span>Current Rotation:</span>
              <span className="font-semibold text-slate-800">{rotation.toFixed(2)}°</span>
            </div>
            <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
              <span>Normalized (0-360°):</span>
              <span className="font-semibold text-slate-800">{normalizedRotation.toFixed(2)}°</span>
            </div>
            <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
              <span>State:</span>
              <span className="font-semibold text-sky-600">
                {isSpinning ? "Spinning" : (showResult ? "Result Shown" : "Ready")}
              </span>
            </div>
          </div>
        </div>
        
        {/* Result Information (when available) */}
        {showResult && (
          <div className="mb-4">
            <h4 className="text-base font-medium text-slate-600 mb-2">Result</h4>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
                <span>Winning Index:</span>
                <span className="font-semibold text-slate-800">{resultIndex}</span>
              </div>
              <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
                <span>Winning Text:</span>
                <span className="font-semibold text-slate-800">{resultText}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Computation Visualization */}
        {winningSlice && (
          <div className="mb-4">
            <h4 className="text-base font-medium text-slate-600 mb-2">Winner Computation</h4>
            <div className="flex flex-col gap-3 bg-white rounded-lg p-3 border border-slate-200">
              {computationSteps.map((step, index) => (
                <div key={index} className="flex flex-col gap-1 p-2 rounded bg-slate-50 border-l-3 border-l-sky-500">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-sky-500 text-white rounded-full text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-slate-900">{step.label}</span>
                  </div>
                  <div className="font-mono bg-slate-100 p-1 rounded text-slate-900 font-medium my-1">
                    {step.value}
                  </div>
                  <div className="text-xs text-slate-500 italic">
                    {step.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Slice Positions */}
        <div className="mb-4">
          <h4 className="text-base font-medium text-slate-600 mb-2">Slice Positions After Rotation</h4>
          <div className="max-h-[300px] overflow-y-auto flex flex-col gap-3 mb-3">
            {slicePositions.map((data) => (
              <div 
                key={data.index} 
                className={`
                  flex flex-col gap-1.5 p-3 rounded-lg border transition-all duration-200
                  ${data.containsZeroDegree 
                    ? 'bg-sky-50 border-sky-200 shadow-[0_0_0_1px_rgba(56,189,248,0.3)]' 
                    : 'bg-white border-slate-200'}
                `}
              >
                <div className="flex justify-between font-semibold">
                  <span>Slice {data.index}</span>
                  <span className="text-slate-900 max-w-[60%] overflow-hidden text-ellipsis whitespace-nowrap">
                    {data.text}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Position: {data.startAngle}° → {data.endAngle}°</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>At indicator (0°):</span>
                  <span className={`font-semibold ${data.containsZeroDegree ? 'text-green-500' : 'text-red-500'}`}>
                    {data.containsZeroDegree ? 'YES ✓' : 'NO'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Explanation */}
        <div className="bg-slate-100 rounded-lg p-3 mb-4 text-sm leading-relaxed">
          <p className="mb-2">
            <strong>How it works:</strong> The wheel rotates clockwise by {rotation.toFixed(2)}°. 
            The slice that contains the indicator (0°) after rotation stops is the winner.
          </p>
          <p className="mb-2">
            <strong>Computation:</strong> For each slice, we calculate its position after rotation by 
            subtracting the normalized rotation from its original position. This is because when the wheel 
            rotates clockwise (positive rotation), the slices move backward relative to the fixed indicator.
          </p>
          <p className="m-0">
            <strong>Direction consistency:</strong> Both the visual animation and the mathematical computation 
            use the same direction convention: positive rotation values = clockwise rotation.
          </p>
        </div>
      </div>
      
      {/* Toggle button for showing the debug panel */}
      <button 
        className={`
          fixed top-1/2 -translate-y-1/2 bg-slate-50 border border-slate-200 border-l-0
          rounded-r px-2 py-3 shadow-md cursor-pointer z-[999]
          hover:bg-slate-200 transition-all duration-300 ease-in-out
          ${isVisible ? 'left-[350px]' : 'left-0'}
        `}
        onClick={() => onHideDebug()}
        aria-label={isVisible ? "Hide debug panel" : "Show debug panel"}
      >
        {isVisible ? '◀' : '▶'}
      </button>
    </>
  );
};

export default DebugPanel;
