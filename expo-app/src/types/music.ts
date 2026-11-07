export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  durationFormatted: string;
  coverUrl: string;
  fallbackGradient?: string;
  genre?: string;
  bpm?: number;
  quality?: string;
  isLiked?: boolean;
  encrypted_media_url?: string;
  queue_id?: number;
  lyrics?: { time: number; text: string }[];
}

export interface Playlist {
  id: string;
  db_id?: number;
  title: string;
  description: string;
  coverUrl: string;
  trackCount: number;
  durationFormatted: string;
  mood?: string;
  tracks: Track[];
}

export interface UserResp {
  id: string;
  username: string;
  created_at?: string;
}

export interface AuthResp {
  access_token: string;
  token_type: string;
  user: UserResp;
}

export interface SongResponse {
  jiosaavn_id: string;
  title: string;
  subtitle?: string;
  album?: string;
  cover_image?: string;
  duration_seconds?: number;
  language?: string;
  encrypted_media_url?: string;
  artists?: { id: string; name: string; role: string }[];
}

export interface TrackResponse {
  jiosaavn_id: string;
  title: string;
  artist: string;
  album?: string;
  cover_image?: string;
  duration_seconds?: number;
  language?: string;
}

export interface FavoriteTrackResponse {
  id: number;
  user_id: string;
  jiosaavn_id: string;
  created_at: string;
  track: TrackResponse;
}

export interface QueueItemResponse {
  queue_id: number;
  user_id: string;
  jiosaavn_id: string;
  position: number;
  added_at: string;
  track: TrackResponse;
}

export interface PlayerStateResponse {
  user_id: string;
  is_playing: boolean;
  current_jiosaavn_id?: string;
  position_ms: number;
  updated_at: string;
  track?: TrackResponse;
}

export interface SearchResponse {
  songs: SongResponse[];
}

export interface StreamResponse {
  jiosaavn_id: string;
  playback_url: string;
  quality: string;
  format: string;
}

export interface PlaylistResponse {
  id: number;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  tracks?: TrackResponse[];
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  responseSpeech?: string;
  action?: string;
  suggestedTrackId?: string;
}
