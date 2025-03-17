# Wheel Spinner Tests

This directory contains tests for the wheel rotation functionality of the Wheel Spinner application. The tests verify that the wheel correctly identifies which slice is at the indicator position (0°) after rotation.

## Test Structure

The tests are organized by functionality and use shared utilities to reduce code duplication:

### Test Files

- **basicRotation.test.js**: Basic tests for wheel rotation with different numbers of choices and rotation values.
- **deterministicRotation.test.js**: Tests with fixed parameters for deterministic testing of wheel rotation.
- **edgeCases.test.js**: Tests for edge cases in wheel rotation, including boundary cases, negative rotations, and very large rotations.
- **componentIntegration.test.js**: Tests that verify the integration between our test utilities and the actual component implementation.

### Utilities

- **utils/testUtils.js**: Shared utility functions for testing wheel rotation, including:
  - `getSliceAtIndicator`: Calculates which slice is at the indicator position after rotation
  - `sliceContainsZeroDegree`: Checks if a slice contains the 0° position
  - `calculateSlicePosition`: Calculates the position of a slice after rotation
  - `logWheelTestInfo`: Logs detailed information about a wheel test
  - `prepareWheelSlices`: Prepares wheel slices from choice texts
  - `verifyResult`: Verifies that a result is valid

## Running the Tests

To run all tests:

```bash
npm test
```

To run a specific test file:

```bash
npm test -- src/__tests__/deterministicRotation.test.js
```

## Test Coverage

The tests cover the following aspects of the wheel rotation functionality:

1. **Different numbers of choices**: Tests with 1, 2, 3, 4, 6, and 8 choices to ensure the wheel works correctly with different numbers of slices.

2. **Different rotation values**: Tests with various rotation values (0°, 45°, 90°, 180°, 270°, 360°, 720°, 1080°) to ensure the wheel correctly identifies the winning slice after rotation.

3. **Edge cases**:
   - Empty choices
   - Slice exactly at 0° boundary
   - Slice ending just before 0°
   - Slice crossing the 0°/360° boundary
   - Negative rotations
   - Very large rotations

4. **Deterministic testing**: Tests with fixed parameters to ensure consistent results.

5. **Component integration**: Tests that verify our test utilities match the actual component implementation.

## Test Methodology

Each test follows this general approach:

1. Create a set of choices
2. Calculate the wheel slices using the actual `calculateWheelSlices` function
3. Apply a rotation to the wheel
4. Calculate which slice is at the indicator position (0°) after rotation
5. Verify that the identified slice actually contains the 0° position

The tests use the same formula for calculating the slice positions as the actual implementation in the WheelSpinner component:

```javascript
// Calculate slice position after rotation
// Formula: (original position - rotation) to account for clockwise movement
let sliceStartAngle = (slice.rotate - normalizedRotation) % 360;
if (sliceStartAngle < 0) sliceStartAngle += 360;
```

This ensures that the tests are testing the actual implementation, not a re-implementation of the logic.
