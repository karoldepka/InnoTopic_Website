import React, { useState } from 'react';
import './DesignManager.css';

function DesignManager({ onDesignChange, tshirtDesign }) {
  const [color, setColor] = useState(tshirtDesign.color);
  const [logos, setLogos] = useState(tshirtDesign.logos);

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    onDesignChange({ color: newColor, logos });
  };

  const handleRemoveLogo = (logoUrl) => {
    const updatedLogos = logos.filter((logo) => logo.url !== logoUrl);
    setLogos(updatedLogos);
    onDesignChange({ color, logos: updatedLogos });
  };

  const handleResizeLogo = (index, size) => {
    const updatedLogos = logos.map((logo, idx) => (idx === index ? { ...logo, size } : logo));
    setLogos(updatedLogos);
    onDesignChange({ color, logos: updatedLogos });
  };

  const handleDrag = (index, e) => {
    const updatedLogos = logos.map((logo, idx) => {
      if (idx === index) {
        return {
          ...logo,
          position: {
            x: e.clientX - 50,
            y: e.clientY - 50,
          },
        };
      }
      return logo;
    });
    setLogos(updatedLogos);
    onDesignChange({ color, logos: updatedLogos });
  };

  return (
    <div className="design-manager">
      <h2>Design Your T-Shirt</h2>
      <div>
        <label>Choose Color: </label>
        <input type="color" value={color} onChange={handleColorChange} />
      </div>
      <div className="tshirt-preview" style={{ backgroundColor: color }}>
        {logos.map((logo, index) => (
          <img
            key={index}
            src={logo.url}
            alt={`Logo ${index + 1}`}
            width={logo.size}
            style={{
              position: 'absolute',
              left: `${logo.position.x}px`,
              top: `${logo.position.y}px`,
              cursor: 'move',
            }}
            onDrag={(e) => handleDrag(index, e)}
          />
        ))}
      </div>
      <div>
        <h3>Logos</h3>
        {logos.map((logo, index) => (
          <div key={index}>
            <img src={logo.url} alt={`Logo ${index + 1}`} width={logo.size} />
            <input
              type="range"
              min="50"
              max="200"
              value={logo.size}
              onChange={(e) => handleResizeLogo(index, e.target.value)}
            />
            <button onClick={() => handleRemoveLogo(logo.url)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DesignManager;
