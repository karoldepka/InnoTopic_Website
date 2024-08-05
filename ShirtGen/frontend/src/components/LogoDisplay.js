import React from 'react';

function LogoDisplay({ logos }) {
  return (
    <div>
      {logos.map((logo, index) => (
        <img key={index} src={logo} alt={`Logo ${index + 1}`} />
      ))}
    </div>
  );
}

export default LogoDisplay;