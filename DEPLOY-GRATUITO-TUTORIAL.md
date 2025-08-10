# 🚀 TUTORIAL DEPLOY KRYONIX - 100% GRATUITO

## 🎯 **RESUMO DO QUE VOCÊ VAI FAZER:**
1. **Vercel** → Site principal (Frontend) - GRÁTIS
2. **Render** → APIs e Backend - GRÁTIS  
3. **Neon** → Banco de dados 3GB - GRÁTIS
4. **GitHub** → Código fonte - GRÁTIS

**CUSTO TOTAL: $0/mês** 💰

---

## 📋 **PASSO 1: PREPARAR O CÓDIGO**

### **1.1 Baixar Projeto:**
1. **No Builder.io:** Clique em "Download Project"
2. **Descompactar** o arquivo ZIP
3. **Abrir pasta** kryonix-plataforma

### **1.2 Verificar Arquivos Importantes:**
✅ `package.json` - Dependências  
✅ `vercel.json` - Config Vercel  
✅ `render.yaml` - Config Render  
✅ `.env.example` - Variáveis de ambiente  
✅ `app/login/page.tsx` - Logo adicionada  

---

## 💾 **PASSO 2: CONFIGURAR BANCO NEON**

### **2.1 Criar Conta Neon:**
1. **Acesse:** https://neon.tech
2. **Clique:** "Sign up" (grátis)
3. **Use GitHub** ou email para registrar

### **2.2 Criar Projeto:**
1. **Nome:** `kryonix-platform`
2. **Database:** `kryonix_platform` 
3. **User:** `kryonix`
4. **Password:** `Vitor@123456`
5. **Region:** escolha mais próxima

### **2.3 Copiar Connection String:**
```bash
# Vai parecer assim:
postgresql://kryonix:Vitor%40123456@ep-xxx-xxx.neon.tech/kryonix_platform?sslmode=require
```
**IMPORTANTE:** Copie e guarde essa string!

---

## 🖥️ **PASSO 3: DEPLOY BACKEND (RENDER)**

### **3.1 Subir Código para GitHub:**
1. **Criar repositório** no GitHub: `kryonix-plataforma`
2. **Fazer upload** dos arquivos do projeto
3. **Commit:** "Initial KRYONIX setup for free deploy"

### **3.2 Conectar Render:**
1. **Acesse:** https://render.com
2. **Login** com GitHub
3. **Clique:** "New +"
4. **Selecione:** "Web Service"
5. **Connect:** seu repositório kryonix-plataforma

### **3.3 Configurar Render:**
```
Name: kryonix-backend
Environment: Node
Branch: main
Root Directory: (deixar vazio)
Build Command: npm ci
Start Command: npm run production
```

### **3.4 Environment Variables (Render):**
```
NODE_ENV = production
PORT = 10000
DATABASE_URL = [Cole sua string do Neon aqui]
ADMIN_USERNAME = kryonix
ADMIN_PASSWORD = Vitor@123456
JWT_SECRET = Kr7$n0x-V1t0r-2025-#Jwt$3cr3t-P0w3rfu1-K3y
WEBHOOK_SECRET = Kr7$n0x-V1t0r-2025-#Webhook$3cr3t
FRONTEND_URL = https://kryonix-plataforma.vercel.app
```

### **3.5 Deploy Backend:**
1. **Clique:** "Create Web Service"
2. **Aguarde:** 5-10 minutos
3. **URL Backend:** https://kryonix-backend.onrender.com
4. **Teste:** Acesse /health para verificar

---

## 🌐 **PASSO 4: DEPLOY FRONTEND (VERCEL)**

### **4.1 Conectar Vercel:**
1. **Acesse:** https://vercel.com
2. **Login** com GitHub
3. **Clique:** "Add New..."
4. **Selecione:** "Project"
5. **Import:** kryonix-plataforma

