// lib/auth.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import type { NextAuthOptions } from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import EmailProvider from "next-auth/providers/email"
import { Client as PostmarkClient } from "postmark"

import { env } from "@/env.mjs"
import { siteConfig } from "@/config/site"
import { db } from "@/lib/db"

const postmarkClient = env.POSTMARK_API_TOKEN
  ? new PostmarkClient(env.POSTMARK_API_TOKEN)
  : null

export const authOptions: NextAuthOptions = {
  // Temporary `any` cast for Prisma adapter issue:
  // https://github.com/prisma/prisma/issues/16117
  adapter: PrismaAdapter(db as any),

  session: { strategy: "database" },

  pages: {
    signIn: "/login",
  },

  providers: [
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),

    ...(postmarkClient
      ? [
          EmailProvider({
            from: env.SMTP_FROM,
            sendVerificationRequest: async ({ identifier, url, provider }) => {
              const user = await db.user.findUnique({
                where: { email: identifier },
                select: { emailVerified: true },
              })

              const templateId = user?.emailVerified
                ? env.POSTMARK_SIGN_IN_TEMPLATE
                : env.POSTMARK_ACTIVATION_TEMPLATE

              if (!templateId) {
                throw new Error("Missing Postmark template id")
              }

              const result = await postmarkClient.sendEmailWithTemplate({
                TemplateId: parseInt(templateId, 10),
                To: identifier,
                From: provider.from as string,
                TemplateModel: {
                  action_url: url,
                  product_name: siteConfig.name,
                },
                Headers: [
                  {
                    Name: "X-Entity-Ref-ID",
                    Value: String(Date.now()),
                  },
                ],
              })

              if (result.ErrorCode) {
                throw new Error(result.Message)
              }
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id
        session.user.name = user.name
        session.user.email = user.email
        session.user.image = user.image
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        ;(token as any).id = (user as any).id
        token.name = user.name ?? token.name
        token.email = user.email ?? token.email
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
}
