import { cookies } from "next/headers"
import { db } from "@/lib/db"

/**
 * Get user from session in server actions
 * 
 * This is a workaround for Next.js 13 canary where getServerSession
 * doesn't work in server actions (tries to access headers() which requires
 * requestAsyncStorage not available in actions).
 * 
 * Instead, we directly read the session cookie and look up the session.
 */
export async function getUserForAction() {
  try {
    const cookieStore = cookies()
    
    // NextAuth stores session token in this cookie
    // The cookie name might be different if you customized it in NextAuth config
    const sessionToken = 
      cookieStore.get("next-auth.session-token")?.value ||
      cookieStore.get("__Secure-next-auth.session-token")?.value

    if (!sessionToken) {
      return null
    }

    // Look up the session in the database
    const session = await db.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    })

    if (!session || session.expires < new Date()) {
      return null
    }

    return session.user
  } catch (error) {
    console.error("[auth-action] Error getting user:", error)
    return null
  }
}
