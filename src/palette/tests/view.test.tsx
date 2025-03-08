import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { PaletteView } from '../view';
import { PaletteModel } from '../model';
import { PaletteController } from '../controller';
import { Color } from '../../color/color';
import { PALETTE } from '../../modal/palette-limit';

describe('PaletteView', () => {
  const setupTest = () => {
    const model = new PaletteModel();
    const controller = new PaletteController(model);
    const onColorChange = vi.fn();
    const color = Color.fromHex('#FF0000');
    const palette = [Color.fromHex('#00FF00'), Color.fromHex('#0000FF')];

    return {
      model,
      controller,
      onColorChange,
      color,
      palette,
      render: (props?: Partial<Parameters<typeof PaletteView>[0]>) =>
        render(
          <PaletteView
            color={color}
            onColorChange={onColorChange}
            palette={palette}
            limit={PALETTE.FULL}
            locked={false}
            model={model}
            controller={controller}
            {...props}
          />
        ),
    };
  };

  describe('rendering', () => {
    it('should render color input with current color value', () => {
      const { render, color } = setupTest();
      render();
      
      const input = screen.getByLabelText('Current color') as HTMLInputElement;
      expect(input.value).toBe(color.hex);
    });

    it('should show palette limit label when not FULL', () => {
      const { render } = setupTest();
      render({ limit: PALETTE.GBC });
      
      expect(screen.getByText('GBC')).toBeInTheDocument();
    });

    it('should not show palette limit label when FULL', () => {
      const { render } = setupTest();
      render({ limit: PALETTE.FULL });
      
      expect(screen.queryByText('Unlimited')).not.toBeInTheDocument();
    });

    it('should show lock icon when locked', () => {
      const { render } = setupTest();
      render({ locked: true });
      
      expect(screen.getByAltText('Palette locked')).toBeInTheDocument();
    });

    it('should render palette colors as buttons', () => {
      const { render, palette } = setupTest();
      render();
      
      palette.forEach(color => {
        expect(screen.getByText(color.hex)).toBeInTheDocument();
      });
    });

    it('should render history colors when available', () => {
      const { render, model, color } = setupTest();
      model.updateHistory(color);
      render();
      
      expect(screen.getAllByText(color.hex)).toHaveLength(1);
    });
  });

  describe('interactions', () => {
    it('should call controller when color input changes', () => {
      const { render, controller } = setupTest();
      const spy = vi.spyOn(controller, 'handleInputChange');
      render();
      
      const input = screen.getByLabelText('Current color');
      fireEvent.change(input, { target: { value: '#00FF00' } });
      
      expect(spy).toHaveBeenCalled();
    });

    it('should call controller when palette color is clicked', () => {
      const { render, controller, palette } = setupTest();
      const spy = vi.spyOn(controller, 'handleColorChange');
      render();
      
      const colorButton = screen.getByText(palette[0].hex);
      fireEvent.click(colorButton);
      
      expect(spy).toHaveBeenCalledWith(
        palette[0],
        false,
        palette,
        PALETTE.FULL,
        expect.any(Function)
      );
    });

    it('should call controller when history color is clicked', () => {
      const { render, controller, model, color } = setupTest();
      model.updateHistory(color);
      const spy = vi.spyOn(controller, 'handleColorChange');
      render();
      
      const colorButton = screen.getByText(color.hex);
      fireEvent.click(colorButton);
      
      expect(spy).toHaveBeenCalled();
    });
  });
}); 