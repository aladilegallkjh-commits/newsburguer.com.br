export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  category: string;
  image?: string;
  ingredients?: string[];
  availableExtras?: Extra[];
  hasRemovableIngredients?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  emoji: string;
}

export interface Extra {
  id: string;
  name: string;
  price: number;
}

export interface ProductCustomization {
  removedIngredients: string[];
  addedExtras: Extra[];
  notes: string;
}

export const categories: MenuCategory[] = [
  { id: 'burgers', name: 'Hambúrgueres', emoji: '🍔' },
  { id: 'hotdogs', name: 'Hot Dogs', emoji: '🌭' },
  { id: 'combos', name: 'Combos', emoji: '🔥' },
  { id: 'drinks', name: 'Bebidas', emoji: '🥤' },
  { id: 'custom', name: 'Crie Seu Lanche', emoji: '👨‍🍳' },
];

export interface CustomIngredient {
  image?: string;
  id: string;
  name: string;
  emoji: string;
  price: number;
  category: 'paes' | 'carnes' | 'queijos' | 'molhos' | 'vegetais' | 'extras';
  categoryLabel: string;
}

export const customIngredients: CustomIngredient[] = [
  // Pães
  { id: 'ci-pao-brioche', name: 'Pão Brioche', emoji: '🍞', price: 4.00, category: 'paes', categoryLabel: 'Pães' , image: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-pao-hotdog', name: 'Pão Hot Dog Tradicional', emoji: '🌭', price: 3.00, category: 'paes', categoryLabel: 'Pães' , image: 'https://images.unsplash.com/photo-1619881589316-56c7f9e6b587?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-pao-hotdog-25cm', name: 'Pão Hot Dog 25cm (Prensado)', emoji: '🌭', price: 5.00, category: 'paes', categoryLabel: 'Pães' , image: 'https://images.unsplash.com/photo-1619881589316-56c7f9e6b587?q=80&w=200&auto=format&fit=crop' },

  // Carnes
  { id: 'ci-burger-180', name: 'Hambúrguer Artesanal 180g', emoji: '🥩', price: 10.00, category: 'carnes', categoryLabel: 'Carnes' , image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-smash-90', name: 'Hambúrguer Smash 90g', emoji: '🥩', price: 5.50, category: 'carnes', categoryLabel: 'Carnes' , image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-salsicha', name: 'Salsicha', emoji: '🌭', price: 3.50, category: 'carnes', categoryLabel: 'Carnes' , image: 'https://images.unsplash.com/photo-1534122119098-b80c5ce3d800?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-frango', name: 'Frango Desfiado Temperado', emoji: '🍗', price: 4.00, category: 'carnes', categoryLabel: 'Carnes' , image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-bacon', name: 'Bacon Crocante', emoji: '🥓', price: 4.50, category: 'carnes', categoryLabel: 'Carnes' , image: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-calabresa', name: 'Calabresa', emoji: '🌶️', price: 3.50, category: 'carnes', categoryLabel: 'Carnes' , image: 'https://images.unsplash.com/photo-1529177114674-cfaea0f5139a?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-ovo', name: 'Ovo Frito', emoji: '🍳', price: 2.50, category: 'carnes', categoryLabel: 'Carnes' , image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?q=80&w=200&auto=format&fit=crop' },

  // Queijos
  { id: 'ci-cheddar', name: 'Queijo Cheddar', emoji: '🧀', price: 3.00, category: 'queijos', categoryLabel: 'Queijos & Cremes' , image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-cream-cheese', name: 'Cream Cheese', emoji: '🧀', price: 2.50, category: 'queijos', categoryLabel: 'Queijos & Cremes' , image: 'https://images.unsplash.com/photo-1628178652431-89d8db18f3a8?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-catupiry', name: 'Catupiry Original', emoji: '🧀', price: 3.00, category: 'queijos', categoryLabel: 'Queijos & Cremes' , image: 'https://images.unsplash.com/photo-1628178652431-89d8db18f3a8?q=80&w=200&auto=format&fit=crop' },

  // Molhos
  { id: 'ci-molho-barbecue', name: 'Molho Barbecue', emoji: '🫙', price: 1.50, category: 'molhos', categoryLabel: 'Molhos' , image: 'https://images.unsplash.com/photo-1585325701165-351af916e581?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-molho-especial', name: 'Molho Especial da Casa', emoji: '🫙', price: 1.50, category: 'molhos', categoryLabel: 'Molhos' , image: 'https://images.unsplash.com/photo-1622978135891-b9627715ecda?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-molho-picante', name: 'Molho Picante', emoji: '🌶️', price: 1.50, category: 'molhos', categoryLabel: 'Molhos' , image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-molho-news', name: "Molho New's", emoji: '⭐', price: 2.00, category: 'molhos', categoryLabel: 'Molhos' , image: 'https://images.unsplash.com/photo-1622978135891-b9627715ecda?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-maionese', name: 'Maionese da Casa', emoji: '🫙', price: 1.00, category: 'molhos', categoryLabel: 'Molhos' , image: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?q=80&w=200&auto=format&fit=crop' },

  // Vegetais
  { id: 'ci-alface', name: 'Alface Americana', emoji: '🥬', price: 1.00, category: 'vegetais', categoryLabel: 'Vegetais & Saladas' , image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-tomate', name: 'Tomate', emoji: '🍅', price: 1.00, category: 'vegetais', categoryLabel: 'Vegetais & Saladas' , image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-cebola', name: 'Cebola', emoji: '🧅', price: 1.00, category: 'vegetais', categoryLabel: 'Vegetais & Saladas' , image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-picles', name: 'Picles', emoji: '🥒', price: 1.00, category: 'vegetais', categoryLabel: 'Vegetais & Saladas' , image: 'https://images.unsplash.com/photo-1520696956693-455b57223e74?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-milho', name: 'Milho', emoji: '🌽', price: 1.00, category: 'vegetais', categoryLabel: 'Vegetais & Saladas' , image: 'https://images.unsplash.com/photo-1533038662993-4d4361abcc0f?q=80&w=200&auto=format&fit=crop' },

  // Extras
  { id: 'ci-onion-rings', name: 'Onion Rings', emoji: '🧅', price: 4.50, category: 'extras', categoryLabel: 'Extras & Crocantes' , image: 'https://images.unsplash.com/photo-1639024471210-203b573a6eeb?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-doritos', name: 'Doritos', emoji: '🌮', price: 2.50, category: 'extras', categoryLabel: 'Extras & Crocantes' , image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-batata-palha', name: 'Batata Palha', emoji: '🍟', price: 1.50, category: 'extras', categoryLabel: 'Extras & Crocantes' , image: 'https://images.unsplash.com/photo-1541592102775-7b8ac428ce0c?q=80&w=200&auto=format&fit=crop' },
  { id: 'ci-oregano', name: 'Orégano', emoji: '🌿', price: 0.50, category: 'extras', categoryLabel: 'Extras & Crocantes' , image: 'https://images.unsplash.com/photo-1596647242171-ec59d04bc2ad?q=80&w=200&auto=format&fit=crop' },
];

// Extras disponíveis para hambúrgueres
const burgerExtras: Extra[] = [
  { id: 'bacon-extra', name: 'Bacon Extra', price: 3.50 },
  { id: 'cheddar-extra', name: 'Cheddar Extra', price: 2.50 },
  { id: 'burger-extra', name: 'Hambúrguer Extra 180g', price: 6.90 },
  { id: 'onion-rings', name: 'Onion Rings', price: 3.90 },
];

// Extras disponíveis para hot dogs
const hotdogExtras: Extra[] = [
  { id: 'bacon-extra', name: 'Bacon Extra', price: 3.50 },
  { id: 'cheddar-extra', name: 'Cheddar Extra', price: 2.50 },
  { id: 'egg', name: 'Ovo', price: 2.00 },
];

export const menuItems: MenuItem[] = [
  // LINHA CLÁSSICA (Burgers de 180g)
  {
    id: 'burger-1',
    name: 'New\'s Prime',
    description: 'Pão brioche selado, hambúrguer artesanal de 180g e queijo cheddar derretido.',
    price: 24.90,
    emoji: '🍔',
    category: 'burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop',
    ingredients: ['Pão brioche selado', 'Hambúrguer artesanal 180g', 'Queijo cheddar derretido'],
    availableExtras: burgerExtras,
    hasRemovableIngredients: true,
  },
  {
    id: 'burger-2',
    name: 'New\'s Fresh',
    description: 'Pão brioche, hambúrguer artesanal de 180g, queijo cheddar, alface americana fresca, tomate, cebola e picles.',
    price: 27.90,
    emoji: '🍔',
    category: 'burgers',
    image: 'https://images.unsplash.com/photo-1594212844510-482a0d17042a?q=80&w=600&auto=format&fit=crop',
    ingredients: ['Pão brioche', 'Hambúrguer artesanal 180g', 'Queijo cheddar', 'Alface americana', 'Tomate', 'Cebola', 'Picles'],
    availableExtras: burgerExtras,
    hasRemovableIngredients: true,
  },
  {
    id: 'burger-3',
    name: 'New\'s Crispy Bacon',
    description: 'Pão brioche, hambúrguer artesanal de 180g, queijo cheddar, fatias de bacon crocantes, cebola e picles.',
    price: 29.90,
    emoji: '🍔',
    category: 'burgers',
    image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?q=80&w=600&auto=format&fit=crop',
    ingredients: ['Pão brioche', 'Hambúrguer artesanal 180g', 'Queijo cheddar', 'Bacon crocante', 'Cebola', 'Picles'],
    availableExtras: burgerExtras,
    hasRemovableIngredients: true,
  },

  // LINHA ESPECIAL (Burgers de 180g)
  {
    id: 'burger-4',
    name: 'New\'s Rings',
    description: 'Pão brioche, hambúrguer artesanal de 180g, queijo cheddar, onion rings crocantes e molho barbecue.',
    price: 31.90,
    emoji: '🍔',
    category: 'burgers',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop',
    ingredients: ['Pão brioche', 'Hambúrguer artesanal 180g', 'Queijo cheddar', 'Onion rings crocantes', 'Molho barbecue'],
    availableExtras: burgerExtras,
    hasRemovableIngredients: true,
  },
  {
    id: 'burger-5',
    name: 'New\'s Crunch',
    description: 'Pão brioche, hambúrguer artesanal de 180g, queijo cheddar, Doritos, cream cheese e molho especial.',
    price: 34.90,
    emoji: '🍔',
    category: 'burgers',
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?q=80&w=600&auto=format&fit=crop',
    ingredients: ['Pão brioche', 'Hambúrguer artesanal 180g', 'Queijo cheddar', 'Doritos', 'Cream cheese', 'Molho especial'],
    availableExtras: burgerExtras,
    hasRemovableIngredients: true,
  },
  {
    id: 'burger-6',
    name: 'New\'s Supreme',
    description: 'Pão brioche, hambúrguer artesanal de 180g, queijo cheddar, bacon crocante, anéis de cebola e molho barbecue.',
    price: 34.90,
    emoji: '🍔',
    category: 'burgers',
    image: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?q=80&w=600&auto=format&fit=crop',
    ingredients: ['Pão brioche', 'Hambúrguer artesanal 180g', 'Queijo cheddar', 'Bacon crocante', 'Anéis de cebola', 'Molho barbecue'],
    availableExtras: burgerExtras,
    hasRemovableIngredients: true,
  },
  {
    id: 'burger-7',
    name: 'New\'s Cheddar Flood',
    description: 'Pão brioche, hambúrguer artesanal de 180g, muito bacon, o dobro de queijo cheddar e molho cheddar cremoso.',
    price: 32.90,
    emoji: '🍔',
    category: 'burgers',
    image: 'https://images.unsplash.com/photo-1608767221051-2b9d18f35a2f?q=80&w=600&auto=format&fit=crop',
    ingredients: ['Pão brioche', 'Hambúrguer artesanal 180g', 'Bacon', 'Queijo cheddar duplo', 'Molho cheddar cremoso'],
    availableExtras: burgerExtras,
    hasRemovableIngredients: true,
  },
  {
    id: 'burger-8',
    name: 'New\'s Fire',
    description: 'Pão brioche, hambúrguer artesanal de 180g, queijo cheddar, bacon, pimenta calabresa, cebola, picles e molho picante.',
    price: 32.90,
    emoji: '🌶️',
    category: 'burgers',
    image: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?q=80&w=600&auto=format&fit=crop',
    ingredients: ['Pão brioche', 'Hambúrguer artesanal 180g', 'Queijo cheddar', 'Bacon', 'Pimenta calabresa', 'Cebola', 'Picles', 'Molho picante'],
    availableExtras: burgerExtras,
    hasRemovableIngredients: true,
  },
  {
    id: 'burger-9',
    name: 'The New\'s Concept',
    description: 'Pão brioche, hambúrguer artesanal de 180g, queijo cheddar, bacon crocante, onion rings, cream cheese, cebola, picles e o exclusivo Molho New\'s.',
    price: 38.90,
    emoji: '🍔',
    category: 'burgers',
    image: 'https://images.unsplash.com/photo-1603064752734-4c48eff53d05?q=80&w=600&auto=format&fit=crop',
    ingredients: ['Pão brioche', 'Hambúrguer artesanal 180g', 'Queijo cheddar', 'Bacon crocante', 'Onion rings', 'Cream cheese', 'Cebola', 'Picles', 'Molho New\'s'],
    availableExtras: burgerExtras,
    hasRemovableIngredients: true,
  },

  // LINHA SMASH (90g)
  {
    id: 'burger-10',
    name: 'New\'s Double Smash',
    description: 'Pão brioche, 2 hambúrgueres smash de 90g, queijo duplo derretido, cebola, picles e molho especial.',
    price: 26.90,
    emoji: '💪',
    category: 'burgers',
    image: 'https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?q=80&w=600&auto=format&fit=crop',
    ingredients: ['Pão brioche', '2 hambúrgueres smash 90g', 'Queijo duplo derretido', 'Cebola', 'Picles', 'Molho especial'],
    availableExtras: burgerExtras,
    hasRemovableIngredients: true,
  },
  {
    id: 'burger-11',
    name: 'New\'s Monster Smash',
    description: 'Pão brioche, 3 hambúrgueres smash de 90g, queijo triplo derretido, cebola, picles e molho especial da casa.',
    price: 32.90,
    emoji: '💪',
    category: 'burgers',
    image: 'https://images.unsplash.com/photo-1547584370-2cc98b8b8dc5?q=80&w=600&auto=format&fit=crop',
    ingredients: ['Pão brioche', '3 hambúrgueres smash 90g', 'Queijo triplo derretido', 'Cebola', 'Picles', 'Molho especial'],
    availableExtras: burgerExtras,
    hasRemovableIngredients: true,
  },

  // LINHA KIDS
  {
    id: 'burger-12',
    name: 'New\'s Kids',
    description: 'Pão brioche fofinho, hambúrguer smash de 90g e queijo cheddar derretido (sem condimentos, cebola ou picles).',
    price: 16.90,
    emoji: '🧒',
    category: 'burgers',
    image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?q=80&w=600&auto=format&fit=crop',
    ingredients: ['Pão brioche fofinho', 'Hambúrguer smash 90g', 'Queijo cheddar derretido'],
    availableExtras: burgerExtras,
    hasRemovableIngredients: true,
  },

  // LINHA DE HOT-DOGS PRENSADOS
  {
    id: 'hotdog-1',
    name: 'Especial K9',
    description: 'Pão de 25cm prensado com 2 salsichas, alface, tomate, milho, cebola, frango desfiado, bacon crocante, calabresa, Catupiry original, Cheddar cremoso, queijo derretido e um toque de orégano.',
    price: 34.90,
    emoji: '🌭',
    category: 'hotdogs',
    ingredients: ['Pão de 25cm prensado', '2 salsichas', 'Alface', 'Tomate', 'Milho', 'Cebola', 'Frango desfiado', 'Bacon crocante', 'Calabresa', 'Catupiry original', 'Cheddar cremoso', 'Queijo derretido', 'Orégano'],
    availableExtras: hotdogExtras,
    hasRemovableIngredients: true,
  },
  {
    id: 'hotdog-2',
    name: 'New\'s Dog Frango & Bacon',
    description: 'Pão de hot-dog tradicional prensado na chapa com 2 salsichas, alface, tomate, milho, cebola, frango desfiado bem temperado, bacon crocante, queijo derretido e orégano.',
    price: 26.90,
    emoji: '🌭',
    category: 'hotdogs',
    ingredients: ['Pão de hot-dog tradicional prensado', '2 salsichas', 'Alface', 'Tomate', 'Milho', 'Cebola', 'Frango desfiado temperado', 'Bacon crocante', 'Queijo derretido', 'Orégano'],
    availableExtras: hotdogExtras,
    hasRemovableIngredients: true,
  },
  {
    id: 'hotdog-3',
    name: 'New\'s Dog Calabresa',
    description: 'Pão de hot-dog tradicional prensado com 1 salsicha, calabresa, alface, tomate, milho, cebola, queijo derretido e orégano.',
    price: 21.90,
    emoji: '🌭',
    category: 'hotdogs',
    ingredients: ['Pão de hot-dog tradicional prensado', '1 salsicha', 'Calabresa', 'Alface', 'Tomate', 'Milho', 'Cebola', 'Queijo derretido', 'Orégano'],
    availableExtras: hotdogExtras,
    hasRemovableIngredients: true,
  },
  {
    id: 'hotdog-4',
    name: 'New\'s Dog Frango',
    description: 'Pão de hot-dog tradicional prensado com 1 salsicha, frango desfiado temperado da casa, alface, tomate, milho, cebola e queijo derretido.',
    price: 20.90,
    emoji: '🌭',
    category: 'hotdogs',
    ingredients: ['Pão de hot-dog tradicional prensado', '1 salsicha', 'Frango desfiado temperado', 'Alface', 'Tomate', 'Milho', 'Cebola', 'Queijo derretido'],
    availableExtras: hotdogExtras,
    hasRemovableIngredients: true,
  },
  {
    id: 'hotdog-5',
    name: 'New\'s Dog Bacon',
    description: 'Pão de hot-dog tradicional prensado com 1 salsicha, bacon, alface, tomate, milho, cebola e queijo derretido.',
    price: 22.90,
    emoji: '🌭',
    category: 'hotdogs',
    ingredients: ['Pão de hot-dog tradicional prensado', '1 salsicha', 'Bacon', 'Alface', 'Tomate', 'Milho', 'Cebola', 'Queijo derretido'],
    availableExtras: hotdogExtras,
    hasRemovableIngredients: true,
  },
  {
    id: 'hotdog-6',
    name: 'New\'s Dog Simples',
    description: 'Pão de hot-dog tradicional, 1 salsicha, alface, tomate, milho, cebola, maionese da casa e queijo derretido.',
    price: 16.90,
    emoji: '🌭',
    category: 'hotdogs',
    ingredients: ['Pão de hot-dog tradicional', '1 salsicha', 'Alface', 'Tomate', 'Milho', 'Cebola', 'Maionese da casa', 'Queijo derretido'],
    availableExtras: hotdogExtras,
    hasRemovableIngredients: true,
  },
  {
    id: 'hotdog-7',
    name: 'New\'s Dog Kids',
    description: 'Pão tradicional prensado com 1 salsicha, queijo derretido e batata palha.',
    price: 13.90,
    emoji: '🌭',
    category: 'hotdogs',
    ingredients: ['Pão tradicional prensado', '1 salsicha', 'Queijo derretido', 'Batata palha'],
    availableExtras: hotdogExtras,
    hasRemovableIngredients: true,
  },

  // Combos
  {
    id: 'combo-1',
    name: 'Combo Classic',
    description: 'New\'s Prime + Batata Simples + Refrigerante Lata',
    price: 37.90,
    emoji: '🔥',
    category: 'combos',
    ingredients: ['New\'s Prime', 'Batata Simples', 'Refrigerante Lata'],
    hasRemovableIngredients: true,
  },
  {
    id: 'combo-2',
    name: 'Combo Fresh',
    description: 'New\'s Fresh + Batata Simples + Refrigerante Lata',
    price: 39.90,
    emoji: '🔥',
    category: 'combos',
    ingredients: ['New\'s Fresh', 'Batata Simples', 'Refrigerante Lata'],
    hasRemovableIngredients: true,
  },
  {
    id: 'combo-3',
    name: 'Combo Crispy Bacon',
    description: 'New\'s Crispy Bacon + Batata Simples + Refrigerante Lata',
    price: 41.90,
    emoji: '🔥',
    category: 'combos',
    ingredients: ['New\'s Crispy Bacon', 'Batata Simples', 'Refrigerante Lata'],
    hasRemovableIngredients: true,
  },
  {
    id: 'combo-4',
    name: 'Combo Supreme',
    description: 'New\'s Supreme + Batata Simples + Refrigerante Lata',
    price: 41.90,
    emoji: '🔥',
    category: 'combos',
    ingredients: ['New\'s Supreme', 'Batata Simples', 'Refrigerante Lata'],
    hasRemovableIngredients: true,
  },

  // Bebidas
  {
    id: 'drink-1',
    name: 'Refrigerante Lata',
    description: 'Refrigerante gelado (Coca-Cola, Sprite, etc)',
    price: 6.00,
    emoji: '🥤',
    category: 'drinks',
    ingredients: ['Refrigerante Lata'],
    hasRemovableIngredients: false,
  },
  {
    id: 'drink-2',
    name: 'Refrigerante 2L',
    description: 'Refrigerante 2 litros (Coca-Cola, Sprite, etc)',
    price: 10.00,
    emoji: '🥤',
    category: 'drinks',
    ingredients: ['Refrigerante 2L'],
    hasRemovableIngredients: false,
  },
  {
    id: 'drink-3',
    name: 'Refrigerante 600ml',
    description: 'Refrigerante 600ml (Coca-Cola, Sprite, etc)',
    price: 7.50,
    emoji: '🥤',
    category: 'drinks',
    ingredients: ['Refrigerante 600ml'],
    hasRemovableIngredients: false,
  },
  {
    id: 'drink-4',
    name: 'Água Mineral',
    description: 'Água mineral gelada',
    price: 4.00,
    emoji: '🥤',
    category: 'drinks',
    ingredients: ['Água Mineral'],
    hasRemovableIngredients: false,
  },
  {
    id: 'drink-5',
    name: 'Sprite Lemon',
    description: 'Sprite Lemon gelado',
    price: 7.50,
    emoji: '🥤',
    category: 'drinks',
    ingredients: ['Sprite Lemon'],
    hasRemovableIngredients: false,
  },
  {
    id: 'drink-6',
    name: 'Refri Mini',
    description: 'Refrigerante mini (Coca-Cola, Sprite, etc)',
    price: 3.50,
    emoji: '🥤',
    category: 'drinks',
    ingredients: ['Refrigerante Mini'],
    hasRemovableIngredients: false,
  },
];

export function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return menuItems.find(item => item.id === id);
}

export function calculateCustomizationPrice(extras: Extra[]): number {
  return extras.reduce((sum, extra) => sum + extra.price, 0);
}
