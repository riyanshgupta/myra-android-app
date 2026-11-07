import {
  AuthResp,
  UserResp,
  Track,
  Playlist,
  SongResponse,
  TrackResponse,
  FavoriteTrackResponse,
  QueueItemResponse,
  PlayerStateResponse,
  SearchResponse,
  SongPageResponse,
  TrackAutoCompleteResp,
  StreamResponse,
  PlaylistResponse,
  PlaylistDetailResponse,
  ChatResponse,
  ChatSession,
  VoiceApiPayload,
} from '../types/music';

export type { UserResp };

export interface ApiResponse {
  success: boolean;
  message?: string;
  responseSpeech?: string;
  action?: string;
  suggestedTrackId?: string;
  chatResponse?: ChatResponse;
}

// ============================================================================
// BASE CONFIGURATION & STATE
// ============================================================================

const DEFAULT_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'https://w78gddz2-8000.inc1.devtunnels.ms';

let apiBaseUrl: string = typeof window !== 'undefined'
  ? localStorage.getItem('myra_api_base_url') || DEFAULT_BASE_URL
  : DEFAULT_BASE_URL;

let authToken: string | null = typeof window !== 'undefined'
  ? localStorage.getItem('myra_access_token')
  : null;

let currentUser: UserResp | null = typeof window !== 'undefined' && localStorage.getItem('myra_user')
  ? JSON.parse(localStorage.getItem('myra_user')!)
  : null;

export function setApiBaseUrl(url: string) {
  apiBaseUrl = url.replace(/\/+$/, '');
  if (typeof window !== 'undefined') {
    localStorage.setItem('myra_api_base_url', apiBaseUrl);
  }
}

export function getApiBaseUrl(): string {
  return apiBaseUrl;
}

