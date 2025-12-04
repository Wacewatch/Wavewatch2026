// Constants for the Interactive World

import { CollisionZone, WorldSettings } from './types'

// ========== SPAWN POSITIONS ==========
export const DEFAULT_SPAWN_POSITION = { x: 4.5, y: -0.35, z: -27 }
export const DEFAULT_ROTATION = 0 // Face buildings

// ========== DEFAULT AVATAR STYLE ==========
export const DEFAULT_AVATAR_STYLE = {
  bodyColor: "#3b82f6",
  headColor: "#fbbf24",
  hairStyle: "short",
  hairColor: "#1f2937",
  skinTone: "#fbbf24",
  accessory: "none",
  faceSmiley: "😊",
}

// ========== DEFAULT WORLD SETTINGS ==========
export const DEFAULT_WORLD_SETTINGS: WorldSettings = {
  maxCapacity: 100,
  worldMode: "day",
  voiceChatEnabled: false,
  playerInteractionsEnabled: true,
  showStatusBadges: true,
  enableChat: true,
  enableEmojis: true,
  enableJumping: true,
}

// ========== COLLISION ZONES ==========
// ID format: TYPE_NUMBER (ex: BLDG_1, TREE_1, LAMP_1, BUSH_1)
// Pour déplacer un élément, modifie les valeurs x et z correspondantes
// lowQuality: false = visible en toutes qualités, true = masqué en qualité basse
export const ALL_COLLISION_ZONES: CollisionZone[] = [
  // ========== BÂTIMENTS (toujours visibles) ==========
  { id: "BLDG_CINEMA", x: 15, z: 0, width: 9, depth: 9, label: "Cinéma", color: "#ef4444", lowQuality: false },
  { id: "BLDG_ARCADE", x: 0, z: 15, width: 10, depth: 10, label: "Arcade", color: "#8b5cf6", lowQuality: false },
  { id: "BLDG_STADIUM", x: 25, z: -15, width: 12, depth: 10, label: "Stade", color: "#22c55e", lowQuality: false },
  { id: "BLDG_DISCO", x: -15, z: -20, width: 10, depth: 8, label: "Discothèque", color: "#ec4899", lowQuality: false },
  // Bâtiments décoratifs (collision active mais pas d'interaction)
  { id: "BLDG_2", x: -15, z: 5, width: 5, depth: 4, label: "Bâtiment Bleu", color: "#0ea5e9", lowQuality: false },
  { id: "BLDG_3", x: -15, z: -8, width: 4, depth: 4, label: "Bâtiment Orange", color: "#f59e0b", lowQuality: false },

  // ========== ARBRES ==========
  // En mode low: seulement TREE_1 et TREE_4 sont visibles
  { id: "TREE_1", x: -24.1, z: -13.4, width: 2, depth: 2, label: "Arbre 1", color: "#166534", lowQuality: false },
  { id: "TREE_2", x: -8, z: -18, width: 2, depth: 2, label: "Arbre 2", color: "#166534", lowQuality: true },
  { id: "TREE_4", x: 15, z: -15, width: 2, depth: 2, label: "Arbre 4", color: "#166534", lowQuality: false },
  { id: "TREE_5", x: -18, z: 10, width: 2, depth: 2, label: "Arbre 5", color: "#166534", lowQuality: true },
  { id: "TREE_6", x: 18, z: 10, width: 2, depth: 2, label: "Arbre 6", color: "#166534", lowQuality: true },
  { id: "TREE_7", x: -10, z: 15, width: 2, depth: 2, label: "Arbre 7", color: "#166534", lowQuality: true },
  { id: "TREE_8", x: 10, z: 15, width: 2, depth: 2, label: "Arbre 8", color: "#166534", lowQuality: true },

  // ========== LAMPADAIRES ==========
  // En mode low: seulement le lampadaire central (z=-10) est visible, mais x=0 pas x=-20
  // Note: en mode low, le seul lampadaire est à position [0, -10] donc x=-20, z=-10
  { id: "LAMP_1", x: -20, z: -10, width: 1, depth: 1, label: "Lampadaire 1", color: "#fbbf24", lowQuality: false },
  { id: "LAMP_2", x: -20, z: 10, width: 1, depth: 1, label: "Lampadaire 2", color: "#fbbf24", lowQuality: true },

  // ========== BANCS (masqués en mode low) ==========
  { id: "BENCH_1", x: -18, z: -12, width: 2, depth: 1, label: "Banc 1", color: "#8b4513", lowQuality: true },
  { id: "BENCH_3", x: -18, z: 12, width: 2, depth: 1, label: "Banc 3", color: "#8b4513", lowQuality: true },

  // ========== FONTAINE (masquée en mode low) ==========
  { id: "FOUNTAIN_1", x: -15, z: 0, width: 6, depth: 6, label: "Fontaine", color: "#0ea5e9", lowQuality: true },

  // ========== BUISSONS (tous masqués en mode low) ==========
  { id: "BUSH_1", x: 5, z: -10, width: 2, depth: 2, label: "Buisson 1", color: "#4ade80", lowQuality: true },
  { id: "BUSH_2", x: -5, z: -10, width: 2, depth: 2, label: "Buisson 2", color: "#4ade80", lowQuality: true },
  { id: "BUSH_3", x: 10, z: 5, width: 2, depth: 2, label: "Buisson 3", color: "#4ade80", lowQuality: true },
  { id: "BUSH_4", x: -10, z: 5, width: 2, depth: 2, label: "Buisson 4", color: "#4ade80", lowQuality: true },
  { id: "BUSH_5", x: 12, z: -5, width: 2, depth: 2, label: "Buisson 5", color: "#4ade80", lowQuality: true },
  { id: "BUSH_6", x: -12, z: -5, width: 2, depth: 2, label: "Buisson 6", color: "#4ade80", lowQuality: true },
]

