import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Fallback: check admin session cookie or headers for local admin authentication
  if (!user) {
    let adminEmail = '';
    const rawCookies = opts.req.headers.cookie || '';
    const cookieMap = new Map<string, string>(
      rawCookies.split(';').map(c => {
        const [k, ...v] = c.trim().split('=');
        return [k?.trim() ?? '', decodeURIComponent(v.join('=').trim())] as [string, string];
      })
    );
    adminEmail = cookieMap.get('admin_session') || '';

    // If cookie not present, check custom headers as a robust fallback
    if (!adminEmail) {
      const headerEmail = opts.req.headers['x-admin-email'];
      const headerToken = opts.req.headers['x-admin-token'];
      if (typeof headerEmail === 'string' && typeof headerToken === 'string' && headerToken.startsWith('logged_in_')) {
        adminEmail = headerEmail;
      }
    }

    if (adminEmail) {
      try {
        const admin = await db.getAdminByEmail(adminEmail);
        if (admin && admin.isActive) {
          user = {
            id: admin.id,
            openId: `admin-${admin.id}`,
            email: admin.email,
            name: admin.name,
            role: 'admin',
            loginMethod: 'local',
            lastSignedIn: admin.lastLoginAt || new Date(),
            createdAt: new Date(),
          } as unknown as User;
        }
      } catch (err) {
        // Ignore errors in admin auth check
      }
    }
  }


  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
