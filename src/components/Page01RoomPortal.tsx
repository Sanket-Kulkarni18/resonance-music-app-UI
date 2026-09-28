import React, { useState } from 'react';
import {
  Radio,
  ArrowRight,
  Sparkles,
  Wifi,
  Speaker,
  Headphones,
  CheckCircle2,
  Users,
  Disc3,
  Zap,
  Shield,
  Volume2,
} from 'lucide-react';
import { AppPageId, PresetRoom, SpatialModeId, UserRole } from '../types/spatial';
import { PRESET_LIVE_ROOMS, SPATIAL_MODES } from '../data/mockSession';
import { spatialAudio } from '../utils/spatialAudioEngine';

interface Page01RoomPortalProps {
  roomName: string;
  setRoomName: (name: string) => void;
  roomCode: string;
  setRoomCode: (code: string) => void;
  activeMode: SpatialModeId;
  setActiveMode: (mode: SpatialModeId) => void;
  setUserRole: (role: UserRole) => void;
  setActivePage: (page: AppPageId) => void;
  peerDeviceName: string;
  setPeerDeviceName: (name: string) => void;
}

export const Page01RoomPortal: React.FC<Page01RoomPortalProps> = ({
  roomName,
  setRoomName,
  roomCode,
  setRoomCode,
  activeMode,
  setActiveMode,
  setUserRole,
  setActivePage,
  peerDeviceName,
  setPeerDeviceName,
}) => {
  const [topologyMode, setTopologyMode] = useState<'array' | 'binaural'>('array');
  const [joinDigits, setJoinDigits] = useState<string[]>(roomCode.split('').slice(0, 6));

  const currentCodeString = joinDigits.join('');
  const matchedPreset: PresetRoom =
    PRESET_LIVE_ROOMS.find((r) => r.code === currentCodeString) || {
      code: currentCodeString.padEnd(6, '0'),
      roomName: 'CUSTOM ACOUSTIC NODE',
      hostName: 'Remote Master Host',
      hostDevice: 'WebRTC PTP Clock',
      activeMode: activeMode,
      peerCount: 3,
      currentTrackTitle: 'SOLARIS // SUB-HORIZON',
      currentArtist: 'Klangwerk & Aether Ensemble',
      avgPingMs: 1.4,
    };

  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/[^0-9A-Za-z]/g, '').toUpperCase().slice(-1);
    const next = [...joinDigits];
    next[index] = clean || '0';
    setJoinDigits(next);
    setRoomCode(next.join(''));
  };

  const handleSelectPresetRoom = (preset: PresetRoom) => {
    setJoinDigits(preset.code.split(''));
    setRoomCode(preset.code);
    setRoomName(preset.roomName);
    setActiveMode(preset.activeMode);
    spatialAudio.playCalibrationChirp(0.2);
  };

  const handleHostLaunch = (skipCalibration = false) => {
    spatialAudio.playCalibrationChirp(0);
    setUserRole('host');
    setActivePage(skipCalibration ? 'studio' : 'calibration');
  };

  const handlePeerJoin = (skipCalibration = false) => {
    spatialAudio.playCalibrationChirp(-0.25);
    setUserRole('peer');
    setRoomCode(matchedPreset.code);
    setRoomName(matchedPreset.roomName);
    setActiveMode(matchedPreset.activeMode);
    setActivePage(skipCalibration ? 'studio' : 'calibration');
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-acoustic-grid py-8 px-4 sm:px-6 flex flex-col justify-between overflow-hidden">
      {/* Ambient Radial Acoustic Field */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[950px] h-[420px] opacity-25 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255, 85, 0, 0.28) 0%, rgba(0, 240, 255, 0.14) 45%, transparent 75%)',
        }}
      />

      <div className="max-w-6xl mx-auto w-full relative z-10 space-y-8">
        {/* Top Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12151E] border border-white/10 text-[11px] font-mono text-[#8E96AA]">
            <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-ping" />
            <span className="text-[#F3F5F8] font-semibold">PAGE 01 // SESSION GATEWAY</span>
            <span>•</span>
            <span className="text-[#00F0FF]">SUB-MS MULTI-DEVICE PHASE SYNC</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-[#F3F5F8] leading-[1.08]">
            ONE HOST. MULTIPLE PEERS.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] via-[#FF8844] to-[#00F0FF]">
              360° THEATRE SOUNDSTAGE.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#8E96AA] max-w-2xl mx-auto leading-relaxed">
            Turn connected phones, tablets, and laptops into a phase-locked acoustic array. Stream{' '}
            <span className="text-[#F3F5F8] font-medium">8D Orbital</span>,{' '}
            <span className="text-[#F3F5F8] font-medium">16D Multi-Axis</span>, or discrete{' '}
            <span className="text-[#F3F5F8] font-medium">Dolby Atmos 7.1.4 Theatre</span> channels simultaneously across every device in the room.
          </p>
        </div>

        {/* Main Split Gateway: Host Console (Left) vs Peer Receiver (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT COLUMN: HOST A ROOM */}
          <div className="lg:col-span-7 studio-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30">
                      MASTER TRANSMITTER
                    </span>
                    <span className="text-xs font-mono text-[#8E96AA]">HOST CONSOLE</span>
                  </div>
                  <h2 className="font-display font-bold text-xl sm:text-2xl text-[#F3F5F8] mt-1.5">
                    HOST A SPATIAL ROOM
                  </h2>
                  <p className="text-xs text-[#8E96AA] mt-0.5">
                    Your device becomes the master clock & audio broadcaster for all connected peers.
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center shrink-0">
                  <Radio className="w-5 h-5 text-[#FF5500]" />
                </div>
              </div>

              {/* Session Name & Room Topology Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8E96AA] mb-1.5">
                    ROOM / STUDIO IDENTIFIER
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g. STUDIO A // DOLBY DOME"
                    className="w-full px-3.5 py-2.5 rounded-xl studio-recessed text-sm font-mono text-[#F3F5F8] focus:outline-none focus:border-[#FF5500] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8E96AA] mb-1.5">
                    MULTI-DEVICE ACOUSTIC TOPOLOGY
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl studio-recessed">
                    <button
                      type="button"
                      onClick={() => setTopologyMode('array')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-mono transition-all ${
                        topologyMode === 'array'
                          ? 'bg-[#181D2A] text-[#F3F5F8] border border-white/15 shadow'
                          : 'text-[#8E96AA] hover:text-white'
                      }`}
                    >
                      <Speaker className="w-3.5 h-3.5 text-[#FF5500]" />
                      <span>SPEAKER ARRAY</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopologyMode('binaural')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-mono transition-all ${
                        topologyMode === 'binaural'
                          ? 'bg-[#181D2A] text-[#F3F5F8] border border-white/15 shadow'
                          : 'text-[#8E96AA] hover:text-white'
                      }`}
                    >
                      <Headphones className="w-3.5 h-3.5 text-[#00F0FF]" />
                      <span>HEADPHONE SYNC</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Default Spatial Mode Matrix Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#8E96AA]">
                    SELECT INITIAL SPATIAL DSP ARCHITECTURE
                  </label>
                  <span className="text-[11px] font-mono text-[#00F0FF]">
                    {SPATIAL_MODES[activeMode].channelCount}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(SPATIAL_MODES) as SpatialModeId[]).map((modeKey) => {
                    const mode = SPATIAL_MODES[modeKey];
                    const isSelected = activeMode === modeKey;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setActiveMode(mode.id);
                          spatialAudio.playCalibrationChirp(mode.id === '8d' ? -0.5 : mode.id === '16d' ? 0.5 : 0);
                        }}
                        className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden ${
                          isSelected
                            ? 'bg-[#181D2A] border-[#FF5500] shadow-[0_0_25px_rgba(255,85,0,0.15)]'
                            : 'bg-[#0C0E15]/90 border-white/[0.07] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${mode.accentColor}20`,
                              color: mode.accentColor,
                            }}
                          >
                            {mode.badge}
                          </span>
                          <span className="text-[10px] font-mono text-[#8E96AA]">
                            {mode.channelCount}
                          </span>
                        </div>
                        <div className="font-display font-bold text-sm text-[#F3F5F8]">
                          {mode.name}
                        </div>
                        <p className="text-[11px] text-[#8E96AA] line-clamp-2 mt-1 leading-relaxed">
                          {mode.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Host Action Footer */}
            <div className="pt-6 mt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#8E96AA]">
                <Shield className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>Auto-generates 6-digit peer code & PTP clock</span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleHostLaunch(true)}
                  className="px-3.5 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-[#F3F5F8] transition-colors"
                >
                  SKIP TO STUDIO
                </button>
                <button
                  type="button"
                  onClick={() => handleHostLaunch(false)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FF5500] hover:bg-[#FF6922] text-[#090A0F] font-mono font-bold text-xs tracking-wider uppercase shadow-[0_0_25px_rgba(255,85,0,0.4)] transition-all cursor-pointer"
                >
                  <span>CREATE & CALIBRATE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: JOIN EXISTING ROOM BY CODE */}
          <div className="lg:col-span-5 studio-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-5">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                      PEER RECEIVER NODE
                    </span>
                    <span className="text-xs font-mono text-[#8E96AA]">SYNC CLIENT</span>
                  </div>
                  <h2 className="font-display font-bold text-xl sm:text-2xl text-[#F3F5F8] mt-1.5">
                    ENTER ROOM CODE
                  </h2>
                  <p className="text-xs text-[#8E96AA] mt-0.5">
                    Connect your phone or laptop as a synchronized satellite speaker peer.
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center shrink-0">
                  <Wifi className="w-5 h-5 text-[#00F0FF]" />
                </div>
              </div>

              {/* 6-Digit Segmented Hardware Code Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#8E96AA]">
                    6-DIGIT SESSION FREQUENCY CODE
                  </label>
                  <span className="text-[11px] font-mono text-[#10B981] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> SIGNAL DETECTED
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  {joinDigits.map((digit, idx) => (
                    <React.Fragment key={idx}>
                      <input
                        type="text"
                        maxLength={2}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        aria-label={`Room code digit ${idx + 1}`}
                        className="w-full h-13 sm:h-14 text-center rounded-xl studio-recessed font-mono font-bold text-xl sm:text-2xl text-[#00F0FF] border border-white/15 focus:border-[#00F0FF] focus:shadow-[0_0_15px_rgba(0,240,255,0.25)] focus:outline-none transition-all"
                      />
                      {idx === 2 && (
                        <span className="font-mono text-lg text-[#8E96AA] px-0.5">-</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Preset Live Rooms for 1-click testing */}
                <div className="mt-3">
                  <span className="block text-[10px] font-mono uppercase text-[#8E96AA] mb-1.5">
                    ACTIVE NEARBY ROOMS (CLICK TO AUTO-FILL):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_LIVE_ROOMS.map((preset) => {
                      const isActivePreset = preset.code === currentCodeString;
                      return (
                        <button
                          key={preset.code}
                          type="button"
                          onClick={() => handleSelectPresetRoom(preset)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                            isActivePreset
                              ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40 font-semibold'
                              : 'bg-[#07080C] text-[#8E96AA] border-white/[0.07] hover:text-white'
                          }`}
                        >
                          {preset.code.slice(0, 3)}-{preset.code.slice(3)} •{' '}
                          {SPATIAL_MODES[preset.activeMode].badge}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Live Room Radar Preview Card */}
              <div className="p-4 rounded-xl bg-[#07080C] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#10B981] font-semibold">
                      LIVE ROOM TELEMETRY
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#8E96AA]">
                    PING: <strong className="text-[#F3F5F8]">{matchedPreset.avgPingMs}ms</strong>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display font-bold text-base text-[#F3F5F8] truncate">
                      {matchedPreset.roomName}
                    </div>
                    <div className="text-xs font-mono text-[#8E96AA] truncate">
                      Host: <span className="text-[#F3F5F8]">{matchedPreset.hostName}</span>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-[#12151E] border border-white/10 text-right shrink-0">
                    <div className="text-[10px] font-mono text-[#00F0FF] font-bold">
                      {SPATIAL_MODES[matchedPreset.activeMode].badge}
                    </div>
                    <div className="text-[10px] font-mono text-[#8E96AA] flex items-center gap-1 justify-end">
                      <Users className="w-3 h-3" /> {matchedPreset.peerCount} Peers
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#8E96AA] flex items-center gap-1.5 truncate">
                    <Disc3 className="w-3.5 h-3.5 text-[#FF5500] animate-spin" />
                    <span className="truncate">{matchedPreset.currentTrackTitle}</span>
                  </span>
                  <span className="text-[10px] text-[#10B981] shrink-0 ml-2">PHASE LOCKED</span>
                </div>
              </div>

              {/* Peer Device Nickname */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8E96AA] mb-1.5">
                  YOUR PEER DEVICE ALIAS
                </label>
                <input
                  type="text"
                  value={peerDeviceName}
                  onChange={(e) => setPeerDeviceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl studio-recessed text-sm font-mono text-[#F3F5F8] focus:outline-none focus:border-[#00F0FF] transition-colors"
                />
              </div>
            </div>

            {/* Join Action Footer */}
            <div className="pt-6 mt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => handlePeerJoin(true)}
                className="px-3.5 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-[#F3F5F8] transition-colors"
              >
                DIRECT JOIN
              </button>
              <button
                type="button"
                onClick={() => handlePeerJoin(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#00F0FF] hover:bg-[#33F3FF] text-[#090A0F] font-mono font-bold text-xs tracking-wider uppercase shadow-[0_0_25px_rgba(0,240,255,0.35)] transition-all cursor-pointer"
              >
                <span>JOIN & ASSIGN SPEAKER</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Architectural Feature Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#12151E]/70 border border-white/[0.07] flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#FF5500]/10 text-[#FF5500] shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold uppercase text-[#F3F5F8]">
                ±0.4ms PTP CLOCK LOCK
              </h3>
              <p className="text-xs text-[#8E96AA] mt-0.5 leading-relaxed">
                Eliminates the hollow comb-filtering echo common when multiple phones play music together in the same room.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#12151E]/70 border border-white/[0.07] flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold uppercase text-[#F3F5F8]">
                8D & 16D ORBITAL TRAJECTORIES
              </h3>
              <p className="text-xs text-[#8E96AA] mt-0.5 leading-relaxed">
                Audio stems physically travel in circular or figure-8 paths from one friend&apos;s device to the next around your seating area.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#12151E]/70 border border-white/[0.07] flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#10B981]/10 text-[#10B981] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold uppercase text-[#F3F5F8]">
                DOLBY ATMOS 7.1.4 BED MAPPING
              </h3>
              <p className="text-xs text-[#8E96AA] mt-0.5 leading-relaxed">
                Assign phones on the table as Front Left/Center/Right and laptops behind the couch as Rear Surround channels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
