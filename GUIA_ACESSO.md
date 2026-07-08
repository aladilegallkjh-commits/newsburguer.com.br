# Guia de Acesso - New S'Burguer

## 🌐 Links de Acesso

### Para Clientes (Site Público)
**URL:** `https://newsburguer-hw2xzyfp.manus.space/`

- Visualizar cardápio completo
- Personalizar produtos (remover ingredientes, adicionar extras)
- Adicionar observações aos pedidos
- Enviar pedidos via WhatsApp

### Para Administrador (Painel Privado)
**URL:** `https://newsburguer-hw2xzyfp.manus.space/admin/login`

- Gerenciar cardápio
- Atualizar informações da loja
- Configurar horários de funcionamento
- Alterar senha de acesso

---

## 🔐 Credenciais de Admin

**Senha Padrão:** `admin123`

> ⚠️ **Importante:** Altere a senha padrão assim que acessar o painel pela primeira vez!

### Como Fazer Login
1. Acesse: `/admin/login`
2. Digite a senha de administrador
3. Clique em "Entrar"
4. Você será redirecionado para o dashboard

---

## 📋 Funcionalidades do Painel Admin

### 1. **Cardápio**
- Adicionar novos produtos
- Editar preços e descrições
- Gerenciar ingredientes e extras
- Ativar/desativar produtos

### 2. **Informações**
- Atualizar endereço da loja
- Configurar número de WhatsApp
- Editar descrição e tagline
- Gerenciar links de redes sociais

### 3. **Horários**
- Definir horário de funcionamento (seg-sex)
- Definir horário de funcionamento (sab-dom)
- Configurar dias de fechamento
- Ativar/desativar modo de entrega

---

## 🔧 Configurações Importantes

### Alterar Número de WhatsApp
1. Abra o arquivo `client/src/lib/whatsappUtils.ts`
2. Localize: `export const WHATSAPP_NUMBER = '5585987654321';`
3. Substitua pelo seu número (formato: código país + DDD + número)
4. Exemplo: `'5585987654321'` para (85) 98765-4321

### Atualizar Informações da Loja
1. Abra o arquivo `client/src/components/Footer.tsx`
2. Localize: `const STORE_INFO = { ... }`
3. Atualize os dados:
   - `name`: Nome da loja
   - `address`: Endereço
   - `phone`: Telefone para contato
   - `whatsapp`: Número de WhatsApp
   - `hours`: Horários de funcionamento
   - `social`: Links de redes sociais

---

## 📱 Fluxo de Pedidos

### Para Clientes
1. Acessar site público
2. Navegar pelo cardápio
3. Clicar em "+" para adicionar item
4. Personalizar (remover ingredientes, adicionar extras)
5. Adicionar observações (opcional)
6. Clicar no botão 💬 flutuante (WhatsApp)
7. Pedido é formatado e enviado via WhatsApp

### Formato do Pedido no WhatsApp
```
*Olá! Gostaria de fazer um pedido:*

🍔 New S'Burguer Clássico (1x)
   R$ 32.90
   🚫 SEM: Cebola, Tomate
   ➕ EXTRAS: Bacon Extra (+R$ 5.00)
   📝 OBS: Carne bem passada

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL: R$ 37.90*
🕐 Horário: 20:35
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Obrigado! 🙏
```

---

## 🛡️ Segurança

- A autenticação é armazenada localmente no navegador (localStorage)
- A senha é comparada em tempo real
- Ao fazer logout, a sessão é encerrada
- Cada navegador/dispositivo tem sua própria sessão

### Recomendações
- Use uma senha forte e única
- Não compartilhe a senha com terceiros
- Faça logout ao terminar de usar o painel
- Limpe o cache do navegador periodicamente

---

## 🐛 Troubleshooting

### Esqueci a Senha
Se esquecer a senha de admin:
1. Abra o navegador (F12) → Console
2. Digite: `localStorage.removeItem('adminPassword');`
3. Recarregue a página
4. A senha voltará para o padrão: `admin123`

### Não Consigo Fazer Login
- Verifique se a senha está correta
- Limpe o cache do navegador
- Tente em uma aba anônima
- Verifique se o localStorage está habilitado

### Pedidos Não Aparecem no WhatsApp
- Verifique se o número de WhatsApp está correto em `whatsappUtils.ts`
- Confirme que o WhatsApp está instalado no dispositivo
- Tente novamente com um navegador diferente

---

## 📞 Suporte

Para dúvidas ou problemas:
- Verifique este guia
- Consulte a documentação do projeto
- Entre em contato com o desenvolvedor

---

**Última atualização:** 23 de junho de 2026
**Versão:** 1.0.0
