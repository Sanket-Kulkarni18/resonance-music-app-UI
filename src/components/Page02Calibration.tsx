import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  Volume2,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Cpu,
  Wifi,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { AppPageId, PeerNode, SpatialModeId, UserRole } from '../types/spatial';
import { SPATIAL_MODES } from '../data/mockSession';
import { spatialAudio } from '../utils/spatialAudioEngine';

interface Page02CalibrationProps {
  userRole: UserRole;
  roomCode: string;
  roomName: string;
  activeMode: SpatialModeId;
  peers: PeerNode[];
  setPeers: React.Dispatch<React.SetStateAction<PeerNode[]>>;
  peerDeviceName: string;
  setActivePage: (page: AppPageId) => void;
}

interface SpeakerZonePreset {
  id: string;
  code: string;
  label: string;
  angleDeg: number;
  distanceRing: number;
  panValue: number;
  desc: string;
}

const SPEAKER_ZONES: SpeakerZonePreset[] = [
  {
    id: 'fc',
    code: 'C / LFE',
    label: 'FRONT CENTER (HOST)',
    angleDeg: 0,
    distanceRing: 0.58,
    panValue: 0,
    desc: 'Primary vocal anchor & sub-bass reference in front of listener',
  },
  {
    id: 'fl',
    code: 'FL CH',
    label: 'FRONT LEFT SATELLITE',
    angleDeg: 315,
    distanceRing: 0.68,
    panValue: -0.7,
    desc: '315° azimuth • Left stage stereo & Atmos bed channel',
  },
  {
    id: 'fr',
    code: 'FR CH',
    label: 'FRONT RIGHT SATELLITE',
    angleDeg: 45,
    distanceRing: 0.68,
    panValue: 0.7,
    desc: '45° azimuth • Right stage stereo & Atmos bed channel',
  },
  {
    id: 'sl',
    code: 'SL CH',
    label: 'SURROUND LEFT',
    angleDeg: 260,
    distanceRing: 0.78,
    panValue: -0.95,
    desc: '260° azimuth • Side-left immersion for 8D/16D orbit sweep',
  },
  {
    id: 'sr',
    code: 'SR CH',
    label: 'SURROUND RIGHT',
    angleDeg: 100,
    distanceRing: 0.78,
    panValue: 0.95,
    desc: '100° azimuth • Side-right immersion for 8D/16D orbit sweep',
  },
  {
    id: 'rl',
    code: 'RL HEIGHT',
    label: 'REAR LEFT SURROUND',
    angleDeg: 215,
    distanceRing: 0.84,
    panValue: -0.65,
    desc: '215° azimuth • Behind listener left cinema surround',
  },
  {
    id: 'rr',
    code: 'RR HEIGHT',
    label: 'REAR RIGHT SURROUND',
    angleDeg: 145,
    distanceRing: 0.84,
    panValue: 0.65,
    desc: '145° azimuth • Behind listener right cinema surround',
  },
  {
    id: 'tr',
    code: 'REAR C',
    label: 'REAR OVERHEAD BRIDGE',
    angleDeg: 180,
    distanceRing: 0.85,
    panValue: 0,
    desc: '180° azimuth • Rear center completion for 360° orbital path',
  },
];

