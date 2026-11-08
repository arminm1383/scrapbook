import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { playlist, type MusicTrack } from '../data/playlist';
import vinyl from '../assets/music/vinyl.svg';
import playIcon from '../assets/music/play.svg';

function formatTime(seconds: number) {
  const value = Math.max(0, Math.floor(seconds));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}

/** Radio-style repeated text; animate only when its measured width overflows. */
function Marquee({ text, className }: { text: string; className: string }) {
  const viewport = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const [distance, setDistance] = useState(0);
  useEffect(() => {
    const measure = () => {
      if (!viewport.current || !label.current) return;
      setDistance(label.current.scrollWidth > viewport.current.clientWidth + 1 ? label.current.scrollWidth + 28 : 0);
    };
    const observer = new ResizeObserver(measure);
    if (viewport.current) observer.observe(viewport.current);
    if (label.current) observer.observe(label.current);
    measure();
    return () => observer.disconnect();
  }, [text]);
  return <div ref={viewport} className={`music-marquee ${className}`} title={text}
    style={{ '--marquee-distance': `${distance}px`, '--marquee-duration': `${Math.max(10, distance / 24)}s` } as CSSProperties}>
    <span key={text} className={distance ? 'music-marquee-track is-overflowing' : 'music-marquee-track'}>
      <span ref={label}>{text}</span>
      {distance > 0 && <span aria-hidden="true">{text}</span>}
    </span>
  </div>;
}

