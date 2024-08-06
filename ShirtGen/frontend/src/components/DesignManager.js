import React, { useState } from 'react';
import './DesignManager.css';

const templates = [
  '/tshirt-template1.png',
  '/tshirt-template2.png',
  '/tshirt-template3.png'
];

function DesignManager({ onDesignChange }) {
  const [color, setColor] = useState('#ffffff');
  const [logos, setLogos] = useState([]);
  const [template, setTemplate] = useState(templates[0]);

  const handleColorChange = (e) => {
    setColor(e.target.value);
    onDesignChange({ color, logos, template });
  };

  const handleAddLogo = (logo) => {
    const newLogo = { url: logo.thumbnail_url, size: 100, position: { x: 50, y: 50 } };
    setLogos([...logos, newLogo]);
    onDesignChange({ color, logos: [...logos, newLogo], template });
  };

  const handleRemoveLogo = (logoUrl) => {
    const updatedLogos = logos.filter(logo => logo.url !== logoUrl);
    setLogos(updatedLogos);
    onDesignChange({ color, logos: updatedLogos, template });
  };

  const handleResizeLogo = (index, size) => {
    const updatedLogos = logos.map((logo, idx) => idx === index ? { ...logo, size } : logo);
    setLogos(updatedLogos);
    onDesignChange({ color, logos: updatedLogos, template });
  };

  const handleDrag = (index, e) => {
    const updatedLogos = logos.map((logo, idx) => {
      if (idx === index) {
        return {
          ...logo,
          position: {
            x: e.clientX - 50,
            y: e.clientY - 50,
          }
        };
      }
      return logo;
    });
    setLogos(updatedLogos);
    onDesignChange({ color, logos: updatedLogos, template });
  };

  const handleTemplateChange = (e) => {
    setTemplate(e.target.value);
    onDesignChange({ color, logos, template: e.target.value });
  };

  return (
    <div className="design-manager">
      <h2>Design Your T-Shirt</h2>
      <div>
        <label>Choose Template: </label>
        <select value={template} onChange={handleTemplateChange}>
          {templates.map((tpl, index) => (
            <option key={index} value={tpl}>{`Template ${index + 1}`}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Choose Color: </label>
        <input type="color" value={color} onChange={handleColorChange} />
      </div>
      <div className="tshirt-preview" style={{ backgroundColor: color, backgroundImage: `url(${template})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }}>
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
