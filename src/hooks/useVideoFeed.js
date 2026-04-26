import { useState, useEffect, useRef, useCallback } from 'react';

function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickChannel(channels, recentChannels, exhausted) {
  const cooldownN = Math.min(4, Math.max(1, Math.floor(channels.length / 4)));
  const blocked   = new Set(recentChannels.slice(-cooldownN));
  const available = channels.filter(c => !blocked.has(c) && !exhausted.has(c));
  const pool      = available.length > 0 ? available : channels.filter(c => !exhausted.has(c));
  if (pool.length === 0) return channels[Math.floor(Math.random() * channels.length)];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function useVideoFeed({ channels = [], authenticated = false }) {
  const [posts, setPosts]           = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [feedError, setFeedError]   = useState(false);

  const r = useRef({
    posts: [],
    fetching: false,
    videoCache: {},
    videoOffsets: {},
    recentChannels: [],
    exhaustedChannels: new Set(),
    channels: [],
  });

  r.current.channels = channels;

  const commit = useCallback((next) => {
    r.current.posts = next;
    setPosts([...next]);
  }, []);

  const fetchOneChannel = useCallback(async (ch) => {
    const primaryUrl = authenticated
      ? `/api/secure_videos.php?channel=${encodeURIComponent(ch)}`
      : `/api/youtube_videos.php?channel=${encodeURIComponent(ch)}`;

    const primary = await fetch(primaryUrl)
      .then(res => {
        if (res.status === 401) { setFeedError(true); return null; }
        return res.ok ? res.json() : null;
      })
      .catch(() => null);

    if (primary?.videos?.length > 0) return primary.videos;

    const feedUrl = authenticated
      ? `/api/secure_feed.php?channel=${encodeURIComponent(ch)}`
      : `/api/youtube_feed.php?channel=${encodeURIComponent(ch)}`;

    return fetch(feedUrl)
      .then(res => res.ok ? res.json() : { videos: [] })
      .then(data => data.videos || [])
      .catch(() => []);
  }, [authenticated]);

  const getChannelVideos = useCallback(async (ch) => {
    const s = r.current;
    if (!s.videoCache[ch]) {
      const videos = await fetchOneChannel(ch);
      const seed   = parseInt(sessionStorage.getItem('session_seed') || '0', 10);
      const offset = seed % Math.max(videos.length, 1);
      s.videoCache[ch]   = fisherYates([...videos.slice(offset), ...videos.slice(0, offset)]);
      s.videoOffsets[ch] = 0;
    }
    return s.videoCache[ch];
  }, [fetchOneChannel]);

  const popVideo = useCallback(async (existingIds) => {
    const s = r.current;
    if (!s.channels.length) return null;

    const ch     = pickChannel(s.channels, s.recentChannels, s.exhaustedChannels);
    const videos = await getChannelVideos(ch);
    const idx    = s.videoOffsets[ch] || 0;

    let found   = null;
    let scanned = 0;
    while (scanned < videos.length) {
      const video = videos[(idx + scanned) % videos.length];
      if (video && !existingIds.has(video.id)) { found = video; break; }
      scanned++;
    }

    if (!found) {
      s.exhaustedChannels.add(ch);
      return null;
    }

    s.videoOffsets[ch]  = (idx + scanned + 1) % videos.length;
    s.recentChannels    = [...s.recentChannels.slice(-16), ch];
    return found;
  }, [getChannelVideos]);

  const fetchBatch = useCallback(async () => {
    const s = r.current;
    if (s.fetching) return;
    s.fetching = true;
    setIsFetching(true);

    const existingIds = new Set(s.posts.map(p => p.id));
    const toAdd       = [];

    for (let i = 0; i < 8; i++) {
      const video = await popVideo(existingIds);
      if (!video) break;
      existingIds.add(video.id);
      toAdd.push(video);
    }

    if (toAdd.length > 0) {
      const next = [...s.posts, ...toAdd];
      commit(next.length > 80 ? next.slice(20) : next);
    } else if (s.posts.length === 0) {
      setFeedError(true);
    }

    s.fetching = false;
    setIsFetching(false);
  }, [commit, popVideo]);

  const channelsKey = channels.join(',');

  useEffect(() => {
    const s = r.current;
    s.posts              = [];
    s.fetching           = false;
    s.videoCache         = {};
    s.videoOffsets       = {};
    s.recentChannels     = [];
    s.exhaustedChannels  = new Set();
    setPosts([]);
    setFeedError(false);
    setIsFetching(false);
    fetchBatch();
  }, [channelsKey]);

  return { posts, isFetching, feedError, fetchBatch };
}
