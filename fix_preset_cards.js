const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const newPresetCardCSS = `
.preset-cards-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 6px;
}

.preset-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  min-height: 58px;
  background: rgba(22, 27, 38, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  gap: 10px;
}

.preset-card:hover {
  background: rgba(0, 240, 255, 0.08);
  border-color: rgba(0, 240, 255, 0.3);
  transform: translateX(3px);
}

.preset-card.active {
  background: rgba(0, 240, 255, 0.15);
  border-color: #00f0ff;
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.preset-info {
  flex: 1;
  min-width: 0;
}

.preset-info h4 {
  font-size: 0.88rem;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.preset-info p {
  font-size: 0.72rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preset-badge {
  font-size: 0.65rem;
  font-family: var(--font-mono);
  font-weight: 700;
  padding: 4px 8px;
  background: rgba(0, 240, 255, 0.15);
  color: #00f0ff;
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}
`;

// Replace old preset-cards-container block
const startIdx = css.indexOf('.preset-cards-container {');
const endIdx = css.indexOf('.delete-preset-btn:hover {');

if (startIdx !== -1 && endIdx !== -1) {
  css = css.substring(0, startIdx) + newPresetCardCSS + '\n\n' + css.substring(endIdx);
  fs.writeFileSync('styles.css', css);
  console.log('styles.css updated with clean preset card styling.');
}
