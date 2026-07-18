import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { sendOrderConfirmation, sendOrderStatusUpdate } from "./whatsapp";
import { OrderItem } from "../drizzle/schema";
import * as ranking from "./ranking";
import * as couponsHelper from "./coupons";
import * as analytics from "./analytics";
import * as ratingsHelper from "./ratings";
import { storagePut } from "./storage";


export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    registerAdmin: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
          name: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        return db.createAdmin(input.email, input.password, input.name);
      }),
  }),

  orders: router({
    // Create a new order
    create: publicProcedure
      .input(
        z.object({
          customerName: z.string().min(1),
          customerPhone: z.string().min(10),
          items: z.array(
            z.object({
              name: z.string(),
              quantity: z.number().min(1),
              price: z.number().min(0),
              removedIngredients: z.array(z.string()).optional(),
              addedExtras: z
                .array(
                  z.object({
                    name: z.string(),
                    price: z.number().min(0),
                  })
                )
                .optional(),
              observations: z.string().optional(),
            })
          ),
          totalAmount: z.number().min(0),
          discount: z.number().min(0).optional(),
          deliveryFee: z.number().min(0).optional(),
          finalAmount: z.number().min(0),
          deliveryType: z.enum(["delivery", "pickup"]),
          address: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Generate order number
        const random = Math.floor(Math.random() * 10000);
        const orderNumber = `ORD-${new Date().toISOString().split('T')[0]}-${String(random).padStart(4, '0')}`;

        // Create order in database
        const result = await db.createOrder({
          orderNumber,
          customerId: input.customerPhone,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          items: input.items as OrderItem[],
          totalAmount: input.totalAmount,
          discount: input.discount || 0,
          deliveryFee: input.deliveryFee || 0,
          finalAmount: input.finalAmount,
          deliveryType: input.deliveryType as any,
          address: input.address,
          notes: input.notes,
          status: "pending" as any,
        });

        // Add status history
        const orderId = (result as any).id || 1; // Get actual ID from result
        await db.addOrderStatusHistory({
          orderId,
          status: "pending" as any,
          message: "Pedido recebido",
        });

        // Send WhatsApp confirmation
        await sendOrderConfirmation(input.customerPhone, {
          orderNumber,
          items: input.items,
          totalAmount: input.totalAmount,
          discount: input.discount,
          finalAmount: input.finalAmount,
          deliveryType: input.deliveryType,
          address: input.address,
        });

        // Update customer stats and rankings after order creation
        try {
          // First update customer stats (total orders and spent)
          await ranking.updateCustomerStats(input.customerPhone, input.finalAmount, input.customerName);
          // Then recalculate rankings
          await ranking.calculateWeeklyRankings();
          await ranking.calculateMonthlyRankings();
        } catch (error) {
          console.error('Erro ao atualizar rankings:', error);
        }

        return {
          success: true,
          orderNumber,
          message: "Pedido criado com sucesso! Você receberá atualizações via WhatsApp.",
        };
      }),

    // Get order by number
    getByNumber: publicProcedure
      .input(z.object({ orderNumber: z.string() }))
      .query(async ({ input }) => {
        const order = await db.getOrderByNumber(input.orderNumber);
        if (!order) {
          throw new Error("Pedido não encontrado");
        }
        return order;
      }),

    // Get order status history
    getStatusHistory: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return db.getOrderStatusHistory(input.orderId);
      }),

    // Get customer orders
    getByPhone: publicProcedure
      .input(z.object({ phone: z.string() }))
      .query(async ({ input }) => {
        return db.getOrdersByCustomerPhone(input.phone);
      }),

    // Admin: Update order status
    updateStatus: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          status: z.enum(["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"]),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Check if user is admin
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }

        // Update order status
        await db.updateOrderStatus(input.orderId, input.status);

        // Add status history
        await db.addOrderStatusHistory({
          orderId: input.orderId,
          status: input.status as any,
          message: input.message,
        });

        // Get order to send WhatsApp update
        const order = await db.getOrderById(input.orderId);
        if (order) {
          await sendOrderStatusUpdate(order.customerPhone, {
            orderNumber: order.orderNumber,
            status: input.status as any,
            message: input.message,
          });

          // If order is delivered, recalculate rankings
          if (input.status === 'delivered') {
            try {
              await ranking.calculateWeeklyRankings();
              await ranking.calculateMonthlyRankings();
              console.log('Rankings recalculated after delivery');
            } catch (error) {
              console.error('Erro ao recalcular rankings após entrega:', error);
            }
          }
        }

        return { success: true };
      }),

    // Admin: Get recent orders
    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(10) }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return db.getRecentOrders(input.limit);
      }),

    // Admin: Get all orders
    getAll: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return db.getRecentOrders(1000);
      }),

    // Admin: Assign driver to order
    assignDriver: protectedProcedure
      .input(z.object({ orderId: z.number(), driverId: z.number().nullable() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        await db.updateOrderDriver(input.orderId, input.driverId);
        return { success: true };
      }),
  }),

  coupons: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Unauthorized");
      return db.getCoupons();
    }),
    create: protectedProcedure
      .input(z.object({ code: z.string(), type: z.enum(["percentage", "fixed"]), discountValue: z.number(), minOrderAmount: z.number().optional(), maxUses: z.number().optional(), expiresAt: z.date().optional() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Unauthorized");
        const { type, ...rest } = input;
        return db.createCoupon({ ...rest, discountType: type });
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number(), code: z.string().optional(), type: z.enum(["percentage", "fixed"]).optional(), discountValue: z.number().optional(), isActive: z.number().optional() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Unauthorized");
        const { id, type, ...data } = input;
        const updateData: any = { ...data };
        if (type) updateData.discountType = type;
        return db.updateCoupon(id, updateData);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Unauthorized");
        return db.deleteCoupon(input.id);
      }),
    validate: publicProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ input }) => {
        return couponsHelper.validateCoupon(input.code);
      }),

    calculateDiscount: publicProcedure
      .input(z.object({ code: z.string(), orderTotal: z.number().min(0) }))
      .mutation(async ({ input }) => {
        return couponsHelper.calculateDiscount(input.code, input.orderTotal);
      }),
  }),

  analytics: router({
    getMetrics: publicProcedure.query(async () => {
      return analytics.getAnalyticsMetrics();
    }),
  }),

  ranking: router({
    getCurrent: publicProcedure.query(async () => {
      return ranking.getCurrentRankings();
    }),

    // TEMPORARY: Fix customer names from orders
    fixNames: publicProcedure.mutation(async () => {
      const database = await db.getDb();
      if (!database) throw new Error("DB not available");

      const { customers, orders: ordersTable } = await import("../drizzle/schema");
      const { eq, desc } = await import("drizzle-orm");

      const fixed: string[] = [];
      const allCustomers = await database.select().from(customers);

      for (const customer of allCustomers) {
        if (customer.name === 'Cliente' || !customer.name) {
          const latestOrders = await database
            .select({ customerName: ordersTable.customerName })
            .from(ordersTable)
            .where(eq(ordersTable.customerPhone, customer.phone))
            .orderBy(desc(ordersTable.createdAt))
            .limit(1);

          if (latestOrders.length > 0 && latestOrders[0].customerName) {
            const realName = latestOrders[0].customerName;
            await database.update(customers).set({ name: realName }).where(eq(customers.id, customer.id));
            fixed.push(`${customer.phone} → ${realName}`);
          }
        }
      }

      // Recalculate rankings
      await ranking.calculateWeeklyRankings();
      await ranking.calculateMonthlyRankings();

      return { success: true, fixed };
    }),

    // TEMPORARY: Clear all orders and customers to reset test environment
    clearTestOrders: publicProcedure.mutation(async () => {
      const database = await db.getDb();
      if (!database) throw new Error("DB not available");

      const { customers, orders: ordersTable, customerRankings, prizeCodes, orderStatusHistory, ratings } = await import("../drizzle/schema");
      
      await database.delete(orderStatusHistory);
      await database.delete(ratings);
      await database.delete(prizeCodes);
      await database.delete(customerRankings);
      await database.delete(ordersTable);
      await database.delete(customers);

      return { success: true, message: "Todos os dados de teste foram apagados!" };
    }),

    getMyPrizes: publicProcedure
      .input(z.object({ phone: z.string() }))
      .query(async ({ input }) => {
        return ranking.getCustomerPrizeCodes(input.phone);
      }),

    usePrizeCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ input }) => {
        return ranking.usePrizeCode(input.code);
      }),

    calculateWeekly: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }
      await ranking.calculateWeeklyRankings();
      return { success: true };
    }),

    calculateMonthly: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }
      await ranking.calculateMonthlyRankings();
      return { success: true };
    }),
  }),

  ratings: router({
    create: publicProcedure
      .input(
        z.object({
          orderId: z.number(),
          customerId: z.string(),
          customerName: z.string(),
          customerPhone: z.string(),
          rating: z.number().min(1).max(5),
          comment: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return ratingsHelper.createRating(
          input.orderId,
          input.customerId,
          input.customerName,
          input.customerPhone,
          input.rating,
          input.comment
        );
      }),

    getByOrderId: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return ratingsHelper.getRatingByOrderId(input.orderId);
      }),

    getCustomerRatings: publicProcedure
      .input(z.object({ phone: z.string() }))
      .query(async ({ input }) => {
        return ratingsHelper.getCustomerRatings(input.phone);
      }),

    getStats: publicProcedure.query(async () => {
      return ratingsHelper.getRatingStats();
    }),
  }),

  // Store Settings Router
  storeSettings: router({
    get: publicProcedure.query(async () => {
      return db.getStoreSettings();
    }),

    update: publicProcedure
      .input(
        z.object({
          storeName: z.string().optional(),
          whatsappNumber: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          zipCode: z.string().optional(),
          openingTime: z.string().optional(),
          closingTime: z.string().optional(),
          isOpen: z.number().optional(),
          logoUrl: z.string().optional(),
          bannerUrl: z.string().optional(),
          description: z.string().optional(),
          freeDeliveryDistance: z.number().optional(),
          baseDeliveryFee: z.number().optional(),
          deliveryFeePerKm: z.number().optional(),
          maxDeliveryDistance: z.number().optional(),
          storeLatitude: z.number().optional(),
          storeLongitude: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateStoreSettings(input);
      }),
      
    calculateDelivery: publicProcedure
      .input(
        z.object({
          address: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const settings = await db.getStoreSettings();
        const maxDist = settings?.maxDeliveryDistance || 10;
        const baseFee = settings?.baseDeliveryFee || 0;
        const perKmFee = settings?.deliveryFeePerKm || 0;
        const freeDist = settings?.freeDeliveryDistance || 6;
        const storeLat = settings?.storeLatitude;
        const storeLon = settings?.storeLongitude;
        
        if (!storeLat || !storeLon) {
          return { deliverable: true, distance: 0, fee: 0 };
        }
        
        try {
          // Geocode using Nominatim
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input.address)}`, {
            headers: { 'User-Agent': 'NewsBurguerApp/1.0' }
          });
          const data = await res.json();
          
          if (!data || data.length === 0) {
            // Fallback se não encontrar: retorna taxa 0 mas diz que entrega (deixa passar com aviso)
            return { deliverable: true, distance: 0, fee: 0, warning: "Endereço não encontrado com precisão." };
          }
          
          const customerLat = parseFloat(data[0].lat);
          const customerLon = parseFloat(data[0].lon);
          
          // Haversine
          const R = 6371; // km
          const dLat = (customerLat - storeLat) * Math.PI / 180;
          const dLon = (customerLon - storeLon) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(storeLat * Math.PI / 180) * Math.cos(customerLat * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          if (distance > 6) {
            return { deliverable: false, distance, fee: 0, message: `Fora da área de entrega (MÁX: 6km). Sua distância: ${distance.toFixed(1)}km.` };
          }
          
          let fee = 0;
          if (distance <= 4) {
            fee = 0;
          } else if (distance <= 5) {
            fee = 2;
          } else if (distance <= 6) {
            fee = 6;
          }
          
          return { deliverable: true, distance, fee };
        } catch (e) {
          console.error("Erro no geocoding", e);
          return { deliverable: true, distance: 0, fee: 0, warning: "Erro ao calcular distância." };
        }
      }),
  }),

  // Menu Items Router
  menu: router({
    getAll: publicProcedure.query(async () => {
      return db.getMenuItems();
    }),

    getAdminAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Unauthorized");
      return db.getMenuItems(undefined, true);
    }),

    toggleAvailability: protectedProcedure
      .input(z.object({ id: z.number(), isAvailable: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Unauthorized");
        return db.updateMenuItem(input.id, { isAvailable: input.isAvailable });
      }),

    getByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return db.getMenuItems(input.category);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getMenuItemById(input.id);
      }),

    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          category: z.enum(["hamburgers", "hotdogs", "combos", "drinks", "extras"]),
          price: z.number().min(0),
          imageUrl: z.string().optional(),
          ingredients: z.array(z.string()).optional(),
          extras: z.array(z.object({ name: z.string(), price: z.number() })).optional(),
          displayOrder: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createMenuItem(input as any);
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          category: z.enum(["hamburgers", "hotdogs", "combos", "drinks", "extras"]).optional(),
          price: z.number().optional(),
          imageUrl: z.string().optional(),
          ingredients: z.array(z.string()).optional(),
          extras: z.array(z.object({ name: z.string(), price: z.number() })).optional(),
          displayOrder: z.number().optional(),
          isActive: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateMenuItem(id, data as any);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteMenuItem(input.id);
      }),
  }),

  // Custom Ingredients Router (Monte seu Lanche)
  customIngredients: router({
    getAll: publicProcedure.query(async () => {
      return db.getCustomIngredients();
    }),

    getAllAdmin: publicProcedure.query(async () => {
      return db.getAllCustomIngredients();
    }),

    create: publicProcedure
      .input(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1),
          emoji: z.string().optional().default('🍔'),
          imageUrl: z.string().optional(),
          price: z.number().min(0),
          category: z.enum(['paes', 'carnes', 'queijos', 'molhos', 'vegetais', 'extras']),
          categoryLabel: z.string().min(1),
          isActive: z.number().optional().default(1),
          displayOrder: z.number().optional().default(0),
        })
      )
      .mutation(async ({ input }) => {
        return db.createCustomIngredient(input as any);
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.string().min(1),
          data: z.object({
            name: z.string().optional(),
            emoji: z.string().optional(),
            imageUrl: z.string().optional(),
            price: z.number().optional(),
            category: z.enum(['paes', 'carnes', 'queijos', 'molhos', 'vegetais', 'extras']).optional(),
            categoryLabel: z.string().optional(),
            displayOrder: z.number().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateCustomIngredient(input.id, input.data as any);
      }),

    toggleAvailability: publicProcedure
      .input(z.object({ id: z.string(), isActive: z.number() }))
      .mutation(async ({ input }) => {
        return db.toggleCustomIngredientAvailability(input.id, input.isActive);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return db.deleteCustomIngredient(input.id);
      }),
  }),


  promotions: router({
    getAll: publicProcedure.query(async () => {
      return db.getPromotions(false);
    }),

    getActive: publicProcedure.query(async () => {
      return db.getPromotions(true);
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getPromotionById(input.id);
      }),

    create: publicProcedure
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          type: z.enum(["percentage", "fixed", "combo"]),
          discountValue: z.number().min(0),
          minOrderAmount: z.number().optional(),
          imageUrl: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          displayOrder: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createPromotion(input as any);
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          type: z.enum(["percentage", "fixed", "combo"]).optional(),
          discountValue: z.number().optional(),
          minOrderAmount: z.number().optional(),
          imageUrl: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          displayOrder: z.number().optional(),
          isActive: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updatePromotion(id, data as any);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deletePromotion(input.id);
      }),
  }),

  // Admin Authentication Router
  adminAuth: router({
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const admin = await db.getAdminByEmail(input.email);
        if (!admin) {
          throw new Error("Admin não encontrado");
        }

        const crypto = await import("crypto");
        const hashedPassword = crypto.createHash("sha256").update(input.password).digest("hex");

        if (hashedPassword !== admin.passwordHash) {
          throw new Error("Senha incorreta");
        }

        await db.updateAdminLastLogin(admin.id);

        // Set admin session cookie so protected procedures can authenticate the admin
        const { getSessionCookieOptions } = await import("./_core/cookies");
        const cookieOpts = getSessionCookieOptions(ctx.req);
        ctx.res.cookie('admin_session', admin.email, {
          ...cookieOpts,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return {
          success: true,
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          },
        };
      }),

    logout: publicProcedure
      .mutation(async ({ ctx }) => {
        ctx.res.clearCookie('admin_session', { path: '/' });
        return { success: true };
      }),

    register: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
          name: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const crypto = await import("crypto");
        const hashedPassword = crypto.createHash("sha256").update(input.password).digest("hex");

        return db.createAdminUser(input.email, hashedPassword, input.name);
      }),
  }),

  // Upload Router
  upload: router({
    menuItemImage: publicProcedure
      .input(
        z.object({
          fileBase64: z.string(),
          filename: z.string(),
          contentType: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const contentType = input.contentType || 'image/jpeg';
          // Store as base64 data URL directly in the database
          // This avoids filesystem issues on ephemeral hosting (Render, etc.)
          const dataUrl = `data:${contentType};base64,${input.fileBase64}`;
          return { key: input.filename, url: dataUrl };
        } catch (error) {
          throw new Error(`Upload failed: ${error}`);
        }
      }),
  }),
  dashboard: router({
    getStats: publicProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ input }) => {
      try {
        // Definir período de filtro
        let startDate = input.startDate ? new Date(input.startDate) : new Date();
        let endDate = input.endDate ? new Date(input.endDate) : new Date();
        
        if (!input.startDate) {
          startDate.setDate(startDate.getDate() - 6);
        }
        
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        const allOrders = await db.getOrdersByDateRange(startDate, endDate);
        
        // Calcular vendas por dia
        const salesByDay: Record<string, { sales: number; orders: number; day: string }> = {};
        const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        
        // Inicializar período selecionado
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dayName = daysOfWeek[currentDate.getDay()];
          const dateStr = currentDate.toISOString().split('T')[0];
          salesByDay[dateStr] = { sales: 0, orders: 0, day: dayName };
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Preencher dados de vendas
        allOrders.forEach((order: any) => {
          const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
          if (salesByDay[dateStr]) {
            salesByDay[dateStr].sales += parseFloat(order.finalAmount);
            salesByDay[dateStr].orders += 1;
          }
        });
        
        const salesData = Object.values(salesByDay).map(d => ({ day: d.day, sales: d.sales, orders: d.orders }));
        
        // Calcular horários de pico
        const peakHours: Record<string, number> = {};
        for (let h = 11; h <= 21; h++) {
          peakHours[`${h}h`] = 0;
        }
        
        allOrders.forEach((order: any) => {
          const hour = new Date(order.createdAt).getHours();
          if (hour >= 11 && hour <= 21) {
            peakHours[`${hour}h`] = (peakHours[`${hour}h`] || 0) + 1;
          }
        });
        
        const peakHoursData = Object.entries(peakHours).map(([hour, count]) => ({ hour, orders: count }));
        
        // Calcular produtos mais vendidos
        const productStats: Record<string, number> = {};
        allOrders.forEach((order: any) => {
          const items = order.items || [];
          items.forEach((item: any) => {
            productStats[item.name] = (productStats[item.name] || 0) + item.quantity;
          });
        });
        
        const topProducts = Object.entries(productStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count], idx) => ({
            name,
            value: Math.round((count / allOrders.length) * 100) || 0,
            fill: ['#C9A227', '#FFA500', '#FF6B35', '#4CAF50', '#2196F3'][idx]
          }));
        
        // Calcular estatísticas gerais do período atual
        const currentSales = allOrders.reduce((sum: number, o: any) => sum + parseFloat(o.finalAmount), 0);
        const currentOrders = allOrders.length;
        const currentAvgTicket = currentOrders > 0 ? currentSales / currentOrders : 0;
        
        // Calcular período anterior (mesma duração)
        const periodDuration = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - periodDuration);
        const prevEndDate = new Date(startDate);
        prevEndDate.setDate(prevEndDate.getDate() - 1);
        
        const prevOrders = await db.getOrdersByDateRange(prevStartDate, prevEndDate);
        const prevSales = prevOrders.reduce((sum: number, o: any) => sum + parseFloat(o.finalAmount), 0);
        const prevAvgTicket = prevOrders.length > 0 ? prevSales / prevOrders.length : 0;
        
        // Calcular percentuais de crescimento
        const salesGrowth = prevSales > 0 ? ((currentSales - prevSales) / prevSales) * 100 : 0;
        const ordersGrowth = prevOrders.length > 0 ? ((currentOrders - prevOrders.length) / prevOrders.length) * 100 : 0;
        const avgTicketGrowth = prevAvgTicket > 0 ? ((currentAvgTicket - prevAvgTicket) / prevAvgTicket) * 100 : 0;
        
        return {
          salesData,
          peakHoursData,
          topProducts,
          stats: {
            todaySales: currentSales.toFixed(2),
            todayOrders: currentOrders,
            avgTicket: currentAvgTicket.toFixed(2),
            totalOrders: allOrders.length,
            salesGrowth: salesGrowth.toFixed(1),
            ordersGrowth: ordersGrowth.toFixed(1),
            avgTicketGrowth: avgTicketGrowth.toFixed(1)
          }
        };
      } catch (error) {
        console.error('Dashboard stats error:', error);
        throw error;
      }
    }),
  }),

  whatsapp: router({
    getSettings: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user || !ctx.user.email) throw new Error('Unauthorized');
        // Get admin user ID from email
        const admin = await db.getAdminByEmail(ctx.user.email);
        if (!admin) throw new Error('Admin not found');
        
        return await db.getWhatsappSettings(admin.id);
      }),
    
    updateSettings: protectedProcedure
      .input(z.object({
        phoneNumber: z.string(),
        enableDailySummary: z.number().optional(),
        summaryTime: z.string().optional(),
        enableSalesAlerts: z.number().optional(),
        salesAlertThreshold: z.number().optional(),
        enableOrderAlerts: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user || !ctx.user.email) throw new Error('Unauthorized');
        const admin = await db.getAdminByEmail(ctx.user.email);
        if (!admin) throw new Error('Admin not found');
        
        const existing = await db.getWhatsappSettings(admin.id);
        
        if (existing) {
          return await db.updateWhatsappSettings(admin.id, input);
        } else {
          return await db.createWhatsappSettings({
            adminUserId: admin.id,
            ...input,
          });
        }
      }),
    
    getMessageLog: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user || !ctx.user.email) throw new Error('Unauthorized');
        const admin = await db.getAdminByEmail(ctx.user.email);
        if (!admin) throw new Error('Admin not found');
        
        return await db.getWhatsappMessagesByAdmin(admin.id, input.limit);
      }),
  }),

  drivers: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      return db.getDrivers();
    }),
    create: protectedProcedure
      .input(z.object({ name: z.string(), phone: z.string(), vehicle: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        return db.createDriver(input);
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number(), name: z.string().optional(), phone: z.string().optional(), vehicle: z.string().optional(), isActive: z.number().optional() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const { id, ...data } = input;
        return db.updateDriver(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        return db.deleteDriver(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
