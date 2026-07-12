import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // DEBUG ENDPOINT
  app.get("/api/test-db", async (req, res) => {
    try {
      const { getDb } = await import("../db");
      const { adminUsers } = await import("../../drizzle/schema");
      const db = await getDb();
      if (!db) {
        return res.json({ error: "Database not available", url: process.env.DATABASE_URL, token: !!process.env.DATABASE_AUTH_TOKEN });
      }
      const result = await db.select().from(adminUsers);
      return res.json({ success: true, count: result.length, url: process.env.DATABASE_URL, token: !!process.env.DATABASE_AUTH_TOKEN });
    } catch (error: any) {
      return res.json({ 
        error: error.message, 
        cause: error.cause?.message || error.cause,
        code: error.code,
        url: process.env.DATABASE_URL, 
        token: !!process.env.DATABASE_AUTH_TOKEN 
      });
    }
  });

  // TEMPORARY: Fix customer names endpoint
  app.get("/api/fix-names", async (req, res) => {
    try {
      const { getDb } = await import("../db");
      const { customers, orders, customerRankings } = await import("../../drizzle/schema");
      const { eq, desc, sql, and } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) return res.json({ error: "DB not available" });

      const fixed: string[] = [];
      const allCustomers = await db.select().from(customers);

      for (const customer of allCustomers) {
        if (customer.name === 'Cliente' || !customer.name) {
          const latestOrders = await db
            .select({ customerName: orders.customerName })
            .from(orders)
            .where(eq(orders.customerPhone, customer.phone))
            .orderBy(desc(orders.createdAt))
            .limit(1);

          if (latestOrders.length > 0 && latestOrders[0].customerName) {
            const realName = latestOrders[0].customerName;
            await db.update(customers).set({ name: realName }).where(eq(customers.id, customer.id));
            fixed.push(`${customer.phone} → ${realName}`);
          }
        }
      }

      // Recalculate rankings
      await db.delete(customerRankings);
      const top = await db.execute(
        sql`SELECT c.id as customerId, c.phone, c.name, COUNT(o.id) as orderCount, SUM(o.finalAmount) as totalSpent
            FROM customers c
            LEFT JOIN orders o ON o.customerPhone = c.phone AND o.status != 'cancelled'
            GROUP BY c.id
            ORDER BY COUNT(o.id) DESC, SUM(o.finalAmount) DESC
            LIMIT 5`
      );

      for (let i = 0; i < top.rows.length; i++) {
        const c = top.rows[i] as any;
        await db.insert(customerRankings).values({ customerId: c.customerId, period: 'week' as any, position: i + 1, orderCount: c.orderCount || 0, totalSpent: parseFloat(c.totalSpent || '0'), prizeWon: (i === 0 ? 'hamburger_kids' : 'none') as any });
        await db.insert(customerRankings).values({ customerId: c.customerId, period: 'month' as any, position: i + 1, orderCount: c.orderCount || 0, totalSpent: parseFloat(c.totalSpent || '0'), prizeWon: (i === 0 ? 'combo_free' : 'none') as any });
      }

      return res.json({ success: true, fixed, ranking: top.rows });
    } catch (error: any) {
      return res.json({ error: error.message });
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
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
