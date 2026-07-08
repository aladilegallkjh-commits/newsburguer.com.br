# Relatório de Melhorias Obrigatórias para MVP
## New S'Burguer - Sistema de Pedidos Premium

**Data:** 22 de junho de 2026  
**Status Atual:** Versão f344c946 (navbar dinâmica, logo corrigida)  
**Objetivo:** Identificar e priorizar funcionalidades essenciais para transformar o sistema em um MVP funcional para hambúrgueria

---

## 1. FUNCIONALIDADES CRÍTICAS FALTANTES

### 1.1 Personalização de Produtos (PRIORIDADE: CRÍTICA)

**Problema Atual:**
- Usuários não podem personalizar produtos
- Não há opção de remover ingredientes
- Não há opção de adicionar ingredientes extras
- Não há campo para observações
- Cozinha não consegue visualizar customizações

**Solução Necessária:**

#### 1.1.1 Remover Ingredientes
Cada produto deve ter lista de ingredientes removíveis:

**Hambúrgueres (exemplo: New S'Burguer Clássico)**
- ✓ Sem cebola
- ✓ Sem tomate
- ✓ Sem alface
- ✓ Sem molho
- ✓ Sem queijo

**Hot Dogs (exemplo: Hot Dog New Especial)**
- ✓ Sem bacon
- ✓ Sem cebola crispy
- ✓ Sem cheddar
- ✓ Sem molho

**Porções (exemplo: Batata Frita)**
- ✓ Sem sal
- ✓ Sem ervas

#### 1.1.2 Adicionar Ingredientes Extras
Cada produto deve permitir adição de ingredientes pagos:

**Hambúrgueres - Extras Disponíveis**
- + Bacon Extra (R$ 3,50)
- + Cheddar Extra (R$ 2,50)
- + Hambúrguer Extra (R$ 8,90)
- + Ovo (R$ 2,00)
- + Abacaxi (R$ 2,50)

**Hot Dogs - Extras Disponíveis**
- + Bacon Extra (R$ 3,50)
- + Cheddar Extra (R$ 2,50)
- + Ovo (R$ 2,00)
- + Batata Palha Extra (R$ 2,00)

**Porções - Extras Disponíveis**
- + Molho Extra (R$ 1,50)
- + Cheddar (R$ 2,50)
- + Bacon (R$ 3,50)

**Bebidas - Extras Disponíveis**
- + Gelo Extra
- + Sem Gelo

#### 1.1.3 Campo de Observação Livre
- Campo de texto aberto para observações especiais
- Exemplos: "Carne bem passada", "Pouco molho", "Sem cebola roxa"
- Limite: 200 caracteres
- Opcional

#### 1.1.4 Visualização para Cozinha
Formato de exibição claro:

```
X-BACON (HAMBÚRGUER DUPLO)
────────────────────────
SEM CEBOLA
SEM TOMATE

+ BACON EXTRA
+ CHEDDAR EXTRA

OBS:
CARNE BEM PASSADA, POUCO MOLHO
────────────────────────
```

**Impacto na Estrutura:**
- Expandir `CartItem` para incluir `customizations`
- Criar interface `ProductCustomization` com:
  - `removedIngredients: string[]`
  - `addedIngredients: { name: string; price: number }[]`
  - `notes: string`
  - `customizationTotal: number` (soma dos extras)
- Atualizar cálculo de preço no carrinho
- Modificar modal de produto para incluir seleção de customizações

---

### 1.2 Integração com WhatsApp (PRIORIDADE: CRÍTICA)

**Problema Atual:**
- Botão "Finalizar Pedido" apenas mostra toast
- Não há integração com WhatsApp
- Pedidos não são enviados para nenhum lugar
- Não há confirmação real do pedido

**Solução Necessária:**

#### 1.2.1 Botão Flutuante WhatsApp
- Posicionado no canto inferior direito (fixed)
- Ícone WhatsApp verde (#25D366)
- Visível em todas as páginas
- Ao clicar: abre WhatsApp com mensagem pré-preenchida

#### 1.2.2 Fluxo de Pedido via WhatsApp
1. Usuário clica "Finalizar Pedido"
2. Sistema gera resumo formatado do pedido
3. Abre WhatsApp Web/App com mensagem pré-preenchida
4. Mensagem contém:
   - Itens do pedido com customizações
   - Preço total
   - Horário do pedido
   - Opção de entrega/retirada

**Exemplo de Mensagem:**
```
Olá! Gostaria de fazer um pedido:

🍔 New S'Burguer Clássico (2x)
   SEM CEBOLA
   + BACON EXTRA
   Subtotal: R$ 65,80

🌭 Hot Dog New Especial (1x)
   SEM BACON
   Subtotal: R$ 24,90

🍟 Batata Frita (1x)
   Subtotal: R$ 22,90

💰 TOTAL: R$ 113,60

Tipo de entrega: Retirada
Horário: 22:30

Obrigado!
```

#### 1.2.3 Número do WhatsApp
- Configurável no sistema
- Armazenar em variável de ambiente ou constante
- Permitir múltiplos números (para distribuir carga)

---

### 1.3 Informações de Contato e Localização (PRIORIDADE: ALTA)

**Problema Atual:**
- Sem endereço da loja
- Sem telefone de contato
- Sem horário de funcionamento
- Sem redes sociais
- Sem informações de entrega/retirada

**Solução Necessária:**

#### 1.3.1 Rodapé com Informações
```
┌─────────────────────────────────┐
│ NEW S'BURGUER                   │
├─────────────────────────────────┤
│ 📍 Rua [Endereço], [Número]     │
│    [Bairro] - [Cidade], [CEP]   │
│                                 │
│ 📞 (XX) XXXXX-XXXX              │
│ 💬 WhatsApp: (XX) XXXXX-XXXX    │
│                                 │
│ ⏰ Seg-Sex: 11h-23h             │
│    Sab-Dom: 12h-00h             │
│                                 │
│ 🚚 Entrega: Sim                 │
│ 🏪 Retirada: Sim                │
│ 💳 Pix, Dinheiro, Cartão        │
├─────────────────────────────────┤
│ Redes Sociais:                  │
│ Instagram | Facebook | TikTok   │
└─────────────────────────────────┘
```

#### 1.3.2 Modal de Informações
- Acessível via botão no rodapé
- Mostra mapa com localização
- Horários de funcionamento
- Opções de contato

#### 1.3.3 Seleção de Tipo de Entrega
- Antes de finalizar pedido
- Opções: Retirada / Entrega
- Se entrega: campo para endereço
- Impacta no resumo do pedido

---

### 1.4 Seleção de Tamanho/Variações (PRIORIDADE: ALTA)

**Problema Atual:**
- Produtos não têm variações de tamanho
- Milk shakes não permitem escolher sabor
- Sucos não permitem escolher fruta
- Combos não permitem escolher componentes

**Solução Necessária:**

#### 1.4.1 Variações de Tamanho
**Bebidas:**
- Pequeno (300ml) - R$ 5,90
- Médio (500ml) - R$ 7,90 (padrão)
- Grande (700ml) - R$ 9,90

**Porções:**
- Pequena - R$ 18,90
- Média - R$ 22,90 (padrão)
- Grande - R$ 28,90

#### 1.4.2 Seleção de Sabor/Tipo
**Milk Shake:**
- Chocolate
- Morango
- Baunilha
- Ovomaltine
- Nutella

**Suco Natural:**
- Laranja
- Limão
- Maracujá
- Abacaxi
- Melancia

**Refrigerante:**
- Coca-Cola
- Guaraná
- Fanta (Laranja/Uva/Morango)
- Sprite

#### 1.4.3 Seleção de Componentes em Combos
**Combo Casal:**
- Escolher 2 hambúrgueres (entre 3 opções)
- Escolher 1 porção (entre 3 opções)
- Escolher 2 bebidas (entre 4 opções)

---

### 1.5 Histórico e Rastreamento de Pedidos (PRIORIDADE: MÉDIA)

**Problema Atual:**
- Sem histórico de pedidos
- Sem rastreamento em tempo real
- Sem confirmação de pedido
- Sem estimativa de tempo

**Solução Necessária:**

#### 1.5.1 Confirmação de Pedido
- Após enviar para WhatsApp
- Mostrar número do pedido
- Horário de criação
- Tempo estimado de preparo

#### 1.5.2 Página de Histórico
- Listar pedidos anteriores
- Status: Pendente / Confirmado / Preparando / Pronto / Entregue
- Permitir repetir pedido anterior

---

## 2. FUNCIONALIDADES SECUNDÁRIAS FALTANTES

### 2.1 Sistema de Cupons/Descontos (PRIORIDADE: MÉDIA)

**Solução Necessária:**
- Campo para código de cupom no carrinho
- Validação de cupom
- Aplicar desconto percentual ou fixo
- Mostrar economia no resumo

**Exemplos:**
- BEMVINDO10 → 10% de desconto
- FRETEGRATIS → Frete grátis
- BLACKFRIDAY50 → R$ 50 de desconto

---

### 2.2 Avaliações e Comentários (PRIORIDADE: BAIXA)

**Solução Necessária:**
- Após entrega: solicitar avaliação
- Estrelas (1-5)
- Campo de comentário
- Exibir avaliações no cardápio

---

### 2.3 Favoritos/Itens Frequentes (PRIORIDADE: BAIXA)

**Solução Necessária:**
- Botão de coração em cada produto
- Seção "Meus Favoritos" no cardápio
- Sugestão de "Você pediu antes"

---

### 2.4 Notificações Push (PRIORIDADE: BAIXA)

**Solução Necessária:**
- Notificar quando pedido é confirmado
- Notificar quando pedido está pronto
- Notificar quando pedido saiu para entrega

---

## 3. MELHORIAS DE UX/UI

### 3.1 Modal de Produto Expandido
- Imagem maior do produto
- Descrição completa
- Ingredientes listados
- Opções de customização
- Botão "Adicionar ao Carrinho"

### 3.2 Carrinho Flutuante
- Sidebar que desliza do lado
- Visualizar itens sem sair da página
- Editar quantidades rapidamente

### 3.3 Filtros Avançados
- Filtrar por preço
- Filtrar por ingredientes (sem glúten, vegetariano, etc.)
- Busca por nome

### 3.4 Responsividade
- Melhorar layout em tablets
- Otimizar para diferentes tamanhos de tela

---

## 4. ESTRUTURA DE DADOS NECESSÁRIA

### 4.1 Expandir Interface CartItem

```typescript
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
  customizations?: {
    removedIngredients: string[];
    addedIngredients: Array<{
      name: string;
      price: number;
    }>;
    notes: string;
    selectedSize?: string;
    selectedFlavor?: string;
  };
  customizationTotal?: number;
}
```

### 4.2 Criar Interface MenuItem Expandida

```typescript
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  category: string;
  ingredients?: string[];
  availableExtras?: Array<{
    name: string;
    price: number;
  }>;
  sizes?: Array<{
    name: string;
    priceModifier: number;
  }>;
  flavors?: string[];
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  image?: string;
}
```

---

## 5. ROADMAP DE IMPLEMENTAÇÃO

### Fase 1: MVP Mínimo (CRÍTICO)
- [ ] Personalização de produtos (remover/adicionar ingredientes)
- [ ] Campo de observações
- [ ] Integração WhatsApp
- [ ] Informações de contato no rodapé

**Estimativa:** 2-3 dias

### Fase 2: Funcionalidades Essenciais (ALTA)
- [ ] Seleção de tamanho/variações
- [ ] Seleção de tipo de entrega
- [ ] Modal de produto expandido
- [ ] Histórico de pedidos

**Estimativa:** 2-3 dias

### Fase 3: Melhorias de UX (MÉDIA)
- [ ] Sistema de cupons
- [ ] Carrinho flutuante
- [ ] Favoritos
- [ ] Filtros avançados

**Estimativa:** 2-3 dias

### Fase 4: Polimento (BAIXA)
- [ ] Notificações push
- [ ] Avaliações
- [ ] Otimizações de performance
- [ ] SEO

**Estimativa:** 1-2 dias

---

## 6. IMPACTO TÉCNICO

### Arquitetura Necessária
- Expandir `CartContext` para suportar customizações
- Criar novo componente `ProductCustomizer`
- Criar novo componente `WhatsAppButton`
- Expandir `menuData.ts` com informações de ingredientes e extras
- Criar utilitário para formatar pedidos para WhatsApp

### Dependências
- Nenhuma dependência nova necessária (usar componentes existentes)

### Banco de Dados
- Não necessário para MVP (dados em localStorage)
- Futuro: armazenar histórico de pedidos

---

## 7. PRIORIZAÇÃO FINAL

| Funcionalidade | Prioridade | Impacto | Esforço | Status |
|---|---|---|---|---|
| Personalização de Produtos | CRÍTICA | Alto | Médio | ❌ |
| Integração WhatsApp | CRÍTICA | Alto | Baixo | ❌ |
| Informações de Contato | ALTA | Alto | Baixo | ❌ |
| Seleção de Tamanho/Variações | ALTA | Médio | Médio | ❌ |
| Tipo de Entrega | ALTA | Médio | Baixo | ❌ |
| Modal de Produto Expandido | ALTA | Médio | Médio | ❌ |
| Histórico de Pedidos | MÉDIA | Médio | Médio | ❌ |
| Sistema de Cupons | MÉDIA | Médio | Médio | ❌ |
| Carrinho Flutuante | MÉDIA | Baixo | Médio | ❌ |
| Favoritos | BAIXA | Baixo | Baixo | ❌ |
| Avaliações | BAIXA | Baixo | Médio | ❌ |
| Notificações Push | BAIXA | Baixo | Alto | ❌ |

---

## 8. CONCLUSÃO

O sistema atual é um **MVP visual** bem estruturado, mas **não funcional** como hambúrgueria. As funcionalidades críticas faltantes impedem que:

1. **Clientes personalizem pedidos** (essencial para hambúrgueria)
2. **Pedidos sejam realmente enviados** (sem WhatsApp, pedidos desaparecem)
3. **Clientes saibam como contatar** (sem endereço/telefone)

**Recomendação:** Implementar Fase 1 (MVP Mínimo) para ter um sistema funcional e pronto para uso real.

---

**Próximo Passo:** Aguardando aprovação para implementar Fase 1 (Personalização + WhatsApp + Contato)
