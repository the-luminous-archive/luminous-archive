import { PrismaClient } from "@prisma/client"
import { config } from "dotenv"
import { resolve } from "path"

// Load .env.local
config({ path: resolve(__dirname, "../.env.local") })

// ============================================================================
// SAFETY GUARDS
// ============================================================================

function checkEnvironmentSafety(): void {
  const appEnv = process.env.APP_ENV
  const nodeEnv = process.env.NODE_ENV
  const databaseUrl = process.env.DATABASE_URL || ""

  console.log("🔍 Environment check:")
  console.log(`   APP_ENV: ${appEnv}`)
  console.log(`   NODE_ENV: ${nodeEnv}`)
  console.log(`   DATABASE_URL: ${databaseUrl.substring(0, 50)}...`)

  // Abort if production environment
  if (nodeEnv === "production") {
    console.error("❌ ABORT: NODE_ENV=production. Seed is for local/dev only.")
    process.exit(1)
  }

  // Require APP_ENV=local
  if (appEnv !== "local") {
    console.error(
      `❌ ABORT: APP_ENV must be 'local' (got '${appEnv}'). Seed is for local/dev only.`
    )
    process.exit(1)
  }

  // Check DATABASE_URL for production-like hosts
  const urlLower = databaseUrl.toLowerCase()
  const prodPatterns = [
    "vercel.app",
    "railway.app",
    "render.com",
    "fly.io",
    "heroku",
  ]

  // Allow dev/preview branches from Neon (common pattern)
  const isNeonPreview = urlLower.includes("neon.tech")
  const isLocalhost = urlLower.includes("localhost") || urlLower.includes("127.0.0.1")

  if (!isLocalhost && !isNeonPreview) {
    for (const pattern of prodPatterns) {
      if (urlLower.includes(pattern)) {
        console.error(
          `❌ ABORT: DATABASE_URL contains '${pattern}'. This appears to be a production host.`
        )
        process.exit(1)
      }
    }
  }

  console.log("✅ Environment check passed. Proceeding with seed.\n")
}

// ============================================================================
// DETERMINISTIC RNG (for stable dates/flags)
// ============================================================================

class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
}

const rng = new SeededRandom(42)

// ============================================================================
// SAMPLE STORIES DATA
// ============================================================================

type StoryData = {
  title: string
  experienceType: "NDE" | "psychedelic"
  substance?: string
  layer: "Personal" | "Species" | "Archetypal" | "Causal" | "Diamond Luminosity"
  motifs: string[]
  feelings: string[]
  dose?: string
  published: boolean
  daysAgo: number
}

