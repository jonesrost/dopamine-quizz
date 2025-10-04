# 🚀 Deploy no EasyPanel - Guia Passo a Passo

## 📦 Arquivo Pronto para Deploy

O arquivo `dopamine-quiz-deploy.zip` foi criado em `/Users/jones/Downloads/` e está pronto para upload no EasyPanel.

## 🔧 Passos para Deploy no EasyPanel

### 1. Acesse o EasyPanel
- Faça login na sua conta EasyPanel
- Vá para o dashboard principal

### 2. Criar Novo Projeto
- Clique em **"New Project"** ou **"+ Create"**
- Escolha **"Static Site"** ou **"HTML/CSS/JS"**

### 3. Configurações do Projeto
```
Project Name: dopamine-quiz
Type: Static Site
Source: Upload ZIP
```

### 4. Upload do Arquivo
- Faça upload do arquivo `dopamine-quiz-deploy.zip`
- Ou arraste e solte o arquivo na área de upload

### 5. Configurações de Build
```
Build Command: (deixe vazio)
Output Directory: . (ponto - pasta raiz)
Root Directory: / (barra - raiz)
Node Version: (não necessário)
```

### 6. Configurações Avançadas (se disponível)
```
Index File: index.html
Error Page: index.html (para SPA behavior)
```

### 7. Deploy
- Clique em **"Deploy"** ou **"Create & Deploy"**
- Aguarde o processo de build e deploy
- Acesse a URL fornecida pelo EasyPanel

## ✅ Verificações Pós-Deploy

Após o deploy, teste:
- ✅ Página inicial carrega corretamente
- ✅ Swipe up funciona nas duas primeiras telas
- ✅ Transições estão suaves
- ✅ Quiz funciona completamente
- ✅ Animações e confetti funcionam
- ✅ Design responsivo em mobile

## 🔄 Atualizações Futuras

Para atualizar o site:
1. Faça as alterações nos arquivos locais
2. (Opção A) Crie um novo ZIP da pasta `public/` e faça upload manual (fluxo atual)
3. (Opção B - Recomendado) Conecte o EasyPanel ao repositório Git para deploy automático:
   - No EasyPanel, edite o projeto e mude **Source** para **Git**
   - Conecte sua conta GitHub e selecione `jonesrost/dopamine-quizz`
   - Branch: `main`
   - Output Directory: `public`
   - Build Command: vazio
   - Ative **Auto Deploy on Push**
   - Agora, cada `git push` dispara um deploy automático

### Alternativa: Deploy automático via GitHub Pages
O repositório inclui um workflow em `.github/workflows/deploy-pages.yml` que publica a pasta `public` no GitHub Pages a cada push para `main`.

Como ativar:
1. Vá em Settings → Pages
2. Configure **Source** para **GitHub Actions**
3. Faça um `git push` e aguarde a publicação

### Script de push rápido (opcional)
Adicionei um script para agilizar commits e push:

```bash
./scripts/quick-push.sh "Mensagem do commit"
```

Ele executa `git add -A`, `git commit -m "..."` e `git push` em sequência.

## 📱 Domínio Personalizado (Opcional)

Se quiser usar seu próprio domínio:
1. No EasyPanel, vá em **"Domains"**
2. Clique em **"Add Domain"**
3. Digite seu domínio
4. Configure os DNS conforme instruções
5. Aguarde propagação (até 24h)

## 🆘 Troubleshooting

**Problema**: Site não carrega
- **Solução**: Verifique se o arquivo `index.html` está na raiz

**Problema**: CSS/JS não carregam
- **Solução**: Verifique os caminhos relativos nos arquivos

**Problema**: Swipe não funciona
- **Solução**: Teste em dispositivo mobile real

## 📞 Suporte

Se precisar de ajuda:
- Documentação EasyPanel: docs.easypanel.io
- Suporte EasyPanel: support@easypanel.io