const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const newStyles = `
/* --- MASTER PROMPT AUDIT UPGRADE STYLES --- */

/* Toast System */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid var(--neon-cyan, #00f0ff);
  color: #fff;
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-family: var(--font-sans);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  pointer-events: auto;
  animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toast.toast-error {
  border-color: #ff3366;
}

.toast.toast-success {
  border-color: #4cd137;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(50px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Signal Flow Bar */
.signal-flow-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin: 10px 15px;
  flex-wrap: wrap;
  font-size: 0.75rem;
  font-family: var(--font-mono);
}

.sf-title {
  color: var(--text-muted, #888);
  font-weight: 700;
  margin-right: 4px;
}

.sf-node {
  padding: 4px 10px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: #888;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.sf-node.active {
  background: rgba(0, 240, 255, 0.1);
  color: var(--neon-cyan, #00f0ff);
  border-color: rgba(0, 240, 255, 0.3);
}

.sf-node:hover {
  border-color: var(--neon-pink, #ff007f);
  color: #fff;
}

.sf-arrow {
  color: rgba(255, 255, 255, 0.2);
}
`;

if (!css.includes('toast-container')) {
  css += '\n' + newStyles;
  fs.writeFileSync('styles.css', css);
  console.log('styles.css updated with toast & signal flow styles.');
}
