import { Server, Zap, Globe, Rocket, Layers, Leaf, Gem, Wind, Hexagon } from 'lucide-react'

/**
 * AllowOrigin — Framework Icons
 * Single source of truth mapping each framework id to a monoline
 * Lucide icon. Deliberately abstract/generic rather than brand
 * logos — keeps the picker visually consistent (Apple SF-Symbols
 * style) and avoids any trademark reproduction concerns.
 */
const ICON_MAP = {
  express: Server,
  fastify: Zap,
  nginx:   Globe,
  fastapi: Rocket,
  django:  Layers,
  spring:  Leaf,
  laravel: Gem,
  gin:     Wind,
  aspnet:  Hexagon,
}

export default function FrameworkIcon({ id, size = 18 }) {
  const Icon = ICON_MAP[id] ?? Server
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" />
}
