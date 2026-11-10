# 🏋️‍♂️ IronLevel - App de Treino, Níveis e Corrida

Aplicativo completo de academia gamificado com sistema de evolução de nível, montagem de treinos diários, monitoramento de corridas e cartão de compartilhamento estilo Story para redes sociais.

Pronto para rodar no **GitHub Pages** e ser instalado em qualquer celular como **PWA**!

---

## 🌐 Como Colocar para Rodar no GitHub (GitHub Pages)

O projeto já está 100% configurado com caminhos relativos e com o arquivo de automação do **GitHub Actions** (`.github/workflows/deploy.yml`).

### Passo 1: Criar o Repositório no GitHub
1. Acesse [github.com/new](https://github.com/new) e faça login na sua conta.
2. Em **Repository name**, coloque um nome (ex: `ironlevel` ou `meu-treino`).
3. Deixe o repositório marcado como **Public** (Público).
4. Clique em **Create repository**.

### Passo 2: Enviar os Arquivos para o Repositório
Você pode enviar os arquivos **diretamente pelo navegador** (sem precisar de comandos no terminal):
1. Na tela do repositório recém-criado, clique no link **"uploading an existing file"** (ou "Add file" -> "Upload files").
2. Abra a pasta do projeto no seu computador:
   `C:\Users\alexh\.gemini\antigravity\scratch\treino-level-up`
3. Selecione e arraste todos os arquivos e pastas para dentro da página do GitHub:
   - `.github/` (pasta com workflow do GitHub Actions)
   - `index.html`
   - `style.css`
   - `app.js`
   - `sw.js`
   - `manifest.json`
   - `icon-192.png`
   - `icon-512.png`
   - `README.md`
4. Clique no botão verde **Commit changes**.

### Passo 3: Ativar o GitHub Pages
1. No seu repositório no GitHub, clique na aba **Settings** (Configurações).
2. No menu lateral esquerdo, clique em **Pages**.
3. Em **Build and deployment > Source**, selecione:
   👉 **GitHub Actions**
4. Aguarde cerca de 1 minuto: o GitHub vai processar e disponibilizar o link público do seu app, algo como:
   `https://SEU_USUARIO.github.io/NOME_DO_REPOSITORIO/`

---

## 📱 Como Instalar no Celular pelo Link do GitHub

1. Abra o link gerado pelo GitHub Pages no navegador do seu celular (**Chrome** no Android ou **Safari** no iPhone).
2. Para instalar na tela inicial como app nativo:
   * **No Android (Chrome):** Toque nos 3 pontinhos no canto superior direito -> **"Instalar aplicativo"** (ou "Adicionar à tela inicial").
   * **No iPhone (Safari):** Toque no botão de compartilhar (quadrado com setinha para cima) -> **"Adicionar à Tela de Início"**.
3. Pronto! O app fica instalado no celular, abre em tela cheia e salva todos os seus treinos automaticamente, funcionando mesmo sem internet!

---

## ⚡ Principais Funcionalidades do App

1. 🏆 **Sistema de Níveis & Evolução (Gamificação):**
   - **Regra:** 2 horas de treino = 1 ponto.
   - Níveis do 1 ao 8 com efeito sonoro e confetes de celebração.
2. 📅 **Montagem do Treino do Dia:**
   - 7 dias da semana customizáveis (Séries, Reps, Carga kg, Descanso, Notas).
3. ⏱️ **Cronômetro Ao Vivo & Sessões Diárias:**
   - Registre quantas vezes treina no dia (ex: Manhã e Noite).
4. 🏃‍♂️ **Monitor de Corrida (Km e Tempo):**
   - Ritmo (Pace), velocidade e calorias. O tempo de corrida soma pontos de treino!
5. ⚡ **Desafio Diário & Sequência (Streak):**
   - Meta diária com barra de progresso e contador de dias seguidos.
6. 📲 **Compartilhar Treino do Dia:**
   - Gera um card estilizado para Stories do Instagram ou WhatsApp.
