import React, { useEffect, useState, useRef } from 'react';

function App() {
  const [pixels, setPixels] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#ffb347');
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const GRID_WIDTH = Math.floor(window.innerWidth / 2);
  const GRID_HEIGHT = Math.floor(window.innerHeight / 2);

  useEffect(() => {
    fetch('http://localhost:3001/api/pixels')
      .then(res => res.json())
      .then(setPixels);
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [pixels, zoom, panX, panY]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Réinitialiser les transformations
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Effacer tout le canvas
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Appliquer les transformations (pan et zoom)
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);
    
    // Dessiner les pixels colorés
    pixels.forEach(pixel => {
      ctx.fillStyle = pixel.color;
      ctx.fillRect(pixel.x * 2, pixel.y * 2, 2, 2);
    });
    
    // Dessiner la grille
    if (zoom > 0.5) { // N'afficher la grille que si le zoom est suffisant
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 0.5 / zoom;
      for (let i = 0; i <= GRID_WIDTH; i += Math.max(1, Math.floor(10 / zoom))) {
        ctx.beginPath();
        ctx.moveTo(i * 2, 0);
        ctx.lineTo(i * 2, GRID_HEIGHT * 2);
        ctx.stroke();
      }
      for (let i = 0; i <= GRID_HEIGHT; i += Math.max(1, Math.floor(10 / zoom))) {
        ctx.beginPath();
        ctx.moveTo(0, i * 2);
        ctx.lineTo(GRID_WIDTH * 2, i * 2);
        ctx.stroke();
      }
    }
  };

  const handleCanvasClick = (e) => {
    if (isPanning) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const x = Math.floor(((e.clientX - rect.left - panX) / zoom) / 2);
    const y = Math.floor(((e.clientY - rect.top - panY) / zoom) / 2);
    
    if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
      fetch('http://localhost:3001/api/pixels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y, color: selectedColor, owner: 'demo' })
      })
        .then(res => res.json())
        .then(() => {
          fetch('http://localhost:3001/api/pixels')
            .then(res => res.json())
            .then(setPixels);
        });
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prevZoom => Math.max(0.1, Math.min(10, prevZoom * zoomFactor)));
  };

  const handleMouseDown = (e) => {
    if (e.button === 1 || e.ctrlKey) { // Molette ou Ctrl+clic pour pan
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPanX(prevX => prevX + deltaX);
      setPanY(prevY => prevY + deltaY);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', position: 'relative' }}>
      {/* Panneau de contrôle flottant */}
      <div style={{ 
        position: 'fixed', 
        top: 20, 
        right: 20, 
        zIndex: 1000, 
        background: 'rgba(0,0,0,0.8)', 
        padding: '15px', 
        borderRadius: '10px',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#ffb347', fontSize: '1.2rem' }}>PixelWar</h3>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem' }}>Couleur :</label>
          <input type="color" value={selectedColor} onChange={e => setSelectedColor(e.target.value)} style={{ width: '100%', height: '30px' }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem' }}>Zoom : {zoom.toFixed(1)}x</label>
          <input 
            type="range" 
            min="0.1" 
            max="10" 
            step="0.1" 
            value={zoom} 
            onChange={e => setZoom(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
          <div>🖱️ Clic gauche : Colorier</div>
          <div>🔄 Molette : Zoom</div>
          <div>🖱️ Ctrl+Clic : Déplacer</div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          background: '#222',
          cursor: isPanning ? 'grabbing' : 'crosshair',
          width: '100vw',
          height: '100vh',
        }}
      />
    </div>
  );
}

export default App;
