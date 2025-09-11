Write-Host "🚀 Démarrage de Pixelnet..." -ForegroundColor Green
docker-compose down
docker-compose up --build -d
Start-Sleep -Seconds 3
docker-compose ps
Write-Host "✅ Prêt! Frontend: http://localhost:3000" -ForegroundColor Green
