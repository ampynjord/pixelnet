# Pixelnet

Collaborative pixel-placing application, inspired by Reddit's r/place.

## Installation

Requires [Docker](https://www.docker.com/).

```bash
git clone https://github.com/ampynjord/pixelnet.git
cd pixelnet
cp .env.example .env
```

## Usage

```bash
# Start
./scripts/start.ps1

# Stop
./scripts/stop.ps1

# Clean up
./scripts/clean.ps1
```

Or manually:
```bash
docker-compose up -d    # Start
docker-compose down     # Stop
```

## Access

- **Application**: http://localhost:3000
- **API**: http://localhost:3001/api/pixels

## Structure

```
pixelnet/
├── backend/           # Node.js API
├── frontend/          # React interface
├── scripts/           # Docker scripts
└── docker-compose.yml # Configuration
```

## API

- `GET /api/pixels` - List pixels
- `POST /api/pixels` - Add a pixel
- `PUT /api/pixels/:id` - Update a pixel

## Development

Without Docker:
```bash
# Backend
cd backend && npm install && npm start

# Frontend
cd frontend && npm install && npm start
```