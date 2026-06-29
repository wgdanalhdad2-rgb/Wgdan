import fs from 'fs';
const text = fs.readFileSync('src/App.tsx', 'utf8');
const matchesBg = text.match(/bg-\[[^\]]+\]/g) || [];
const countsBg: Record<string, number> = {};
matchesBg.forEach(m => countsBg[m] = (countsBg[m] || 0) + 1);
console.log('Backgrounds:', countsBg);

const matchesBorder = text.match(/border-\[[^\]]+\]/g) || [];
const countsBorder: Record<string, number> = {};
matchesBorder.forEach(m => countsBorder[m] = (countsBorder[m] || 0) + 1);
console.log('Borders:', countsBorder);
