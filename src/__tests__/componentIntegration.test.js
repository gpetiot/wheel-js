import React from 'react';
import { render, screen } from '@testing-library/react';
import { 
  prepareWheelSlices, 
  getSliceAtIndicator, 
  verifyResult 
} from './utils/testUtils';

// Create a test utility to access the calculateRotatedSliceAtIndicator function
// This is a simplified version of the function from WheelSpinner.js
function calculateRotatedSliceAtIndicator(wheelSlices, rotation) {
  // No slices case
  if (wheelSlices.length === 0) return -1;
  
  // Single slice case
  if (wheelSlices.length === 1) return 0;
  
  // Get normalized rotation between 0-360°
  let normalizedRotation = rotation % 360;
  if (normalizedRotation < 0) normalizedRotation += 360;
  
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
        return i;
      }
    } else {
      // Edge case: slice crosses the 0/360 boundary
      if (0 >= sliceStartAngle || 0 < sliceEndAngle) {
        return i;
      }
    }
  }
  
  return 0; // Fallback to first slice
}

describe('Component Integration Tests', () => {
  // Test that our utility function matches the component's implementation
  describe('Utility function matches component implementation', () => {
    const testCases = [
      { name: 'Four choices', choices: ['North', 'East', 'South', 'West'] },
      { name: 'Three choices', choices: ['Red', 'Green', 'Blue'] }
    ];
    
    const rotations = [0, 45, 90, 180, 270, 360];
    
    testCases.forEach(testCase => {
      describe(testCase.name, () => {
        const wheelSlices = prepareWheelSlices(testCase.choices);
        
        rotations.forEach(rotation => {
          test(`Rotation ${rotation}°`, () => {
            // Get result using our utility function
            const utilityResult = getSliceAtIndicator(wheelSlices, rotation);
            
            // Get result using the component's implementation
            const componentResult = calculateRotatedSliceAtIndicator(wheelSlices, rotation);
            
            // Verify that both implementations give the same result
            expect(utilityResult.index).toBe(componentResult);
            expect(utilityResult.text).toBe(wheelSlices[componentResult].text);
          });
        });
      });
    });
  });
  
  // Test that the component correctly handles different rotation scenarios
  describe('Component rotation handling', () => {
    // Test cases with specific rotations that might be problematic
    const edgeCases = [
      { rotation: 0, description: 'No rotation' },
      { rotation: 359.99, description: 'Just before full circle' },
      { rotation: 360, description: 'Exact full circle' },
      { rotation: 360.01, description: 'Just after full circle' },
      { rotation: 45, description: 'Slice crossing boundary' },
      { rotation: -45, description: 'Negative rotation' },
      { rotation: 1080, description: 'Multiple rotations' }
    ];
    
    // Create a wheel with 4 choices (90° slices)
    const choices = ['North', 'East', 'South', 'West'];
    const wheelSlices = prepareWheelSlices(choices);
    
    edgeCases.forEach(edgeCase => {
      test(`${edgeCase.description} (${edgeCase.rotation}°)`, () => {
        // Get result using our utility function
        const utilityResult = getSliceAtIndicator(wheelSlices, edgeCase.rotation);
        
        // Get result using the component's implementation
        const componentResult = calculateRotatedSliceAtIndicator(wheelSlices, edgeCase.rotation);
        
        // Verify that both implementations give the same result
        expect(utilityResult.index).toBe(componentResult);
        
        // Verify that the result is valid
        const { startAngle, endAngle } = {
          startAngle: (wheelSlices[componentResult].rotate - edgeCase.rotation) % 360,
          endAngle: ((wheelSlices[componentResult].rotate - edgeCase.rotation) % 360 + wheelSlices[componentResult].sliceAngle) % 360
        };
        
        // Check if the slice contains 0°
        const containsZero = startAngle <= endAngle
          ? (0 >= startAngle && 0 < endAngle)
          : (0 >= startAngle || 0 < endAngle);
          
        expect(containsZero).toBe(true);
      });
    });
  });
});
