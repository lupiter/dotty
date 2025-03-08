import { describe, it, expect, beforeEach } from 'vitest';
import { UndoManager, UndoState } from '../undo-manager';

describe('UndoManager', () => {
  let initialState: UndoState;

  beforeEach(() => {
    initialState = {
      past: [],
      current: 'initial',
      future: []
    };
  });

  describe('canUndo', () => {
    it('should return false when there is no past state', () => {
      expect(UndoManager.canUndo(initialState)).toBe(false);
    });

    it('should return true when there is past state', () => {
      const state = {
        past: ['past1'],
        current: 'current',
        future: []
      };
      expect(UndoManager.canUndo(state)).toBe(true);
    });
  });

  describe('canRedo', () => {
    it('should return false when there is no future state', () => {
      expect(UndoManager.canRedo(initialState)).toBe(false);
    });

    it('should return true when there is future state', () => {
      const state = {
        past: [],
        current: 'current',
        future: ['future1']
      };
      expect(UndoManager.canRedo(state)).toBe(true);
    });
  });

  describe('tick', () => {
    it('should add current state to past and update current', () => {
      const newState = UndoManager.tick(initialState, 'new state');
      
      expect(newState.past).toEqual(['initial']);
      expect(newState.current).toBe('new state');
      expect(newState.future).toEqual([]);
    });

    it('should clear future states when new tick occurs', () => {
      const stateWithFuture = {
        past: [],
        current: 'current',
        future: ['future1', 'future2']
      };

      const newState = UndoManager.tick(stateWithFuture, 'new state');
      
      expect(newState.past).toEqual(['current']);
      expect(newState.current).toBe('new state');
      expect(newState.future).toEqual([]);
    });
  });

  describe('undo', () => {
    it('should not modify state when no past states exist', () => {
      const newState = UndoManager.undo(initialState);
      
      expect(newState).toEqual(initialState);
    });

    it('should move current to future and restore last past state', () => {
      const stateWithPast = {
        past: ['past1', 'past2'],
        current: 'current',
        future: []
      };

      const newState = UndoManager.undo(stateWithPast);
      
      expect(newState.past).toEqual(['past1']);
      expect(newState.current).toBe('past2');
      expect(newState.future).toEqual(['current']);
    });
  });

  describe('redo', () => {
    it('should not modify state when no future states exist', () => {
      const newState = UndoManager.redo(initialState);
      
      expect(newState).toEqual(initialState);
    });

    it('should move current to past and restore next future state', () => {
      const stateWithFuture = {
        past: [],
        current: 'current',
        future: ['future1', 'future2']
      };

      const newState = UndoManager.redo(stateWithFuture);
      
      expect(newState.past).toEqual(['current']);
      expect(newState.current).toBe('future2');
      expect(newState.future).toEqual(['future1']);
    });
  });

  describe('complete workflow', () => {
    it('should handle a sequence of operations correctly', () => {
      let state = initialState;
      
      // Add some states
      state = UndoManager.tick(state, 'state1');
      state = UndoManager.tick(state, 'state2');
      state = UndoManager.tick(state, 'state3');

      expect(state.past).toEqual(['initial', 'state1', 'state2']);
      expect(state.current).toBe('state3');
      expect(state.future).toEqual([]);

      // Undo twice
      state = UndoManager.undo(state);
      state = UndoManager.undo(state);

      expect(state.past).toEqual(['initial']);
      expect(state.current).toBe('state1');
      expect(state.future).toEqual(['state3', 'state2']);

      // Redo once
      state = UndoManager.redo(state);

      expect(state.past).toEqual(['initial', 'state1']);
      expect(state.current).toBe('state2');
      expect(state.future).toEqual(['state3']);

      // New tick should clear future
      state = UndoManager.tick(state, 'new state');

      expect(state.past).toEqual(['initial', 'state1', 'state2']);
      expect(state.current).toBe('new state');
      expect(state.future).toEqual([]);
    });
  });
}); 