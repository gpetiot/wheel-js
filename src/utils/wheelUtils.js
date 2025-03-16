import { COLORS, DEFAULTS } from './constants';

/**
 * Checks if a choice text already exists in the choices array
 * @param {string} text - The text to check
 * @param {Array} choices - The array of existing choices
 * @param {number} excludeIndex - Optional index to exclude from checking (for updates)
 * @returns {boolean} True if the text is a duplicate
 */
export function isDuplicateChoice(text, choices, excludeIndex = -1) {
  if (!text || !text.trim()) return false;
  
  const normalizedText = text.trim().toLowerCase();
  return choices.some((choice, index) => 
      index !== excludeIndex && 
      choice.text.toLowerCase() === normalizedText
  );
}

/**
 * Gets a valid color for a given index
 * @param {number} index - The index to get a color for
 * @returns {string} A valid color
 */
export function getValidColor(index) {
  // Make sure we have a valid COLORS array
  if (!COLORS || !Array.isArray(COLORS) || COLORS.length === 0) {
      return DEFAULTS.DEFAULT_COLOR;
  }
  
  // Ensure index is a non-negative number
  const safeIndex = (typeof index === 'number' && !isNaN(index)) 
      ? Math.max(0, index) 
      : 0;
      
  // Calculate a valid color index within array bounds
  const colorIndex = safeIndex % COLORS.length;
  
  // Return the color or a default if the specific color is invalid
  return COLORS[colorIndex] || DEFAULTS.DEFAULT_COLOR;
}

/**
 * Creates an SVG path for a wheel sector
 * @param {number} centerX - X coordinate of the center
 * @param {number} centerY - Y coordinate of the center
 * @param {number} radius - Radius of the wheel
 * @param {number} startAngle - Starting angle in radians
 * @param {number} endAngle - Ending angle in radians
 * @returns {string} SVG path data
 */
export function createSectorPath(centerX, centerY, radius, startAngle, endAngle) {
  // Check if this is a full circle (or very close to it)
  const isFullCircle = Math.abs(endAngle - startAngle - 2 * Math.PI) < 0.001;
  
  if (isFullCircle) {
      // For a full circle, create a more precise circle representation
      return [
          `M ${centerX},${centerY - radius}`, // Start at top of circle
          `A ${radius},${radius} 0 1 1 ${centerX - 0.001},${centerY - radius}`, // Almost full arc (clockwise)
          `A ${radius},${radius} 0 1 1 ${centerX},${centerY - radius}`, // Complete the circle
          'Z' // Close path
      ].join(' ');
  }
  
  // For regular sectors, calculate points on the circle
  const startX = centerX + radius * Math.cos(startAngle);
  const startY = centerY + radius * Math.sin(startAngle);
  const endX = centerX + radius * Math.cos(endAngle);
  const endY = centerY + radius * Math.sin(endAngle);
  
  // Create SVG path for sector
  const largeArcFlag = (endAngle - startAngle) > Math.PI ? 1 : 0;
  return [
      `M ${centerX},${centerY}`,  // Move to center
      `L ${startX},${startY}`,    // Line to start point on circle
      `A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY}`, // Arc to end point
      'Z'                         // Close path
  ].join(' ');
}

/**
 * Converts degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Creates a new choice object
 * @param {string} text - The text for the choice
 * @returns {Object} A choice object
 */
export function createChoice(text) {
  return {
      text: text.trim(),
      id: Date.now() + Math.random().toString(36).substr(2, 9) // Generate a unique ID
  };
}

/**
 * Prepares wheel data from choices, determining occurrences and colors
 * @param {Array} choices - The array of choice objects
 * @returns {Array} Array of objects with choice text, color, and occurrences
 */
export function prepareWheelData(choices) {
  // Get choice texts
  const choiceTexts = choices.map(choice => choice.text);
  
  // If there are no choices, return an empty array
  if (choiceTexts.length === 0) {
      return [];
  }
  
  // Special case: If there's exactly one choice, it appears once with full wheel
  if (choiceTexts.length === 1) {
      return [{
          text: choiceTexts[0],
          color: getValidColor(0),
          occurrences: 1
      }];
  }
  
  // For each choice, determine color and number of occurrences
  return choiceTexts.map((text, index) => {
      const color = getValidColor(index);
      // If fewer than minimum choices, each choice appears twice
      const occurrences = choiceTexts.length < DEFAULTS.MIN_CHOICES_FOR_SINGLE_SLICES ? 2 : 1;
      
      return {
          text,
          color,
          occurrences
      };
  });
}

/**
 * Generates wheel slices from prepared wheel data
 * @param {Array} wheelData - Array of objects with choice text, color, and occurrences
 * @returns {Array} Array of slice objects with properties for rendering
 */
