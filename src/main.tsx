
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add Inter and Lexend fonts
const interFontLink = document.createElement('link');
interFontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
interFontLink.rel = 'stylesheet';
document.head.appendChild(interFontLink);

const lexendFontLink = document.createElement('link');
lexendFontLink.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&display=swap';
lexendFontLink.rel = 'stylesheet';
document.head.appendChild(lexendFontLink);

createRoot(document.getElementById("root")!).render(<App />);
