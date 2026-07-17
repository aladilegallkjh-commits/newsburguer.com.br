const fs = require('fs');
let content = fs.readFileSync('client/src/lib/menuData.ts', 'utf8');
content = content.replace('export interface CustomIngredient {', 'export interface CustomIngredient {\n  image?: string;');
const images = {
  'ci-pao-brioche': 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?q=80&w=200&auto=format&fit=crop',
  'ci-pao-hotdog': 'https://images.unsplash.com/photo-1619881589316-56c7f9e6b587?q=80&w=200&auto=format&fit=crop',
  'ci-pao-hotdog-25cm': 'https://images.unsplash.com/photo-1619881589316-56c7f9e6b587?q=80&w=200&auto=format&fit=crop',
  'ci-burger-180': 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=200&auto=format&fit=crop',
  'ci-smash-90': 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=200&auto=format&fit=crop',
  'ci-salsicha': 'https://images.unsplash.com/photo-1534122119098-b80c5ce3d800?q=80&w=200&auto=format&fit=crop',
  'ci-frango': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=200&auto=format&fit=crop',
  'ci-bacon': 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?q=80&w=200&auto=format&fit=crop',
  'ci-calabresa': 'https://images.unsplash.com/photo-1529177114674-cfaea0f5139a?q=80&w=200&auto=format&fit=crop',
  'ci-ovo': 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?q=80&w=200&auto=format&fit=crop',
  'ci-cheddar': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=200&auto=format&fit=crop',
  'ci-cream-cheese': 'https://images.unsplash.com/photo-1628178652431-89d8db18f3a8?q=80&w=200&auto=format&fit=crop',
  'ci-catupiry': 'https://images.unsplash.com/photo-1628178652431-89d8db18f3a8?q=80&w=200&auto=format&fit=crop',
  'ci-molho-barbecue': 'https://images.unsplash.com/photo-1585325701165-351af916e581?q=80&w=200&auto=format&fit=crop',
  'ci-molho-especial': 'https://images.unsplash.com/photo-1622978135891-b9627715ecda?q=80&w=200&auto=format&fit=crop',
  'ci-molho-picante': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=200&auto=format&fit=crop',
  'ci-molho-news': 'https://images.unsplash.com/photo-1622978135891-b9627715ecda?q=80&w=200&auto=format&fit=crop',
  'ci-maionese': 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?q=80&w=200&auto=format&fit=crop',
  'ci-alface': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?q=80&w=200&auto=format&fit=crop',
  'ci-tomate': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=200&auto=format&fit=crop',
  'ci-cebola': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=200&auto=format&fit=crop',
  'ci-picles': 'https://images.unsplash.com/photo-1520696956693-455b57223e74?q=80&w=200&auto=format&fit=crop',
  'ci-milho': 'https://images.unsplash.com/photo-1533038662993-4d4361abcc0f?q=80&w=200&auto=format&fit=crop',
  'ci-onion-rings': 'https://images.unsplash.com/photo-1639024471210-203b573a6eeb?q=80&w=200&auto=format&fit=crop',
  'ci-doritos': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=200&auto=format&fit=crop',
  'ci-batata-palha': 'https://images.unsplash.com/photo-1541592102775-7b8ac428ce0c?q=80&w=200&auto=format&fit=crop',
  'ci-oregano': 'https://images.unsplash.com/photo-1596647242171-ec59d04bc2ad?q=80&w=200&auto=format&fit=crop'
};
for(const [id, url] of Object.entries(images)) {
  const regex = new RegExp(`({ id: '${id}'.*?})`, 'g');
  content = content.replace(regex, (match) => match.replace('}', `, image: '${url}' }`));
}
fs.writeFileSync('client/src/lib/menuData.ts', content);
console.log('Script executado com sucesso.');
