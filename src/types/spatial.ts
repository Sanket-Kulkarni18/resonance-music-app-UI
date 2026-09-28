export type SpatialModeId = 'stereo' | '8d' | '16d' | 'atmos';

export type AppPageId = 'portal' | 'calibration' | 'studio';

export type UserRole = 'host' | 'peer';

export interface SpatialModeConfig {
  id: SpatialModeId;
  code: string;
  name: string;
  subtitle: string;
  badge: string;
  accentColor: string;
  channelCount: string;
  description: string;
  technicalSpec: string;
  defaultOrbitSpeed: number; // Hz
  defaultRoomDecay: number;  // %
  defaultLfeGain: number;    // dB
  defaultElevation: number;  // deg
}

export interface PeerNode {
  id: string;
  name: string;
  deviceModel: string;
  deviceType: 'laptop' | 'phone' | 'tablet' | 'speaker';
  role: 'HOST' | 'PEER';
  channelLabel: string; // e.g., 'MASTER C', 'FL CH', 'FR CH', 'SL CH', 'SR CH', 'TFL HEIGHT'
  angleDeg: number;     // 0 is Front Center, 90 is Right, 180 is Rear, 270 is Left
  distanceRing: number; // 0.35 to 0.92 normalized radius
  latencyMs: number;
  jitterMs: number;
  syncLocked: boolean;
  batteryPct: number;
  isMuted?: boolean;
  isSolo?: boolean;
}

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationSec: number;
  bpm: number;
  keySignature: string;
  formatBadge: string;
  recommendedMode: SpatialModeId;
  waveformPeaks: number[];
  notes: string[]; // frequencies in Hz for live WebAudio preview synth
}

export interface PresetRoom {
  code: string;
  roomName: string;
  hostName: string;
  hostDevice: string;
  activeMode: SpatialModeId;
  peerCount: number;
  currentTrackTitle: string;
  currentArtist: string;
  avgPingMs: number;
}
