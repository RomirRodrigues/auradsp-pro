const fs = require('fs');

const themes = [
  { id: 'theme-sunset', name: 'Sunset Gradient', bg: '#1a0b1c', panel: 'rgba(38, 14, 28, 0.9)', accent1: '#ff4b1f', accent2: '#ff9068', text: '#ffe6e6' },
  { id: 'theme-forest', name: 'Deep Forest', bg: '#0b1c10', panel: 'rgba(14, 38, 22, 0.9)', accent1: '#11998e', accent2: '#38ef7d', text: '#e6ffe6' },
  { id: 'theme-neon-tokyo', name: 'Neon Tokyo', bg: '#09080e', panel: 'rgba(23, 17, 36, 0.9)', accent1: '#ff007f', accent2: '#00f0ff', text: '#ffffff' },
  { id: 'theme-coffee', name: 'Morning Coffee', bg: '#1c1511', panel: 'rgba(46, 32, 23, 0.9)', accent1: '#c0a080', accent2: '#8b5a2b', text: '#f0e6d2' },
  { id: 'theme-hacker', name: 'Terminal Hacker', bg: '#000000', panel: 'rgba(0, 20, 0, 0.9)', accent1: '#00ff00', accent2: '#009900', text: '#00ff00' },
  { id: 'theme-lavender', name: 'Lavender Dream', bg: '#181522', panel: 'rgba(35, 30, 48, 0.9)', accent1: '#b39ddb', accent2: '#7e57c2', text: '#f3e5f5' },
  { id: 'theme-volcano', name: 'Volcanic Ash', bg: '#110c0c', panel: 'rgba(36, 20, 20, 0.9)', accent1: '#ff3300', accent2: '#cc0000', text: '#ffcccc' },
  { id: 'theme-ice', name: 'Arctic Ice', bg: '#0a192f', panel: 'rgba(17, 43, 79, 0.9)', accent1: '#64ffda', accent2: '#00bfff', text: '#e6f1ff' },
  { id: 'theme-bubblegum', name: 'Bubblegum Pop', bg: '#2b1b24', panel: 'rgba(64, 36, 52, 0.9)', accent1: '#ff77ff', accent2: '#ff33cc', text: '#ffe6f9' },
  { id: 'theme-military', name: 'Military Camo', bg: '#171a15', panel: 'rgba(36, 43, 30, 0.9)', accent1: '#8bc34a', accent2: '#558b2f', text: '#f1f8e9' },
  { id: 'theme-cherry', name: 'Cherry Blossom', bg: '#2a1a1f', panel: 'rgba(56, 30, 40, 0.9)', accent1: '#ffb7b2', accent2: '#e28495', text: '#ffe5ec' },
  { id: 'theme-royal', name: 'Royal Purple', bg: '#130b1f', panel: 'rgba(32, 17, 56, 0.9)', accent1: '#9c27b0', accent2: '#6a1b9a', text: '#f3e5f5' },
  { id: 'theme-mustard', name: 'Mustard Yellow', bg: '#1a180b', panel: 'rgba(43, 38, 14, 0.9)', accent1: '#ffc107', accent2: '#ffa000', text: '#fffde7' },
  { id: 'theme-navy', name: 'Navy Blue', bg: '#0b101c', panel: 'rgba(14, 25, 46, 0.9)', accent1: '#1976d2', accent2: '#0d47a1', text: '#e3f2fd' },
  { id: 'theme-teal', name: 'Vibrant Teal', bg: '#091c1b', panel: 'rgba(13, 46, 44, 0.9)', accent1: '#009688', accent2: '#00796b', text: '#e0f2f1' },
  { id: 'theme-coral', name: 'Coral Reef', bg: '#241413', panel: 'rgba(54, 26, 24, 0.9)', accent1: '#ff7f50', accent2: '#ff6b6b', text: '#ffece6' },
  { id: 'theme-mint', name: 'Fresh Mint', bg: '#0d1c16', panel: 'rgba(19, 46, 34, 0.9)', accent1: '#98ff98', accent2: '#3cb371', text: '#e6ffe6' },
  { id: 'theme-rose', name: 'Rose Gold', bg: '#1f1617', panel: 'rgba(51, 33, 36, 0.9)', accent1: '#b76e79', accent2: '#c07c88', text: '#f9f1f2' },
  { id: 'theme-slate', name: 'Slate Gray', bg: '#15171a', panel: 'rgba(32, 36, 43, 0.9)', accent1: '#708090', accent2: '#778899', text: '#f8f9fa' },
  { id: 'theme-amber', name: 'Glowing Amber', bg: '#1c130b', panel: 'rgba(46, 29, 14, 0.9)', accent1: '#ffbf00', accent2: '#ff8c00', text: '#fff8e1' },
  { id: 'theme-peacock', name: 'Peacock Feather', bg: '#0a161c', panel: 'rgba(14, 38, 48, 0.9)', accent1: '#33a1c9', accent2: '#20b2aa', text: '#e6f7ff' },
  { id: 'theme-wine', name: 'Red Wine', bg: '#1a080c', panel: 'rgba(46, 11, 18, 0.9)', accent1: '#722f37', accent2: '#8b0000', text: '#ffcccc' },
  { id: 'theme-pumpkin', name: 'Pumpkin Spice', bg: '#1c1007', panel: 'rgba(48, 25, 10, 0.9)', accent1: '#ff7518', accent2: '#e65c00', text: '#ffeee6' },
  { id: 'theme-sapphire', name: 'Sapphire Crystal', bg: '#060a1c', panel: 'rgba(10, 18, 48, 0.9)', accent1: '#0f52ba', accent2: '#082567', text: '#e6ebff' },
  { id: 'theme-emerald', name: 'Emerald Gem', bg: '#061a10', panel: 'rgba(11, 43, 25, 0.9)', accent1: '#50c878', accent2: '#2e8b57', text: '#e6ffe6' },
  { id: 'theme-amethyst', name: 'Amethyst Stone', bg: '#150a1f', panel: 'rgba(34, 15, 51, 0.9)', accent1: '#9966cc', accent2: '#663399', text: '#f2e6ff' },
  { id: 'theme-bronze', name: 'Polished Bronze', bg: '#1a130b', panel: 'rgba(46, 31, 15, 0.9)', accent1: '#cd7f32', accent2: '#a0522d', text: '#fdf5e6' },
  { id: 'theme-silver', name: 'Metallic Silver', bg: '#171717', panel: 'rgba(43, 43, 43, 0.9)', accent1: '#c0c0c0', accent2: '#a9a9a9', text: '#ffffff' },
  { id: 'theme-rust', name: 'Rusted Iron', bg: '#1c0f0a', panel: 'rgba(48, 23, 14, 0.9)', accent1: '#b7410e', accent2: '#8b4513', text: '#ffe6cc' },
  { id: 'theme-olive', name: 'Olive Grove', bg: '#15170b', panel: 'rgba(35, 38, 14, 0.9)', accent1: '#808000', accent2: '#556b2f', text: '#f5f5dc' },
  { id: 'theme-plum', name: 'Deep Plum', bg: '#170c17', panel: 'rgba(41, 19, 41, 0.9)', accent1: '#dda0dd', accent2: '#800080', text: '#ffe6ff' },
  { id: 'theme-cyan', name: 'Electric Cyan', bg: '#05171a', panel: 'rgba(10, 39, 43, 0.9)', accent1: '#00ffff', accent2: '#00ced1', text: '#e6ffff' },
  { id: 'theme-magenta', name: 'Pure Magenta', bg: '#1a0517', panel: 'rgba(43, 10, 39, 0.9)', accent1: '#ff00ff', accent2: '#c71585', text: '#ffe6ff' },
  { id: 'theme-indigo', name: 'Indigo Night', bg: '#0d0b1a', panel: 'rgba(21, 17, 46, 0.9)', accent1: '#4b0082', accent2: '#483d8b', text: '#e6e6ff' },
  { id: 'theme-lemon', name: 'Lemon Drop', bg: '#1a1a05', panel: 'rgba(43, 43, 10, 0.9)', accent1: '#fffacd', accent2: '#ffd700', text: '#ffffe6' },
  { id: 'theme-peach', name: 'Soft Peach', bg: '#1f1513', panel: 'rgba(54, 34, 30, 0.9)', accent1: '#ffdab9', accent2: '#ffa07a', text: '#fff0e6' },
  { id: 'theme-crimson', name: 'Crimson Red', bg: '#1a0609', panel: 'rgba(43, 11, 17, 0.9)', accent1: '#dc143c', accent2: '#b22222', text: '#ffcccc' },
  { id: 'theme-sky', name: 'Sky Blue', bg: '#0b161f', panel: 'rgba(17, 39, 56, 0.9)', accent1: '#87ceeb', accent2: '#4682b4', text: '#e6f2ff' },
  { id: 'theme-lime', name: 'Neon Lime', bg: '#0d1a08', panel: 'rgba(20, 43, 11, 0.9)', accent1: '#32cd32', accent2: '#00ff00', text: '#e6ffe6' },
  { id: 'theme-salmon', name: 'Salmon Pink', bg: '#1c1010', panel: 'rgba(48, 25, 25, 0.9)', accent1: '#fa8072', accent2: '#e9967a', text: '#ffe6e6' },
  { id: 'theme-chocolate', name: 'Dark Chocolate', bg: '#170e0a', panel: 'rgba(38, 20, 11, 0.9)', accent1: '#d2691e', accent2: '#8b4513', text: '#ffe6cc' },
  { id: 'theme-ivory', name: 'Ivory White', bg: '#f0f0f0', panel: 'rgba(255, 255, 255, 0.9)', accent1: '#8b8b8b', accent2: '#555555', text: '#333333' },
  { id: 'theme-sepia', name: 'Sepia Tone', bg: '#1f1c18', panel: 'rgba(56, 48, 38, 0.9)', accent1: '#e3dac9', accent2: '#c4b59d', text: '#fcfaf5' },
  { id: 'theme-turquoise', name: 'Turquoise Gem', bg: '#081c1c', panel: 'rgba(12, 48, 48, 0.9)', accent1: '#40e0d0', accent2: '#00ced1', text: '#e6ffff' },
  { id: 'theme-violet', name: 'Deep Violet', bg: '#12051c', panel: 'rgba(29, 10, 48, 0.9)', accent1: '#ee82ee', accent2: '#9400d3', text: '#ffe6ff' },
  { id: 'theme-jade', name: 'Jade Green', bg: '#0b1a13', panel: 'rgba(16, 43, 30, 0.9)', accent1: '#00a86b', accent2: '#2e8b57', text: '#e6ffe6' },
  { id: 'theme-ruby', name: 'Ruby Red', bg: '#1c050a', panel: 'rgba(48, 10, 19, 0.9)', accent1: '#e0115f', accent2: '#c71585', text: '#ffcccc' },
  { id: 'theme-pearl', name: 'Pearl White', bg: '#f5f5f5', panel: 'rgba(255, 255, 255, 0.95)', accent1: '#b0c4de', accent2: '#778899', text: '#222222' },
  { id: 'theme-obsidian', name: 'Obsidian Glass', bg: '#050505', panel: 'rgba(15, 15, 15, 0.85)', accent1: '#555555', accent2: '#333333', text: '#dddddd' },
  { id: 'theme-nebula', name: 'Cosmic Nebula', bg: '#120a1c', panel: 'rgba(30, 15, 48, 0.9)', accent1: '#ff00ff', accent2: '#00ffff', text: '#ffe6ff' }
];