export const Page02Calibration: React.FC<Page02CalibrationProps> = ({
  userRole,
  roomCode,
  roomName,
  activeMode,
  peers,
  setPeers,
  peerDeviceName,
  setActivePage,
}) => {
  const [selectedZone, setSelectedZone] = useState<SpeakerZonePreset>(
    userRole === 'host' ? SPEAKER_ZONES[0] : SPEAKER_ZONES[1]
  );
  const [customAngle, setCustomAngle] = useState<number>(
    userRole === 'host' ? 0 : 315
  );
  const [hwBufferOffsetMs, setHwBufferOffsetMs] = useState<number>(0.0);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [sweepProgress, setSweepProgress] = useState<number>(100);
  const [phaseCorrelation, setPhaseCorrelation] = useState<number>(99.6);

  const modeConfig = SPATIAL_MODES[activeMode];

  useEffect(() => {
    if (!isSweeping) return;
    setSweepProgress(0);
    const interval = setInterval(() => {
      setSweepProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSweeping(false);
          setPhaseCorrelation(99.8);
          return 100;
        }
        return prev + 10;
      });
    }, 90);
    return () => clearInterval(interval);
  }, [isSweeping]);

  const handleSelectZone = (zone: SpeakerZonePreset) => {
    setSelectedZone(zone);
    setCustomAngle(zone.angleDeg);
    spatialAudio.playCalibrationChirp(zone.panValue);
  };

  const triggerAcousticSweep = () => {
    setIsSweeping(true);
    spatialAudio.playCalibrationChirp(-0.8);
    setTimeout(() => spatialAudio.playCalibrationChirp(0), 220);
    setTimeout(() => spatialAudio.playCalibrationChirp(0.8), 440);
  };

  const handleConfirmAndEnterStudio = () => {
    spatialAudio.playCalibrationChirp(0);
    // Update the user's node position in the peers list
    setPeers((prev) => {
      const targetId = userRole === 'host' ? 'peer-host' : 'peer-2';
      return prev.map((p) =>
        p.id === targetId
          ? {
              ...p,
              name: userRole === 'host' ? 'Aarav (Host)' : `${peerDeviceName} (You)`,
              channelLabel: selectedZone.code,
              angleDeg: customAngle,
              distanceRing: selectedZone.distanceRing,
              syncLocked: true,
            }
          : p
      );
    });
    setActivePage('studio');
  };

  // Convert angle (0 deg = top North, clockwise) to SVG x,y on a 320x320 radar
  const polarToCartesian = (angleDeg: number, radiusPx: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: 170 + radiusPx * Math.cos(rad),
      y: 170 + radiusPx * Math.sin(rad),
    };
  };

  const activeNodeCoords = polarToCartesian(customAngle, 112);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-acoustic-grid py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Breadcrumb & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00F0FF]">
              <Compass className="w-4 h-4" />
              <span>PAGE 02 // ACOUSTIC CALIBRATION & SPEAKER PLACEMENT</span>
              <span className="text-white/20">•</span>
              <span className="text-[#FF5500] uppercase">{userRole} MODE</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#F3F5F8] mt-1">
              POSITION YOUR DEVICE IN THE 360° SOUNDSTAGE
            </h1>
            <p className="text-xs sm:text-sm text-[#8E96AA] mt-0.5">
              For convincing <span className="text-white font-medium">{modeConfig.name}</span>, assign where this device is physically placed relative to the listener sweet spot.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <button
              onClick={() => setActivePage('portal')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-[#8E96AA] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>BACK TO PORTAL</span>
            </button>
            <button
              onClick={handleConfirmAndEnterStudio}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF5500] hover:bg-[#FF6922] text-[#090A0F] font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,85,0,0.35)] transition-all cursor-pointer"
            >
              <span>ENTER LIVE STUDIO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main 12-Col Calibration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 7 COLS: INTERACTIVE 360° ROOM PLACEMENT COMPASS */}
          <div className="lg:col-span-7 studio-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#00F0FF] block">
                  STEP 1 // PHYSICAL GEOMETRY
                </span>
                <h2 className="font-display font-bold text-lg text-[#F3F5F8]">
                  SELECT SPEAKER CHANNEL OR AZIMUTH ANGLE
                </h2>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs text-[#8E96AA]">ASSIGNED VECTOR</div>
                <div className="text-sm font-bold text-[#FF5500]">
                  {customAngle}° • {selectedZone.code}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Interactive SVG Compass */}
              <div className="md:col-span-7 flex justify-center">
                <div className="relative w-[320px] h-[320px] sm:w-[340px] sm:h-[340px] rounded-2xl studio-recessed flex items-center justify-center p-2">
                  <svg viewBox="0 0 340 340" className="w-full h-full overflow-visible">
                    <defs>
                      <radialGradient id="calSweetSpot" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#FF5500" stopOpacity="0.22" />
                        <stop offset="65%" stopColor="#00F0FF" stopOpacity="0.06" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Background radial glow */}
                    <circle cx="170" cy="170" r="145" fill="url(#calSweetSpot)" />

                    {/* Concentric Distance Rings */}
                    <circle
                      cx="170"
                      cy="170"
                      r="55"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx="170"
                      cy="170"
                      r="112"
                      fill="none"
                      stroke="rgba(0,240,255,0.22)"
                      strokeWidth="1.2"
                    />
                    <circle
                      cx="170"
                      cy="170"
                      r="148"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                    />

                    {/* Crosshairs */}
                    <line
                      x1="170"
                      y1="15"
                      x2="170"
                      y2="325"
                      stroke="rgba(255,255,255,0.06)"
                    />
                    <line
                      x1="15"
                      y1="170"
                      x2="325"
                      y2="170"
                      stroke="rgba(255,255,255,0.06)"
                    />

                    {/* Compass Degree Labels */}
                    <text
                      x="170"
                      y="16"
                      textAnchor="middle"
                      className="fill-[#8E96AA] text-[9px] font-mono"
                    >
                      0° FRONT STAGE
                    </text>
                    <text
                      x="170"
                      y="334"
                      textAnchor="middle"
                      className="fill-[#8E96AA] text-[9px] font-mono"
                    >
                      180° REAR WALL
                    </text>

                    {/* Other Connected Peers (Ghost Preview) */}
                    {peers.slice(0, 5).map((peer) => {
                      const pos = polarToCartesian(peer.angleDeg, 112);
                      return (
                        <g key={peer.id} opacity="0.45">
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r="5"
                            fill="#00F0FF"
                          />
                        </g>
                      );
                    })}

                    {/* Clickable Speaker Zone Nodes */}
                    {SPEAKER_ZONES.map((zone) => {
                      const pos = polarToCartesian(zone.angleDeg, 112);
                      const isSelected = selectedZone.id === zone.id;
                      return (
                        <g
                          key={zone.id}
                          onClick={() => handleSelectZone(zone)}
                          className="cursor-pointer group"
                        >
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={isSelected ? 18 : 13}
                            fill={isSelected ? '#FF5500' : '#12151E'}
                            stroke={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.25)'}
                            strokeWidth={isSelected ? 2 : 1}
                          />
                          <text
                            x={pos.x}
                            y={pos.y + 3}
                            textAnchor="middle"
                            className={`text-[8px] font-mono font-bold select-none ${
                              isSelected ? 'fill-[#090A0F]' : 'fill-[#F3F5F8]'
                            }`}
                          >
                            {zone.code.split(' ')[0]}
                          </text>
                        </g>
                      );
                    })}

                    {/* Acoustic Vector Line from Active Node to Listener Center */}
                    <line
                      x1="170"
                      y1="170"
                      x2={activeNodeCoords.x}
                      y2={activeNodeCoords.y}
                      stroke="#FF5500"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />

                    {/* Central Listener Head Icon */}
                    <circle
                      cx="170"
                      cy="170"
                      r="22"
                      fill="#12151E"
                      stroke="#00F0FF"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M163 166 C163 160, 177 160, 177 166"
                      stroke="#00F0FF"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <circle cx="170" cy="172" r="5" fill="#F3F5F8" />
                    <text
                      x="170"
                      y="204"
                      textAnchor="middle"
                      className="fill-[#00F0FF] text-[8px] font-mono font-bold"
                    >
                      SWEET SPOT
                    </text>
                  </svg>
                </div>
              </div>

              {/* Right Side of Card: Quick Channel Presets */}
              <div className="md:col-span-5 space-y-2">
                <div className="text-[11px] font-mono uppercase text-[#8E96AA] mb-2">
                  CLICK CHANNEL SLOT TO ASSIGN:
                </div>
                <div className="space-y-1.5 max-h-[290px] overflow-y-auto pr-1">
                  {SPEAKER_ZONES.map((zone) => {
                    const active = selectedZone.id === zone.id;
                    return (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => handleSelectZone(zone)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                          active
                            ? 'bg-[#FF5500]/15 border-[#FF5500] text-[#F3F5F8]'
                            : 'bg-[#07080C] border-white/[0.06] text-[#8E96AA] hover:text-white hover:border-white/15'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-mono font-bold text-[#F3F5F8]">
                            {zone.label}
                          </div>
                          <div className="text-[10px] font-mono text-[#8E96AA]">
                            Azimuth {zone.angleDeg}°
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            active
                              ? 'bg-[#FF5500] text-[#090A0F]'
                              : 'bg-white/[0.06] text-[#8E96AA]'
                          }`}
                        >
                          {zone.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Fine Azimuth Angle Slider */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-[#8E96AA]">CUSTOM AZIMUTH FINE-TUNE</span>
                  <span className="text-[#00F0FF] font-bold">{customAngle}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={359}
                  value={customAngle}
                  onChange={(e) => setCustomAngle(Number(e.target.value))}
                  className="w-full dsp-slider"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  spatialAudio.playCalibrationChirp(
                    Math.sin((customAngle * Math.PI) / 180)
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/40 text-xs font-mono font-bold text-[#00F0FF] transition-colors shrink-0 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>TEST SPEAKER CHIRP</span>
              </button>
            </div>
          </div>

          {/* RIGHT 5 COLS: CLOCK SYNC TELEMETRY & HANDSHAKE */}
          <div className="lg:col-span-5 studio-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#10B981] block">
                  STEP 2 // PHASE ALIGNMENT
                </span>
                <h2 className="font-display font-bold text-lg text-[#F3F5F8]">
                  NTP CLOCK & BUFFER LOCK
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[11px] font-mono font-bold text-[#10B981] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isSweeping ? 'ALIGNING...' : 'LOCKED'}
              </span>
            </div>

            {/* Telemetry Readout Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl studio-recessed">
                <div className="text-[10px] font-mono text-[#8E96AA] flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span>CLOCK DRIFT OFFSET</span>
                </div>
                <div className="font-mono font-bold text-xl text-[#F3F5F8] mt-1">
                  ±0.38 <span className="text-xs text-[#10B981]">ms</span>
                </div>
                <div className="text-[10px] font-mono text-[#8E96AA] mt-0.5">
                  Sub-sample accuracy achieved
                </div>
              </div>

              <div className="p-3.5 rounded-xl studio-recessed">
                <div className="text-[10px] font-mono text-[#8E96AA] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span>PHASE CORRELATION</span>
                </div>
                <div className="font-mono font-bold text-xl text-[#F3F5F8] mt-1">
                  {phaseCorrelation}% <span className="text-xs text-[#00F0FF]">COHERENT</span>
                </div>
                <div className="text-[10px] font-mono text-[#8E96AA] mt-0.5">
                  Zero comb-filtering echo
                </div>
              </div>
            </div>

            {/* Visual Phase Alignment Bars */}
            <div className="p-4 rounded-xl studio-recessed space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8E96AA]">ACOUSTIC IMPULSE ALIGNMENT</span>
                <span className="text-[#10B981]">{sweepProgress}% VERIFIED</span>
              </div>

              <div className="h-14 flex items-end gap-1 pt-2">
                {Array.from({ length: 28 }).map((_, idx) => {
                  const activeBar = (idx / 28) * 100 <= sweepProgress;
                  const heightPct =
                    30 + Math.abs(Math.sin(idx * 0.45) * 55) + (idx % 3 === 0 ? 12 : 0);
                  return (
                    <div
                      key={idx}
                      className="flex-1 rounded-t transition-all duration-150"
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: activeBar
                          ? idx % 4 === 0
                            ? '#00F0FF'
                            : '#10B981'
                          : 'rgba(255,255,255,0.08)',
                      }}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={triggerAcousticSweep}
                className="w-full py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-[#F3F5F8] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSweeping ? 'animate-spin text-[#00F0FF]' : ''}`} />
                <span>RE-RUN 3-CHANNEL ACOUSTIC PHASE SWEEP</span>
              </button>
            </div>

            {/* Hardware Output Latency Compensation */}
            <div className="p-4 rounded-xl bg-[#07080C] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8E96AA] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span>LOCAL DAC / SPEAKER OFFSET</span>
                </span>
                <span className="text-[#F3F5F8] font-bold">
                  {hwBufferOffsetMs > 0 ? `+${hwBufferOffsetMs}` : hwBufferOffsetMs} ms
                </span>
              </div>
              <input
                type="range"
                min={-15}
                max={15}
                step={0.5}
                value={hwBufferOffsetMs}
                onChange={(e) => setHwBufferOffsetMs(Number(e.target.value))}
                className="w-full dsp-slider"
              />
              <p className="text-[11px] text-[#8E96AA]">
                Keep at <strong className="text-white">0ms</strong> for built-in phone/laptop speakers. Adjust only if routing to an external Bluetooth speaker.
              </p>
            </div>

            {/* Summary & Primary CTA */}
            <div className="pt-2 space-y-3">
              <div className="p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/25 flex items-center gap-2.5 text-xs text-[#D5DAE5]">
                <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>
                  Synced to <strong className="text-white">{roomName}</strong> ({roomCode.slice(0, 3)}-{roomCode.slice(3)}) as{' '}
                  <strong className="text-[#00F0FF]">{selectedZone.code}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleConfirmAndEnterStudio}
                className="w-full py-3.5 px-5 rounded-xl bg-[#FF5500] hover:bg-[#FF6922] text-[#090A0F] font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,85,0,0.4)] transition-all cursor-pointer"
              >
                <span>LAUNCH LIVE SPATIAL STUDIO (PAGE 03)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