export function MusicPlayer({ tracks = playlist }: { tracks?: readonly MusicTrack[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const reveal = useRef<HTMLButtonElement>(null);
  const playButton = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(0);
  const [error, setError] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const track = tracks[index % Math.max(1, tracks.length)];
  const duration = mediaDuration || track?.duration || 1;

  useEffect(() => {
    const landscape = matchMedia('(max-height: 500px) and (min-width: 480px) and (max-width: 1024px)');
    const update = () => setCollapsed(landscape.matches);
    update();
    landscape.addEventListener('change', update);
    return () => landscape.removeEventListener('change', update);
  }, []);

  function hidePlayer() {
    setCollapsed(true);
    requestAnimationFrame(() => reveal.current?.focus({ preventScroll: true }));
  }

  function seek(value: number) {
    const next = Math.max(0, Math.min(duration, value));
    setElapsed(next);
    if (track?.src && audio.current) audio.current.currentTime = next;
  }

  function changeTrack(direction: number) {
    if (!tracks.length) return;
    setIndex(current => (current + direction + tracks.length) % tracks.length);
    setElapsed(0);
    setMediaDuration(0);
    setError(false);
    // Also restart a one-track playlist when its only track ends.
    if (tracks.length === 1 && audio.current) {
      audio.current.currentTime = 0;
      if (playing && track?.src) void audio.current.play().catch(() => { setPlaying(false); setError(true); });
    }
  }

  useEffect(() => {
    const media = audio.current;
    if (!track?.src || !media) return;
    let cancelled = false;
    if (playing) {
      void media.play().catch(() => {
        if (!cancelled) { setPlaying(false); setError(true); }
      });
    } else media.pause();
    return () => { cancelled = true; media.pause(); };
  }, [playing, track?.id, track?.src]);

  useEffect(() => {
    if (!playing || track?.src) return;
    let previous = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const delta = (now - previous) / 1000;
      previous = now;
      setElapsed(value => Math.min(duration, value + delta));
    }, 200);
    return () => clearInterval(timer);
  }, [playing, track?.id, track?.src, duration]);

  useEffect(() => {
    if (playing && !track?.src && elapsed >= duration) changeTrack(1);
  }, [elapsed, duration, playing, track?.src]);

  if (!track) return null;
  return (
    <>
    <section className="music-player" aria-label="Music player" data-node-id="25:3060" data-track={track.id} data-collapsed={collapsed}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0 || (event.target as Element).closest('button, input')) return;
        if (!matchMedia('(max-width: 767px), (hover: none) and (pointer: coarse) and (max-width: 1024px)').matches) return;
        swipe.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerUp={event => {
        const start = swipe.current;
        swipe.current = null;
        if (!start || start.id !== event.pointerId) return;
        const dx = event.clientX - start.x, dy = event.clientY - start.y;
        if (dx > 48 && dx > Math.abs(dy) * 1.25) hidePlayer();
      }}
      onPointerCancel={() => { swipe.current = null; }}
      onKeyDown={event => {
        if (event.key === 'Escape' && matchMedia('(max-width: 767px), (hover: none) and (pointer: coarse) and (max-width: 1024px)').matches) hidePlayer();
      }}>
      <button type="button" className="music-dismiss" aria-label="Hide music player" onClick={hidePlayer}>×</button>
      <audio ref={audio} src={track.src} preload="metadata"
        onTimeUpdate={event => setElapsed(event.currentTarget.currentTime)}
        onDurationChange={event => {
          const value = event.currentTarget.duration;
          if (Number.isFinite(value) && value > 0) setMediaDuration(value);
        }}
        onEnded={() => changeTrack(1)}
        onError={() => { setPlaying(false); setError(true); }} />
      <div className="music-player-main">
        <div className="music-controls">
          <button type="button" className="music-skip music-previous" aria-label="Previous track" disabled={tracks.length < 2 && elapsed === 0}
            onClick={() => elapsed > 3 ? seek(0) : changeTrack(-1)}><span className="music-skip-glyph music-skip-previous" aria-hidden="true" /></button>
          <button ref={playButton} type="button" className="music-play" aria-label={playing ? 'Pause music' : 'Play music'} aria-pressed={playing}
            onClick={() => { setError(false); if (!playing && elapsed >= duration) seek(0); setPlaying(value => !value); }}>
            {playing ? <span className="music-pause-glyph" aria-hidden="true" /> : <span className="music-play-glyph" aria-hidden="true"><img src={playIcon} alt="" /></span>}
          </button>
          <button type="button" className="music-skip music-next" aria-label="Next track" disabled={tracks.length < 2}
            onClick={() => changeTrack(1)}><span className="music-skip-glyph" aria-hidden="true" /></button>
        </div>
        <div className="music-details" data-node-id="25:3066">
          <span className="music-status" data-node-id="25:3062">{error ? 'Audio unavailable' : track.src ? 'now playing' : 'music preview'}</span>
          <div key={track.id} className="music-track-description" aria-live="polite" aria-atomic="true">
            <Marquee className="music-title" text={track.title} />
            <Marquee className="music-artist" text={track.artist} />
          </div>
        </div>
        <div className="music-artwork" style={{ '--album-color': track.coverColor } as CSSProperties}>
          <span data-node-id="25:3070" className="music-vinyl" aria-hidden="true"><img src={vinyl} alt="" /><span /></span>
          <div data-node-id="25:3073" className="music-album" aria-label={`${track.album ?? track.title} album cover`} role="img">
            {track.cover ? <img src={track.cover} alt="" /> : <><span>scrapbook</span><strong>{String(index % tracks.length + 1).padStart(2, '0')}</strong></>}
          </div>
        </div>
      </div>
      <div className="music-timeline">
        <span aria-hidden="true">{formatTime(elapsed)}</span>
        <input type="range" aria-label="Track progress" aria-valuetext={`${formatTime(elapsed)} of ${formatTime(duration)}`}
          min={0} max={duration} step={0.1} value={Math.min(elapsed, duration)} onChange={event => seek(Number(event.target.value))}
          style={{ '--track-progress': `${Math.min(100, elapsed / duration * 100)}%` } as CSSProperties} />
        <span aria-hidden="true">{formatTime(duration)}</span>
      </div>
    </section>
    <button ref={reveal} type="button" className="music-reveal" data-collapsed={collapsed}
      aria-label="Show music player" onClick={() => {
        setCollapsed(false);
        requestAnimationFrame(() => playButton.current?.focus({ preventScroll: true }));
      }}><span aria-hidden="true">♫</span></button>
    </>
  );
}
