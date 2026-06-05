// feedback.controller.js — Customer feedback and ratings
//
// Returns all delivery ratings for the authenticated business,
// plus summary stats (avg rating, sentiment breakdown).
// Data comes from the Delivery table where rating is stored
// after customers rate via the tracking page.

const prisma = require('../utils/prisma');

/**
 * GET /api/feedback
 * Returns all ratings for this business with summary stats.
 */
async function getFeedback(req, res, next) {
  try {
    const businessId = req.user.businessId;

    // Get all delivered orders with ratings for this business
    const deliveries = await prisma.delivery.findMany({
      where: {
        order: {
          business_id: businessId,
        },
        rating: { not: null },
      },
      include: {
        order: {
          select: {
            id: true,
            customer_name: true,
            customer_address: true,
            created_at: true,
          },
        },
        rider: {
          select: { name: true },
        },
      },
      orderBy: { updated_at: 'desc' },
    });

    // Build feedback list
    const feedback = deliveries.map(d => ({
      order_id: d.order.id,
      customer_name: d.order.customer_name,
      customer_address: d.order.customer_address,
      rider_name: d.rider?.name || null,
      rating: d.rating,
      rated_at: d.updated_at,
    }));

    // Calculate summary stats
    const totalRatings = feedback.length;
    const avgRating = totalRatings > 0
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / totalRatings).toFixed(1)
      : null;

    const positive = feedback.filter(f => f.rating >= 4).length;
    const neutral = feedback.filter(f => f.rating === 3).length;
    const negative = feedback.filter(f => f.rating <= 2).length;

    const summary = {
      total_ratings: totalRatings,
      avg_rating: avgRating,
      positive_percent: totalRatings > 0
        ? Math.round((positive / totalRatings) * 100) : 0,
      neutral_percent: totalRatings > 0
        ? Math.round((neutral / totalRatings) * 100) : 0,
      negative_percent: totalRatings > 0
        ? Math.round((negative / totalRatings) * 100) : 0,
    };

    res.json({ feedback, summary });
  } catch (err) {
    next(err);
  }
}

module.exports = { getFeedback };