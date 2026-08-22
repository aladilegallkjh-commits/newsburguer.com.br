// Vercel Serverless Function entrypoint
// This imports the Express app and lets Vercel run it as a Serverless Function
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Load OAuth and storage proxy
import("../server/_core/oauth").then(({ registerOAuthRoutes }) => {
  registerOAuthRoutes(app);
});
import("../server/_core/storageProxy").then(({ registerStorageProxy }) => {
  registerStorageProxy(app);
});

// REST endpoint for image update
app.post("/api/menu/:id/image", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { imageUrl } = req.body;
    if (!id || !imageUrl) {
      return res.status(400).json({ error: "id and imageUrl are required" });
    }
    const { updateMenuItem } = await import("../server/db");
    await updateMenuItem(id, { imageUrl } as any);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Debug endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    const { getDb } = await import("../server/db");
    const { adminUsers } = await import("../drizzle/schema");
    const db = await getDb();
    if (!db) {
      return res.json({ error: "Database not available", url: process.env.DATABASE_URL, token: !!process.env.DATABASE_AUTH_TOKEN });
    }
    const result = await db.select().from(adminUsers);
    return res.json({ success: true, count: result.length, url: process.env.DATABASE_URL, token: !!process.env.DATABASE_AUTH_TOKEN });
  } catch (error: any) {
    return res.json({ error: error.message, url: process.env.DATABASE_URL, token: !!process.env.DATABASE_AUTH_TOKEN });
  }
});

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
