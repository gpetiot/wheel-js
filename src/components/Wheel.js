import React from 'react';
import { toRadians, createSectorPath, calculateTextRotation } from '../utils/wheelUtils';
import { DEFAULTS } from '../utils/constants';

// Text component for the slice labels
const SliceText = ({ text, x, y, rotation, sliceAngle }) => {
  // Larger font for full circle or large slices
  let fontSize;
  if (sliceAngle === 360) {
    fontSize = "3.5";  // Slightly smaller font for full circle near border
  } else if (sliceAngle > 45) {
    fontSize = "3";  // Larger font for bigger slices
  } else {
    fontSize = "2.5"; // Default size for smaller slices
  }
  
  // Break text into multiple lines if needed
  const words = text.split(' ');
  
  // For normal display
  if (!(words.length > 1 && sliceAngle < 45 && sliceAngle !== 360)) {
    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={fontSize}
        fontWeight="bold"
        transform={`rotate(${rotation}, ${x}, ${y})`}
        style={{ textShadow: "0 0 1px black" }}
      >
        <title>{text}</title>
        {text}
      </text>
    );
  }
  
  // For text that needs to be broken into multiple lines
  const midpoint = Math.ceil(words.length/2);
  
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fill="white"
      fontSize={fontSize}
      fontWeight="bold"
      transform={`rotate(${rotation}, ${x}, ${y})`}
      style={{ textShadow: "0 0 1px black" }}
    >
      <title>{text}</title>
      <tspan x={x} dy="-0.6em">{words.slice(0, midpoint).join(' ')}</tspan>
      <tspan x={x} dy="1.2em">{words.slice(midpoint).join(' ')}</tspan>
    </text>
  );
};

// Empty wheel message when no choices exist
const EmptyWheelMessage = () => (
  <div className="empty-wheel-message">
    Add choices<br/>to start
  </div>
);

// Main Wheel component
const Wheel = ({ wheelSlices, rotation, highlightIndex = -1 }) => {
  if (wheelSlices.length === 0) {
    return <EmptyWheelMessage />;
  }
  
  const centerX = 50;
  const centerY = 50;
  const radius = 50;
  
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      {wheelSlices.map((slice, index) => {
        // Calculate angles in radians
        const startAngle = toRadians(slice.rotate);
        const endAngle = toRadians(slice.rotate + slice.sliceAngle);
        
        // Get the path data
        const pathData = createSectorPath(centerX, centerY, radius, startAngle, endAngle);
        
        // Calculate text position
        const textAngle = startAngle + toRadians(slice.sliceAngle / 2);
        let textX, textY;

        if (slice.sliceAngle === 360) {
          // For full circle (single choice), position text at the top
          textX = centerX;
          textY = centerY - (radius * 0.6);
        } else {
          // For normal slices, calculate position along the radius
          const textRadius = radius * 0.75;
          textX = centerX + textRadius * Math.cos(textAngle);
          textY = centerY + textRadius * Math.sin(textAngle);
        }

        // Calculate rotation for text
        const adjustedRotation = slice.sliceAngle === 360 
          ? 0 
          : calculateTextRotation(textAngle);
        
        // Add index number to each slice for debugging
        const middleRadius = radius * 0.4;
        const middleX = centerX + middleRadius * Math.cos(textAngle);
        const middleY = centerY + middleRadius * Math.sin(textAngle);
        
        return (
          <React.Fragment key={index}>
            <path
              d={pathData}
              fill={slice.color || DEFAULTS.DEFAULT_COLOR}
              stroke="white"
              strokeWidth="1"
              data-slice-index={index}
            />
            <SliceText 
              text={slice.text}
              x={textX}
              y={textY}
              rotation={adjustedRotation}
              sliceAngle={slice.sliceAngle}
            />
            {/* Debug index number on each slice */}
            <text
              x={middleX}
              y={middleY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="black"
              fontSize="2"
              fontWeight="bold"
              transform={`rotate(${adjustedRotation}, ${middleX}, ${middleY})`}
            >
              {index}
            </text>
          </React.Fragment>
        );
      })}
    </svg>
  );
};

export default Wheel;
