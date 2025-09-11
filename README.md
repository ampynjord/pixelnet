# Pixelnet

Application collaborative de placement de pixels. Inspirée par le projet Reddit r/place.

## Installation

Requiert [Docker](https://www.docker.com/)

```bash
git clone https://github.com/ampynjord/pixelnet.git
cd pixelnet
cp .env.example .env
```

## Utilisation

```bash
# Démarrer
./scripts/start.ps1

# Arrêter  
./scripts/stop.ps1

# Nettoyer
./scripts/clean.ps1
```

Ou manuellement :
```bash
docker-compose up -d    # Démarrer
docker-compose down     # Arrêter
```

## Accès

- **Application** : http://localhost:3000
- **API** : http://localhost:3001/api/pixels

## Structure

```
pixelnet/
├── backend/           # API Node.js
├── frontend/          # Interface React  
├── scripts/           # Scripts Docker
└── docker-compose.yml # Configuration
```

## API

- `GET /api/pixels` - Liste des pixels
- `POST /api/pixels` - Ajouter un pixel
- `PUT /api/pixels/:id` - Modifier un pixel

## Développement

Sans Docker :
```bash
# Backend
cd backend && npm install && npm start

# Frontend  
cd frontend && npm install && npm start
```