### **4.2 Configurar Vercel:**
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm ci
Root Directory: (deixar vazio)
```

### **4.3 Environment Variables (Vercel):**
```
NEXT_PUBLIC_API_URL = https://kryonix-backend.onrender.com
NODE_ENV = production
ADMIN_USERNAME = kryonix
ADMIN_PASSWORD = Vitor@123456
```

### **4.4 Deploy Frontend:**
1. **Clique:** "Deploy"
2. **Aguarde:** 2-5 minutos
3. **URL Frontend:** https://kryonix-plataforma.vercel.app

---

## ✅ **PASSO 5: TESTAR TUDO FUNCIONANDO**

### **5.1 URLs para Testar:**
- **Site Principal:** https://kryonix-plataforma.vercel.app
- **Backend Health:** https://kryonix-backend.onrender.com/health
- **API Status:** https://kryonix-backend.onrender.com/api/status

### **5.2 Teste de Login:**
1. **Acesse:** https://kryonix-plataforma.vercel.app/login
2. **Verificar:** Logo KRYONIX no centro superior ✅
3. **Login:** kryonix
4. **Senha:** Vitor@123456
5. **Entrar** no dashboard

### **5.3 Teste Completo:**
- ✅ Logo aparece corretamente
- ✅ Login funciona
- ✅ Dashboard carrega
- ✅ Navegação funcionando
- ✅ Layout responsivo mobile/desktop
- ✅ Todas as páginas acessíveis

---

## 🔄 **PASSO 6: CONFIGURAR AUTO-DEPLOY**

### **6.1 Deploy Automático:**
Já está configurado! Quando você fizer mudanças:

1. **Editar código** localmente
2. **Git commit** + push
3. **Vercel + Render** atualizam automaticamente
4. **2-5 minutos** para estar no ar

### **6.2 Monitoramento:**
- **Vercel Dashboard:** Logs e analytics
- **Render Dashboard:** Backend monitoring  
- **Neon Dashboard:** Database metrics

---

## 💰 **RESUMO DOS CUSTOS (GRÁTIS):**

| Serviço | Limite Free | Custo |
|---------|-------------|-------|
| **Vercel** | 100GB bandwidth/mês | $0 |
| **Render** | 750 horas/mês | $0 |
| **Neon** | 3GB storage | $0 |
| **GitHub** | Repositórios ilimitados | $0 |
| **TOTAL** | | **$0/mês** 🎉 |

---

## 🎯 **CREDENCIAIS FINAIS:**

### **Acesso Sistema:**
- **Login:** kryonix
- **Senha:** Vitor@123456

### **URLs Finais:**
- **Site:** https://kryonix-plataforma.vercel.app
- **Admin:** https://kryonix-plataforma.vercel.app/login
- **API:** https://kryonix-backend.onrender.com

### **Database:**
- **Host:** Neon (ep-xxx.neon.tech)
- **Database:** kryonix_platform
- **User:** kryonix
- **Password:** Vitor@123456

---

## 🆘 **SE ALGO DER ERRADO:**

### **Problemas Comuns:**
1. **Build falha:** Verifique se todas as dependências estão no package.json
2. **Environment variables:** Verifique se todas foram copiadas corretamente  
3. **Database error:** Verifique se CONNECTION_STRING do Neon está correto
4. **Login não funciona:** Verifique ADMIN_USERNAME e ADMIN_PASSWORD

### **Como Debuggar:**
1. **Vercel:** Functions → View Logs
2. **Render:** Logs tab no dashboard
3. **Neon:** Dashboard → Monitoring

### **Contatos Suporte:**
- **Vercel:** https://vercel.com/help
- **Render:** https://render.com/docs
- **Neon:** https://neon.tech/docs

---

**🎉 PARABÉNS! SEU KRYONIX ESTÁ NO AR 100% GRÁTIS!**

**Layout mantido ✅ | Logo adicionada ✅ | Deploy gratuito ✅ | Tudo funcionando ✅**
