# Script de Deploy Manual via FTP para Hostinger
# Criado por Antigravity

$hostAddress = "ftp.darkslategrey-chimpanzee-761383.hostingersite.com"
$username = "u969661049.u969661049"
$password = "230520@#HOVPn"
$localFolder = "." # Pasta raiz do projeto

Write-Host "--- INICIANDO DEPLOY MANUAL VPRequisições ---" -ForegroundColor Cyan

# 1. Build do projeto
Write-Host "1. Compilando o projeto (npm run build)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha na compilação. Deploy cancelado." -ForegroundColor Red
    exit
}

# 2. Criar pacote de deploy (apenas o essencial)
Write-Host "2. Preparando pacote de deploy (vprequisicoes-deploy.zip)..." -ForegroundColor Yellow
$zipFile = "vprequisicoes-deploy.zip"
if (Test-Path $zipFile) { Remove-Item $zipFile }

# Lista de arquivos/pastas para o zip
$includeList = @(".next", "public", "package.json", "package-lock.json", "server.js", "next.config.js")
Compress-Archive -Path $includeList -DestinationPath $zipFile -Force

# 3. Upload via FTP (Simples)
Write-Host "3. Enviando para a Hostinger..." -ForegroundColor Yellow
$url = "ftp://$hostAddress/$zipFile"
$webclient = New-Object System.Net.WebClient
$webclient.Credentials = New-Object System.Net.NetworkCredential($username, $password)

try {
    $uri = New-Object System.Uri($url)
    $webclient.UploadFile($uri, "STOR", (Get-Item $zipFile).FullName)
    Write-Host "SUCESSO! O arquivo $zipFile foi enviado para a Hostinger." -ForegroundColor Green
    Write-Host "Agora, no painel da Hostinger:" -ForegroundColor Cyan
    Write-Host "1. Vá em Gerenciador de Arquivos."
    Write-Host "2. Extraia o arquivo $zipFile."
    Write-Host "3. No painel Node.js, reinicie a aplicação."
} catch {
    Write-Host "ERRO NO UPLOAD: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Verifique se o FTP está ativo no painel da Hostinger." -ForegroundColor Yellow
}
