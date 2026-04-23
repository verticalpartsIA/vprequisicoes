# Script de Deploy Manual High-Fidelity
# Criado por Antigravity seguindo a especificação v2.1.0

$hostAddress = "ftp.darkslategrey-chimpanzee-761383.hostingersite.com"
$username = "u969661049.u969661049" # FTP User
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

# 3. Preparar Pasta de Distribuição
Write-Host "3. Preparando pasta de distribuição (deploy-dist)..." -ForegroundColor Yellow
if (Test-Path "deploy-dist") { Remove-Item -Recurse -Force "deploy-dist" }
New-Item -ItemType Directory -Path "deploy-dist"
Copy-Item -Path ".next/standalone/*" -Destination "deploy-dist" -Recurse
if (!(Test-Path "deploy-dist/.next")) { New-Item -ItemType Directory -Path "deploy-dist/.next" }
Copy-Item -Path ".next/static" -Destination "deploy-dist/.next" -Recurse
Copy-Item -Path "public" -Destination "deploy-dist" -Recurse
Copy-Item -Path "server.js" -Destination "deploy-dist"

# 4. Criar ZIP Final (Leve)
Write-Host "4. Criando pacote otimizado (vprequisicoes-final.zip)..." -ForegroundColor Yellow
Compress-Archive -Path "deploy-dist/*" -DestinationPath "vprequisicoes-final.zip" -Force

Write-Host "`n✅ PROCESSO CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "Arquivos desnecessários (src, skills, etc) foram excluídos do pacote." -ForegroundColor Cyan
Write-Host "O arquivo 'vprequisicoes-final.zip' está pronto para ser enviado." -ForegroundColor Yellow
