import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // Erreur explicite au premier accès BDD (runtime) plutôt qu'au chargement
    // du module — sinon le build Vercel plante (DATABASE_URL absente à la
    // collecte des pages).
    throw new Error("DATABASE_URL manquante — connexion à la base de données impossible.");
  }

  // Strip ?sslmode=... from the URL to avoid conflict with the explicit ssl option below.
  // When both are present, pg may give priority to sslmode=require and reject Supabase's cert.
  const connectionString = url
    .replace(/([?&])sslmode=[^&]*/g, "$1")
    .replace(/[?&]$/, "");

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Proxy paresseux : le vrai client n'est instancié qu'au premier accès à une
// propriété (ex: `prisma.user`). On évite ainsi toute lecture de DATABASE_URL
// au chargement du module — ce qui faisait planter le build Vercel.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = Reflect.get(client, prop);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default prisma;
