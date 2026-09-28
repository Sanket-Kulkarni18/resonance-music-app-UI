import React from 'react';
import {
  Radio,
  Compass,
  Sliders,
  Sparkles,
  ShieldCheck,
  Crown,
  Smartphone,
  Layers,
  X,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { AppPageId, SpatialModeId, UserRole } from '../types/spatial';
import { SPATIAL_MODES } from '../data/mockSession';

interface TopArchitectureBarProps {
  activePage: AppPageId;
  setActivePage: (page: AppPageId) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  roomCode: string;
  roomName: string;
  activeMode: SpatialModeId;
  peerCount: number;
  showBlueprintModal: boolean;
  setShowBlueprintModal: (show: boolean) => void;
}

export const TopArchitectureBar: React.FC<TopArchitectureBarProps> = ({
  activePage,
  setActivePage,
  userRole,
  setUserRole,
  roomCode,
  roomName,
  activeMode,
  peerCount,
  showBlueprintModal,
  setShowBlueprintModal,
}) => {
  const modeConfig = SPATIAL_MODES[activeMode];
  const formattedCode = `${roomCode.slice(0, 3)}-${roomCode.slice(3, 6)}`;

  const pages: {
    id: AppPageId;
    step: string;
    label: string;
    sub: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'portal',
      step: '01',
      label: 'ROOM PORTAL',
      sub: 'Host or Enter Code',
      icon: <Radio className="w-3.5 h-3.5" />,
    },
    {
      id: 'calibration',
      step: '02',
      label: 'SYNC CALIBRATION',
      sub: 'Clock & Speaker Angle',
      icon: <Compass className="w-3.5 h-3.5" />,
    },
    {
      id: 'studio',
      step: '03',
      label: 'LIVE SPATIAL STUDIO',
      sub: '360° Radar & Transport',
      icon: <Sliders className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#090A0F]/90 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setActivePage('portal')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-[#12151E] border border-white/15 flex items-center justify-center relative overflow-hidden group-hover:border-[#FF5500]/60 transition-colors">
                <div
                  className="absolute inset-0 opacity-25"
                  style={{
                    background: `radial-gradient(circle at center, ${modeConfig.accentColor}, transparent 70%)`,
                  }}
                />
                <Activity className="w-4 h-4 text-[#FF5500] relative z-10" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold tracking-wider text-sm text-[#F3F5F8]">
                    AETHER<span className="text-[#FF5500]">//</span>SYNC
                  </span>
                  <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-white/[0.06] text-[#8E96AA] border border-white/[0.06]">
                    UI PROTOTYPE v2.4
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#8E96AA] hidden sm:block truncate">
                  {roomName} • CODE <span className="text-[#00F0FF]">{formattedCode}</span>
                </p>
              </div>
            </button>
          </div>

          {/* Center: 3-Page Interactive Switcher */}
          <nav
            aria-label="UI Page Switcher"
            className="flex items-center p-1 rounded-xl bg-[#07080C] border border-white/[0.08] shadow-inner"
          >
            {pages.map((p, index) => {
              const isActive = activePage === p.id;
              return (
                <React.Fragment key={p.id}>
                  <button
                    onClick={() => setActivePage(p.id)}
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all duration-150 ${
                      isActive
                        ? 'bg-[#181D2A] text-[#F3F5F8] border border-white/15 shadow-[0_0_20px_rgba(255,85,0,0.18)]'
                        : 'text-[#8E96AA] hover:text-[#F3F5F8] hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-[#FF5500] text-[#090A0F] font-bold'
                          : 'bg-white/[0.06] text-[#8E96AA]'
                      }`}
                    >
                      {p.step}
                    </span>
                    <span className="hidden lg:inline-flex items-center gap-1.5 font-semibold tracking-wide">
                      {p.label}
                    </span>
                    <span className="lg:hidden font-semibold">{p.label.split(' ')[0]}</span>
                    <span className="hidden xl:inline text-[10px] font-mono text-[#8E96AA] border-l border-white/10 pl-2">
                      {p.sub}
                    </span>
                  </button>
                  {index < pages.length - 1 && (
                    <span className="text-white/15 px-1 hidden sm:inline font-mono text-xs">/</span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Right Controls: Perspective Switcher (Host vs Peer) & Design Guide */}
          <div className="flex items-center gap-2.5">
            {/* Host vs Peer Role Switcher */}
            <div className="hidden sm:flex items-center bg-[#07080C] p-1 rounded-lg border border-white/[0.08]">
              <button
                onClick={() => setUserRole('host')}
                title="Preview UI as the Room Host (Master Transport & DSP Controls unlocked)"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                  userRole === 'host'
                    ? 'bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/40 font-semibold'
                    : 'text-[#8E96AA] hover:text-[#F3F5F8]'
                }`}
              >
                <Crown className="w-3 h-3" />
                <span>HOST VIEW</span>
              </button>
              <button
                onClick={() => setUserRole('peer')}
                title="Preview UI as a Connected Peer Device (Receiver mode synced to Host)"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                  userRole === 'peer'
                    ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 font-semibold'
                    : 'text-[#8E96AA] hover:text-[#F3F5F8]'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>PEER VIEW</span>
              </button>
            </div>

            {/* Live Sync Status Pill */}
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#12151E] border border-white/[0.08] text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[#8E96AA]">NODES:</span>
              <span className="text-[#F3F5F8] font-semibold">{peerCount} SYNCED</span>
            </div>

            {/* UI Design Blueprint Guide Button */}
            <button
              onClick={() => setShowBlueprintModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-xs font-mono text-[#F3F5F8] transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span className="hidden md:inline">UI DESIGN GUIDE</span>
            </button>
          </div>
        </div>
      </header>

      {/* UI Architecture & Design Rationale Modal */}
      {showBlueprintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="studio-card max-w-3xl w-full rounded-2xl border border-white/15 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0C0E15]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#FF5500]" />
                <h2 className="font-display font-bold text-sm tracking-wider uppercase text-[#F3F5F8]">
                  HOW TO DESIGN A CONVINCING MULTI-DEVICE SPATIAL AUDIO UI
                </h2>
              </div>
              <button
                onClick={() => setShowBlueprintModal(false)}
                className="p-1.5 rounded-lg text-[#8E96AA] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-sm text-[#8E96AA]">
              <div className="p-4 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#F3F5F8]">
                <p className="font-semibold text-xs font-mono uppercase tracking-wider text-[#FF5500] mb-1">
                  KEY UX INSIGHT: WHY 3 PAGES INSTEAD OF 2?
                </p>
                <p className="text-xs leading-relaxed text-[#D5DAE5]">
                  When users join a room on multiple phones/laptops expecting synchronized{' '}
                  <strong className="text-white">8D, 16D, or Dolby Atmos Theatre</strong> playback, jumping straight from a{' '}
                  <em>Room Code Input</em> to a <em>Music Player</em> feels like a standard playlist-sharing app—not a synchronized acoustic array. Adding a 10-second{' '}
                  <strong className="text-[#00F0FF]">Page 02: Acoustic Calibration & Speaker Placement Bridge</strong> builds immediate psychological and physical trust.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#0C0E15] border border-white/10 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#FF5500]/20 text-[#FF5500] font-bold">
                      PAGE 01 // GATEWAY
                    </span>
                    <h3 className="font-display font-bold text-white mt-2 mb-1">
                      Room Portal (Host / Join)
                    </h3>
                    <p className="text-xs leading-relaxed">
                      Split hardware gateway. Left side lets the Host configure the default spatial profile (8D/16D/Atmos) before opening the room. Right side has a 6-digit segmented code receiver with live room preview before joining.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActivePage('portal');
                      setShowBlueprintModal(false);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-mono text-[#FF5500] hover:underline"
                  >
                    <span>Inspect Page 01</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#0C0E15] border border-[#00F0FF]/30 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#00F0FF]/20 text-[#00F0FF] font-bold">
                      PAGE 02 // THE TRUST BRIDGE
                    </span>
                    <h3 className="font-display font-bold text-white mt-2 mb-1">
                      Sync & Speaker Placement
                    </h3>
                    <p className="text-xs leading-relaxed">
                      Shows real-time NTP clock offset alignment (`±0.4ms`) and lets each peer assign where their device sits physically in the room (`Front Left`, `Rear Surround`, `Center`, etc.).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActivePage('calibration');
                      setShowBlueprintModal(false);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-mono text-[#00F0FF] hover:underline"
                  >
                    <span>Inspect Page 02</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#0C0E15] border border-white/10 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-bold">
                      PAGE 03 // MAIN COMMAND DECK
                    </span>
                    <h3 className="font-display font-bold text-white mt-2 mb-1">
                      Live 360° Spatial Studio
                    </h3>
                    <p className="text-xs leading-relaxed">
                      Replaces generic album art with an interactive 360° Soundstage Radar showing connected peers, orbiting 8D/16D trajectories, and Dolby Atmos 7.1.4 speaker beds alongside a phase-locked transport bar.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActivePage('studio');
                      setShowBlueprintModal(false);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-mono text-[#10B981] hover:underline"
                  >
                    <span>Inspect Page 03</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0C0E15] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase text-white">
                      TRY SWITCHING BETWEEN "HOST VIEW" AND "PEER VIEW" IN THE TOP BAR
                    </h4>
                    <p className="text-xs text-[#8E96AA] mt-0.5">
                      In Host View, you control the master playhead, track queue, and spatial mode for everyone. In Peer View, transport controls lock to the Host clock while letting the peer fine-tune their local speaker latency offset.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBlueprintModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#FF5500] text-[#090A0F] font-mono text-xs font-bold whitespace-nowrap hover:bg-[#FF6A22] transition-colors"
                >
                  EXPLORE LIVE UI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
