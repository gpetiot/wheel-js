import { calculateWheelSlices, createChoice } from '../../utils/wheelUtils';

/**
 * Helper function to calculate which slice is at the indicator position
 * @param {Array} wheelSlices - Array of wheel slices
 * @param {number} rotation - Rotation angle in degrees
 * @returns {Object} Object with text and index of the winning slice
 */
export function getSliceAtIndicator(wheelSlices, rotation) {
  // Normalize rotation to be between 0 and 360 degrees
  let normalizedRotation = rotation % 360;
  if (normalizedRotation < 0) normalizedRotation += 360;
  
  // No slices case
  if (wheelSlices.length === 0) return { text: '', index: -1 };
  
  // Single slice case
  if (wheelSlices.length === 1) return { text: wheelSlices[0].text, index: 0 };
  
  // Check each slice to see which one contains the indicator (0°)
  for (let i = 0; i < wheelSlices.length; i++) {
    const slice = wheelSlices[i];
    
    // Calculate slice position after rotation
    // Formula: (original position - rotation) to account for clockwise movement
    let sliceStartAngle = (slice.rotate - normalizedRotation) % 360;
    if (sliceStartAngle < 0) sliceStartAngle += 360;
    
    let sliceEndAngle = (sliceStartAngle + slice.sliceAngle) % 360;
    
    // Check if indicator (0°) is within this slice
    if (sliceStartAngle <= sliceEndAngle) {
      // Normal case: slice doesn't cross the 0/360 boundary
      if (0 >= sliceStartAngle && 0 < sliceEndAngle) {
        return { text: slice.text, index: i };
      }
    } else {
      // Edge case: slice crosses the 0/360 boundary
      if (0 >= sliceStartAngle || 0 < sliceEndAngle) {
        return { text: slice.text, index: i };
      }
    }
  }
  
  return { text: wheelSlices[0].text, index: 0 }; // Fallback to first slice
}

/**
 * Checks if a slice contains the 0° position
 * @param {Object} slice - Wheel slice object
 * @param {number} rotation - Rotation angle in degrees
 * @returns {boolean} True if the slice contains 0°
 */
export function sliceContainsZeroDegree(slice, rotation) {
  // Special case: if the slice angle is 360°, it always contains 0°
  if (slice.sliceAngle >= 360) {
    return true;
  }
  
  let startAngle = (slice.rotate - rotation) % 360;
  if (startAngle < 0) startAngle += 360;
  
  let endAngle = (startAngle + slice.sliceAngle) % 360;
  
  // Check if 0° is within this slice
  if (startAngle <= endAngle) {
    // Normal case: slice doesn't cross the 0/360 boundary
    return (0 >= startAngle && 0 < endAngle);
  } else {
    // Edge case: slice crosses the 0/360 boundary
    return (0 >= startAngle || 0 < endAngle);
  }
}

/**
 * Calculates the position of a slice after rotation
 * @param {Object} slice - Wheel slice object
 * @param {number} rotation - Rotation angle in degrees
 * @returns {Object} Object with startAngle and endAngle
 */
export function calculateSlicePosition(slice, rotation) {
  let startAngle = (slice.rotate - rotation) % 360;
  if (startAngle < 0) startAngle += 360;
  
  // Special case: if the slice angle is 360°, set endAngle to 360
  if (slice.sliceAngle >= 360) {
    return { startAngle, endAngle: 360 };
  }
  
  let endAngle = (startAngle + slice.sliceAngle) % 360;
  
  return { startAngle, endAngle };
}

/**
 * Logs detailed information about a wheel test
 * @param {string} testName - Name of the test
 * @param {Array} wheelSlices - Array of wheel slices
 * @param {number} rotation - Rotation angle in degrees
 * @param {Object} result - Result object with text and index
 */
export function logWheelTestInfo(testName, wheelSlices, rotation, result) {
  console.log(`\n--- ${testName} with rotation ${rotation}° ---`);
  console.log(`Number of slices: ${wheelSlices.length}`);
  console.log(`Slice angles: ${wheelSlices.map(s => s.sliceAngle).join(', ')}°`);
  
  // Log each slice's position after rotation
  console.log('\nSlice positions after rotation:');
  wheelSlices.forEach((slice, i) => {
    const { startAngle, endAngle } = calculateSlicePosition(slice, rotation);
    const isWinningSlice = i === result.index;
    
    console.log(
      `Slice ${i} (${slice.text}): ${startAngle.toFixed(2)}° to ${endAngle.toFixed(2)}° ${isWinningSlice ? '← WINNER' : ''}`
    );
    
    // Check if this slice contains 0°
    if (sliceContainsZeroDegree(slice, rotation)) {
      console.log(`  ✓ This slice contains 0° (indicator position)`);
    }
  });
  
  console.log(`\nResult: ${result.text} (index: ${result.index})`);
}

/**
 * Common test cases for wheel rotation
 */
export const commonTestCases = [
  { name: 'Single choice', choices: ['Option 1'] },
  { name: 'Two choices', choices: ['Option 1', 'Option 2'] },
  { name: 'Three choices', choices: ['Option 1', 'Option 2', 'Option 3'] },
  { name: 'Four choices', choices: ['Option 1', 'Option 2', 'Option 3', 'Option 4'] },
  { name: 'Six choices', choices: ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 'Option 6'] }
];

/**
 * Common rotation values for testing
 */
export const commonRotations = [0, 45, 90, 180, 270, 360, 720, 1080];

/**
 * Prepares wheel slices from choice texts
 * @param {Array} choiceTexts - Array of choice texts
 * @returns {Array} Array of wheel slices
 */
export function prepareWheelSlices(choiceTexts) {
  const choiceObjects = choiceTexts.map(text => createChoice(text));
  return calculateWheelSlices(choiceObjects);
}

/**
 * Verifies that the result is valid
 * @param {Object} result - Result object with text and index
 * @param {Array} wheelSlices - Array of wheel slices
 * @param {number} rotation - Rotation angle in degrees
 * @param {Function} expect - Jest expect function
 */
export function verifyResult(result, wheelSlices, rotation, expect) {
  // Verify the result is valid
  expect(result.index).toBeGreaterThanOrEqual(0);
  expect(result.index).toBeLessThan(wheelSlices.length);
  
  // Verify that the winning slice contains 0°
  const winningSlice = wheelSlices[result.index];
  expect(sliceContainsZeroDegree(winningSlice, rotation)).toBe(true);
}

// Add a dummy test to satisfy Jest's requirement for at least one test
describe('Test Utils', () => {
  test('Dummy test to satisfy Jest', () => {
    expect(true).toBe(true);
  });
});
