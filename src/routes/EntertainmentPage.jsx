import React, { useState, useEffect, useCallback } from 'react';
import VideoFeed from '../components/entertainment/VideoFeed';
import { useVideoFeed } from '../hooks/useVideoFeed';
import { HUB_CATEGORIES } from '../config/categories';
import '../styles/entertainment.css';

export default function EntertainmentPage({ onLogout }) {
  const [activeCat, setActiveCat] = useState(HUB_CATEGORIES[0]);
  const { posts, isFetching, feedError, fetchBatch } = useVideoFeed({
    channels: activeCat.channels,
    authenticated: true,
  });

  const doLogout = useCallback(() => {
    navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_AUTH' });
    sessionStorage.clear();
    onLogout();
  }, [onLogout]);

  useEffect(() => {
    const token       = sessionStorage.getItem('token');
    const fingerprint = sessionStorage.getItem('fingerprint');
    if (!token) { doLogout(); return; }
    navigator.serviceWorker.ready.then(reg => {
      reg.active?.postMessage({ type: 'SET_AUTH', token, fingerprint });
    });
  }, []);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') doLogout();
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [doLogout]);

  const handleCatChange = useCallback((cat) => {
    setActiveCat(cat);
  }, []);

  const handleError = useCallback(() => {}, []);

  return (
    <div className="hub-page">
      <header className="feed-header">
        <span className="feed-logo">
          THE BUNKER<span className="feed-logo-dot">·</span>
        </span>
        <button className="hub-exit" onClick={doLogout} aria-label="Exit">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ef4444" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </header>

      <nav className="cat-bar">
        <div className="cat-track">
          {HUB_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`cat-pill${activeCat.id === cat.id ? ' cat-pill--active' : ''}`}
              onClick={() => handleCatChange(cat)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </nav>

      <VideoFeed
        posts={posts}
        isFetching={isFetching}
        feedError={feedError}
        fetchBatch={fetchBatch}
        onError={handleError}
      />
    </div>
  );
}
