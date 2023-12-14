export type UndoState = {
  past: string[];
  current: string;
  future: string[];
};

export class UndoManager {
  static canUndo(state: UndoState) {
    return state.past.length > 0;
  }

  static canRedo(state: UndoState) {
    return state.future.length > 0;
  }

  static tick(state: UndoState, tick: string): UndoState {
    state.past.push(state.current);
    state.current = tick;
    state.future = [];
    return state;
  }

  static undo(state: UndoState): UndoState {
    const popped = state.past.pop();
    if (popped) {
      state.future.push(state.current);
      state.current = popped;
    }
    return state;
  }

  static redo(state: UndoState): UndoState {
    const popped = state.future.pop();
    if (popped) {
      state.past.push(state.current);
      state.current = popped;
    }
    return state;
  }
}
