// Utility functions for cinema scenes

export type ThemeColors = {
  floor: string
  wall: string
  seatDefault: string
  seatOccupied: string
  seatSelected: string
}

export function getThemeColors(theme?: string): ThemeColors {
  switch (theme) {
    case "luxury":
      return {
        floor: "#1a1a2e",
        wall: "#16213e",
        seatDefault: "#8b0000",
        seatOccupied: "#f97316",
        seatSelected: "#ef4444",
      }
    case "retro":
      return {
        floor: "#2d2d2d",
        wall: "#4a4a4a",
        seatDefault: "#b8860b",
        seatOccupied: "#f97316",
        seatSelected: "#ef4444",
      }
    case "modern":
      return {
        floor: "#0f0f0f",
        wall: "#1f1f1f",
        seatDefault: "#3b82f6",
        seatOccupied: "#f97316",
        seatSelected: "#ef4444",
      }
    default:
      return {
        floor: "#1a1a1a",
        wall: "#2a2a2a",
        seatDefault: "#4a4a4a",
        seatOccupied: "#f97316",
        seatSelected: "#ef4444",
      }
  }
}

export function generateSeatPosition(
  rowNumber: number,
  seatNumber: number,
  seatsPerRow: number,
): [number, number, number] {
  const seatWidth = 1.4
  const rowSpacing = 2.5

  // Centrer les sièges horizontalement
  const totalRowWidth = seatsPerRow * seatWidth
  const startX = -totalRowWidth / 2 + seatWidth / 2

  const x = startX + (seatNumber - 1) * seatWidth
  const y = 0.4 // Hauteur des sièges
  const z = 5 + (rowNumber - 1) * rowSpacing // Sièges face à l'écran (Z négatif = écran)

  return [x, y, z]
}

export function getVideoType(url: string): "mp4" | "m3u8" | "iframe" {
  const lowerUrl = url.toLowerCase()

  // Fichiers MP4 directs ou PHP qui streament du MP4
  if (
    lowerUrl.endsWith(".mp4") ||
    lowerUrl.endsWith(".webm") ||
    lowerUrl.endsWith(".ogg") ||
    lowerUrl.includes(".php") ||
    lowerUrl.includes("video/mp4")
  ) {
    return "mp4"
  }

  // Streams HLS
  if (lowerUrl.endsWith(".m3u8") || lowerUrl.includes("m3u8")) {
    return "m3u8"
  }

  // Tout le reste est traité comme iframe
  return "iframe"
}
