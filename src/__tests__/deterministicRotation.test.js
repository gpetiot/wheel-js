import { 
  prepareWheelSlices, 
  getSliceAtIndicator, 
  logWheelTestInfo, 
  verifyResult 
} from './utils/testUtils';

describe('Deterministic Wheel Rotation Tests', () => {
  // Define fixed parameters for deterministic testing
  const FIXED_SPIN_SPEED = 5; // seconds
  const FIXED_SPIN_AMOUNT = 1080; // 3 full rotations (360° × 3)
  
  // Test scenarios with different numbers of choices
  const scenarios = [
    {
      name: 'Even number of choices (4)',
      choices: ['Apple', 'Banana', 'Cherry', 'Date'],
      expectedSliceAngle: 90 // 360° ÷ 4 = 90°
    },
    {
      name: 'Odd number of choices (3)',
      choices: ['Red', 'Green', 'Blue'],
      expectedSliceAngle: 120 // 360° ÷ 3 = 120°
    },
    {
      name: 'Single choice',
      choices: ['Only Option'],
      expectedSliceAngle: 360 // Full circle
    },
    {
      name: 'Many choices (8)',
      choices: ['1', '2', '3', '4', '5', '6', '7', '8'],
      expectedSliceAngle: 45 // 360° ÷ 8 = 45°
    }
  ];
  
  // Test each scenario
  scenarios.forEach(scenario => {
    describe(scenario.name, () => {
      // Calculate wheel slices
      const wheelSlices = prepareWheelSlices(scenario.choices);
      
      test('Slice configuration is correct', () => {
        // Verify number of slices
        expect(wheelSlices.length).toBe(
          scenario.choices.length < 3 ? scenario.choices.length * 2 : scenario.choices.length
        );
        
        // Verify slice angles
        wheelSlices.forEach(slice => {
          expect(slice.sliceAngle).toBeCloseTo(scenario.expectedSliceAngle / (scenario.choices.length < 3 ? 2 : 1));
        });
        
        // Verify total angle is 360°
        const totalAngle = wheelSlices.reduce((sum, slice) => sum + slice.sliceAngle, 0);
        expect(totalAngle).toBeCloseTo(360);
      });
      
      // Test with specific rotation values
      [0, 90, 180, 270, FIXED_SPIN_AMOUNT].forEach(rotation => {
        test(`Rotation ${rotation}° identifies correct slice`, () => {
          // Get the slice at the indicator position
          const result = getSliceAtIndicator(wheelSlices, rotation);
          
          // Log detailed information about the test
          logWheelTestInfo(`${scenario.name}`, wheelSlices, rotation, result);
          
          // Verify the result
          verifyResult(result, wheelSlices, rotation, expect);
        });
      });
      
      // Test with a simulated spin
      test('Simulated spin with fixed parameters', () => {
        // Initial rotation (0°)
        const initialRotation = 0;
        
        // Calculate final rotation after spin
        const finalRotation = initialRotation + FIXED_SPIN_AMOUNT;
        
        // Get the slice at the indicator position after spin
        const result = getSliceAtIndicator(wheelSlices, finalRotation);
        
        console.log(`\n--- ${scenario.name} with simulated spin ---`);
        console.log(`Initial rotation: ${initialRotation}°`);
        console.log(`Spin amount: ${FIXED_SPIN_AMOUNT}°`);
        console.log(`Final rotation: ${finalRotation}°`);
        console.log(`Result: ${result.text} (index: ${result.index})`);
        
        // Verify the result
        verifyResult(result, wheelSlices, finalRotation, expect);
        
        // Log the position of each slice after the spin
        logWheelTestInfo(`${scenario.name} after spin`, wheelSlices, finalRotation, result);
      });
    });
  });
});
