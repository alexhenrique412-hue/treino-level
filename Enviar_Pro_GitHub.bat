@echo off
chcp 65001 >nul
title IronLevel - Enviar Atualizações para o GitHub
cls

echo ========================================================
echo       IRONLEVEL - ENVIAR ATUALIZAÇÕES PARA O GITHUB
echo ========================================================
echo.

:: 1. Verifica se o Git está instalado
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] O Git ainda não está instalado no seu computador.
    echo.
    echo Baixe o instalador oficial do Git clicando no link abaixo:
    echo 👉 https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/Git-2.47.1-64-bit.exe
    echo.
    echo (Basta abrir o arquivo baixado e clicar em "Next" até concluir).
    echo Depois de instalar, dê dois cliques neste arquivo novamente!
    echo.
    pause
    exit /b
)

cd /d "%~dp0"

:: 2. Inicializa o repositório Git local se não existir
if not exist ".git" (
    echo [1/4] Inicializando repositório Git local...
    git init
    git branch -M main
    git remote remove origin >nul 2>nul
    git remote add origin https://github.com/alexhenrique412-hue/treino-level.git
)

:: 3. Configura autor automaticamente para não dar erro de identidade
git config user.name "alexhenrique412-hue"
git config user.email "alexhenrique412-hue@users.noreply.github.com"

:: 4. Adiciona todos os arquivos alterados
echo [2/4] Preparando arquivos modificados...
git add .

:: 5. Cria o commit com a data e hora
echo [3/4] Gravando alterações...
set TIMESTAMP=%date% %time%
git commit -m "Atualizacao do app IronLevel: %TIMESTAMP%" >nul 2>nul

:: 6. Envia para o GitHub
echo [4/4] Enviando para https://github.com/alexhenrique412-hue/treino-level...
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Sincronizando historico com o GitHub...
    git pull origin main --rebase --allow-unrelated-histories
    git push -u origin main
)

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo    ✔ SUCESSO! Todas as atualizações foram enviadas!
    echo ========================================================
    echo Seu app atualizado já está no ar em:
    echo 👉 https://alexhenrique412-hue.github.io/treino-level/
) else (
    echo ========================================================
    echo [AVISO] Se uma janela do navegador abriu pedindo login:
    echo Faça o login no GitHub para autorizar o envio.
    echo ========================================================
)
echo.
pause
