# Dopamine Quiz

Um quiz interativo sobre dopamina e transformação de vida.

## Estrutura do Projeto

```
dopamine-quizz/
├── public/                 # Pasta principal para deploy
│   ├── index.html         # Página principal
│   └── assets/            # Recursos estáticos
│       ├── css/           # Arquivos de estilo
│       │   └── style.css
│       ├── js/            # Arquivos JavaScript
│       │   ├── quiz.js
│       │   └── confetti.min.js
│       └── images/        # Imagens do projeto
└── README.md              # Este arquivo
```

## Deploy no EasyPanel

### Pré-requisitos
1. Conta no EasyPanel
2. Projeto compactado ou repositório Git

### Passos para Deploy

1. **Preparar o projeto**:
   - Certifique-se de que todos os arquivos estão na pasta `public/`
   - Teste localmente executando um servidor HTTP na pasta raiz

2. **No EasyPanel**:
   - Faça login na sua conta
   - Clique em "New Project" ou "Criar Projeto"
   - Escolha "Static Site" ou "Site Estático"

3. **Configuração**:
   - **Source**: Upload do arquivo ZIP ou conecte seu repositório Git
   - **Build Command**: Deixe vazio (não precisa de build)
   - **Output Directory**: `public`
   - **Root Directory**: `/` (raiz do projeto)

4. **Deploy**:
   - Clique em "Deploy" ou "Fazer Deploy"
   - Aguarde o processo de deploy
   - Acesse a URL fornecida pelo EasyPanel

### Configurações Importantes

- **Pasta de Deploy**: `public/` (contém todos os arquivos necessários)
- **Arquivo Principal**: `index.html`
- **Tipo de Projeto**: Static Site / HTML
- **Porta**: Não necessária (site estático)

### Testando Localmente

Para testar antes do deploy:

```bash
# Na pasta raiz do projeto
cd public
python3 -m http.server 8000
# Acesse: http://localhost:8000
```

## Funcionalidades

- Quiz interativo com 9 perguntas
- Sistema de navegação por swipe/toque
- Armazenamento local do progresso
- Animações e efeitos visuais
- Design responsivo
- Analytics integrado

## Tecnologias

- HTML5
- CSS3 (com animações)
- JavaScript (ES6+)
- Animate.css
- Confetti.js