export function setAuthToken(token: string | null, user: UserResp | null = null) {
  authToken = token;
  currentUser = user;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('myra_access_token', token);
    } else {
      localStorage.removeItem('myra_access_token');
    }
    if (user) {
      localStorage.setItem('myra_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('myra_user');
    }
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

export const getStoredToken = getAuthToken;

export function removeStoredToken() {
  setAuthToken(null, null);
}

export function getCurrentUser(): UserResp | null {
  return currentUser;
}

export const getCurrentUserApi = getCurrentUser;

// ============================================================================
// MAPPER UTILITIES
// ============================================================================

export function mapSongToTrack(song: SongResponse): Track {
  const artistName = song.artists && song.artists.length > 0
    ? song.artists.map((a) => a.name).join(', ')
    : song.subtitle || 'Unknown Artist';
  const durSec = song.duration_seconds || 180;
  const m = Math.floor(durSec / 60);
  const s = Math.floor(durSec % 60);
  const durationFormatted = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;

  return {
    id: song.jiosaavn_id,
    title: song.title || 'Untitled Track',
    artist: artistName,
    album: song.album || 'Single',
    duration: durSec,
    durationFormatted,
    coverUrl: song.cover_image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop',
    fallbackGradient: 'from-purple-900 via-indigo-950 to-cyan-900',
    genre: song.language ? `${song.language} Music` : 'Popular',
    bpm: 120,
    quality: 'Spatial Audio',
    isLiked: false,
    encrypted_media_url: song.encrypted_media_url || undefined,
  };
}

export function mapTrackResponseToTrack(tr: TrackResponse): Track {
  const durSec = tr.duration_seconds || 180;
  const m = Math.floor(durSec / 60);
  const s = Math.floor(durSec % 60);
  const durationFormatted = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;

  return {
    id: tr.jiosaavn_id,
    title: tr.title || 'Untitled Track',
    artist: tr.artist || 'Unknown Artist',
    album: tr.album || 'Single',
    duration: durSec,
    durationFormatted,
    coverUrl: tr.cover_image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop',
    fallbackGradient: 'from-purple-900 via-indigo-950 to-cyan-900',
    genre: tr.language ? `${tr.language} Music` : 'Popular',
    bpm: 120,
    quality: 'Spatial Audio',
    isLiked: false,
  };
}

export function mapFavoriteTrackToTrack(ftr: FavoriteTrackResponse): Track {
  const t = mapTrackResponseToTrack(ftr);
  t.isLiked = true;
  return t;
}

export function mapQueueItemToTrack(item: QueueItemResponse): Track {
  const t = mapTrackResponseToTrack(item.track);
  t.queue_id = item.queue_id;
  return t;
}

export function mapPlaylistResponseToPlaylist(pl: PlaylistResponse): Playlist {
  const tracks = (pl.tracks || []).map(mapTrackResponseToTrack);
  return {
    id: `pl-api-${pl.id}`,
    db_id: pl.id,
    title: pl.name,
    description: pl.description || 'User Playlist',
    coverUrl: tracks[0]?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop',
    trackCount: tracks.length,
    durationFormatted: `${tracks.length} tracks`,
    mood: 'My Playlist',
    tracks,
  };
}

// ============================================================================
// CORE HTTP REQUEST WRAPPER
// ============================================================================

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 20000
): Promise<T> {
  const url = `${apiBaseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const headers: Record<string, string> = {
    'X-Tunnel-Skip-AntiPhishing-Page': 'true',
    'ngrok-skip-browser-warning': 'true',
    'Bypass-Tunnel-Reminder': 'true',
    ...(options.headers as Record<string, string>),
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`Backend request timed out after ${Math.round(timeoutMs / 1000)}s.`);
    }
    throw new Error(`Could not connect to backend server at ${apiBaseUrl}`);
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 204) {
    return {} as T;
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        if (typeof errJson.detail === 'string') {
          errorDetail = errJson.detail;
        } else if (Array.isArray(errJson.detail)) {
          errorDetail = errJson.detail.map((e: any) => e.msg || e.detail || JSON.stringify(e)).join(', ');
        } else {
          errorDetail = JSON.stringify(errJson.detail);
        }
      } else if (errJson.message) {
        errorDetail = typeof errJson.message === 'string' ? errJson.message : JSON.stringify(errJson.message);
      } else if (errJson.error) {
        errorDetail = typeof errJson.error === 'string' ? errJson.error : JSON.stringify(errJson.error);
      }
    } catch (_) {}

    if (!errorDetail) {
      if (response.status === 401) {
        errorDetail = 'Unauthorized (401). Token expired or invalid.';
      } else {
        errorDetail = `API Error ${response.status}: ${response.statusText}`;
      }
    }

    if (response.status === 401 && !endpoint.includes('/users/login') && !endpoint.includes('/users/register')) {
      setAuthToken(null, null);
    }

    throw new Error(errorDetail);
  }

  return response.json();
}

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

export async function registerApi(username: string, pin: string): Promise<AuthResp> {
  const res = await request<AuthResp>('/users/register', {
    method: 'POST',
    body: JSON.stringify({ username, pin }),
  });
  setAuthToken(res.access_token, res.user);
  return res;
}

export async function loginApi(username: string, pin: string): Promise<AuthResp> {
  const res = await request<AuthResp>('/users/login', {
    method: 'POST',
    body: JSON.stringify({ username, pin }),
  });
  setAuthToken(res.access_token, res.user);
  return res;
}

export async function getMeApi(): Promise<UserResp> {
  const res = await request<UserResp>('/users/me', { method: 'GET' });
  currentUser = res;
  if (typeof window !== 'undefined') {
    localStorage.setItem('myra_user', JSON.stringify(res));
  }
  return res;
}

export async function changePinApi(current_pin: string, new_pin: string): Promise<void> {
  await request<void>('/users/me/pin', {
    method: 'PATCH',
    body: JSON.stringify({ current_pin, new_pin }),
  });
}

// ============================================================================
// MUSIC DISCOVERY ENDPOINTS
// ============================================================================

export async function autocompleteApi(q: string): Promise<string[]> {
  try {
    const raw = await request<TrackAutoCompleteResp>(`/search/autocomplete?q=${encodeURIComponent(q)}`, {
      method: 'GET',
    });
    const suggestions: string[] = [];
    if (raw.songs) {
      raw.songs.forEach((s) => suggestions.push(s.title));
    }
    if (raw.artists) {
      raw.artists.forEach((a) => suggestions.push(a.title));
    }
    return suggestions;
  } catch (_) {
    return [];
  }
}

export async function searchApi(
  q: string,
  page: number = 1,
  limit: number = 10
): Promise<Track[]> {
  try {
    const raw = await request<SearchResponse>(
      `/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`,
      { method: 'GET' }
    );
    if (raw.songs && Array.isArray(raw.songs)) {
      return raw.songs.map(mapSongToTrack);
    }
    return [];
  } catch (_) {
    return [];
  }
}

export async function getTrendingApi(
  offset: number = 0,
  limit: number = 20
): Promise<Track[]> {
  try {
    const raw = await request<SongPageResponse>(`/music/trending?offset=${offset}&limit=${limit}`, {
      method: 'GET',
    });
    const songs = raw.items || raw.songs || [];
    return songs.map(mapSongToTrack);
  } catch (_) {
    return [];
  }
}

export async function getRecommendedApi(
  track_id: string,
  limit: number = 20
): Promise<Track[]> {
  try {
    const raw = await request<SongPageResponse>(
      `/music/recommended?track_id=${encodeURIComponent(track_id)}&limit=${limit}`,
      { method: 'GET' }
    );
    const songs = raw.items || raw.songs || [];
    return songs.map(mapSongToTrack);
  } catch (_) {
    return [];
  }
}

export async function getTrackDetailsApi(track_id: string): Promise<SongResponse> {
  return request<SongResponse>(`/track/${encodeURIComponent(track_id)}`, {
    method: 'GET',
  });
}

export async function getTrackStreamApi(
  encrypted_media_url: string
): Promise<StreamResponse | null> {
  try {
    const encoded = encodeURIComponent(encrypted_media_url);
    return await request<StreamResponse>(`/track/stream/${encoded}`, {
      method: 'GET',
    });
  } catch (_) {
    return null;
  }
}

// ============================================================================
// PLAYBACK & PLAYER STATE ENDPOINTS
// ============================================================================

export async function updatePlayerStateApi(payload: {
  action?: string;
  jiosaavn_id?: string | null;
  track_id?: string | null;
  is_playing?: boolean | null;
  shuffle?: boolean | null;
  repeat_mode?: 'off' | 'one' | 'all' | null;
  position_seconds?: number | null;
  position_ms?: number | null;
}): Promise<PlayerStateResponse | null> {
  try {
    const bodyPayload = {
      jiosaavn_id: payload.jiosaavn_id || payload.track_id,
      is_playing: payload.is_playing ?? (payload.action === 'play' ? true : payload.action === 'pause' ? false : undefined),
      shuffle: payload.shuffle,
      repeat_mode: payload.repeat_mode,
      position_seconds: payload.position_seconds ?? (typeof payload.position_ms === 'number' ? Math.floor(payload.position_ms / 1000) : undefined),
    };

    return await request<PlayerStateResponse>('/player/state', {
      method: 'PATCH',
      body: JSON.stringify(bodyPayload),
    });
  } catch (_) {
    return null;
  }
}

// ============================================================================
// LIBRARY & FAVORITES ENDPOINTS
// ============================================================================

export async function addFavoriteApi(jiosaavn_id: string): Promise<boolean> {
  try {
    await request<{ favorite: boolean; track: TrackResponse }>(`/library/favorites/${encodeURIComponent(jiosaavn_id)}`, {
      method: 'PUT',
    });
    return true;
  } catch (_) {
    return false;
  }
}

export const addFavoriteTrackApi = addFavoriteApi;

export async function removeFavoriteApi(jiosaavn_id: string): Promise<boolean> {
  try {
    await request<void>(`/library/favorites/${encodeURIComponent(jiosaavn_id)}`, {
      method: 'DELETE',
    });
    return true;
  } catch (_) {
    return false;
  }
}

export const removeFavoriteTrackApi = removeFavoriteApi;

export async function getFavoritesApi(
  offset: number = 0,
  limit: number = 20
): Promise<Track[]> {
  try {
    const raw = await request<{ items: FavoriteTrackResponse[]; offset: number; limit: number; total: number }>(
      `/library/favorites?offset=${offset}&limit=${limit}`,
      { method: 'GET' }
    );
    if (raw && Array.isArray(raw.items)) {
      return raw.items.map(mapFavoriteTrackToTrack);
    }
    return [];
  } catch (_) {
    return [];
  }
}

// ============================================================================
// PLAYLIST ENDPOINTS
// ============================================================================

export async function createPlaylistApi(
  nameOrPayload: string | { title?: string; name?: string; description?: string; tracks?: string[] },
  description?: string
): Promise<Playlist | null> {
  try {
    const nameStr = typeof nameOrPayload === 'string' ? nameOrPayload : (nameOrPayload.title || nameOrPayload.name || 'New Playlist');
    const descStr = typeof nameOrPayload === 'string' ? description : nameOrPayload.description;

    const raw = await request<PlaylistResponse>('/playlists', {
      method: 'POST',
      body: JSON.stringify({ name: nameStr, description: descStr }),
    });

    return mapPlaylistResponseToPlaylist(raw);
  } catch (_) {
    return null;
  }
}

export async function getPlaylistsApi(
  offset: number = 0,
  limit: number = 20
): Promise<Playlist[]> {
  try {
    const raw = await request<{ items: PlaylistResponse[]; offset: number; limit: number; total: number }>(
      `/playlists?offset=${offset}&limit=${limit}`,
      { method: 'GET' }
    );
    if (raw && Array.isArray(raw.items)) {
      return raw.items.map(mapPlaylistResponseToPlaylist);
    }
    return [];
  } catch (_) {
    return [];
  }
}

export async function getPlaylistDetailsApi(
  playlist_id: number | string,
  offset: number = 0,
  limit: number = 20
): Promise<PlaylistDetailResponse | null> {
  try {
    return await request<PlaylistDetailResponse>(
      `/playlists/${playlist_id}?offset=${offset}&limit=${limit}`,
      { method: 'GET' }
    );
  } catch (_) {
    return null;
  }
}

export async function addPlaylistTrackApi(
  playlist_id: string | number,
  jiosaavn_id: string
): Promise<boolean> {
  try {
    await request<{ playlist_id: number; track: TrackResponse; position: number }>(
      `/playlists/${playlist_id}/tracks`,
      {
        method: 'POST',
        body: JSON.stringify({ jiosaavn_id }),
      }
    );
    return true;
  } catch (_) {
    return false;
  }
}

export async function removePlaylistTrackApi(
  playlist_id: string | number,
  track_record_id: string | number
): Promise<boolean> {
  try {
    await request<void>(`/playlists/${playlist_id}/tracks/${track_record_id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (_) {
    return false;
  }
}

// ============================================================================
// AI ASSISTANT ENDPOINT
// ============================================================================

export async function sendAssistantChatApi(
  messageOrParams: string | { message: string; session?: any },
  metaData?: { current_track_id?: string | null; is_playing?: boolean; position_seconds?: number } | null,
  session?: ChatSession | null
): Promise<any> {
  try {
    const msg = typeof messageOrParams === 'string' ? messageOrParams : messageOrParams.message;
    const sess = typeof messageOrParams === 'string' ? session : messageOrParams.session;

    const res = await request<ChatResponse>('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message: msg, metaData, session: sess }),
    });

    let action: string | undefined;
    let suggestedTrackId: string | undefined;
    let songObj: Track | undefined;
    let fnCall: any = undefined;

    if (res.message_type === 'song' && res.metadata) {
      const songMeta = res.metadata as any;
      if (songMeta.jiosaavn_id) {
        suggestedTrackId = songMeta.jiosaavn_id;
        songObj = mapSongToTrack(songMeta);
        action = 'play_track';
      }
    } else if (res.message_type === 'function_call' && res.metadata) {
      fnCall = res.metadata;
      const fnName = fnCall.function_name || fnCall.name;
      if (fnName === 'pause') action = 'pause';
      else if (fnName === 'next') action = 'next';
      else if (fnName === 'previous') action = 'previous';
      else if (fnName === 'resume') action = 'play';
    }

    return {
      message: res.message,
      content: res.message,
      responseSpeech: res.message,
      message_type: res.message_type,
      metadata: res.metadata,
      function_call: fnCall,
      song: songObj,
      suggestedTrackId,
      action,
      session: res.session,
    };
  } catch (err: any) {
    console.warn('[Myra API] Assistant chat exception:', err.message);
    return null;
  }
}

export async function sendVoiceQueryApi(payload: VoiceApiPayload): Promise<ApiResponse> {
  const assistantResult = await sendAssistantChatApi(payload.transcript);
  if (assistantResult) {
    return {
      success: true,
      message: assistantResult.content,
      responseSpeech: assistantResult.content,
      action: assistantResult.action,
      suggestedTrackId: assistantResult.suggestedTrackId,
      chatResponse: assistantResult,
    };
  }
  return {
    success: true,
    message: `Processed: "${payload.transcript}"`,
    responseSpeech: `I heard: ${payload.transcript}`,
  };
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function getHealthApi(): Promise<{ status: string }> {
  return request<{ status: string }>('/health', { method: 'GET' });
}
