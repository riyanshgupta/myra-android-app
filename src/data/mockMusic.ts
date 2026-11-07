import { Track, Playlist, SearchHistoryItem } from '../types/music';

export const TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Neon Horizon',
    artist: 'Astrid & The Cosmos',
    album: 'Celestial Drift (2024 Remaster)',
    duration: 331, // 05:31
    durationFormatted: '05:31',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC276U_wEX0u448AeYIW4ZUCwAt5fEoj1tGbLuoJJcB3zrz13QN3Qt067lyFI153NcJL-r6ve0qm3bYc1YjMrUdGQhzx8UQFnLudTvMjaneLaSUqIdJP1oICnYS1DKiggHarLvp_ubCAbesyT2gItHaFgKxi9tRPPof_2d8tPFr0-HrXzmEdX5985edpZAhf-X8Tqfkx6Pokhx7Z-umVxsd7TC96Mu9xCQ4qMGN1ND_P4LLmn88mUkP',
    fallbackGradient: 'from-purple-900 via-indigo-950 to-cyan-900',
    genre: 'Synthwave',
    bpm: 118,
    quality: 'Dolby Atmos',
    isLiked: true,
    preset: 'Popular Mix',
    lyrics: [
      { time: 0, text: 'Midnight streetlights blur across the glass' },
      { time: 14, text: 'Reflections dancing as the shadows pass' },
      { time: 28, text: 'Twin turbo purring through the neon rain' },
      { time: 45, text: 'Washing away the static and the pain' },
      { time: 65, text: 'We chase the horizon into the purple glow' },
      { time: 82, text: 'Nowhere to be, nowhere we have to go' },
      { time: 105, text: 'Neon horizon, guide me through the night' },
      { time: 128, text: 'Luminescent road under digital starlight' },
      { time: 154, text: 'Synthetic pulses beating with my heart' },
      { time: 180, text: 'Where the highway ends is where our dreams will start' }
    ]
  },
  {
    id: 'track-2',
    title: 'Midnight Resonance',
    artist: 'Kaelen Vane',
    album: 'Synaptic Flow',
    duration: 236, // 03:56
    durationFormatted: '03:56',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCa6ep27dNbmFniw4JB0p4ghOAeiMtoyQVTtYWRfD9SEf6V7zhAqQz15MTbaWA_ViEB6hNtK6OaMR7kRO6BbhfEiT5oZ5TzSeJJLLsNfn8k4JSahREVIOpkSM_oubsfkhdmRaZOdqucwg1j_Nm59A88TEZ2gdEePBjDYr6Pn2w5KOed-FvFspUhYYGWOKVB03xHS48eLJ6i9nB2MLikEv1hIZk5KC9Q9nrHOH7lm3C-FOiPCDHociQd',
    fallbackGradient: 'from-violet-950 via-purple-900 to-black',
    genre: 'Ambient Electronic',
    bpm: 94,
    quality: 'Dolby Atmos',
    isLiked: false,
    preset: 'Late Night Chill'
  },
  {
    id: 'track-3',
    title: 'Quantum Drift',
    artist: 'Lumina Project',
    album: 'Cybernetic Echoes',
    duration: 234, // 03:54
    durationFormatted: '03:54',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBepVvxqMUVwI3kiv0BzhWoRrrWbDROV0YmckiSMmjGg0oPMS47tBcjPwpi1e3h6b8IarF6URTTzQGmsF7xEQCaDysOXL6Bmk2fYFhZD9kpactqF65XaHWR124Je-443ICIrW4lv5Dwl06XWVKqKQpmi_wZ4z2s4RiXdFP5v_uRO-JEYjxf-FnaBjE_m0rTxCz0j7WuZ0GRiUjZy0hsERZ0LMaeKjUKbE_KpdlX7vv9-w4boK_lngyw',
    fallbackGradient: 'from-cyan-950 via-teal-900 to-slate-950',
    genre: 'Electronic',
    bpm: 122,
    quality: 'Spatial Audio',
    isLiked: true,
    preset: 'Focus Flow'
  },
  {
    id: 'track-4',
    title: 'Ethereal Echoes',
    artist: 'Saffron Wave',
    album: 'Velvet Meridian',
    duration: 262, // 04:22
    durationFormatted: '04:22',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvVvaDNKRhWLKasn9shrvIzJiVUMWnXFLu-GTUsZJRF-A6O0Btv2gDcC1Xo919sj8NtNqUkwZa1BImwAb8xrTomFVmcE9M6ADG52LzNr_SGXoWYG4A40o7gd6I5Lw87tPMqmwnPQzFKlHlRUXICWnLn15SFEuuHIf1vw9xBrzVk37aBgp27tMZXhKBdOTmTVKV4FJnDgq_44sJPxubaL23X4xmWJigo5udKM_rgr3bjI0p7IiINhg5',
    fallbackGradient: 'from-rose-950 via-purple-900 to-amber-950',
    genre: 'Chill Acoustic',
    bpm: 88,
    quality: 'Dolby Atmos',
    isLiked: false,
    preset: 'Lounge Vibe'
  },
  {
    id: 'track-5',
    title: 'Synthetic Aurora',
    artist: 'Nova Mind',
    album: 'High Altitude Protocol',
    duration: 284, // 04:44
    durationFormatted: '04:44',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCep4SWI5WBCtHmHI4yOZnJRSYuCHwUrSuJEk7dC2ppvKEXpEGGFIT7fI5eYPmsCwmvhtUcsrIkd9E6TiV0hNLkQu4M4vljzL9f4_owpDTF4-Ob4Og0NmTO4M68vSOIQCE_fxmF5sqLsHmJdBo0V2DDcMCTBqDNEZLlfQBd6kQfYtbbvtwsA1eU7LPxpZWjfvwWS_4kJRRnBv08rsjaAo_WUtfjMln7X86hZaDBhh8hpn5HmpHKiov-',
    fallbackGradient: 'from-emerald-950 via-teal-900 to-purple-950',
    genre: 'Cyber Ambient',
    bpm: 104,
    quality: 'Lossless',
    isLiked: false,
    preset: 'Scenic Drive'
  },
  {
    id: 'track-6',
    title: 'Echoes in the Rain',
    artist: 'Synthwave Collective',
    album: 'Night Drive Odyssey',
    duration: 225, // 03:45
    durationFormatted: '03:45',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwMMup1NBJxEk20fqqWruMD_ROeT_NrShPbNWcGfR0bUR8LNfcuDWvP0mQy80CUiDjEqADb3dBufnh-09Kxc2qR0I6ydi7NIEpgMz-h7Hrjw9baJODJaUArSPPyse7ClO5bCljJaLxX13fzI4BIa1TyLOeaz8T3so8_sNkP_4fxTVVBxWWmmJugwQpVGvnReuxGcxcP7eMGHg7hz8d_5XIa7_fXWiSquWqlzXiKd4W-3SeTKe_Lhnd',
    fallbackGradient: 'from-blue-950 via-indigo-900 to-black',
    genre: 'Synthwave',
    bpm: 112,
    quality: 'Dolby Atmos',
    isLiked: true,
    preset: 'Rain Mode'
  },
  {
    id: 'track-7',
    title: 'Atmospheric Bloom',
    artist: 'Solaris',
    album: 'Bioluminescence',
    duration: 252, // 04:12
    durationFormatted: '04:12',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZZfe5liPekbEWLASBq7C_fvZYSnnufuRy3ZopHJKS1nI7QJEc8tRvCxfe5BHpq-MWevzonbcg9jAd0XrmUuaixe7xEl1Hp_9myFp9j0yj047fTD3oPxTChar7DXIkf3NB195weQE4xn9P_ErBUNQiw7_jmd1SKfWMOYMm5LHf1A0Ji7gv3g9hEOr72erhBfsP8HJClonu_4ROrat4TCFAy7ZCjAT38YeYNNZ_-4oenuBLNVJkAbR-',
    fallbackGradient: 'from-teal-950 via-cyan-900 to-emerald-950',
    genre: 'Chillout',
    bpm: 96,
    quality: 'Dolby Atmos',
    isLiked: false,
    preset: 'Calm Pulse'
  },
  {
    id: 'track-8',
    title: 'Deep Orbit',
    artist: 'Helix Pulse',
    album: 'Sub-Bass Dimensions',
    duration: 210, // 03:30
    durationFormatted: '03:30',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOr0UQ6CF-sU2JCA3L-aXuXIKKM_6NOoDVViXk_wB_AOE5XWsERSMHHgLUcWJJIzAFa9wtXFMUgP9rQZfkhZuSrH_qxG7x2xEn5ARpqKL97YG4pHnI1vWEBwefxjGjGa6bZIG0lSii5LkkFDAT0GRBTecwfqY7x4_eLbTyXbEzNI6IPHlW0BqhgXANLaAilCGzharKWTVkSAMToaSy_oFwReUDFx0LxgD95cxwzcQonjYkGG55ICsm',
    fallbackGradient: 'from-violet-950 via-purple-950 to-slate-950',
    genre: 'Space Ambient',
    bpm: 82,
    quality: 'Spatial Audio',
    isLiked: true,
    preset: 'Night Highway'
  },
  {
    id: 'track-9',
    title: 'Midnight Pulse',
    artist: 'Kaelen Vane',
    album: 'Synth Odyssey',
    duration: 222, // 03:42
    durationFormatted: '03:42',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxbOgv9VTuyS37MfUBXBMtNgNwG_UavVvmnlmOGCwSjvHf9ZFQ4hciAJbigmpqG2F-yu3-u4cani3mTCiAyZ-s6aSYdKYYB0cGIwb7fNKlFW6hEApR8yqxxKQyK3v1oO7smupFp5phGnin2MM_yEHhZyxbqGzetOVpyTRIU2oysEStEnuQsEQWdYuEHe888zCOxuVQVVwSlDtrFkwLiX_2LJ72cQgufEZbtddCDhKM9efTWNvr7CLe',
    fallbackGradient: 'from-fuchsia-950 via-purple-950 to-blue-950',
    genre: 'Synthwave',
    bpm: 128,
    quality: 'Dolby Atmos',
    isLiked: true,
    preset: 'High Octane'
  }
];

