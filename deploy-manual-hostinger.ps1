# Script de Deploy Manual High-Fidelity
# Criado por Antigravity seguindo a especificação v2.1.0

$hostAddress = "ftp.darkslategrey-chimpanzee-761383.hostingersite.com"
$username = "u969661049.u969661049"
$password = "230520@#HOVPn"

Write-Host "--- INICIANDO DEPLOY HIGH-FIDELITY VPRequisições ---" -ForegroundColor Cyan

# 0. Limpeza de entulho local
Write-Host "0. Limpando arquivos temporários e zips antigos..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "*.zip" | Remove-Item -Force
Get-ChildItem -Path . -Filter "*.log" | Remove-Item -Force

# 1. Build Standalone
Write-Host "1. Executando Build Standalone (npm run build)..." -ForegroundColor Yellow
npm run build

# 2. Verificação
Write-Host "2. Verificando integridade..." -ForegroundColor Yellow
node scripts/verify-standalone.js
if ($LASTEXITCODE -ne 0) { exit }

# 3. Preparar Pasta de Distribuição (PADRÃO OFICIAL STANDALONE)
Write-Host "3. Preparando pacote oficial standalone..." -ForegroundColor Yellow
$standalonePath = ".next/standalone"

# --- PATCH DE PORTABILIDADE (O segredo para Hostinger) ---
# O Next.js do Windows grava caminhos C:\Users\gelso... no server.js. 
# Precisamos limpar isso para que ele funcione no Linux da Hostinger.
Write-Host "   -> Aplicando patch de portabilidade (Windows -> Linux)..." -ForegroundColor Cyan
$serverJsPath = "$standalonePath/server.js"
$content = Get-Content $serverJsPath -Raw
$localPath = "C:\\Users\\gelso\\Projetos_Sites\\vprequisições_pai\\vprequisicoes\\nodejs"
$escapedPath = $localPath.Replace("\", "\\")
$content = $content.Replace($escapedPath, ".")
Set-Content -Path $serverJsPath -Value $content -NoNewline

# Injeta os ativos estáticos
Write-Host "   -> Injetando ativos estáticos no motor..." -ForegroundColor Gray
if (!(Test-Path "$standalonePath/.next/static")) { New-Item -ItemType Directory -Path "$standalonePath/.next/static" }
Copy-Item -Path ".next/static/*" -Destination "$standalonePath/.next/static" -Recurse -Force
Copy-Item -Path "public" -Destination "$standalonePath" -Recurse -Force

# Verificação de integridade (BUILD_ID é o que estava faltando no erro anterior)
if (!(Test-Path "$standalonePath/.next/BUILD_ID")) {
    Write-Host "ERRO CRÍTICO: BUILD_ID não encontrado no standalone!" -ForegroundColor Red
    exit
}

# 4. Criar ZIP Final (Garantindo inclusão de pastas ocultas como .next)
Write-Host "4. Criando pacote final (vprequisicoes-final.zip)..." -ForegroundColor Yellow
$size = (Get-ChildItem $standalonePath -Recurse -Force | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host ("Tamanho real do pacote: {0:N2} MB" -f $size) -ForegroundColor Cyan

# Remove ZIP antigo se existir
if (Test-Path "vprequisicoes-final.zip") { Remove-Item "vprequisicoes-final.zip" }

# Captura todos os arquivos (INCLUINDO OCULTOS) para o ZIP
Set-Location $standalonePath
$itemsToZip = Get-ChildItem -Path . -Force
Compress-Archive -Path $itemsToZip -DestinationPath "../../vprequisicoes-final.zip" -Force
Set-Location ../..

Write-Host "`n✅ PROCESSO CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "Arquivos desnecessários (src, skills, etc) foram excluídos do pacote." -ForegroundColor Cyan
Write-Host "O arquivo 'vprequisicoes-final.zip' está pronto para ser enviado." -ForegroundColor Yellow
