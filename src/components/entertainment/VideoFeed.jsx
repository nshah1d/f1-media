import { useState, useEffect, useRef, useCallback } from 'react';
import VideoCard from './VideoCard';

export default function VideoFeed({ posts, isFetching, feedError, fetchBatch, onError }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const itemRefs = useRef([]);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const handleUnmute = useCallback(() => setIsMuted(false), []);

  useEffect(() => { setIsMuted(true); }, [activeIndex]);

  const handleCardError = useCallback((postId) => {
    onError && onError(postId);
  }, [onError]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        });
      },
      { threshold: 0.75, rootMargin: '0px' }
    );

    itemRefs.current.forEach(el => {
      if (el) observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [posts.length]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetching) fetchBatch();
      },
      { threshold: 0.1 }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [isFetching, fetchBatch]);

  useEffect(() => {
    if (posts.length - activeIndex < 6 && !isFetching) fetchBatch();
  }, [activeIndex, posts.length, isFetching, fetchBatch]);

  if (feedError) {
    return (
      <div className="feed-state">
        <div className="feed-state__icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="1" y1="1" x2="23" y2="23"/>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <line x1="12" y1="20" x2="12.01" y2="20"/>
          </svg>
        </div>
        <p>No connection</p>
      </div>
    );
  }

  if (posts.length === 0 && isFetching) {
    return (
      <div className="feed-state">
        <div className="feed-skeleton">
          {[0,1,2].map(i => (
            <div key={i} className="feed-skeleton__card" style={{ opacity: 1 - i * 0.25 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="video-feed">
      {posts.map((post, idx) => (
        <div
          key={post.id}
          data-index={idx}
          ref={el => { itemRefs.current[idx] = el; }}
          className={`vf-item${idx === activeIndex ? ' vf-item--active' : ''}`}
        >
          <VideoCard
            post={post}
            isActive={idx === activeIndex}
            isMuted={isMuted}
            onError={handleCardError}
            onUnmute={handleUnmute}
          />
        </div>
      ))}
      <div ref={sentinelRef} style={{ height: 1, flexShrink: 0 }} />
    </div>
  );
}
