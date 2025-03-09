import { describe, it, expect, vi, beforeEach } from 'vitest';
import { keyboardShortcut } from '../shortcuts';
import { TOOL } from '../../tools/tools';
import { DottyState } from '../../state';
import { Color } from '../../color/color';
import { PALETTE } from '../../modal/palette-limit';
import { PIXEL_SHAPE } from '../../modal/view-options';

describe('keyboardShortcut', () => {
  // Setup common test variables
  const mockState: DottyState = {
    tool: TOOL.PENCIL,
    ModalContent: undefined,
    undo: { past: [], future: [], current: '' },
    color: Color.fromHex('#000000'),
    title: '',
    zoom: 1,
    size: { width: 32, height: 32 },
    documentScroll: { x: 0, y: 0 },
    pan: { x: 0, y: 0 },
    palette: [],
    paletteLimit: PALETTE.FULL,
    paletteLocked: false,
    pixelShape: PIXEL_SHAPE.SQUARE
  };
  const mockSetState = vi.fn();
  const mockOnSave = vi.fn();
  const mockUndo = vi.fn();
  const mockRedo = vi.fn();
  const mockZoomIn = vi.fn();
  const mockZoomOut = vi.fn();
  const mockZoomFit = vi.fn();
  
  // Mock modal components that return JSX elements
  const mockExportModal = vi.fn().mockImplementation(({ onClose }) => {
    return <div onClick={onClose}>Export</div>;
  });
  const mockOpenModal = vi.fn().mockImplementation(({ onClose }) => {
    return <div onClick={onClose}>Open</div>;
  });
  const mockNewModal = vi.fn().mockImplementation(({ onClose }) => {
    return <div onClick={onClose}>New</div>;
  });
  const mockSaveAsModal = vi.fn().mockImplementation(({ onClose }) => {
    return <div onClick={onClose}>Save As</div>;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test modal-opening shortcuts
  it('opens export modal with Ctrl/Cmd + E', () => {
    const event = new KeyboardEvent('keydown', { key: 'e', metaKey: true });
    keyboardShortcut(
      event,
      mockState,
      mockSetState,
      mockOnSave,
      mockUndo,
      mockRedo,
      mockZoomIn,
      mockZoomOut,
      mockZoomFit,
      mockExportModal,
      mockOpenModal,
      mockNewModal,
      mockSaveAsModal
    );
    expect(mockSetState).toHaveBeenCalledWith({ ...mockState, ModalContent: mockExportModal });
  });

  // Test save functionality
  it('triggers save with Ctrl/Cmd + S', () => {
    const event = new KeyboardEvent('keydown', { key: 's', metaKey: true });
    keyboardShortcut(
      event,
      mockState,
      mockSetState,
      mockOnSave,
      mockUndo,
      mockRedo,
      mockZoomIn,
      mockZoomOut,
      mockZoomFit,
      mockExportModal,
      mockOpenModal,
      mockNewModal,
      mockSaveAsModal
    );
    expect(mockOnSave).toHaveBeenCalled();
  });

  // Test tool shortcuts
  it('changes to pencil tool with "b" key', () => {
    const event = new KeyboardEvent('keydown', { key: 'b' });
    keyboardShortcut(
      event,
      mockState,
      mockSetState,
      mockOnSave,
      mockUndo,
      mockRedo,
      mockZoomIn,
      mockZoomOut,
      mockZoomFit,
      mockExportModal,
      mockOpenModal,
      mockNewModal,
      mockSaveAsModal
    );
    expect(mockSetState).toHaveBeenCalledWith({ ...mockState, tool: TOOL.PENCIL });
  });

  // Test undo/redo functionality
  it('triggers undo with Ctrl/Cmd + Z', () => {
    const event = new KeyboardEvent('keydown', { key: 'z', metaKey: true });
    keyboardShortcut(
      event,
      mockState,
      mockSetState,
      mockOnSave,
      mockUndo,
      mockRedo,
      mockZoomIn,
      mockZoomOut,
      mockZoomFit,
      mockExportModal,
      mockOpenModal,
      mockNewModal,
      mockSaveAsModal
    );
    expect(mockUndo).toHaveBeenCalled();
  });

  it('triggers redo with Ctrl/Cmd + Shift + Z', () => {
    const event = new KeyboardEvent('keydown', { key: 'Z', metaKey: true, shiftKey: true });
    keyboardShortcut(
      event,
      mockState,
      mockSetState,
      mockOnSave,
      mockUndo,
      mockRedo,
      mockZoomIn,
      mockZoomOut,
      mockZoomFit,
      mockExportModal,
      mockOpenModal,
      mockNewModal,
      mockSaveAsModal
    );
    expect(mockRedo).toHaveBeenCalled();
  });

  // Test zoom functionality
  it('triggers zoom in with Ctrl/Cmd + =', () => {
    const event = new KeyboardEvent('keydown', { key: '=', metaKey: true });
    keyboardShortcut(
      event,
      mockState,
      mockSetState,
      mockOnSave,
      mockUndo,
      mockRedo,
      mockZoomIn,
      mockZoomOut,
      mockZoomFit,
      mockExportModal,
      mockOpenModal,
      mockNewModal,
      mockSaveAsModal
    );
    expect(mockZoomIn).toHaveBeenCalled();
  });

  it('triggers zoom out with Ctrl/Cmd + -', () => {
    const event = new KeyboardEvent('keydown', { key: '-', metaKey: true });
    keyboardShortcut(
      event,
      mockState,
      mockSetState,
      mockOnSave,
      mockUndo,
      mockRedo,
      mockZoomIn,
      mockZoomOut,
      mockZoomFit,
      mockExportModal,
      mockOpenModal,
      mockNewModal,
      mockSaveAsModal
    );
    expect(mockZoomOut).toHaveBeenCalled();
  });
}); 