// Middleware disabled - using database sessions which don't work with middleware
// Auth is handled in each page with getCurrentUser() and redirect()
// See: lib/session.ts and individual dashboard pages

export const config = {
  matcher: [],
}