export function generateWheelSlices(wheelData) {
  // Count total slices (accounting for duplicates)
  const totalSlices = wheelData.reduce(
      (total, item) => total + item.occurrences, 
      0
  );
  
  // Calculate angle per slice
  const sliceAngle = 360 / totalSlices;
  
  // Track current rotation position
  let currentRotation = 0;
  
  let slices = [];
  // Generate slices for each wheel data item
  wheelData.forEach(item => {
      if (item.occurrences === 1) {
          // Single occurrence - add one slice
          slices.push({
              text: item.text,
              color: item.color,
              rotate: currentRotation,
              sliceAngle: sliceAngle
          });
          
          currentRotation += sliceAngle;
      } else if (item.occurrences === 2) {
          // Double occurrence - add two slices with same color, 180° apart
          // First occurrence
          slices.push({
              text: item.text,
              color: item.color,
              rotate: currentRotation,
              sliceAngle: sliceAngle
          });
          
          // Second occurrence, 180° opposite
          slices.push({
              text: item.text,
              color: item.color,
              rotate: (currentRotation + 180),
              sliceAngle: sliceAngle
          });
          
          // Move to next position for different choice
          currentRotation += sliceAngle;
      }
  });
  
  return slices;
}

/**
 * Calculates the wheel slices data based on current choices
 * @param {Array} choices - The array of choice objects
 * @returns {Array} Array of slice objects with properties for rendering
 */
export function calculateWheelSlices(choices) {
  // Step 1: Prepare wheel data (choices with colors and occurrences)
  const wheelData = prepareWheelData(choices);
  
  // Step 2: Generate wheel slices with proper angles and rotations
  const slices = generateWheelSlices(wheelData);
  
  // Double-check all slices have a valid color
  slices.forEach((slice, index) => {
      if (!slice.color || slice.color === 'undefined' || typeof slice.color !== 'string') {
          console.warn(`Missing color detected for slice ${index}, using default`);
          slice.color = DEFAULTS.DEFAULT_COLOR;
      }
  });
  
  // Verify that the total angle of all slices is 360 degrees
  const totalAngle = slices.reduce((sum, slice) => sum + slice.sliceAngle, 0);
  if (Math.abs(totalAngle - 360) > 0.001) {
      console.warn(`Total angle of wheel slices is ${totalAngle}, not 360 degrees`);
  }
  
  return slices;
}

/**
 * Calculates the rotation for readable text in a wheel slice
 * @param {number} textAngle - The angle of the text in radians
 * @returns {number} The adjusted rotation in degrees for readable text
 */
export function calculateTextRotation(textAngle) {
  // Convert from radians to degrees and adjust to keep text horizontal
  const textRotationDegrees = (textAngle * 180 / Math.PI) + 90;
  
  // Adjust text rotation to ensure it's always readable (not upside down)
  return textRotationDegrees > 180 && textRotationDegrees < 360 
      ? textRotationDegrees + 180 
      : textRotationDegrees;
}

/**
 * Calculates the result after spinning the wheel
 * @param {number} rotation - The final rotation angle
 * @param {Array} slices - The wheel slices
 * @returns {string} The result text
 */
export function calculateSpinResult(rotation, slices) {
  if (slices.length === 0) return '';
  
  // For a single choice filling the whole wheel, always return that choice
  if (slices.length === 1) {
    return slices[0].text;
  }
  
  // Normalize the rotation to be between 0 and 360 degrees
  let normalizedRotation = rotation % 360;
  if (normalizedRotation < 0) normalizedRotation += 360;
  
  // The indicator is at 0 degrees (top position)
  // When the wheel rotates clockwise, we need to see which slice is now at the top
  
  // Iterate through each slice to check which one contains the indicator angle (0°)
  // after the wheel has rotated by normalizedRotation degrees
  
  for (let i = 0; i < slices.length; i++) {
    const slice = slices[i];
    
    // Calculate the rotated position of this slice's start and end angles
    // When the wheel rotates clockwise by normalizedRotation, 
    // the slice positions effectively rotate counter-clockwise
    let rotatedStartAngle = (slice.rotate - normalizedRotation) % 360;
    if (rotatedStartAngle < 0) rotatedStartAngle += 360;
    
    let rotatedEndAngle = (rotatedStartAngle + slice.sliceAngle) % 360;
    
    // The indicator is at 0 degrees (top position)
    // Check if 0 degrees falls within this slice's rotated range
    
    // Normal case: start angle is less than end angle
    if (rotatedStartAngle < rotatedEndAngle) {
      if (rotatedStartAngle <= 0 && 0 < rotatedEndAngle) {
        return slice.text;
      }
    } 
    // Edge case: slice wraps around 360/0 degrees (end angle is less than start angle)
    else {
      if (rotatedStartAngle <= 0 || 0 < rotatedEndAngle) {
        return slice.text;
      }
    }
  }
  
  // If we get here, something went wrong - return the first slice as a fallback
  console.warn('Could not determine result slice, using first slice as fallback');
  return slices[0].text;
}
