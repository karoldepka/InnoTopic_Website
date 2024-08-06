import React, { useState } from 'react';
import PromptInput from './components/PromptInput';
import LogoDisplay from './components/LogoDisplay';
import DesignManager from './components/DesignManager';
import OrderManager from './components/OrderManager';
import './App.css';

function App() {
  const [logos, setLogos] = useState([]);
  const [error, setError] = useState(null);
  const [tshirtDesign, setTshirtDesign] = useState({
    color: '#ffffff',
    logos: [],
    template: 'tshirt-template1.png',
  });

  const handlePromptSubmit = async (prompt) => {
    try {
      const response = await fetch('/api/process-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch logos');
      }

      const data = await response.json();
      setLogos(data.logos);
      setError(null);
    } catch (err) {
      setError(err.message);
      setLogos([]);
    }
  };

  const handleDesignChange = (design) => {
    setTshirtDesign(design);
  };

  const handleAddLogo = (logo) => {
    if (!logo.thumbnail_url) {
      setError('Invalid logo data');
      return;
    }
    const newLogo = { url: logo.thumbnail_url, size: 100, position: { x: 50, y: 50 } };
    const updatedDesign = {
      ...tshirtDesign,
      logos: [...tshirtDesign.logos, newLogo],
    };
    setTshirtDesign(updatedDesign);
  };

  return (
    <div className="App container">
      <h1>Shirt Generator</h1>
      <div className="row">
        <div className="col">
          <PromptInput onSubmit={handlePromptSubmit} />
          {error && <p className="text-danger">{error}</p>}
        </div>
      </div>
      <div className="row">
        <div className="col">
          <LogoDisplay logos={logos} onAddLogo={handleAddLogo} />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <DesignManager tshirtDesign={tshirtDesign} onDesignChange={handleDesignChange} />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <OrderManager tshirtDesign={tshirtDesign} />
        </div>
      </div>
    </div>
  );
}

export default App;
