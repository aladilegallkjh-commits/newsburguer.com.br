import { getDb } from './db';
import { sql } from 'drizzle-orm';

export interface Rating {
  id: number;
  orderId: number;
  customerId: string;
  customerName: string;
  customerPhone: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentRatings: Rating[];
}

/**
 * Create a new rating for an order
 */
export async function createRating(
  orderId: number,
  customerId: string,
  customerName: string,
  customerPhone: string,
  rating: number,
  comment?: string
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  const result = await db.run(
    sql`INSERT INTO ratings (orderId, customerId, customerName, customerPhone, rating, comment)
        VALUES (${orderId}, ${customerId}, ${customerName}, ${customerPhone}, ${rating}, ${comment || null})`
  ) as any;

  return {
    id: Number(result?.lastInsertRowid) || Date.now(),
    orderId,
    customerId,
    customerName,
    customerPhone,
    rating,
    comment: comment || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get rating for a specific order
 */
export async function getRatingByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.get(
    sql`SELECT * FROM ratings WHERE orderId = ${orderId}`
  ) as any;

  return result as Rating | undefined;
}

/**
 * Get all ratings for a customer
 */
export async function getCustomerRatings(customerPhone: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.all(
    sql`SELECT * FROM ratings WHERE customerPhone = ${customerPhone} ORDER BY createdAt DESC`
  ) as any;

  return result as Rating[];
}

/**
 * Get rating statistics
 */
export async function getRatingStats(): Promise<RatingStats> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get average rating and total
  const statsResult = await db.get(
    sql`SELECT 
        AVG(rating) as averageRating,
        COUNT(*) as totalRatings,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating1,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating2,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating3,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating4,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating5
      FROM ratings`
  ) as any;

  const stats = statsResult as any;

  // Get recent ratings
  const recentResult = await db.all(
    sql`SELECT * FROM ratings ORDER BY createdAt DESC LIMIT 10`
  ) as any;

  return {
    averageRating: parseFloat(stats?.averageRating || '0') || 0,
    totalRatings: stats?.totalRatings || 0,
    ratingDistribution: {
      1: stats?.rating1 || 0,
      2: stats?.rating2 || 0,
      3: stats?.rating3 || 0,
      4: stats?.rating4 || 0,
      5: stats?.rating5 || 0,
    },
    recentRatings: (recentResult as Rating[]) || [],
  };
}

/**
 * Update a rating
 */
export async function updateRating(
  ratingId: number,
  rating: number,
  comment?: string
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  await db.run(
    sql`UPDATE ratings SET rating = ${rating}, comment = ${comment || null} WHERE id = ${ratingId}`
  );

  return { success: true };
}

/**
 * Delete a rating
 */
export async function deleteRating(ratingId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.run(sql`DELETE FROM ratings WHERE id = ${ratingId}`);

  return { success: true };
}
