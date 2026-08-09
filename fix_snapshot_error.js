const fs = require('fs');
let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

const safeSnapshotMethods = `
  // --- A, B, C, D SNAPSHOT ENGINE ---
  saveSnapshot(key) {
    if (!['A','B','C','D'].includes(key)) return;
    if (!this.snapshots) this.snapshots = { A: null, B: null, C: null, D: null };
    this.snapshots[key] = this.getSnapshot();
  }

  loadSnapshot(key) {
    if (!this.snapshots) this.snapshots = { A: null, B: null, C: null, D: null };
    if (!this.snapshots[key]) return false;
    this.applySnapshot(this.snapshots[key]);
    this.activeSnapshotKey = key;
    return true;
  }

  // --- UNDO / REDO HISTORY ENGINE ---
  pushHistory() {
    if (!this.undoStack) this.undoStack = [];
    if (!this.redoStack) this.redoStack = [];
    const currentState = this.getSnapshot();
    this.undoStack.push(JSON.stringify(currentState));
    if (this.undoStack.length > 50) this.undoStack.shift();
    this.redoStack = [];
  }

  undo() {
    if (!this.undoStack || this.undoStack.length === 0) return false;
    if (!this.redoStack) this.redoStack = [];
    const currentState = this.getSnapshot();
    this.redoStack.push(JSON.stringify(currentState));
    const prevState = JSON.parse(this.undoStack.pop());
    this.applySnapshot(prevState);
    return true;
  }

  redo() {
    if (!this.redoStack || this.redoStack.length === 0) return false;
    if (!this.undoStack) this.undoStack = [];
    const currentState = this.getSnapshot();
    this.undoStack.push(JSON.stringify(currentState));
    const nextState = JSON.parse(this.redoStack.pop());
    this.applySnapshot(nextState);
    return true;
  }
`;

engine = engine.replace(/\/\/\s*--- A, B, C, D SNAPSHOT ENGINE ---[\s\S]*?return true;\s*\}/, safeSnapshotMethods);
fs.writeFileSync('js/audio/audio-engine.js', engine);
console.log('Fixed js/audio/audio-engine.js with defensive snapshot initialization.');
