import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Users,
  UserPlus,
  RefreshCw,
  Copy,
  Check,
  Sliders,
  ListMusic,
  Crown,
  Smartphone,
  Laptop,
  Tablet,
  Speaker,
  Lock,
  Sparkles,
  Radio,
  Compass,
} from 'lucide-react';
import {
  AppPageId,
  PeerNode,
  SpatialModeId,
  TrackItem,
  UserRole,
} from '../types/spatial';
import {
  EXTRA_JOINABLE_PEERS,
  SPATIAL_MODES,
  TRACK_QUEUE,
} from '../data/mockSession';
import { SpatialRadarStage } from './SpatialRadarStage';
import { spatialAudio } from '../utils/spatialAudioEngine';

interface Page03LiveStudioProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  roomCode: string;
  roomName: string;
  activeMode: SpatialModeId;
  setActiveMode: (mode: SpatialModeId) => void;
  peers: PeerNode[];
  setPeers: React.Dispatch<React.SetStateAction<PeerNode[]>>;
  setActivePage: (page: AppPageId) => void;
}

export const Page03LiveStudio: React.FC<Page03LiveStudioProps> = ({
  userRole,
  setUserRole,
  roomCode,
  roomName,
  activeMode,
  setActiveMode,
  peers,
  setPeers,
  setActivePage,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTrack, setCurrentTrack] = useState<TrackItem>(TRACK_QUEUE[0]);
  const [progressSec, setProgressSec] = useState<number>(78);
  const [masterVolume, setMasterVolume] = useState<number>(82);
  const [liveSynthEnabled, setLiveSynthEnabled] = useState<boolean>(false);

  // DSP Parameters
  const [orbitSpeedHz, setOrbitSpeedHz] = useState<number>(
    SPATIAL_MODES[activeMode].defaultOrbitSpeed
  );
  const [roomDecayPct, setRoomDecayPct] = useState<number>(
    SPATIAL_MODES[activeMode].defaultRoomDecay
  );
  const [lfeGainDb, setLfeGainDb] = useState<number>(
    SPATIAL_MODES[activeMode].defaultLfeGain
  );

  const [rightPanelTab, setRightPanelTab] = useState<'dsp' | 'queue'>('dsp');
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(peers[0]?.id || null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isResyncing, setIsResyncing] = useState<boolean>(false);
  const [extraPeerCursor, setExtraPeerCursor] = useState<number>(0);

  const modeConfig = SPATIAL_MODES[activeMode];

  // Sync DSP defaults when mode changes
  const handleSelectMode = (newMode: SpatialModeId) => {
    setActiveMode(newMode);
    const cfg = SPATIAL_MODES[newMode];
    setOrbitSpeedHz(cfg.defaultOrbitSpeed);
    setRoomDecayPct(cfg.defaultRoomDecay);
    setLfeGainDb(cfg.defaultLfeGain);
    spatialAudio.playCalibrationChirp(newMode === '8d' ? -0.5 : newMode === '16d' ? 0.5 : 0);
  };

  // Track playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setProgressSec((prev) => {
        if (prev >= currentTrack.durationSec) return 0;
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, currentTrack]);

  // Manage optional live WebAudio drone synth
  useEffect(() => {
    if (liveSynthEnabled && isPlaying) {
      spatialAudio.startSpatialDrone(currentTrack.notes, masterVolume);
    } else {
      spatialAudio.stopSpatialDrone();
    }
    return () => {
      spatialAudio.stopSpatialDrone();
    };
  }, [liveSynthEnabled, isPlaying, currentTrack]);

  const handleCopyRoomCode = () => {
    navigator.clipboard?.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const handleSimulatePeerJoin = () => {
    const template = EXTRA_JOINABLE_PEERS[extraPeerCursor % EXTRA_JOINABLE_PEERS.length];
    const newPeer: PeerNode = {
      ...template,
      id: `peer-sim-${Date.now()}`,
      angleDeg: (template.angleDeg + extraPeerCursor * 25) % 360,
    };
    setPeers((prev) => [...prev, newPeer]);
    setExtraPeerCursor((c) => c + 1);
    setSelectedPeerId(newPeer.id);
    spatialAudio.playCalibrationChirp(Math.sin((newPeer.angleDeg * Math.PI) / 180));
  };

  const handleTriggerResync = () => {
    setIsResyncing(true);
    spatialAudio.playCalibrationChirp(0);
    setPeers((prev) =>
      prev.map((p) => ({
        ...p,
        latencyMs: Number((0.4 + Math.random() * 1.1).toFixed(1)),
        syncLocked: true,
      }))
    );
    setTimeout(() => setIsResyncing(false), 700);
  };

  const handleRotatePeerAngle = (peerId: string, deltaDeg: number) => {
    setPeers((prev) =>
      prev.map((p) =>
        p.id === peerId
          ? { ...p, angleDeg: (p.angleDeg + deltaDeg + 360) % 360 }
          : p
      )
    );
  };

  const handleToggleMutePeer = (peerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPeers((prev) =>
      prev.map((p) => (p.id === peerId ? { ...p, isMuted: !p.isMuted } : p))
    );
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getDeviceIcon = (type: PeerNode['deviceType']) => {
    switch (type) {
      case 'laptop':
        return <Laptop className="w-3.5 h-3.5" />;
      case 'tablet':
        return <Tablet className="w-3.5 h-3.5" />;
      case 'speaker':
        return <Speaker className="w-3.5 h-3.5" />;
      default:
        return <Smartphone className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-acoustic-grid flex flex-col justify-between p-3 sm:p-5 gap-4 max-w-[1600px] mx-auto">
      {/* TOP ROOM TELEMETRY & ROLE BANNER */}
      <div className="studio-card rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Room Identity & Code Copy */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#07080C] border border-white/10">
            <span className="font-display font-bold text-xs text-[#F3F5F8] hidden sm:inline">
              {roomName}
            </span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="text-[10px] font-mono text-[#8E96AA]">CODE</span>
            <span className="font-mono font-bold text-sm text-[#00F0FF] tracking-wider">
              {roomCode.slice(0, 3)}-{roomCode.slice(3, 6)}
            </span>
            <button
              type="button"
              onClick={handleCopyRoomCode}
              className="p-1 rounded hover:bg-white/10 text-[#8E96AA] hover:text-white transition-colors cursor-pointer"
              title="Copy Room Invite Code"
            >
              {copiedCode ? (
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#07080C] border border-white/[0.07] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[#8E96AA]">PTP MASTER CLOCK:</span>
            <span className="text-[#10B981] font-bold">LOCKED (±0.38ms)</span>
          </div>

          <button
            type="button"
            onClick={() => setActivePage('calibration')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-xs font-mono text-[#8E96AA] hover:text-white transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>RE-CALIBRATE SPEAKER ANGLE</span>
          </button>
        </div>

        {/* Right: Live Synth Audio Toggle & Role Perspective Indicator */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setLiveSynthEnabled((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs border transition-all cursor-pointer ${
              liveSynthEnabled
                ? 'bg-[#FF5500]/20 border-[#FF5500] text-[#FF5500] font-bold shadow-[0_0_15px_rgba(255,85,0,0.3)]'
                : 'bg-[#07080C] border-white/10 text-[#8E96AA] hover:text-white'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${liveSynthEnabled ? 'animate-pulse' : ''}`} />
            <span>{liveSynthEnabled ? '8D SYNTH AUDIO: ON' : 'TEST 8D SYNTH SOUND'}</span>
          </button>

          {userRole === 'peer' && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-xs font-mono text-[#00F0FF]">
              <Lock className="w-3.5 h-3.5" />
              <span>PEER RECEIVER MODE</span>
              <button
                type="button"
                onClick={() => setUserRole('host')}
                className="underline ml-1 font-bold hover:text-white cursor-pointer"
              >
                Switch to Host
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MAIN 12-COLUMN STUDIO WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-stretch">
        {/* LEFT COLUMN (3 COLS): CONNECTED PEER SPEAKER NODES */}
        <div className="lg:col-span-3 studio-card rounded-2xl p-4 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00F0FF]" />
                <div>
                  <h2 className="font-display font-bold text-sm text-[#F3F5F8]">
                    CONNECTED PEERS
                  </h2>
                  <p className="text-[10px] font-mono text-[#8E96AA]">
                    {peers.length} DEVICES IN ACOUSTIC MESH
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTriggerResync}
                title="Re-align NTP phase clock across all connected phones & laptops"
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[#8E96AA] hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isResyncing ? 'animate-spin text-[#10B981]' : ''}`}
                />
              </button>
            </div>

            {/* Peer Node Cards List (Capped at 3 clean data points per card) */}
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {peers.map((peer) => {
                const isSelected = selectedPeerId === peer.id;
                return (
                  <div
                    key={peer.id}
                    onClick={() => {
                      setSelectedPeerId(peer.id);
                      spatialAudio.playCalibrationChirp(
                        Math.sin((peer.angleDeg * Math.PI) / 180)
                      );
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#181D2A] border-[#00F0FF]/60 shadow-[0_0_20px_rgba(0,240,255,0.12)]'
                        : 'bg-[#07080C]/90 border-white/[0.06] hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* Data Point 1: Device Name & Icon */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            peer.role === 'HOST'
                              ? 'bg-[#FF5500]/20 text-[#FF5500]'
                              : 'bg-[#00F0FF]/15 text-[#00F0FF]'
                          }`}
                        >
                          {peer.role === 'HOST' ? (
                            <Crown className="w-3.5 h-3.5" />
                          ) : (
                            getDeviceIcon(peer.deviceType)
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#F3F5F8] truncate">
                            {peer.name}
                          </div>
                          <div className="text-[10px] font-mono text-[#8E96AA] truncate">
                            {peer.channelLabel} • {peer.angleDeg}°
                          </div>
                        </div>
                      </div>

                      {/* Data Point 2 & 3: Ping Badge + Sync Lock Dot */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-1.5 py-0.5 rounded bg-white/[0.05] text-[10px] font-mono text-[#8E96AA]">
                          {peer.latencyMs}ms
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleToggleMutePeer(peer.id, e)}
                          title={peer.isMuted ? 'Unmute speaker node' : 'Mute speaker node'}
                          className={`p-1 rounded transition-colors ${
                            peer.isMuted
                              ? 'bg-[#EF4444]/20 text-[#EF4444]'
                              : 'text-[#10B981] hover:bg-white/10'
                          }`}
                        >
                          {peer.isMuted ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <span className="block w-2 h-2 rounded-full bg-[#10B981]" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Simulated Peer Action */}
          <div className="pt-3 mt-3 border-t border-white/[0.08] space-y-2">
            <button
              type="button"
              onClick={handleSimulatePeerJoin}
              className="w-full py-2.5 px-3 rounded-xl bg-[#00F0FF]/12 hover:bg-[#00F0FF]/20 border border-[#00F0FF]/30 text-xs font-mono font-bold text-[#00F0FF] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ SIMULATE PEER DEVICE JOIN</span>
            </button>
          </div>
        </div>

        {/* CENTER COLUMN (6 COLS): INTERACTIVE 360° SPATIAL SOUNDSTAGE RADAR */}
        <div className="lg:col-span-6 flex flex-col">
          <SpatialRadarStage
            activeMode={activeMode}
            isPlaying={isPlaying}
            peers={peers}
            selectedPeerId={selectedPeerId}
            setSelectedPeerId={setSelectedPeerId}
            orbitSpeedHz={orbitSpeedHz}
            roomDecayPct={roomDecayPct}
            lfeGainDb={lfeGainDb}
            userRole={userRole}
            liveSynthEnabled={liveSynthEnabled}
            masterVolume={masterVolume}
            onRotatePeerAngle={handleRotatePeerAngle}
          />
        </div>

        {/* RIGHT COLUMN (3 COLS): SPATIAL DSP MODES (8D / 16D / ATMOS) & QUEUE */}
        <div className="lg:col-span-3 studio-card rounded-2xl p-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Segmented Tab Header: Spatial DSP vs Track Queue */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl studio-recessed">
              <button
                type="button"
                onClick={() => setRightPanelTab('dsp')}
                className={`py-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  rightPanelTab === 'dsp'
                    ? 'bg-[#181D2A] text-[#F3F5F8] border border-white/15 shadow'
                    : 'text-[#8E96AA] hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>SPATIAL DSP</span>
              </button>
              <button
                type="button"
                onClick={() => setRightPanelTab('queue')}
                className={`py-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  rightPanelTab === 'queue'
                    ? 'bg-[#181D2A] text-[#F3F5F8] border border-white/15 shadow'
                    : 'text-[#8E96AA] hover:text-white'
                }`}
              >
                <ListMusic className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>QUEUE ({TRACK_QUEUE.length})</span>
              </button>
            </div>

            {rightPanelTab === 'dsp' ? (
              <div className="space-y-4">
                {/* Spatial Mode Selector Matrix */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#8E96AA]">
                    <span>ACOUSTIC ENGINE PROFILE</span>
                    {userRole === 'peer' && (
                      <span className="text-[#00F0FF] flex items-center gap-1">
                        <Lock className="w-3 h-3" /> HOST CONTROLLED
                      </span>
                    )}
                  </div>

                  {(Object.keys(SPATIAL_MODES) as SpatialModeId[]).map((modeKey) => {
                    const m = SPATIAL_MODES[modeKey];
                    const active = activeMode === modeKey;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={userRole === 'peer'}
                        onClick={() => handleSelectMode(m.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer disabled:cursor-not-allowed ${
                          active
                            ? 'bg-[#181D2A] border-[#FF5500] shadow-[0_0_20px_rgba(255,85,0,0.16)]'
                            : 'bg-[#07080C]/90 border-white/[0.06] hover:border-white/15 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display font-bold text-xs text-[#F3F5F8]">
                            {m.name}
                          </span>
                          <span
                            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${m.accentColor}20`,
                              color: m.accentColor,
                            }}
                          >
                            {m.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8E96AA] mt-1 leading-snug">
                          {m.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Tactile Hardware DSP Sliders */}
                <div className="p-3.5 rounded-xl studio-recessed space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E96AA]">
                      REAL-TIME DSP TELEMETRY
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-[#FF5500]" />
                  </div>

                  {/* Slider 1: Orbit Angular Velocity */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-[#8E96AA]">ORBIT VELOCITY</span>
                      <span className="text-[#F3F5F8] font-bold">{orbitSpeedHz.toFixed(2)} Hz</span>
                    </div>
                    <input
                      type="range"
                      min={0.05}
                      max={0.65}
                      step={0.01}
                      disabled={userRole === 'peer' || activeMode === 'stereo'}
                      value={orbitSpeedHz}
                      onChange={(e) => setOrbitSpeedHz(Number(e.target.value))}
                      className="w-full dsp-slider disabled:opacity-40"
                    />
                  </div>

                  {/* Slider 2: Theatre Room Decay / Reverb */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-[#8E96AA]">THEATRE DOME SIZE</span>
                      <span className="text-[#00F0FF] font-bold">{roomDecayPct}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={1}
                      disabled={userRole === 'peer'}
                      value={roomDecayPct}
                      onChange={(e) => setRoomDecayPct(Number(e.target.value))}
                      className="w-full dsp-slider disabled:opacity-40"
                    />
                  </div>

                  {/* Slider 3: Sub-Bass LFE Gain */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-[#8E96AA]">SUB-BASS LFE GAIN</span>
                      <span className="text-[#10B981] font-bold">+{lfeGainDb.toFixed(1)} dB</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={12}
                      step={0.5}
                      disabled={userRole === 'peer'}
                      value={lfeGainDb}
                      onChange={(e) => setLfeGainDb(Number(e.target.value))}
                      className="w-full dsp-slider disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Synchronized Track Queue Tab */
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase text-[#8E96AA] mb-2">
                  MASTER ROOM PLAYLIST (LOSSLESS ADM)
                </div>
                {TRACK_QUEUE.map((trk) => {
                  const isCurrent = currentTrack.id === trk.id;
                  return (
                    <button
                      key={trk.id}
                      type="button"
                      disabled={userRole === 'peer'}
                      onClick={() => {
                        setCurrentTrack(trk);
                        setProgressSec(0);
                        handleSelectMode(trk.recommendedMode);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer disabled:cursor-not-allowed ${
                        isCurrent
                          ? 'bg-[#181D2A] border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                          : 'bg-[#07080C] border-white/[0.06] hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold text-[#00F0FF]">
                          {trk.formatBadge}
                        </span>
                        <span className="text-[10px] font-mono text-[#8E96AA]">
                          {formatTime(trk.durationSec)}
                        </span>
                      </div>
                      <div className="font-display font-bold text-xs text-[#F3F5F8] mt-1 truncate">
                        {trk.title}
                      </div>
                      <div className="text-[11px] text-[#8E96AA] truncate">{trk.artist}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Acoustic Output Summary Footer */}
          <div className="pt-3 mt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-[#8E96AA]">
            <span>SAMPLE RATE: 48KHZ</span>
            <span className="text-[#10B981]">BITSTREAM LOCKED</span>
          </div>
        </div>
      </div>

      {/* BOTTOM DOCK: MASTER SYNCHRONIZED TRANSPORT & WAVEFORM SCRUBBER */}
      <div className="studio-card rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Active Track Metadata */}
        <div className="flex items-center gap-3.5 w-full lg:w-72 shrink-0">
          <div
            className="w-12 h-12 rounded-xl border border-white/15 flex flex-col items-center justify-center shrink-0 relative overflow-hidden"
            style={{
              background: `radial-gradient(circle at center, ${modeConfig.accentColor}35, #07080C 80%)`,
            }}
          >
            <span className="font-mono font-bold text-[10px] text-[#F3F5F8]">
              {modeConfig.badge.split(' ')[0]}
            </span>
            <span className="font-mono text-[9px] text-[#00F0FF]">SYNC</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-[#F3F5F8] truncate">
                {currentTrack.title}
              </span>
            </div>
            <div className="text-xs text-[#8E96AA] truncate">{currentTrack.artist}</div>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-[#00F0FF]">
              <span>{currentTrack.formatBadge}</span>
              <span>•</span>
              <span>{currentTrack.bpm} BPM</span>
            </div>
          </div>
        </div>

        {/* Center: Transport Controls + Synchronized Multi-Bar Waveform Scrubber */}
        <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-4">
          {/* Play / Pause / Skip Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={userRole === 'peer'}
              onClick={() => setProgressSec(0)}
              className="p-2 rounded-lg bg-[#07080C] hover:bg-white/10 border border-white/10 text-[#F3F5F8] disabled:opacity-40 transition-colors cursor-pointer"
              title="Restart Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={userRole === 'peer'}
              onClick={() => setIsPlaying((prev) => !prev)}
              className="w-11 h-11 rounded-xl bg-[#FF5500] hover:bg-[#FF6922] text-[#090A0F] flex items-center justify-center shadow-[0_0_20px_rgba(255,85,0,0.4)] disabled:opacity-50 transition-all cursor-pointer"
              title={
                userRole === 'peer'
                  ? 'Playback is controlled by the Room Host'
                  : isPlaying
                  ? 'Pause Synchronized Playback'
                  : 'Play Synchronized Playback'
              }
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              disabled={userRole === 'peer'}
              onClick={() => {
                const idx = TRACK_QUEUE.findIndex((t) => t.id === currentTrack.id);
                const next = TRACK_QUEUE[(idx + 1) % TRACK_QUEUE.length];
                setCurrentTrack(next);
                setProgressSec(0);
              }}
              className="p-2 rounded-lg bg-[#07080C] hover:bg-white/10 border border-white/10 text-[#F3F5F8] disabled:opacity-40 transition-colors cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Waveform Scrubber */}
          <div className="flex-1 w-full space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#F3F5F8] font-bold">{formatTime(progressSec)}</span>
              <span className="text-[10px] text-[#10B981] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                {userRole === 'host'
                  ? `BROADCASTING TO ${peers.length} PEERS IN LOCKSTEP`
                  : 'LOCKED TO HOST MASTER PLAYHEAD'}
              </span>
              <span className="text-[#8E96AA]">{formatTime(currentTrack.durationSec)}</span>
            </div>

            <div
              onClick={(e) => {
                if (userRole === 'peer') return;
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                setProgressSec(Math.round(ratio * currentTrack.durationSec));
              }}
              className={`h-9 rounded-xl studio-recessed px-2.5 py-1.5 flex items-end gap-[3px] ${
                userRole === 'host' ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
            >
              {currentTrack.waveformPeaks.map((peak, idx) => {
                const barRatio = idx / currentTrack.waveformPeaks.length;
                const playRatio = progressSec / currentTrack.durationSec;
                const isPassed = barRatio <= playRatio;
                return (
                  <div
                    key={idx}
                    className="flex-1 rounded-full transition-all duration-150"
                    style={{
                      height: `${Math.max(18, peak)}%`,
                      backgroundColor: isPassed
                        ? modeConfig.accentColor
                        : 'rgba(255, 255, 255, 0.12)',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Master Array Gain Control */}
        <div className="flex items-center gap-3 w-full lg:w-52 shrink-0 justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-white/[0.08]">
          <Volume2 className="w-4 h-4 text-[#8E96AA] shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-[#8E96AA]">ARRAY GAIN</span>
              <span className="text-[#F3F5F8] font-bold">{masterVolume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              className="w-full dsp-slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