const SAMPLE_STORIES: StoryData[] = [
  // NDEs (5)
  {
    title: "A Gentle Descent into Light",
    experienceType: "NDE",
    layer: "Personal",
    motifs: ["light", "tunnel", "peace"],
    feelings: ["peace", "comfort", "safety"],
    published: true,
    daysAgo: 45,
  },
  {
    title: "Hearing Every Heartbeat of the Living",
    experienceType: "NDE",
    layer: "Species",
    motifs: ["connection", "web", "ancestors"],
    feelings: ["unity", "belonging", "awe"],
    published: true,
    daysAgo: 78,
  },
  {
    title: "The Library of All That Was",
    experienceType: "NDE",
    layer: "Archetypal",
    motifs: ["library", "symbols", "teacher"],
    feelings: ["wonder", "understanding", "gratitude"],
    published: true,
    daysAgo: 102,
  },
  {
    title: "Before the First Breath",
    experienceType: "NDE",
    layer: "Causal",
    motifs: ["void", "origin", "stillness"],
    feelings: ["tranquility", "timelessness", "presence"],
    published: false,
    daysAgo: 23,
  },
  {
    title: "Where Light Becomes Itself",
    experienceType: "NDE",
    layer: "Diamond Luminosity",
    motifs: ["radiance", "infinite", "dissolution"],
    feelings: ["bliss", "transcendence", "oneness"],
    published: true,
    daysAgo: 67,
  },
  // Psilocybin (2)
  {
    title: "Listening to the Golden Hum",
    experienceType: "psychedelic",
    substance: "psilocybin",
    dose: "3.5g dried",
    layer: "Archetypal",
    motifs: ["music", "geometry", "teacher"],
    feelings: ["awe", "gratitude", "humility"],
    published: true,
    daysAgo: 12,
  },
  {
    title: "My Body as Ancient Earth",
    experienceType: "psychedelic",
    substance: "psilocybin",
    dose: "2g dried",
    layer: "Personal",
    motifs: ["body", "roots", "healing"],
    feelings: ["tenderness", "acceptance", "release"],
    published: true,
    daysAgo: 34,
  },
  // LSD (2)
  {
    title: "The Room of Quiet Stars",
    experienceType: "psychedelic",
    substance: "LSD",
    dose: "150 µg",
    layer: "Species",
    motifs: ["cosmos", "evolution", "web"],
    feelings: ["wonder", "curiosity", "connection"],
    published: true,
    daysAgo: 56,
  },
  {
    title: "Dancing with the Archetype",
    experienceType: "psychedelic",
    substance: "LSD",
    dose: "200 µg",
    layer: "Archetypal",
    motifs: ["dance", "symbols", "play"],
    feelings: ["joy", "freedom", "insight"],
    published: false,
    daysAgo: 8,
  },
  // DMT/Ayahuasca (2)
  {
    title: "Under the Canopy, a Door",
    experienceType: "psychedelic",
    substance: "ayahuasca",
    dose: "ceremonial brew",
    layer: "Causal",
    motifs: ["jungle", "serpent", "door"],
    feelings: ["awe", "fear", "transformation"],
    published: true,
    daysAgo: 89,
  },
  {
    title: "The Weaver Behind the Weave",
    experienceType: "psychedelic",
    substance: "DMT",
    dose: "breakthrough",
    layer: "Archetypal",
    motifs: ["entities", "patterns", "communication"],
    feelings: ["astonishment", "disorientation", "clarity"],
    published: true,
    daysAgo: 41,
  },
  // 5-MeO-DMT (1)
  {
    title: "Petals in the Dark, Opening",
    experienceType: "psychedelic",
    substance: "5-MeO-DMT",
    dose: "10mg vaporized",
    layer: "Diamond Luminosity",
    motifs: ["dissolution", "light", "infinite"],
    feelings: ["bliss", "surrender", "unity"],
    published: true,
    daysAgo: 15,
  },
  // Mescaline (1)
  {
    title: "A Bridge of Breath",
    experienceType: "psychedelic",
    substance: "mescaline",
    dose: "300mg",
    layer: "Species",
    motifs: ["desert", "ancestors", "earth"],
    feelings: ["reverence", "connection", "peace"],
    published: false,
    daysAgo: 28,
  },
  // MDMA (1)
  {
    title: "Echoes in the Heartfield",
    experienceType: "psychedelic",
    substance: "MDMA",
    dose: "120mg",
    layer: "Personal",
    motifs: ["heart", "forgiveness", "embrace"],
    feelings: ["love", "compassion", "openness"],
    published: true,
    daysAgo: 19,
  },
  // Ketamine (1)
  {
    title: "Between Ridges of Time",
    experienceType: "psychedelic",
    substance: "ketamine",
    dose: "80mg IM",
    layer: "Causal",
    motifs: ["void", "layers", "threshold"],
    feelings: ["curiosity", "disorientation", "insight"],
    published: false,
    daysAgo: 6,
  },
]

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  checkEnvironmentSafety()

  const prisma = new PrismaClient()

  try {
    console.log("📝 Starting seed transaction...\n")

    await prisma.$transaction(async (tx) => {
      // 1. Upsert seed author
      const author = await tx.user.upsert({
        where: { email: "seed@example.com" },
        update: {},
        create: {
          email: "seed@example.com",
          name: "Seed Author",
          emailVerified: new Date(),
        },
      })

      console.log(`✅ Seed author: ${author.name} (${author.email})`)

      // 2. Upsert stories
      let createdCount = 0
      let updatedCount = 0

      for (const story of SAMPLE_STORIES) {
        const createdAt = new Date()
        createdAt.setDate(createdAt.getDate() - story.daysAgo)

        // Encode metadata in content JSON
        const content = {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "Experience Details" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `Type: ${story.experienceType}`,
                },
              ],
            },
            ...(story.substance
              ? [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: `Substance: ${story.substance}`,
                      },
                    ],
                  },
                ]
              : []),
            ...(story.dose
              ? [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: `Dose: ${story.dose}`,
                      },
                    ],
                  },
                ]
              : []),
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `Layer: ${story.layer}`,
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `Motifs: ${story.motifs.join(", ")}`,
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `Feelings: ${story.feelings.join(", ")}`,
                },
              ],
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "Narrative" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "This is a seed story generated for development purposes. In a real archive, this would contain the contributor's first-person narrative of their visionary experience.",
                },
              ],
            },
          ],
        }

        const result = await tx.post.upsert({
          where: {
            id: `seed-${story.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          },
          update: {
            title: story.title,
            content: content,
            published: story.published,
            createdAt: createdAt,
            updatedAt: new Date(),
          },
          create: {
            id: `seed-${story.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            title: story.title,
            content: content,
            published: story.published,
            authorId: author.id,
            createdAt: createdAt,
            updatedAt: new Date(),
          },
        })

        const action = result.updatedAt > result.createdAt ? "updated" : "created"
        if (action === "created") createdCount++
        else updatedCount++

        const publishStatus = story.published ? "📘 published" : "📄 draft"
        console.log(
          `   ${action === "created" ? "✨" : "🔄"} ${story.title} (${publishStatus}, ${story.layer})`
        )
      }

      console.log(
        `\n📊 Summary: ${createdCount} created, ${updatedCount} updated, ${SAMPLE_STORIES.length} total`
      )
    })

    console.log("\n✅ Seed completed successfully!")
  } catch (error) {
    console.error("\n❌ Seed failed:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// ============================================================================
// RUN
// ============================================================================

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
