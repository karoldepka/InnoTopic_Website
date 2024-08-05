import React, { useState } from 'react';
import PromptInput from './components/PromptInput';
import LogoDisplay from './components/LogoDisplay';

function App() {
  const [logos, setLogos] = useState([]);
  const [error, setError] = useState(null);

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

  return (
    <div>
      <h1>Shirt Generator</h1>
      <PromptInput onSubmit={handlePromptSubmit} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <LogoDisplay logos={logos} />
    </div>
  );
}

export default App;
