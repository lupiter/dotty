import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaletteController } from './controller';
import { PaletteModel } from './model';
import { Color } from '../color/color';
import { PALETTE } from '../modal/palette-limit';
import type { ChangeEvent } from 'react';

describe('PaletteController', () => {
  let controller: PaletteController;
  let model: PaletteModel;
  let mockOnColorChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create fresh instances and mocks for each test
    model = new PaletteModel();
    controller = new PaletteController(model);
    mockOnColorChange = vi.fn();
  });

  describe('handleColorChange', () => {
    it('should update history and call onColorChange when color is allowed', () => {
      // Arrange
      const color = Color.fromHex('#FF0000');
      const locked = false;
      const palette: Color[] = [];
      vi.spyOn(model, 'updateHistory');
      vi.spyOn(model, 'canAddColor').mockReturnValue(true);

      // Act
      controller.handleColorChange(
        color,
        locked,
        palette,
        PALETTE.FULL,
        mockOnColorChange
      );

      // Assert
      expect(model.updateHistory).toHaveBeenCalledWith(color);
      expect(mockOnColorChange).toHaveBeenCalled();
    });

    it('should not update when color is not allowed in locked mode', () => {
      // Arrange
      const color = Color.fromHex('#FF0000');
      const locked = true;
      const palette: Color[] = [];
      vi.spyOn(model, 'updateHistory');
      vi.spyOn(model, 'canAddColor').mockReturnValue(false);

      // Act
      controller.handleColorChange(
        color,
        locked,
        palette,
        PALETTE.FULL,
        mockOnColorChange
      );

      // Assert
      expect(model.updateHistory).not.toHaveBeenCalled();
      expect(mockOnColorChange).not.toHaveBeenCalled();
    });

    it('should apply color limit before calling onColorChange', () => {
      // Arrange
      const color = Color.fromHex('#FF0000');
      const locked = false;
      const palette: Color[] = [];
      vi.spyOn(color, 'limit');

      // Act
      controller.handleColorChange(
        color,
        locked,
        palette,
        PALETTE.FULL,
        mockOnColorChange
      );

      // Assert
      expect(color.limit).toHaveBeenCalledWith(PALETTE.FULL);
      expect(mockOnColorChange).toHaveBeenCalled();
    });
  });

  describe('handleInputChange', () => {
    it('should convert input value to Color and call handleColorChange', () => {
      // Arrange
      const mockEvent = {
        target: { value: '#FF0000' }
      } as ChangeEvent<HTMLInputElement>;
      const locked = false;
      const palette: Color[] = [];
      vi.spyOn(Color, 'fromHex');
      vi.spyOn(controller, 'handleColorChange');

      // Act
      controller.handleInputChange(
        mockEvent,
        locked,
        palette,
        PALETTE.FULL,
        mockOnColorChange
      );

      // Assert
      expect(Color.fromHex).toHaveBeenCalledWith('#FF0000');
      expect(controller.handleColorChange).toHaveBeenCalled();
    });

    it('should handle invalid color input gracefully', () => {
      // Arrange
      const mockEvent = {
        target: { value: 'invalid-color' }
      } as ChangeEvent<HTMLInputElement>;
      const locked = false;
      const palette: Color[] = [];
      vi.spyOn(console, 'error').mockImplementation(() => {});

      // Act & Assert
      expect(() => {
        controller.handleInputChange(
          mockEvent,
          locked,
          palette,
          PALETTE.FULL,
          mockOnColorChange
        );
      }).not.toThrow();
    });
  });
}); 