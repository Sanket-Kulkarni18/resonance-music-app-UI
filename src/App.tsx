import { useState } from 'react';
import { AppPageId, PeerNode, SpatialModeId, UserRole } from './types/spatial';
import { INITIAL_PEERS } from './data/mockSession';
import { TopArchitectureBar } from './components/TopArchitectureBar';
import { Page01RoomPortal } from './components/Page01RoomPortal';
import { Page02Calibration } from './components/Page02Calibration';
import { Page03LiveStudio } from './components/Page03LiveStudio';

export function App() {
  const [activePage, setActivePage] = useState<AppPageId>('portal');
  const [userRole, setUserRole] = useState<UserRole>('host');
  const [roomName, setRoomName] = useState<string>('STUDIO A // DOLBY DOME');
  const [roomCode, setRoomCode] = useState<string>('849204');
  const [activeMode, setActiveMode] = useState<SpatialModeId>('atmos');
  const [peers, setPeers] = useState<PeerNode[]>(INITIAL_PEERS);
  const [peerDeviceName, setPeerDeviceName] = useState<string>('Maya iPhone 16 Pro');
  const [showBlueprintModal, setShowBlueprintModal] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F3F5F8] flex flex-col selection:bg-[#FF5500]/30 selection:text-white">
      {/* Persistent Top Studio Architecture Bar & Page Switcher */}
      <TopArchitectureBar
        activePage={activePage}
        setActivePage={setActivePage}
        userRole={userRole}
        setUserRole={setUserRole}
        roomCode={roomCode}
        roomName={roomName}
        activeMode={activeMode}
        peerCount={peers.length}
        showBlueprintModal={showBlueprintModal}
        setShowBlueprintModal={setShowBlueprintModal}
      />

      {/* Active Page Viewport */}
      <main className="flex-1">
        {activePage === 'portal' && (
          <Page01RoomPortal
            roomName={roomName}
            setRoomName={setRoomName}
            roomCode={roomCode}
            setRoomCode={setRoomCode}
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            setUserRole={setUserRole}
            setActivePage={setActivePage}
            peerDeviceName={peerDeviceName}
            setPeerDeviceName={setPeerDeviceName}
          />
        )}

        {activePage === 'calibration' && (
          <Page02Calibration
            userRole={userRole}
            roomCode={roomCode}
            roomName={roomName}
            activeMode={activeMode}
            peers={peers}
            setPeers={setPeers}
            peerDeviceName={peerDeviceName}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'studio' && (
          <Page03LiveStudio
            userRole={userRole}
            setUserRole={setUserRole}
            roomCode={roomCode}
            roomName={roomName}
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            peers={peers}
            setPeers={setPeers}
            setActivePage={setActivePage}
          />
        )}
      </main>
    </div>
  );
}

export default App;
