Write-Host "🧹 Nettoyage..." -ForegroundColor Yellow
docker-compose down
docker rmi pixelnet-frontend pixelnet-backend -f
docker system prune -f
Write-Host "✅ Nettoyé!" -ForegroundColor Green
