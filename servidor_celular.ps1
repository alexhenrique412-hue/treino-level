# Servidor local para abrir no celular pela rede Wi-Fi
$port = 8080
$prefix = "http://*:$port/"
$folder = $PSScriptRoot

$ip = (ipconfig | Select-String "IPv4" | ForEach-Object { ($_ -split ":")[-1].Trim() } | Select-Object -First 1)
if (-not $ip) { $ip = "192.168.0.103" }

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "         IRONLEVEL - SERVIDOR PARA O CELULAR              " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. Conecte seu celular na MESMA rede Wi-Fi deste computador." -ForegroundColor Yellow
Write-Host "2. No navegador do seu celular (Chrome ou Safari), acesse:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   👉  http://${ip}:${port}  👈" -ForegroundColor Green
Write-Host ""
Write-Host "3. Para instalar como aplicativo no celular:" -ForegroundColor Yellow
Write-Host "   • No Android (Chrome): Menu (3 pontinhos) -> 'Instalar aplicativo'" -ForegroundColor White
Write-Host "   • No iPhone (Safari): Botao Compartilhar -> 'Adicionar a Tela de Inicio'" -ForegroundColor White
Write-Host ""
Write-Host "Pressione Ctrl+C para encerrar o servidor." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Green

$listener = New-Object System.Net.HttpListener
try {
    $listener.Prefixes.Add("http://+:$port/")
    $listener.Start()
} catch {
    try {
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://localhost:$port/")
        $listener.Start()
    } catch {
        Write-Host "Erro ao iniciar listener: $_" -ForegroundColor Red
        exit
    }
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($urlPath)) { $urlPath = "index.html" }
        $filePath = Join-Path $folder $urlPath

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".ico"  { "image/x-icon" }
                default { "application/octet-stream" }
            }
            $response.ContentType = $mime
            $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.AddHeader("Pragma", "no-cache")
            $response.AddHeader("Expires", "0")
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    } catch {
        # ignore client disconnects
    }
}