export const INITIAL_SEARCH_HISTORY: SearchHistoryItem[] = [
  { id: 'sh-1', query: 'Astrid & The Cosmos', category: 'Artist', timestamp: '10m ago' },
  { id: 'sh-2', query: 'Synthwave Highway 1984', category: 'Genre', timestamp: '1h ago' },
  { id: 'sh-3', query: 'Kaelen Vane - Midnight Pulse', category: 'Track', timestamp: '3h ago' },
  { id: 'sh-4', query: '128 BPM Instrumental Night Drive', category: 'Cadence', timestamp: 'Yesterday' },
  { id: 'sh-5', query: 'Hans Zimmer Interstellar FLAC', category: 'Album', timestamp: '2 days ago' }
];

export const PLAYLISTS: Playlist[] = [
  {
    id: 'pl-1',
    title: 'Night Drive 2024',
    description: 'Curated by Myra AI for open highways, late night cruising, and high-visibility cockpit listening.',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC276U_wEX0u448AeYIW4ZUCwAt5fEoj1tGbLuoJJcB3zrz13QN3Qt067lyFI153NcJL-r6ve0qm3bYc1YjMrUdGQhzx8UQFnLudTvMjaneLaSUqIdJP1oICnYS1DKiggHarLvp_ubCAbesyT2gItHaFgKxi9tRPPof_2d8tPFr0-HrXzmEdX5985edpZAhf-X8Tqfkx6Pokhx7Z-umVxsd7TC96Mu9xCQ4qMGN1ND_P4LLmn88mUkP',
    trackCount: 18,
    durationFormatted: '1 hr 14 min',
    mood: 'Night Drive',
    tracks: [TRACKS[0], TRACKS[1], TRACKS[2], TRACKS[5], TRACKS[8]],
    isCurated: true
  },
  {
    id: 'pl-2',
    title: 'Synthwave Highway',
    description: 'Retro-futuristic analog synthesizers, driving 4/4 basslines, and neon cityscapes.',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxDYk1JDZchVZvaTewFVE1feLyWL_brqIQE4LR9x8hiWL557TOHkZJCcphaKL2VT0RGHtyorlTNZ44KS1zcdOMWYYTWUtx23KU6aVelkla2c_xMAp-Q1gjGfCx3BX74S07Syl2iPkmuWSFure9cZejnaY57a7h7gfQiwnL6O_V2YxBQd_bB2ZHil0HtDQXwREGB5nhg6KpHHFYd9KE_iSrZpExegUbbXRp22BRPZoe4fvsZxQF7y3m',
    trackCount: 24,
    durationFormatted: '1 hr 38 min',
    mood: 'Synthwave',
    tracks: [TRACKS[0], TRACKS[5], TRACKS[8], TRACKS[2]],
    isCurated: true
  },
  {
    id: 'pl-3',
    title: 'Chill Ambient Lounge',
    description: 'Deep tranquil soundscapes, minimal organic percussion, and zero-fatigue acoustic depth.',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvVvaDNKRhWLKasn9shrvIzJiVUMWnXFLu-GTUsZJRF-A6O0Btv2gDcC1Xo919sj8NtNqUkwZa1BImwAb8xrTomFVmcE9M6ADG52LzNr_SGXoWYG4A40o7gd6I5Lw87tPMqmwnPQzFKlHlRUXICWnLn15SFEuuHIf1vw9xBrzVk37aBgp27tMZXhKBdOTmTVKV4FJnDgq_44sJPxubaL23X4xmWJigo5udKM_rgr3bjI0p7IiINhg5',
    trackCount: 16,
    durationFormatted: '58 min',
    mood: 'Chill Ambient',
    tracks: [TRACKS[1], TRACKS[3], TRACKS[6], TRACKS[7]],
    isCurated: true
  },
  {
    id: 'pl-4',
    title: 'Deep Focus 128 BPM',
    description: 'Cadence-locked electronic textures engineered for sustained creative focus and zero cognitive clutter.',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBepVvxqMUVwI3kiv0BzhWoRrrWbDROV0YmckiSMmjGg0oPMS47tBcjPwpi1e3h6b8IarF6URTTzQGmsF7xEQCaDysOXL6Bmk2fYFhZD9kpactqF65XaHWR124Je-443ICIrW4lv5Dwl06XWVKqKQpmi_wZ4z2s4RiXdFP5v_uRO-JEYjxf-FnaBjE_m0rTxCz0j7WuZ0GRiUjZy0hsERZ0LMaeKjUKbE_KpdlX7vv9-w4boK_lngyw',
    trackCount: 30,
    durationFormatted: '2 hr 06 min',
    mood: 'Focus Mode',
    tracks: [TRACKS[2], TRACKS[8], TRACKS[4], TRACKS[7]],
    isCurated: true
  }
];

export const MOOD_CATEGORIES = [
  { id: 'night-drive', name: 'Night Drive', icon: 'headphones', gradient: 'from-primary-container to-secondary-container' },
  { id: 'chill-ambient', name: 'Chill Ambient', icon: 'bubble_chart' },
  { id: 'focus-mode', name: 'Focus Mode', icon: 'bolt' },
  { id: 'workout-beat', name: 'Workout Beat', icon: 'fitness_center' },
  { id: 'discovery-radar', name: 'Discovery Radar', icon: 'explore' }
];
