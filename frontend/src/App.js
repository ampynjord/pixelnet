import React, { useEffect, useState, useRef } from 'react';

function App() {
  const [pixels, setPixels] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#ffb347');
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [cooldownTime, setCooldownTime] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const canvasRef = useRef(null);
  const GRID_WIDTH = Math.floor(window.innerWidth / 2);
  const GRID_HEIGHT = Math.floor(window.innerHeight / 2);

  useEffect(() => {
    // Charger les pixels au démarrage
    loadPixels();
    // Vérifier le cooldown au démarrage
    checkCooldown();
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [pixels, zoom, panX, panY]);

  // Timer pour le cooldown
  useEffect(() => {
    let interval;
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            setMessage('Vous pouvez maintenant placer un pixel !');
            setMessageType('success');
            setTimeout(() => setMessage(''), 3000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTime]);

  const loadPixels = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/pixels');
      const pixelsData = await response.json();
      setPixels(pixelsData);
    } catch (error) {
      console.error('Erreur lors du chargement des pixels:', error);
      showMessage('Erreur de connexion au serveur', 'error');
    }
  };

  const checkCooldown = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cooldown');
      const cooldownData = await response.json();
      if (cooldownData.inCooldown) {
        setCooldownTime(cooldownData.remainingTime);
        showMessage(`Cooldown actif : ${formatTime(cooldownData.remainingTime)}`, 'info');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du cooldown:', error);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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

  const handleCanvasClick = async (e) => {
    if (isPanning) return;
    
    if (cooldownTime > 0) {
      showMessage(`Attendez ${formatTime(cooldownTime)} avant de placer un autre pixel`, 'error');
      return;
    }
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const x = Math.floor(((e.clientX - rect.left - panX) / zoom) / 2);
    const y = Math.floor(((e.clientY - rect.top - panY) / zoom) / 2);
    
    if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
      try {
        const response = await fetch('http://localhost:3001/api/pixels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x, y, color: selectedColor })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          showMessage(result.message || 'Pixel placé !', 'success');
          setCooldownTime(result.cooldownTime || 300); // 5 minutes par défaut
          loadPixels(); // Recharger la grille
        } else {
          if (result.remainingTime) {
            setCooldownTime(result.remainingTime);
            showMessage(`${result.message} (${formatTime(result.remainingTime)})`, 'error');
          } else {
            showMessage(result.error || 'Erreur lors du placement', 'error');
          }
        }
      } catch (error) {
        console.error('Erreur lors du placement du pixel:', error);
        showMessage('Erreur de connexion', 'error');
      }
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
      {/* Message flottant */}
      {message && (
        <div style={{ 
          position: 'fixed', 
          top: 20, 
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1001, 
          background: messageType === 'error' ? '#ff4444' : messageType === 'success' ? '#44ff44' : '#ffb347', 
          color: messageType === 'success' ? '#000' : '#fff',
          padding: '10px 20px', 
          borderRadius: '5px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          fontSize: '0.9rem',
          fontWeight: 'bold'
        }}>
          {message}
        </div>
      )}

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
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        minWidth: '200px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#ffb347', fontSize: '1.2rem' }}>PixelNet</h3>
        
        {/* Indicateur de cooldown */}
        {cooldownTime > 0 && (
          <div style={{ 
            marginBottom: 15, 
            padding: '8px', 
            background: 'rgba(255, 68, 68, 0.2)', 
            borderRadius: '5px',
            border: '1px solid #ff4444'
          }}>
            <div style={{ fontSize: '0.8rem', marginBottom: '5px' }}>🕒 Cooldown actif</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ff6666' }}>
              {formatTime(cooldownTime)}
            </div>
          </div>
        )}
        
        {!cooldownTime && (
          <div style={{ 
            marginBottom: 15, 
            padding: '8px', 
            background: 'rgba(68, 255, 68, 0.2)', 
            borderRadius: '5px',
            border: '1px solid #44ff44'
          }}>
            <div style={{ fontSize: '0.9rem', color: '#66ff66' }}>✅ Prêt à placer !</div>
          </div>
        )}

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem' }}>Couleur :</label>
          <input 
            type="color" 
            value={selectedColor} 
            onChange={e => setSelectedColor(e.target.value)} 
            style={{ width: '100%', height: '30px', border: 'none', borderRadius: '3px' }} 
          />
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
          <div style={{ marginTop: '5px', color: '#ffb347' }}>⏱️ 1 pixel / 5 minutes</div>
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
