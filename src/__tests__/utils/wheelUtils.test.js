import { calculateWheelSlices } from '../../utils/wheelUtils';
import { COLORS } from '../../utils/constants';

describe('wheelUtils', () => {
  describe('calculateWheelSlices', () => {
    const createWheelData = choices => {
      return choices.map((text, index) => ({
        text,
        color: `color${index + 1}`,
        occurrences: 1,
      }));
    };

    const verifySliceOrder = slices => {
      // Verify that slices are sorted by rotation
      for (let i = 1; i < slices.length; i++) {
        const prevAngle = ((slices[i - 1].rotate % 360) + 360) % 360;
        const currentAngle = ((slices[i].rotate % 360) + 360) % 360;
        expect(currentAngle).toBeGreaterThanOrEqual(prevAngle);
      }

      // Verify that the last slice connects back to the first slice
      const lastSlice = slices[slices.length - 1];
      const firstSlice = slices[0];
      const lastAngle = ((lastSlice.rotate + lastSlice.sliceAngle) % 360) + 360;
      const firstAngle = ((firstSlice.rotate % 360) + 360) % 360;
      expect(firstAngle).toBe(0);
      expect(lastAngle).toBe(360);
    };

    const color1 = COLORS[0];
    const color2 = COLORS[1];
    const color3 = COLORS[2];
    const color4 = COLORS[3];
    const color5 = COLORS[4];
    const color6 = COLORS[5];

    it('should generate correct slices for 1 choice', () => {
      const wheelData = createWheelData(['Choice 1']);
      const slices = calculateWheelSlices(wheelData);

      expect(slices).toEqual([{ text: 'Choice 1', color: color1, rotate: 0, sliceAngle: 360 }]);
      verifySliceOrder(slices);
    });

    it('should generate correct slices for 2 choices', () => {
      const wheelData = createWheelData(['Choice 1', 'Choice 2']);
      const slices = calculateWheelSlices(wheelData);

      expect(slices).toEqual([
        { text: 'Choice 1', color: color1, rotate: 0, sliceAngle: 90 },
        { text: 'Choice 2', color: color2, rotate: 90, sliceAngle: 90 },
        { text: 'Choice 1', color: color1, rotate: 180, sliceAngle: 90 },
        { text: 'Choice 2', color: color2, rotate: 270, sliceAngle: 90 },
      ]);
      verifySliceOrder(slices);
    });

    it('should generate correct slices for 3 choices', () => {
      const wheelData = createWheelData(['Choice 1', 'Choice 2', 'Choice 3']);
      const slices = calculateWheelSlices(wheelData);

      expect(slices).toEqual([
        { text: 'Choice 1', color: color1, rotate: 0, sliceAngle: 60 },
        { text: 'Choice 2', color: color2, rotate: 60, sliceAngle: 60 },
        { text: 'Choice 3', color: color3, rotate: 120, sliceAngle: 60 },
        { text: 'Choice 1', color: color1, rotate: 180, sliceAngle: 60 },
        { text: 'Choice 2', color: color2, rotate: 240, sliceAngle: 60 },
        { text: 'Choice 3', color: color3, rotate: 300, sliceAngle: 60 },
      ]);
      verifySliceOrder(slices);
    });

    it('should generate correct slices for 4 choices', () => {
      const wheelData = createWheelData(['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4']);
      const slices = calculateWheelSlices(wheelData);

      expect(slices).toEqual([
        { text: 'Choice 1', color: color1, rotate: 0, sliceAngle: 45 },
        { text: 'Choice 2', color: color2, rotate: 45, sliceAngle: 45 },
        { text: 'Choice 3', color: color3, rotate: 90, sliceAngle: 45 },
        { text: 'Choice 4', color: color4, rotate: 135, sliceAngle: 45 },
        { text: 'Choice 1', color: color1, rotate: 180, sliceAngle: 45 },
        { text: 'Choice 2', color: color2, rotate: 225, sliceAngle: 45 },
        { text: 'Choice 3', color: color3, rotate: 270, sliceAngle: 45 },
        { text: 'Choice 4', color: color4, rotate: 315, sliceAngle: 45 },
      ]);
      verifySliceOrder(slices);
    });

    it('should generate correct slices for 5 choices', () => {
      const wheelData = createWheelData([
        'Choice 1',
        'Choice 2',
        'Choice 3',
        'Choice 4',
        'Choice 5',
      ]);
      const slices = calculateWheelSlices(wheelData);

      expect(slices).toEqual([
        { text: 'Choice 1', color: color1, rotate: 0, sliceAngle: 36 },
        { text: 'Choice 2', color: color2, rotate: 36, sliceAngle: 36 },
        { text: 'Choice 3', color: color3, rotate: 72, sliceAngle: 36 },
        { text: 'Choice 4', color: color4, rotate: 108, sliceAngle: 36 },
        { text: 'Choice 5', color: color5, rotate: 144, sliceAngle: 36 },
        { text: 'Choice 1', color: color1, rotate: 180, sliceAngle: 36 },
        { text: 'Choice 2', color: color2, rotate: 216, sliceAngle: 36 },
        { text: 'Choice 3', color: color3, rotate: 252, sliceAngle: 36 },
        { text: 'Choice 4', color: color4, rotate: 288, sliceAngle: 36 },
        { text: 'Choice 5', color: color5, rotate: 324, sliceAngle: 36 },
      ]);
      verifySliceOrder(slices);
    });

    it('should generate correct slices for 6 choices', () => {
      const wheelData = createWheelData([
        'Choice 1',
        'Choice 2',
        'Choice 3',
        'Choice 4',
        'Choice 5',
        'Choice 6',
      ]);
      const slices = calculateWheelSlices(wheelData);

      expect(slices).toEqual([
        { text: 'Choice 1', color: color1, rotate: 0, sliceAngle: 60 },
        { text: 'Choice 2', color: color2, rotate: 60, sliceAngle: 60 },
        { text: 'Choice 3', color: color3, rotate: 120, sliceAngle: 60 },
        { text: 'Choice 4', color: color4, rotate: 180, sliceAngle: 60 },
        { text: 'Choice 5', color: color5, rotate: 240, sliceAngle: 60 },
        { text: 'Choice 6', color: color6, rotate: 300, sliceAngle: 60 },
      ]);
      verifySliceOrder(slices);
    });
  });
});
