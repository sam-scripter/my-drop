// analytics.controller.js — Dashboard summary statistics

const prisma = require('../utils/prisma');

/**
 * GET /api/analytics/today
 * Returns summary stats for today's deliveries.
 * Used by the management dashboard summary cards and bar chart.
 */
async function getToday(req, res, next) {
  try {
    // Start of today in UTC
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const businessId = req.user.businessId;

    // Run all queries in parallel — much faster than sequential awaits
    const [
      totalCreated,
      totalDelivered,
      totalFailed,
      ordersPerHour,
      avgDeliveryTime,
    ] = await Promise.all([

      // Total orders created today
      prisma.order.count({
        where: {
          business_id: businessId,
          created_at: { gte: startOfDay }
        }
      }),

      // Total delivered today
      prisma.order.count({
        where: {
          business_id: businessId,
          status: 'DELIVERED',
          created_at: { gte: startOfDay }
        }
      }),

      // Total failed today
      prisma.order.count({
        where: {
          business_id: businessId,
          status: 'FAILED',
          created_at: { gte: startOfDay }
        }
      }),

      // Orders grouped by hour for the bar chart
      // Raw SQL because Prisma doesn't support GROUP BY hour natively
      prisma.$queryRaw`
        SELECT
          EXTRACT(HOUR FROM created_at) AS hour,
          COUNT(*) AS count
        FROM orders
        WHERE business_id = ${businessId}
          AND created_at >= ${startOfDay}
        GROUP BY hour
        ORDER BY hour ASC
      `,

      // Average delivery time in minutes (assigned → delivered)
      prisma.$queryRaw`
        SELECT
          AVG(
            EXTRACT(EPOCH FROM (d.delivered_at - d.assigned_at)) / 60
          ) AS avg_minutes
        FROM deliveries d
        JOIN orders o ON o.id = d.order_id
        WHERE o.business_id = ${businessId}
          AND d.delivered_at IS NOT NULL
          AND d.assigned_at >= ${startOfDay}
      `,
    ]);

    // Format ordersPerHour into a clean array for Recharts
    // Fill in missing hours with 0
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const found = ordersPerHour.find(r => Number(r.hour) === hour);
      return {
        hour: `${String(hour).padStart(2, '0')}:00`,
        orders: found ? Number(found.count) : 0,
      };
    });

    const avgMinutes = avgDeliveryTime[0]?.avg_minutes
      ? Math.round(Number(avgDeliveryTime[0].avg_minutes))
      : null;

    res.json({
      summary: {
        orders_created: totalCreated,
        delivered: totalDelivered,
        failed: totalFailed,
        avg_delivery_minutes: avgMinutes,
      },
      hourly_chart: hourlyData,
    });

  } catch (err) {
    next(err);
  }
}

module.exports = { getToday };