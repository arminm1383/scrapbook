import audio0 from '../assets/music/tracks/veridis-quo.mp3';
import cover0 from '../assets/music/covers/discovery.jpg';
import audio1 from '../assets/music/tracks/time-million.mp3';
import cover1 from '../assets/music/covers/socialo-blanco.jpg';
import audio2 from '../assets/music/tracks/gold-teeth.mp3';
import cover2 from '../assets/music/covers/angels-pulse.jpg';
import audio3 from '../assets/music/tracks/metaphysical.mp3';
import cover3 from '../assets/music/covers/flow-river-of-my-soul.jpg';
import audio4 from '../assets/music/tracks/hardly-ever-smile.mp3';
import cover4 from '../assets/music/covers/melting-moment.jpg';
import audio5 from '../assets/music/tracks/times-a-wastin.mp3';
import cover5 from '../assets/music/covers/mamas-gun.jpg';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  /** Local MP3 URL, imported from src/assets or resolved against import.meta.env.BASE_URL. */
  src?: string;
  cover?: string;
  coverColor: string;
}

// Titles, artist credits, and covers verified against Spotify. Audio stays local.
export const playlist: readonly MusicTrack[] = [
  { id: "veridis-quo", title: "Veridis Quo", artist: "Daft Punk", album: "Discovery", duration: 345.129813, src: audio0, cover: cover0, coverColor: "#535353" },
  { id: "time-million", title: "Time Million", artist: "Feater, Vilja Larjosto", album: "Socialo Blanco", duration: 289.285813, src: audio1, cover: cover1, coverColor: "#483040" },
  { id: "gold-teeth", title: "Gold Teeth", artist: "Blood Orange, Project Pat, Gangsta Boo, Tinashe", album: "Angel's Pulse", duration: 181.649705, src: audio2, cover: cover2, coverColor: "#9c003c" },
  { id: "metaphysical", title: "Metaphysical", artist: "Single Gun Theory", album: "Flow, River Of My Soul", duration: 221.466667, src: audio3, cover: cover3, coverColor: "#103838" },
  { id: "hardly-ever-smile", title: "HARDLY EVER SMILE(without you)", artist: "POiSON GiRL FRiEND", album: "Melting Moment", duration: 415.079909, src: audio4, cover: cover4, coverColor: "#185050" },
  { id: "times-a-wastin", title: "Time's A Wastin", artist: "Erykah Badu", album: "Mama's Gun", duration: 400.869297, src: audio5, cover: cover5, coverColor: "#843e00" },
];