// ========== DISCO COLLISION ZONES ==========
export const DISCO_COLLISION_ZONES: CollisionZone[] = [
  // DJ booth (table centrale au fond)
  { x: 0, z: -12, width: 7, depth: 3 },
  // Bar area (côté droit)
  { x: 16, z: 5, width: 4, depth: 9 },
  // Enceintes gauche
  { x: -18, z: -10, width: 3, depth: 3 },
  // Enceintes droite
  { x: 18, z: -10, width: 3, depth: 3 },
  // Mur du fond (derrière les écrans)
  { x: 0, z: -17, width: 40, depth: 1 },
  // Mur gauche
  { x: -20, z: 0, width: 1, depth: 35 },
  // Mur droit
  { x: 20, z: 0, width: 1, depth: 35 },
]

// ========== TREE POSITIONS ==========
export const TREE_POSITIONS_LOW_QUALITY: [number, number][] = [
  [-24.1, -13.4],
  [15, -15],
]

export const TREE_POSITIONS_FULL: [number, number][] = [
  [-24.1, -13.4],
  [-8, -18],
  [15, -15],
  [-18, 10],
  [18, 10],
  [-10, 15],
  [10, 15],
]

// ========== LAMPPOST POSITIONS ==========
export const LAMPPOST_POSITIONS_LOW_QUALITY: [number, number][] = [
  [0, -10],
]

export const LAMPPOST_POSITIONS_FULL: [number, number][] = [
  [-10, -10],
  [0, -10],
  [10, -10],
  [-10, 10],
  [10, 10],
]

// ========== BENCH POSITIONS ==========
export const BENCH_POSITIONS: number[] = [-12, 12]

// ========== BUSH POSITIONS ==========
export const BUSH_POSITIONS: [number, number][] = [
  [5, -10],
  [-5, -10],
  [10, 5],
  [-10, 5],
  [12, -5],
  [-12, -5],
]

// ========== CHRISTMAS TREE POSITION ==========
export const CHRISTMAS_TREE_POSITION: [number, number, number] = [0, 0, -8]
export const CHRISTMAS_TREE_SCALE = 1.5

// ========== DISCO AUDIO DEFAULTS ==========
export const DEFAULT_DISCO_STREAM_URLS: string[] = [
  'https://stream.nightride.fm/nightride.m4a',
  'https://stream.nightride.fm/chillsynth.m4a',
  'https://ice1.somafm.com/groovesalad-128-mp3',
  'https://ice1.somafm.com/spacestation-128-mp3',
]
export const DEFAULT_DISCO_VOLUME = 70

// ========== QUICK EMOJIS ==========
export const QUICK_EMOJIS = ["😀", "😂", "😍", "🎉", "👍", "👋", "🔥", "💯"]

// ========== TIMING CONSTANTS ==========
export const CHAT_BUBBLE_DURATION = 5000 // 5 seconds
export const PLAYER_REFRESH_INTERVAL = 5000 // 5 seconds
export const HEARTBEAT_INTERVAL = 10000 // 10 seconds
export const AFK_TIMEOUT = 3 * 60 * 60 * 1000 // 3 hours in milliseconds
export const AFK_CHECK_INTERVAL = 60000 // 1 minute
export const DB_UPDATE_THROTTLE = 100 // 100ms minimum between DB updates

// ========== ANIMATION CONSTANTS ==========
export const WALK_ANIMATION_SPEED = 4
export const LEG_SWING_AMPLITUDE = 0.4
export const ARM_SWING_AMPLITUDE = 0.25
export const JUMP_HEIGHT = 2
export const JUMP_DURATION = 400 // ms

// ========== CAMERA CONSTANTS ==========
export const FPS_CAMERA_SENSITIVITY = 0.002
export const DEFAULT_CAMERA_DISTANCE = 15
export const MIN_CAMERA_DISTANCE = 5
export const MAX_CAMERA_DISTANCE = 30

// ========== MOVEMENT CONSTANTS ==========
export const PLAYER_SPEED = 0.15
export const MOBILE_JOYSTICK_SPEED_MULTIPLIER = 1

// ========== UI CONSTANTS ==========
export const NAMEPLATE_DISTANCE_FACTOR = 8
export const MAX_CHAT_MESSAGE_WIDTH = 200

// ========== GRAPHICS QUALITY SETTINGS ==========
export type GraphicsQuality = "low" | "medium" | "high"

export const getCollisionZonesForQuality = (quality: GraphicsQuality): CollisionZone[] => {
  if (quality === "low") {
    return ALL_COLLISION_ZONES.filter(zone => !zone.lowQuality)
  }
  return ALL_COLLISION_ZONES
}

export const getTreePositionsForQuality = (quality: GraphicsQuality): [number, number][] => {
  if (quality === "low") {
    return TREE_POSITIONS_LOW_QUALITY
  }
  return TREE_POSITIONS_FULL
}

export const getLamppostPositionsForQuality = (quality: GraphicsQuality): [number, number][] => {
  if (quality === "low") {
    return LAMPPOST_POSITIONS_LOW_QUALITY
  }
  return LAMPPOST_POSITIONS_FULL
}
