# 🛠️ Verificador de Produção Nível 2 (Corrigido)
# Valida .env.local, RLS e Perfil de Usuário

$ErrorActionPreference = "Stop"
$LogDate = Get-Date -Format "yyyyMMdd-HHmm"
$LogFile = Join-Path $PSScriptRoot "fix-report-$LogDate.log"

function Write-Log {
    param([string]$Message, [string]$Type = "INFO")
    $Timestamp = Get-Date -Format "HH:mm:ss"
    $FormattedMessage = "[$Timestamp] [$Type] $Message"
    $Color = switch($Type) {
        "SUCCESS" { "Green" }
        "ERROR"   { "Red" }
        "WARNING" { "Yellow" }
        Default   { "White" }
    }
    Write-Host $FormattedMessage -ForegroundColor $Color
    $FormattedMessage | Out-File -FilePath $LogFile -Append
}

Write-Log "--- DIAGNOSTICO DE RIGOR (SDD SPEC) ---" "INFO"

# 1️⃣ PARSING .env.local
$EnvPath = Join-Path $PSScriptRoot "..\.env.local"
if (-not (Test-Path $EnvPath)) {
    Write-Log "ERRO: Arquivo .env.local nao encontrado!" "ERROR"
    exit 1
}

$EnvContent = @{}
Get-Content $EnvPath -Encoding UTF8 | ForEach-Object {
    $Line = $_.Trim()
    if ($Line -match '^([^#=]+)=(.*)$') {
        $Key = $Matches[1].Trim()
        $Value = $Matches[2].Trim().Trim("'").Trim('"')
        $EnvContent[$Key] = $Value
    }
}

$SupaUrl = $EnvContent["NEXT_PUBLIC_SUPABASE_URL"]
$AnonKey = $EnvContent["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
$ServKey = $EnvContent["SUPABASE_SERVICE_ROLE_KEY"]

# 2️⃣ TESTE ANON (Simulando o Site/Browser)
Write-Log "2. Testando conexao via ANON_KEY (Simulando Site)..." "INFO"
try {
    $Headers = @{ "apikey" = $AnonKey; "Authorization" = "Bearer $AnonKey" }
    $UrlAnon = "$SupaUrl/rest/v1/req_tickets?limit=1"
    $Response = Invoke-RestMethod -Uri $UrlAnon -Headers $Headers -Method Get
    
    if ($Response.Count -eq 0) {
        Write-Log "[!] Tabela vazia ou RLS bloqueando acesso ANON. (Array retornado: [])" "WARNING"
    } else {
        Write-Log "✅ SUCESSO: Dados lidos via ANON_KEY." "SUCCESS"
    }
} catch {
    Write-Log "❌ FALHA CRITICA: Site nao conseguira ler dados (Erro: $($_.Exception.Message))" "ERROR"
    $Blocker = $true
}

# 3️⃣ VERIFICAR USUARIO ADMIN (via Service Role)
Write-Log "3. Verificando Perfil do Usuario 'gelson.simoes'..." "INFO"
try {
    $Headers = @{ "apikey" = $ServKey; "Authorization" = "Bearer $ServKey" }
    # Usando string separada para evitar erro de parse do '&'
    $Query = "email=eq.gelson.simoes@verticalparts.com.br&select=full_name,role"
    $UserUrl = "$SupaUrl/rest/v1/req_profiles?$Query"
    
    $UserData = Invoke-RestMethod -Uri $UserUrl -Headers $Headers -Method Get
    
    if ($UserData) {
        Write-Log "✅ Usuario localizado: $($UserData[0].full_name) | Papel: $($UserData[0].role)" "SUCCESS"
        if ($UserData[0].role -ne "admin") {
            Write-Log "[!] ATENCAO: Usuario nao e ADMIN. Pode haver restricoes de acesso." "WARNING"
        }
    } else {
        Write-Log "❌ ERRO: Perfil nao encontrado para o email fornecido em req_profiles." "ERROR"
        $Blocker = $true
    }
} catch {
    Write-Log "❌ Falha ao consultar perfis: $($_.Exception.Message)" "ERROR"
    $Blocker = $true
}

# 4️⃣ RESUMO
Write-Log "--------------------------------------------" "INFO"
if ($Blocker) {
    Write-Log "❌ STATUS: REPROVADO PARA DEPLOY. Corrija os erros acima." "ERROR"
} else {
    Write-Log "✅ STATUS: APROVADO COM RIGOR. Conexao e Perfil validados." "SUCCESS"
    Write-Log "Dica: Garanta que as VARS na Vercel sejam IDENTICAS ao .env.local." "INFO"
}
Write-Log "Log detalhado em: $LogFile" "INFO"
