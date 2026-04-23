# 🚀 Script de Deploy VPRequisições
Write-Host "Iniciando processo de build..." -ForegroundColor Cyan

# 1. Rodar o Build
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: O build falhou. Verifique as mensagens acima." -ForegroundColor Red
    exit
}

Write-Host "Build concluído com sucesso! Gerando pacote de upload..." -ForegroundColor Green

# 2. Limpar ZIP antigo se existir
if (Test-Path "para-upload.zip") {
    Remove-Item "para-upload.zip" -Force
}

# 3. Entrar na pasta 'out' e zipar o conteúdo (NÃO a pasta 'out' em si)
# Usamos o caminho absoluto para evitar erros
$outPath = Join-Path (Get-Location) "out"
$zipPath = Join-Path (Get-Location) "para-upload.zip"

Write-Host "Compactando arquivos de $outPath..." -ForegroundColor Yellow

# Comando mágico: zipa o conteúdo de 'out' diretamente para a raiz do zip
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($outPath, $zipPath)

Write-Host "`n✅ SUCESSO!" -ForegroundColor Green
Write-Host "Arquivo gerado: para-upload.zip" -ForegroundColor Cyan
Write-Host "O QUE FAZER AGORA:" -ForegroundColor Yellow
Write-Host "1. Delete tudo o que está na pasta da Hostinger."
Write-Host "2. Suba o arquivo 'para-upload.zip'."
Write-Host "3. Extraia e o site estará no ar!"
