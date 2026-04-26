let _promise = null;

export function loadYouTubeAPI() {
  if (_promise) return _promise;

  if (window.YT && window.YT.Player) {
    _promise = Promise.resolve();
    return _promise;
  }

  _promise = new Promise((resolve) => {
    const existing = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (existing) existing();
      resolve();
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    document.head.appendChild(tag);
  });

  return _promise;
}
