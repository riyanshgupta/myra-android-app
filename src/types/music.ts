export type AudioQuality = 'Spatial Audio' | 'Dolby Atmos' | 'Lossless' | 'High Quality';

export interface Track {
  id: string; // jiosaavn_id or local id
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  durationFormatted: string;
  coverUrl: string;
  fallbackGradient: string;
  genre: string;
  bpm: number;
  quality: AudioQuality;
  isLiked?: boolean;
  preset?: string;
  lyrics?: { time: number; text: string }[];
  encrypted_media_url?: string;
  playback_url?: string;
  playback_headers?: Record<string, string>;
  queue_id?: number;
}

export interface Playlist {
  id: string;
  db_id?: number;
  title: string;
  description: string;
  coverUrl: string;
  trackCount: number;
  durationFormatted: string;
  mood: string;
  tracks: Track[];
  isCurated?: boolean;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  category: 'Artist' | 'Genre' | 'Track' | 'Cadence' | 'Album';
  timestamp: string;
}

export type ScreenType = 'home' | 'search' | 'player' | 'playlists' | 'myra-ai';

export interface VoiceApiPayload {
  transcript: string;
  confidence?: number;
  audioBlob?: Blob | null;
  timestamp: string;
}

export type OrientationMode = 'auto' | 'portrait' | 'landscape';

// ============================================================================
// BACKEND API SCHEMAS (from OpenAPI spec)
// ============================================================================

export interface UserResp {
  id: string;
  username: string;
  created_at: string;
}

export interface AuthResp {
  access_token: string;
  token_type: string;
  user: UserResp;
}

export interface ArtistRef {
  name: string;
  id?: string | null;
}

export interface SongResponse {
  jiosaavn_id: string;
  title: string;
  subtitle?: string | null;
  cover_image?: string | null;
  language?: string | null;
  year?: number | null;
  play_count?: number | null;
  album?: string | null;
  label?: string | null;
  duration_seconds?: number | null;
  encrypted_media_url?: string | null;
  artists?: ArtistRef[];
}

export interface ArtistSearchResponse {
  artist_id: string;
  title: string;
  cover_image?: string | null;
  url?: string | null;
}

export interface AutoCompleteSongResp {
  jiosaavn_id: string;
  title: string;
  cover_image?: string | null;
  album?: string | null;
}

export interface AutoCompleteArtistResp {
  artist_id: string;
  title: string;
  cover_image?: string | null;
}

export interface TrackAutoCompleteResp {
  songs?: AutoCompleteSongResp[];
  artists?: AutoCompleteArtistResp[];
}

export interface SearchResponse {
  songs: SongResponse[];
  artists: ArtistSearchResponse[];
  page: number;
  limit: number;
}

export interface SongPageResponse {
  items: SongResponse[];
  offset: number;
  page?: number | null;
  limit: number;
  total?: number | null;
  songs?: SongResponse[] | null;
  source_track_id?: string | null;
}

export interface StreamResponse {
  playback_url: string;
  playback_headers: Record<string, string>;
}

export interface TrackResponse {
  id: number;
  jiosaavn_id: string;
  title: string;
  artist: string;
  album?: string | null;
  cover_image?: string | null;
  language?: string | null;
  year?: number | null;
  label?: string | null;
  play_count?: number;
  duration_seconds: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface FavoriteTrackResponse extends TrackResponse {
  favorite_id: number;
}

export interface QueueItemResponse {
  queue_id: number;
  position: number;
  is_current: boolean;
  track: TrackResponse;
}

export interface QueueResponse {
  items: QueueItemResponse[];
  total: number;
}

export interface PlayerStateResponse {
  current_track?: TrackResponse | null;
  is_playing: boolean;
  shuffle: boolean;
  repeat_mode: 'off' | 'one' | 'all';
  position_seconds: number;
  queue?: QueueItemResponse[] | null;
  queue_total?: number | null;
}

export interface PlaylistResponse {
  id: number;
  name: string;
  description?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  tracks?: TrackResponse[];
}

export interface PlaylistDetailResponse {
  id: number;
  name: string;
  description?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  tracks: TrackResponse[];
  offset: number;
  limit: number;
  total: number;
}

export interface ChatSession {
  chat_id: string;
  bx_umidtoken: string;
  model?: string;
  parent_id?: string | null;
}

export interface ChatRequest {
  message: string;
  metaData?: {
    current_track_id?: string | null;
    is_playing?: boolean;
    position_seconds?: number;
  } | null;
  session?: ChatSession | null;
}

export interface SongMetadata {
  jiosaavn_id: string;
  title: string;
  cover_image?: string | null;
  album?: string | null;
  language?: string | null;
  year?: number | null;
  play_count?: number | null;
  label?: string | null;
  duration_seconds?: number | null;
  encrypted_media_url?: string | null;
  artists?: Record<string, string>[] | null;
  subtitle?: string | null;
  playback_url?: string | null;
  playback_headers?: Record<string, string> | null;
}

export interface FunctionCallMetadata {
  function_name: 'pause' | 'resume' | 'next' | 'previous' | 'seek_forward' | 'seek_backward' | 'seek_to';
  arguments?: Record<string, any>;
}

export interface ChatResponse {
  message: string;
  message_type: 'text' | 'song' | 'function_call';
  metadata?: SongMetadata | FunctionCallMetadata | null;
  session?: ChatSession | null;
}
