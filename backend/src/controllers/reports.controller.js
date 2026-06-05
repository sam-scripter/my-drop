// reports.controller.js — Analytics and reporting endpoints
//
// Provides aggregated data for the Reports page dashboard.
// All queries are scoped to the authenticated business.
//
// Endpoints:
//   GET /api/reports?period=today|week|month|custom
//   GET /api/reports/riders — per-rider performance

const prisma = require('../utils/prisma');

/**
 * GET /api/reports
 * Returns aggregated delivery and revenue stats for a given period.
 *
 * Query params:
 *   period: 'today' | 'week' | 'month' (default: 'month')
 *   from: ISO date string (for custom range)
 *   to: ISO date string (for custom range)
 */
async function getReports(req, res, next) {
  try {
    const { period = 'month', from, to } = req.query
    const businessId = req.user.businessId

    // Calculate date range
    const now = new Date()
    let startDate, endDate

    if (from && to) {
      startDate = new Date(from)
      endDate = new Date(to)
    } else {
      endDate = now
      switch (period) {
        case 'today':
          startDate = new Date(now)
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate = new Date(now)
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
        default:
          startDate = new Date(now)
          startDate.setDate(1)
          startDate.setHours(0, 0, 0, 0)
          break
      }
    }

    // Get all orders in the date range for this business
    const orders = await prisma.order.findMany({
      where: {
        business_id: businessId,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        delivery: {
          include: {
            rider: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })

    // ── Calculate summary stats ──────────────────────────────────────
    const totalOrders = orders.length
    const delivered = orders.filter(o => o.status === 'DELIVERED').length
    const failed = orders.filter(o => o.status === 'FAILED').length
    const pending = orders.filter(
      o => !['DELIVERED', 'FAILED'].includes(o.status)
    ).length

    // Revenue
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (o.order_value || 0), 0
    )
    const deliveryRevenue = orders.reduce(
      (sum, o) => sum + (o.delivery_fee || 0), 0
    )

    // Average delivery time (minutes)
    const deliveredOrders = orders.filter(
      o => o.status === 'DELIVERED' &&
        o.delivery?.picked_up_at &&
        o.delivery?.delivered_at
    )
    const avgDeliveryTime = deliveredOrders.length > 0
      ? Math.round(
          deliveredOrders.reduce((sum, o) => {
            const mins = (
              new Date(o.delivery.delivered_at) -
              new Date(o.delivery.picked_up_at)
            ) / (1000 * 60)
            return sum + mins
          }, 0) / deliveredOrders.length
        )
      : null

    // Average rating
    const ratedDeliveries = orders.filter(
      o => o.delivery?.rating != null
    )
    const avgRating = ratedDeliveries.length > 0
      ? (
          ratedDeliveries.reduce(
            (sum, o) => sum + o.delivery.rating, 0
          ) / ratedDeliveries.length
        ).toFixed(1)
      : null

    // ── Daily breakdown (for chart) ──────────────────────────────────
    const dailyMap = {}
    orders.forEach(order => {
      const day = order.created_at.toISOString().split('T')[0]
      if (!dailyMap[day]) {
        dailyMap[day] = { date: day, orders: 0, delivered: 0, revenue: 0 }
      }
      dailyMap[day].orders++
      if (order.status === 'DELIVERED') dailyMap[day].delivered++
      dailyMap[day].revenue += (order.order_value || 0)
    })
    const dailyBreakdown = Object.values(dailyMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    )

    // ── Per-rider stats ──────────────────────────────────────────────
    const riderMap = {}
    orders.forEach(order => {
      if (!order.delivery?.rider) return
      const rider = order.delivery.rider
      if (!riderMap[rider.id]) {
        riderMap[rider.id] = {
          id: rider.id,
          name: rider.name,
          deliveries: 0,
          failed: 0,
          totalRating: 0,
          ratingCount: 0,
          revenue: 0,
        }
      }
      if (order.status === 'DELIVERED') {
        riderMap[rider.id].deliveries++
        riderMap[rider.id].revenue += (order.order_value || 0)
      }
      if (order.status === 'FAILED') riderMap[rider.id].failed++
      if (order.delivery?.rating) {
        riderMap[rider.id].totalRating += order.delivery.rating
        riderMap[rider.id].ratingCount++
      }
    })

    const riderStats = Object.values(riderMap)
      .map(r => ({
        ...r,
        avgRating: r.ratingCount > 0
          ? (r.totalRating / r.ratingCount).toFixed(1)
          : null,
      }))
      .sort((a, b) => b.deliveries - a.deliveries)

    res.json({
      period: { start: startDate, end: endDate, label: period },
      summary: {
        total_orders: totalOrders,
        delivered,
        failed,
        pending,
        delivery_rate: totalOrders > 0
          ? Math.round((delivered / totalOrders) * 100)
          : 0,
        total_revenue: totalRevenue,
        delivery_revenue: deliveryRevenue,
        avg_delivery_time: avgDeliveryTime,
        avg_rating: avgRating,
      },
      daily_breakdown: dailyBreakdown,
      rider_stats: riderStats,
    })

  } catch (err) {
    next(err)
  }
}

module.exports = { getReports }