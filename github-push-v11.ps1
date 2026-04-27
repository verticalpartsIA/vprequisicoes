# Script de Upload para vprequisicoes v11
# Criado por Antigravity

$repoUrl = "https://github.com/verticalpartsIA/vprequisicoes.git"
$branchName = "v11-integrado"

Write-Host "Iniciando processo de upload para GitHub..." -ForegroundColor Cyan

# 1. Verificar se pasta .git existe
if (-not (Test-Path ".git")) {
    git init
    Write-Host "Repositório git inicializado localmente."
}

# 2. Configurar Remote
git remote remove origin 2>$null
git remote add origin $repoUrl
Write-Host "Remote configurado: $repoUrl"

# 3. Adicionar arquivos (respeitando .gitignore)
Write-Host "Adicionando arquivos..."
git add .

# 4. Commit
$commitMsg = "v11-integrado: Implementação completa dos módulos M1-M6 e integração do fluxo V2-V5"
git commit -m $commitMsg

# 5. Push
Write-Host "Enviando para o GitHub na branch $branchName..." -ForegroundColor Yellow
git checkout -b $branchName 2>$null
git push -u origin $branchName --force

Write-Host "Sucesso! O código está no GitHub." -ForegroundColor Green
