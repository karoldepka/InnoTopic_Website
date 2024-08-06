import React, { useState } from 'react';

function DesignManager({ onDesignChange }) {
    const [color, setColor] = useState('white');
    const [logos, setLogos] = useState([]);

    const handleColorChange = (e) => {
        setColor(e.target.value);
        onDesignChange({ color, logos });
    };

    const handleAddLogo = (logoUrl) => {
        setLogos([...logos, logoUrl]);
        onDesignChange({ color, logos: [...logos, logoUrl] });
    };

    const handleRemoveLogo = (logoUrl) => {
        const updatedLogos = logos.filter(logo => logo !== logoUrl);
        setLogos(updatedLogos);
        onDesignChange({ color, logos: updatedLogos });
    };

    return (
        <div>
            <h2>Design Your T-Shirt</h2>
            <div>
                <label>Choose Color: </label>
                <input type="color" value={color} onChange={handleColorChange} />
            </div>
            <div>
                <h3>Logos</h3>
                {logos.map((logo, index) => (
                    <div key={index}>
                        <img src={logo} alt={`Logo ${index + 1}`} />
                        <button onClick={() => handleRemoveLogo(logo)}>Remove</button>
                    </div>
                ))}
                <button onClick={() => handleAddLogo(prompt('Enter logo URL:'))}>Add Logo</button>
            </div>
        </div>
    );
}

export default DesignManager;
