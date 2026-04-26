import { useRef, useEffect, useState, useCallback } from 'react';
import { loadYouTubeAPI } from '../../utils/youtube';
import { YT_PLAYER_VARS } from '../../config/youtube';

export default function VideoCard({ post, isActive, isMuted, onError, onUnmute }) {
  const ytRef        = useRef(null);
  const containerRef = useRef(null);
  const [ytReady, setYtReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;

    if (isActive) {
      loadYouTubeAPI().then(() => {
        if (destroyed || !containerRef.current) return;
        const player = new window.YT.Player(containerRef.current, {
          videoId: post.videoId,
          playerVars: { ...YT_PLAYER_VARS, playlist: post.videoId },
          events: {
            onReady: (e) => {
              if (!destroyed) { e.target.playVideo(); setYtReady(true); }
            },
            onStateChange: (e) => {
              if (e.data === window.YT.PlayerState.ENDED) {
                e.target.seekTo(0);
                e.target.playVideo();
              }
            },
            onError: () => onError && onError(post.id),
          },
        });
        ytRef.current = player;
      });
    }

    return () => {
      destroyed = true;
      setYtReady(false);
      if (ytRef.current) {
        try { ytRef.current.destroy(); } catch {}
        ytRef.current = null;
      }
    };
  }, [isActive, post.videoId]);

  useEffect(() => {
    if (!ytRef.current) return;
    try {
      if (isMuted) ytRef.current.mute();
      else ytRef.current.unMute();
    } catch {}
  }, [isMuted, ytReady]);

  return (
    <div
      className={`video-card${isActive ? ' is-active' : ''}`}
      onClick={isMuted && isActive ? onUnmute : undefined}
    >
      <div className="vc-yt-wrapper">
        <div ref={containerRef} className="vc-yt-slot" />
        <div className="vc-yt-blocker" />
      </div>

      <div className="vc-overlay">
        <p className="vc-title">{post.title}</p>
        <div className="vc-meta">
          <div className="vc-channel">
            <svg className="vc-yt-icon" viewBox="0 0 24 24" width="11" height="11" fill="#ff0000">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8z"/>
              <polygon fill="#fff" points="9.75,15.02 15.5,12 9.75,8.98"/>
            </svg>
            <span className="vc-channel-name">{post.channelName}</span>
          </div>
          {isMuted && isActive && (
            <button className="vc-unmute" onClick={onUnmute} aria-label="Unmute">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
              Tap to unmute
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
