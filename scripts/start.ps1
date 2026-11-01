# 빌드된 웹과 API를 같은 주소에서 실행. 기본은 예시 모드.
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path "$root/frontend/dist/index.html")) {
    throw 'frontend에서 npm run build를 먼저 실행해 주세요.'
}
$env:SERVE_FRONTEND = '1'
Push-Location "$root/backend"
try {
    uv run python -m app.serve
    if ($LASTEXITCODE) { throw '운영 서버 실행 실패' }
} finally {
    Pop-Location
}
