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
              rotate: (currentRotation + 180) % 360,
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
    if (
      !slice.color ||
      slice.color === "undefined" ||
      typeof slice.color !== "string"
    ) {
      console.warn(`Missing color detected for slice ${index}, using default`);
      slice.color = DEFAULTS.DEFAULT_COLOR;
    }
  });

  if (slices.length === 0) {
    return [];
  }

  // Verify that the total angle of all slices is 360 degrees
  const totalAngle = slices.reduce((sum, slice) => sum + slice.sliceAngle, 0);
  if (Math.abs(totalAngle - 360) > 0.001) {
    console.warn(
      `Total angle of wheel slices is ${totalAngle}, not 360 degrees`
    );
  }

  // Sort slices by rotation angle in clockwise order
  return slices.sort((a, b) => {
    // Normalize angles to 0-360 range for comparison
    const angleA = ((a.rotate % 360) + 360) % 360;
    const angleB = ((b.rotate % 360) + 360) % 360;
    return angleA - angleB;
  });
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
 * Calculates the positions of all slices after rotation
 * @param {Array} wheelSlices - Array of wheel slices
 * @param {number} rotation - Current rotation in degrees
 * @returns {Array} Array of objects containing slice positions and whether they contain the indicator
 */
export function calculateRotatedSlicePositions(wheelSlices, rotation) {
  // No slices case
  if (wheelSlices.length === 0) return [];
  
  // Single slice case
  if (wheelSlices.length === 1) {
    return [{
      index: 0,
      text: wheelSlices[0].text,
      startAngle: 0,
      endAngle: 360,
      containsZeroDegree: true
    }];
  }
  
  // Get normalized rotation between 0-360°
  let normalizedRotation = rotation % 360;
  if (normalizedRotation < 0) normalizedRotation += 360;
  
  // IMPORTANT: The wheel rotates clockwise (positive rotation values)
  // When the wheel rotates clockwise, the slices move clockwise
  // So we add the rotation to each slice's original position
  
  return wheelSlices.map((slice, i) => {
    // Calculate slice position after rotation
    // Formula: (original position + rotation) to account for clockwise movement
    let sliceStartAngle = (slice.rotate + normalizedRotation) % 360;
    if (sliceStartAngle < 0) sliceStartAngle += 360;
    
    let sliceEndAngle = (sliceStartAngle + slice.sliceAngle) % 360;
    
    // Check if indicator (0°) falls within this slice
    const containsZeroDegree = sliceStartAngle <= sliceEndAngle 
      ? (0 >= sliceStartAngle && 0 < sliceEndAngle) // Normal case
      : true; // Boundary case
    
    return {
      index: i,
      text: slice.text,
      startAngle: sliceStartAngle,
      endAngle: sliceEndAngle,
      containsZeroDegree
    };
  });
}

/**
 * Finds which slice is at the indicator (0°) position
 * @param {Array} rotatedPositions - Pre-computed array of slice positions from calculateRotatedSlicePositions
 * @returns {number} Index of the slice at the indicator position, or -1 if no slices
 */
export function calculateRotatedSliceAtIndicator(rotatedPositions) {
  // No slices case
  if (!rotatedPositions || rotatedPositions.length === 0) return -1;
  
  // Find the slice that contains the indicator
  const winningSlice = rotatedPositions.find(slice => slice.containsZeroDegree);
  
  return winningSlice ? winningSlice.index : -1;
}
