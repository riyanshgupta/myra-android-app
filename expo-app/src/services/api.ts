import AsyncStorage from '@react-native-async-storage/async-storage';
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
  StreamResponse,
  PlaylistResponse,
  ApiResponse,
} from '../types/music';

const DEFAULT_BASE_URL = 'https://w78gddz2-8000.inc1.devtunnels.ms';

let apiBaseUrl = DEFAULT_BASE_URL;
let authToken: string | null = null;
let currentUser: UserResp | null = null;

// Initialize stored tokens from AsyncStorage
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

// Mapper Utilities
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
      errorDetail = errJson.detail || errJson.message || errJson.error || '';
    } catch (_) {}
    if (!errorDetail) {
      errorDetail = response.status === 401
        ? 'Invalid username or PIN.'
        : `API Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// API Methods
export async function loginApi(username: string, pin: string): Promise<AuthResp> {
  const res = await request<AuthResp>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, pin }),
  });
  setAuthToken(res.access_token, res.user);
  return res;
}

export async function registerApi(username: string, pin: string): Promise<AuthResp> {
  const res = await request<AuthResp>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, pin }),
  });
  setAuthToken(res.access_token, res.user);
  return res;
}

export async function searchMusicApi(query: string): Promise<Track[]> {
  if (!query.trim()) return [];
  const res = await request<SearchResponse>(`/songs/search?query=${encodeURIComponent(query)}`);
  return (res.songs || []).map(mapSongToTrack);
}

export async function getTrendingApi(): Promise<Track[]> {
  try {
    const res = await request<SearchResponse>('/songs/search?query=trending');
    return (res.songs || []).map(mapSongToTrack);
  } catch (_) {
    return [];
  }
}

export async function getTrackStreamApi(encryptedUrl: string): Promise<StreamResponse | null> {
  try {
    const encoded = encodeURIComponent(encryptedUrl);
    return await request<StreamResponse>(`/track/stream/${encoded}`);
  } catch (_) {
    return null;
  }
}

export async function getFavoritesApi(): Promise<Track[]> {
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
