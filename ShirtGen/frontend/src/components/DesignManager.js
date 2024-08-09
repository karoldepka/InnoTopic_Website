import React, { useState, useEffect } from 'react';
import './DesignManager.css';

function DesignManager({ tshirtDesign, onDesignChange }) {
  const [color, setColor] = useState(tshirtDesign.color);
  const [logos, setLogos] = useState(tshirtDesign.logos);
  const [template, setTemplate] = useState(tshirtDesign.template);

  useEffect(() => {
    onDesignChange({ color, logos, template });
  }, [color, logos, template]);

  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

  const handleTemplateChange = (e) => {
    setTemplate(e.target.value);
  };

  const handleAddLogo = (logo) => {
    const newLogo = { url: logo, size: 100, position: { x: 50, y: 50 } };
    setLogos([...logos, newLogo]);
  };

  const handleRemoveLogo = (logoUrl) => {
    const updatedLogos = logos.filter((logo) => logo.url !== logoUrl);
    setLogos(updatedLogos);
  };

  const handleResizeLogo = (index, size) => {
    const updatedLogos = logos.map((logo, idx) =>
      idx === index ? { ...logo, size } : logo
    );
    setLogos(updatedLogos);
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
  };

  return (
    <div className="design-manager">
      <h2>Design Your T-Shirt</h2>
      <div>
        <label>Choose Template: </label>
        <select value={template} onChange={handleTemplateChange}>
          <option value="tshirt-template1.png">Template 1</option>
          <option value="tshirt-template2.png">Template 2</option>
          <option value="tshirt-template3.png">Template 3</option>
        </select>
      </div>
      <div>
        <label>Choose Color: </label>
        <input type="color" value={color} onChange={handleColorChange} />
      </div>
      <div className="tshirt-preview" style={{ backgroundColor: color, backgroundImage: `url(${template})` }}>
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
        <button onClick={() => handleAddLogo(prompt('Enter logo URL:'))}>Add Logo</button>
      </div>
    </div>
  );
}

export default DesignManager;
