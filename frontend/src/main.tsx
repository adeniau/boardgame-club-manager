import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Imports pour l'accessibilité en développement
if (import.meta.env.DEV) {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000);
  });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);