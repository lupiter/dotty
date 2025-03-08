import { describe, it, expect } from 'vitest';
import { PaletteModel } from '../model';
import { Color } from '../../color/color';

describe('PaletteModel', () => {
  describe('getHistory', () => {
    it('should return empty history for new model', () => {
      const model = new PaletteModel();
      expect(model.getHistory()).toHaveLength(0);
    });
  });

  describe('updateHistory', () => {
    it('should add new color to the beginning of history', () => {
      // Arrange
      const model = new PaletteModel();
      const color = Color.fromHex('#FF0000');

      // Act
      model.updateHistory(color);

      // Assert
      expect(model.getHistory()).toHaveLength(1);
      expect(model.getHistory()[0]).toBe(color);
    });

    it('should deduplicate colors in history', () => {
      // Arrange
      const model = new PaletteModel();
      const color = Color.fromHex('#FF0000');

      // Act
      model.updateHistory(color);
      model.updateHistory(color);

      // Assert
      expect(model.getHistory()).toHaveLength(1);
      expect(model.getHistory()[0]).toBe(color);
    });

    it('should maintain order with newest colors first', () => {
      // Arrange
      const model = new PaletteModel();
      const color1 = Color.fromHex('#FF0000');
      const color2 = Color.fromHex('#00FF00');

      // Act
      model.updateHistory(color1);
      model.updateHistory(color2);

      // Assert
      expect(model.getHistory()).toHaveLength(2);
      expect(model.getHistory()[0]).toBe(color2);
      expect(model.getHistory()[1]).toBe(color1);
    });
  });

  describe('canAddColor', () => {
    it('should always allow colors when not locked', () => {
      // Arrange
      const model = new PaletteModel();
      const color = Color.fromHex('#FF0000');
      const palette: Color[] = [];

      // Act & Assert
      expect(model.canAddColor(color, false, palette)).toBe(true);
    });

    it('should allow colors from palette when locked', () => {
      // Arrange
      const model = new PaletteModel();
      const color = Color.fromHex('#FF0000');
      const palette = [color];

      // Act & Assert
      expect(model.canAddColor(color, true, palette)).toBe(true);
    });

    it('should allow colors from history when locked', () => {
      // Arrange
      const model = new PaletteModel();
      const color = Color.fromHex('#FF0000');
      const palette: Color[] = [];
      model.updateHistory(color);

      // Act & Assert
      expect(model.canAddColor(color, true, palette)).toBe(true);
    });

    it('should not allow new colors when locked', () => {
      // Arrange
      const model = new PaletteModel();
      const color = Color.fromHex('#FF0000');
      const palette: Color[] = [];

      // Act & Assert
      expect(model.canAddColor(color, true, palette)).toBe(false);
    });
  });
}); 