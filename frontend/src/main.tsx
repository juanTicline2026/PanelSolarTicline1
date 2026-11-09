import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Evitar que el scroll del mouse cambie valores numéricos en los inputs
document.addEventListener('wheel', () => {
  if (document.activeElement instanceof HTMLInputElement && document.activeElement.type === 'number') {
    document.activeElement.blur();
  }
}, { passive: true });

createRoot(document.getElementById('root')!).render(<App />);