let htmlOptions = '';
let cssClasses = '';

themes.forEach((t, index) => {
  htmlOptions += `          <option value="${t.id}">${t.name}</option>\n`;
  
  // Helper to dim colors for hover states
  const cardHover = t.bg === '#000000' ? 'rgba(30,30,30,0.9)' : t.panel.replace('0.9', '1').replace('0.85', '0.95');

  cssClasses += `
/* 12+${index + 1}. ${t.name} */
body.${t.id} {
  --bg-primary: ${t.bg};
  --bg-panel: ${t.panel};
  --bg-card: ${t.panel.replace('0.9', '0.7').replace('0.85', '0.6')};
  --bg-card-hover: ${cardHover};
  --accent-cyan: ${t.accent1};
  --accent-neon: ${t.accent2};
  --accent-amber: ${t.accent1};
  --accent-green: ${t.accent2};
  --accent-red: ${t.accent1};
  --text-main: ${t.text};
  --border-color: ${t.accent1}40;
  --border-hardware: ${t.accent2}20;
}
`;
});

// Update index.html
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('</select>', htmlOptions + '        </select>');
fs.writeFileSync('index.html', html);

// Update styles.css
let css = fs.readFileSync('styles.css', 'utf8');
css += cssClasses;
fs.writeFileSync('styles.css', css);

console.log("Added 50 new themes successfully.");
