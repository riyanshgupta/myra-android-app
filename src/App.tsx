import React from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { TopBar } from './components/navigation/TopBar';
import { MobileNavbar } from './components/navigation/MobileNavbar';
import { CockpitNavbar } from './components/navigation/CockpitNavbar';
import { MiniPlayer } from './components/player/MiniPlayer';
import { LyricsModal } from './components/player/LyricsModal';
import { QueueModal } from './components/player/QueueModal';
import { AddToPlaylistModal } from './components/player/AddToPlaylistModal';
import { AuthModal } from './components/auth/AuthModal';
import { AndroidDeviceFrame } from './components/emulator/AndroidDeviceFrame';
import { HomeScreen } from './screens/HomeScreen';
import { SearchScreen } from './screens/SearchScreen';
import { PlayerScreen } from './screens/PlayerScreen';
import { PlaylistsScreen } from './screens/PlaylistsScreen';
import { MyraAiScreen } from './screens/MyraAiScreen';

const MainAppContent: React.FC = () => {
  const { activeScreen, isLandscape, orientationMode, isAuthModalOpen, setIsAuthModalOpen } = usePlayer();

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen />;
      case 'search':
        return <SearchScreen />;
      case 'player':
        return <PlayerScreen />;
      case 'playlists':
        return <PlaylistsScreen />;
      case 'myra-ai':
        return <MyraAiScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const isPlayerActive = activeScreen === 'player';

  return (
    <AndroidDeviceFrame>
      <div
        className={`w-full bg-[#10131a] text-[#e1e2ec] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col relative select-none ${
          isPlayerActive
            ? 'h-full max-h-full overflow-hidden'
            : 'min-h-full overflow-y-auto overflow-x-hidden'
        }`}
      >
        {/* Top Bar for both Portrait and Cockpit modes */}
        <TopBar />

        {/* Main Content Viewport */}
        <main
          className={`flex-1 w-full pt-16 flex flex-col items-center ${
            isPlayerActive ? 'h-[calc(100%-64px)] max-h-[calc(100%-64px)] overflow-hidden' : ''
          }`}
        >
          {orientationMode === 'portrait' ? (
            <div
              className={`w-full bg-surface relative flex flex-col ${
                isPlayerActive
                  ? 'h-full max-h-full overflow-hidden'
                  : 'min-h-full'
              }`}
            >
              {renderScreen()}
              {!isPlayerActive && <MiniPlayer />}
              {!isPlayerActive && <MobileNavbar />}
            </div>
          ) : (
            <div
              className={`w-full flex-1 flex flex-col ${
                isPlayerActive ? 'h-full max-h-full overflow-hidden' : ''
              }`}
            >
              {renderScreen()}

              {isLandscape ? (
                !isPlayerActive && <CockpitNavbar />
              ) : (
                <>
                  {!isPlayerActive && <MiniPlayer />}
                  {!isPlayerActive && <MobileNavbar />}
                </>
              )}
            </div>
          )}
        </main>

        {/* Shared Modals */}
        <LyricsModal />
        <QueueModal />
        <AddToPlaylistModal />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    </AndroidDeviceFrame>
  );
};

export default function App() {
  return (
    <PlayerProvider>
      <MainAppContent />
    </PlayerProvider>
  );
}
