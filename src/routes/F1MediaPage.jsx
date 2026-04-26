import React, { useState, useRef, useEffect, useCallback } from 'react';
import VideoFeed from '../components/entertainment/VideoFeed';
import { useVideoFeed } from '../hooks/useVideoFeed';
import { F1_CATEGORIES } from '../config/categories';
import '../styles/login.css';
import '../styles/entertainment.css';

export default function F1MediaPage({ onAuth }) {
  const [activeCat, setActiveCat]       = useState(F1_CATEGORIES[0]);
  const [showGate, setShowGate]         = useState(false);
  const [showNumpad, setShowNumpad]     = useState(false);
  const [passcode, setPasscode]         = useState('');
  const [isLocked, setIsLocked]         = useState(false);
  const [shaking, setShaking]           = useState(false);
  const [tapCount, setTapCount]         = useState(0);
  const tapTimer = useRef(null);
  const inputRef = useRef(null);

  const { posts, isFetching, feedError, fetchBatch } = useVideoFeed({
    channels: activeCat.channels,
  });

  useEffect(() => {
    if (showGate && inputRef.current) inputRef.current.focus();
  }, [showGate]);

  const handleLogoTap = useCallback(() => {
    if (tapTimer.current) clearTimeout(tapTimer.current);
    const next = tapCount + 1;
    setTapCount(next);
    tapTimer.current = setTimeout(() => setTapCount(0), 1000);
    if (next >= 5) {
      setTapCount(0);
      setShowNumpad(true);
      setShowGate(false);
      setPasscode('');
    }
  }, [tapCount]);

  const authenticate = useCallback(async () => {
    if (!passcode || isLocked) return;
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      sessionStorage.setItem('timezone', timezone);
      const dims = [screen.width, screen.height].sort((a, b) => a - b);
      const rawFp = navigator.userAgent + dims[0] + 'x' + dims[1] + screen.colorDepth;
      const hash = Array.from(
        new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawFp)))
      ).map(b => b.toString(16).padStart(2, '0')).join('');

      const res = await fetch('/api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, timezone, fingerprint: hash }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('fingerprint', hash);
        navigator.serviceWorker.controller?.postMessage({
          type: 'SET_AUTH', token: data.token, fingerprint: hash,
        });
        setShowGate(false);
        setShowNumpad(false);
        setPasscode('');
        onAuth();
      } else if (res.status === 423) {
        setIsLocked(true);
        setShowGate(false);
        setShowNumpad(false);
        setPasscode('');
      } else {
        setPasscode('');
        setShaking(true);
        setTimeout(() => setShaking(false), 400);
        setShowGate(false);
        setShowNumpad(false);
      }
    } catch {
      setPasscode('');
      setShowGate(false);
      setShowNumpad(false);
    }
  }, [passcode, isLocked, onAuth]);

  const handleKeyDown = useCallback(async (e) => {
    if (e.key === 'Enter') await authenticate();
    if (e.key === 'Escape') { setShowGate(false); setPasscode(''); }
  }, [authenticate]);

  const handleBgClick = useCallback((e) => {
    const cl = e.target.className;
    if (typeof cl === 'string' && (cl.includes('video-feed') || cl.includes('feed-state') || cl.includes('f1-page'))) {
      setShowGate(true);
    }
  }, []);

  const handleCatChange = useCallback((cat) => {
    setActiveCat(cat);
  }, []);

  const handleError = useCallback(() => {}, []);

  return (
    <div className={`f1-page${shaking ? ' shaking' : ''}`} onClick={handleBgClick}>
      <header className="feed-header">
        <button
          className="feed-logo"
          onClick={e => { e.stopPropagation(); handleLogoTap(); }}
        >
          F1 MEDIA<span className="feed-logo-dot">·</span>
        </button>
        {isLocked && <span className="lockout-dot" />}
      </header>

      <nav className="cat-bar">
        <div className="cat-track">
          {F1_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`cat-pill${activeCat.id === cat.id ? ' cat-pill--active' : ''}`}
              onClick={e => { e.stopPropagation(); handleCatChange(cat); }}
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

      {showGate && !isLocked && (
        <input
          ref={inputRef}
          type="password"
          value={passcode}
          onChange={e => setPasscode(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (!passcode) setShowGate(false); }}
          className="ghost-input"
        />
      )}

      {showNumpad && !isLocked && (
        <div className="numpad-overlay" onClick={e => e.stopPropagation()}>
          <div className="numpad-display">
            {passcode ? passcode.replace(/./g, '•') : <span className="numpad-placeholder">ENTER KEY</span>}
          </div>
          <div className="numpad-grid">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button
                key={n}
                className="numpad-key"
                onClick={() => setPasscode(p => p + n)}
              >{n}</button>
            ))}
            <button
              className="numpad-key numpad-key--cancel"
              onClick={() => { setShowNumpad(false); setPasscode(''); }}
            >ESC</button>
            <button
              className="numpad-key"
              onClick={() => setPasscode(p => p + '0')}
            >0</button>
            <button
              className="numpad-key numpad-key--confirm"
              onClick={authenticate}
            >OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
