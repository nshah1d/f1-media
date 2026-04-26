import React, { useState } from 'react';
import F1MediaPage from './routes/F1MediaPage';
import EntertainmentPage from './routes/EntertainmentPage';

if (!sessionStorage.getItem('session_seed')) {
  sessionStorage.setItem('session_seed', String(Math.floor(Math.random() * 1000000)));
}


export default function App() {
  const [view, setView] = useState('f1');

  if (view === 'entertainment') {
    return <EntertainmentPage onLogout={() => setView('f1')} />;
  }

  return <F1MediaPage onAuth={() => setView('entertainment')} />;
}
