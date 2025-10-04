import NextAuth from "next-auth"

import { authOptions } from "@/lib/auth"

// Force Node runtime for Prisma compatibility
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// TEMP: Runtime diagnostics (remove after verification)
const url = process.env.DATABASE_URL || ''
const proto = url.split(':')[0]
console.log('[auth-route] DATABASE_URL protocol:', proto)
console.log('[auth-route] DATABASE_URL head:', url.slice(0, 80))
if (proto !== 'postgresql' && proto !== 'postgres') {
  throw new Error(`DATABASE_URL must be postgresql:// or postgres://. Got: ${proto}`)
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
