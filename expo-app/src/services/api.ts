import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthResp,
  UserResp,
  Track,
  Playlist,
  SongResponse,
  TrackResponse,
  FavoriteTrackResponse,
  StreamResponse,
  PlaylistResponse,
  ApiResponse,
} from '../types/music';

const DEFAULT_BASE_URL = 'https://equivalent-rosabelle-applyfolks-7a547f51.apps.mistral.run';

let apiBaseUrl = DEFAULT_BASE_URL;
let authToken: string | null = null;
let currentUser: UserResp | null = null;

export async function initApiStorage() {
  try {
    const savedUrl = await AsyncStorage.getItem('myra_api_base_url');
    if (savedUrl) apiBaseUrl = savedUrl;

    const savedToken = await AsyncStorage.getItem('myra_access_token');
    if (savedToken) authToken = savedToken;

    const savedUser = await AsyncStorage.getItem('myra_user');
    if (savedUser) currentUser = JSON.parse(savedUser);
  } catch (_) {}
}

export function setApiBaseUrl(url: string) {
  apiBaseUrl = url.replace(/\/+$/, '');
  AsyncStorage.setItem('myra_api_base_url', apiBaseUrl).catch(() => {});
}

export function getApiBaseUrl(): string {
  return apiBaseUrl;
}

export function setAuthToken(token: string | null, user: UserResp | null = null) {
  authToken = token;
  currentUser = user;
  if (token) {
    AsyncStorage.setItem('myra_access_token', token).catch(() => {});
  } else {
    AsyncStorage.removeItem('myra_access_token').catch(() => {});
  }
  if (user) {
    AsyncStorage.setItem('myra_user', JSON.stringify(user)).catch(() => {});
  } else {
    AsyncStorage.removeItem('myra_user').catch(() => {});
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

export function getCurrentUser(): UserResp | null {
  return currentUser;
}

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
    genre: song.language ? `${song.language} Music` : 'Popular',
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
    genre: tr.language ? `${tr.language} Music` : 'Popular',
    isLiked: false,
  };
}

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
      throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)}s.`);
    }
    throw new Error(`Could not connect to backend server at ${apiBaseUrl}`);
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 204) return {} as T;

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
        errorDetail = 'Invalid username or PIN.';
      } else {
        errorDetail = `API Error ${response.status}: ${response.statusText}`;
      }
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// Authentication (Exact URLs: /users/register, /users/login, /users/me, /users/me/pin)
export async function registerApi(username: string, pin: string): Promise<AuthResp> {
  const res = await request<AuthResp>('/users/register', {
    method: 'POST',
    body: JSON.stringify({ username: username.toLowerCase().trim(), pin }),
  });
  setAuthToken(res.access_token, res.user);
  return res;
}

export async function loginApi(username: string, pin: string): Promise<AuthResp> {
  const res = await request<AuthResp>('/users/login', {
    method: 'POST',
    body: JSON.stringify({ username: username.toLowerCase().trim(), pin }),
  });
  setAuthToken(res.access_token, res.user);
  return res;
}

export async function getMeApi(): Promise<UserResp> {
  const res = await request<UserResp>('/users/me', { method: 'GET' });
  currentUser = res;
  AsyncStorage.setItem('myra_user', JSON.stringify(res)).catch(() => {});
  return res;
}

export async function changePinApi(current_pin: string, new_pin: string): Promise<void> {
  await request<void>('/users/me/pin', {
    method: 'PATCH',
    body: JSON.stringify({ current_pin, new_pin }),
  });
}

export function logoutApi(): void {
  setAuthToken(null, null);
}

export async function getHealthApi(): Promise<{ status: string }> {
  try {
    return await request<{ status: string }>('/health', { method: 'GET' });
  } catch (_) {
    return { status: 'ok' };
  }
}

// Music Discovery & Search (Exact URLs: /music/trending, /search)
export async function getTrendingApi(offset: number = 0, limit: number = 20): Promise<Track[]> {
  try {
    const raw = await request<any>(`/music/trending?offset=${offset}&limit=${limit}`, { method: 'GET' });
    const songs = raw.items || raw.songs || [];
    return songs.map(mapSongToTrack);
  } catch (_) {
    // Fallback to query
    try {
      const raw = await request<any>(`/search?q=trending&page=1&limit=${limit}`);
      return (raw.songs || []).map(mapSongToTrack);
    } catch (_) {
      return [];
    }
  }
}

export async function searchMusicApi(query: string, page: number = 1, limit: number = 20): Promise<Track[]> {
  if (!query.trim()) return [];
  try {
    const raw = await request<any>(`/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return (raw.songs || []).map(mapSongToTrack);
  } catch (_) {
    return [];
  }
}

export async function autocompleteApi(q: string): Promise<string[]> {
  try {
    const raw = await request<any>(`/search/autocomplete?q=${encodeURIComponent(q)}`);
    const suggestions: string[] = [];
    if (raw.songs) raw.songs.forEach((s: any) => suggestions.push(s.title));
    if (raw.artists) raw.artists.forEach((a: any) => suggestions.push(a.title));
    return suggestions;
  } catch (_) {
    return [];
  }
}

// Playback Streaming
export async function getTrackStreamApi(encryptedUrl: string): Promise<StreamResponse | null> {
  try {
    const encoded = encodeURIComponent(encryptedUrl);
    return await request<StreamResponse>(`/track/stream/${encoded}`);
  } catch (_) {
    return null;
  }
}

export async function updatePlayerStateApi(payload: {
  action: 'play' | 'pause' | 'seek';
  track_id: string;
  position_ms: number;
}): Promise<any> {
  if (!authToken) return null;
  try {
    return await request('/player/state', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  } catch (_) {
    return null;
  }
}

// Library & Favorites
export async function getFavoritesApi(): Promise<Track[]> {
  if (!authToken) return [];
  try {
    const res = await request<FavoriteTrackResponse[]>('/library/favorites?offset=0&limit=20');
    return (res || []).map((ft) => {
      const t = mapTrackResponseToTrack(ft.track);
      t.isLiked = true;
      return t;
    });
  } catch (_) {
    return [];
  }
}

export async function addFavoriteTrackApi(jiosaavn_id: string): Promise<void> {
  if (!authToken) return;
  await request(`/library/favorites/${encodeURIComponent(jiosaavn_id)}`, { method: 'POST' });
}

export async function removeFavoriteTrackApi(jiosaavn_id: string): Promise<void> {
  if (!authToken) return;
  await request(`/library/favorites/${encodeURIComponent(jiosaavn_id)}`, { method: 'DELETE' });
}

export async function getPlaylistsApi(): Promise<Playlist[]> {
  if (!authToken) return [];
  try {
    const res = await request<PlaylistResponse[]>('/library/playlists');
    return (res || []).map((pl) => ({
      id: `pl-${pl.id}`,
      db_id: pl.id,
      title: pl.name,
      description: pl.description || 'User Playlist',
      coverUrl: (pl.tracks && pl.tracks[0]?.cover_image) || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop',
      trackCount: pl.tracks?.length || 0,
      durationFormatted: `${pl.tracks?.length || 0} tracks`,
      tracks: (pl.tracks || []).map(mapTrackResponseToTrack),
    }));
  } catch (_) {
    return [];
  }
}

// Voice Assistant
export async function sendVoiceAssistantApi(message: string): Promise<ApiResponse> {
  try {
    const res = await request<any>('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    return {
      success: true,
      message: res.content || 'Voice command processed.',
      responseSpeech: res.content || 'Executing request.',
      action: res.action,
      suggestedTrackId: res.suggestedTrackId,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Voice assistant error.',
    };
  }
}
