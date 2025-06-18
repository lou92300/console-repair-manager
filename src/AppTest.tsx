import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2196F3' }}>🎮 Test Frontend Console Repair Manager</h1>
      <p>Si vous voyez ce message, le frontend fonctionne parfaitement !</p>
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h2>✅ Vérifications :</h2>
        <ul>
          <li>React fonctionne</li>
          <li>Vite fonctionne</li>
          <li>TypeScript fonctionne</li>
          <li>Le serveur de développement fonctionne</li>
        </ul>
      </div>
      <button 
        style={{ 
          marginTop: '20px', 
          padding: '10px 20px', 
          backgroundColor: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
        onClick={() => alert('Le JavaScript fonctionne aussi !')}
      >
        Test Button
      </button>
    </div>
  );
};

export default App;
