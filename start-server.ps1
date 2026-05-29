Write-Host "Starting sense website server on port 3000..."
Write-Host ""
Write-Host "Access it at: http://localhost:3000"
Write-Host ""
Write-Host "Press Ctrl+C to stop the server"
Write-Host ""

python -m http.server 3000
