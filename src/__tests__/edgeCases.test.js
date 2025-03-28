import {
  prepareWheelSlices,
  getSliceAtIndicator,
  verifyResult,
  calculateSlicePosition,
} from './utils/testUtils';

describe('Wheel Rotation Edge Cases', () => {
  describe('Empty choices', () => {
    test('No choices returns -1 index', () => {
      const wheelSlices = prepareWheelSlices([]);
      const result = getSliceAtIndicator(wheelSlices, 0);

      expect(wheelSlices.length).toBe(0);
      expect(result.index).toBe(-1);
      expect(result.text).toBe('');
    });
  });

  describe('Boundary cases', () => {
    // Create a wheel with 4 choices
    const choices = ['North', 'East', 'South', 'West'];
    const wheelSlices = prepareWheelSlices(choices);

    test('Slice exactly at 0° boundary', () => {
      // Position a slice exactly at the 0° boundary
      // For a 4-slice wheel, each slice is 90°
      // If we rotate by 0°, the first slice starts at 0°
      const rotation = 0;
      const result = getSliceAtIndicator(wheelSlices, rotation);

      // The first slice should be the winner
      expect(result.index).toBe(0);
      verifyResult(result, wheelSlices, rotation, expect);
    });

    test('Slice exactly at 359.99° boundary', () => {
      // Position a slice so that it ends just before 0°
      // For a 4-slice wheel with 90° slices, if we rotate by 90.01°,
      // the fourth slice will end at 359.99°
      const rotation = 90.01;
      const result = getSliceAtIndicator(wheelSlices, rotation);

      verifyResult(result, wheelSlices, rotation, expect);
    });

    test('Slice crossing the 0°/360° boundary', () => {
      // Position a slice so that it crosses the 0°/360° boundary
      // For a 4-slice wheel, if we rotate by 45°, the fourth slice
      // will start at 315° and end at 45°, crossing the boundary
      const rotation = 45;
      const result = getSliceAtIndicator(wheelSlices, rotation);

      verifyResult(result, wheelSlices, rotation, expect);
    });
  });

  describe('Negative rotations', () => {
    // Create a wheel with 4 choices
    const choices = ['North', 'East', 'South', 'West'];
    const wheelSlices = prepareWheelSlices(choices);

    // Test with negative rotation values
    [-90, -180, -270, -360, -1080].forEach(rotation => {
      test(`Negative rotation ${rotation}°`, () => {
        // Get the slice at the indicator position
        const result = getSliceAtIndicator(wheelSlices, rotation);

        // Calculate the equivalent positive rotation
        const positiveRotation = rotation % 360;
        const normalizedRotation = positiveRotation < 0 ? positiveRotation + 360 : positiveRotation;

        verifyResult(result, wheelSlices, rotation, expect);

        // Test that negative rotation gives the same result as its positive equivalent
        const positiveResult = getSliceAtIndicator(wheelSlices, normalizedRotation);
        expect(result.index).toBe(positiveResult.index);
        expect(result.text).toBe(positiveResult.text);
      });
    });
  });

  describe('Very large rotations', () => {
    // Create a wheel with 4 choices
    const choices = ['North', 'East', 'South', 'West'];
    const wheelSlices = prepareWheelSlices(choices);

    // Test with very large rotation values
    [3600, 7200, 10800, 36000].forEach(rotation => {
      test(`Large rotation ${rotation}°`, () => {
        // Get the slice at the indicator position
        const result = getSliceAtIndicator(wheelSlices, rotation);

        // Calculate the normalized rotation
        const normalizedRotation = rotation % 360;

        verifyResult(result, wheelSlices, rotation, expect);

        // Test that large rotation gives the same result as its normalized equivalent
        const normalizedResult = getSliceAtIndicator(wheelSlices, normalizedRotation);
        expect(result.index).toBe(normalizedResult.index);
        expect(result.text).toBe(normalizedResult.text);
      });
    });
  });
});
