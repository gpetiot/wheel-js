import { 
  commonTestCases, 
  commonRotations, 
  prepareWheelSlices, 
  getSliceAtIndicator, 
  logWheelTestInfo, 
  verifyResult 
} from './utils/testUtils';

describe('Basic Wheel Rotation Tests', () => {
  // Test each case with different rotations
  commonTestCases.forEach(testCase => {
    describe(testCase.name, () => {
      // Calculate wheel slices
      const wheelSlices = prepareWheelSlices(testCase.choices);
      
      // Test with different rotation values
      commonRotations.forEach(rotation => {
        test(`Rotation ${rotation}°`, () => {
          // Calculate the result
          const result = getSliceAtIndicator(wheelSlices, rotation);
          
          // Log test information
          logWheelTestInfo(testCase.name, wheelSlices, rotation, result);
          
          // Verify the result
          verifyResult(result, wheelSlices, rotation, expect);
          
          // Additional verification for the text
          expect(wheelSlices[result.index].text).toBe(result.text);
        });
      });
    });
  });
});
