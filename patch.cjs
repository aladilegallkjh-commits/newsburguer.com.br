const fs = require('fs');
const content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf-8');
const replacement = fs.readFileSync('pedidos_replacement.txt', 'utf-8');
const startIdx = content.indexOf('function PedidosTab() {');
const endIdx = content.indexOf('function CardapioTab() {');
if (startIdx !== -1 && endIdx !== -1) {
  const newContent = content.substring(0, startIdx) + replacement + '\n\n' + content.substring(endIdx);
  fs.writeFileSync('client/src/pages/AdminDashboard.tsx', newContent);
  console.log('Replaced successfully');
} else {
  console.log('Indices not found');
}
