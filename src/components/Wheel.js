import React from 'react';
import { toRadians, createSectorPath, calculateTextRotation } from '../utils/wheelUtils';
import { DEFAULTS } from '../utils/constants';
import SliceText from './SliceText';

import EmptyWheelMessage from './EmptyWheelMessage';

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
      {/* Center circle (optional decorative element) */}
      <circle cx={centerX} cy={centerY} r={2} fill="white" stroke="#e5e7eb" strokeWidth="0.5" />

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
          textY = centerY - radius * 0.6;
        } else {
          // For normal slices, calculate position along the radius
          const textRadius = radius * 0.75;
          textX = centerX + textRadius * Math.cos(textAngle);
          textY = centerY + textRadius * Math.sin(textAngle);
        }

        // Calculate rotation for text
        const adjustedRotation = slice.sliceAngle === 360 ? 0 : calculateTextRotation(textAngle);

        // Determine if this slice is highlighted (the winner)
        const isHighlighted = index === highlightIndex;

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
              className={isHighlighted ? 'filter brightness-110' : ''}
            />
            {isHighlighted && (
              <path
                d={pathData}
                fill="white"
                opacity="0.1"
                stroke="white"
                strokeWidth="1.5"
                data-highlight="true"
              />
            )}
            <SliceText
              text={slice.text}
              x={textX}
              y={textY}
              rotation={adjustedRotation}
              sliceAngle={slice.sliceAngle}
            />
            {/* Debug index number on each slice */}
            {DEFAULTS.DEBUG && (
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
            )}
          </React.Fragment>
        );
      })}
    </svg>
  );
};

export default Wheel;
