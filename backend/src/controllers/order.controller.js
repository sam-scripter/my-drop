// order.controller.js — Order creation, management, and tracking

const prisma = require('../utils/prisma');
const { generateTrackingToken, generateDeliveryPin } = require('../utils/helpers');

/**
 * POST /api/orders
 * Creates a new order. Generates a tracking token and URL.
 * In Phase 6, this also triggers a WhatsApp/SMS to the customer.
 */
async function createOrder(req, res, next) {
  try {
    const {
      customer_name,
      customer_phone,
      customer_address,
      items_description,
      notes,
      delivery_lat,
      delivery_lng,
      order_value,     // ← add
      delivery_fee,    // ← add
      payment_method,  
      source,
      source_ref,
    } = req.body;

    // Generate unique tracking token — retry if collision (extremely rare)
    let tracking_token;
    let attempts = 0;
    do {
      tracking_token = generateTrackingToken();
      const exists = await prisma.order.findUnique({ where: { tracking_token } });
      if (!exists) break;
      attempts++;
    } while (attempts < 5);

    const tracking_url = `${process.env.TRACKING_BASE_URL}/${tracking_token}`;

    const order = await prisma.order.create({
      data: {
        business_id: req.user.businessId,
        customer_name,
        customer_phone,
        customer_address,
        items_description,
        notes,
        delivery_lat: delivery_lat || null,
        delivery_lng: delivery_lng || null,
        order_value: order_value || null,
        delivery_fee: delivery_fee || null,
        payment_method: payment_method || null,
        payment_status: order_value ? 'pending' : null,
        source: source || 'manual',
        source_ref,
        tracking_token,
        tracking_url,
        status: 'PENDING',
      },
      include: {
        business: {
          select: { name: true, logo_url: true }
        }
      }
    });

    // Increment the business's monthly order count
    // This runs outside the main create so a counter failure
    // doesn't roll back the order creation
    await prisma.business.update({
      where: { id: req.user.businessId },
      data: { monthly_order_count: { increment: 1 } }
    }).catch(err => {
      console.error('Failed to increment order count:', err.message);
    });

    // Send SMS notification to customer
    try {
      const { sendOrderNotification } = require('../services/notification.service');
      await sendOrderNotification({
        customerPhone: customer_phone,
        customerName: customer_name,
        businessName: order.business.name,
        trackingUrl: tracking_url,
        trigger: 'created',
      });
    } catch (smsErr) {
      // SMS failure never breaks order creation
      console.error('Order creation SMS failed:', smsErr.message);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order
    });

  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders
 * Lists all orders for this business.
 * Supports filtering by status and pagination.
 */
async function getOrders(req, res, next) {
  try {
    const {
      status,
      page = 1,
      limit = 25,
    } = req.query;

    const where = {
      business_id: req.user.businessId, // always scoped to this business
    };

    // Only add status filter if provided
    if (status) {
      where.status = status.toUpperCase();
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Run count and data fetch in parallel for speed
    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          delivery: {
            include: {
              rider: {
                select: { id: true, name: true, phone: true }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit),
      })
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      }
    });

  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders/:id
 * Returns a single order with full details.
 */
async function getOrder(req, res, next) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        business_id: req.user.businessId, // security check
      },
      include: {
        business: {
          select: { name: true, logo_url: true }
        },
        delivery: {
          include: {
            rider: {
              select: { id: true, name: true, phone: true }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        error: true,
        message: 'Order not found',
        code: 'NOT_FOUND'
      });
    }

    res.json({ order });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/orders/:id/assign
 * Assigns a rider to an order. Creates a Delivery record.
 * In Phase 6, this triggers an FCM push to the rider.
 */
async function assignRider(req, res, next) {
  try {
    const { riderId } = req.body;

    // Verify the order belongs to this business
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        business_id: req.user.businessId,
      }
    });

    if (!order) {
      return res.status(404).json({
        error: true,
        message: 'Order not found',
        code: 'NOT_FOUND'
      });
    }

    if (!['PENDING', 'ASSIGNED'].includes(order.status)) {
      return res.status(400).json({
        error: true,
        message: 'Can only assign riders to PENDING or ASSIGNED orders',
        code: 'INVALID_STATUS'
      });
    }

    // Verify the rider belongs to this business
    const rider = await prisma.user.findFirst({
      where: {
        id: riderId,
        business_id: req.user.businessId,
        role: 'RIDER',
        is_active: true,
      }
    });

    if (!rider) {
      return res.status(404).json({
        error: true,
        message: 'Rider not found or not active',
        code: 'NOT_FOUND'
      });
    }

    const delivery_pin = generateDeliveryPin();

    // Update order and create/update delivery in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // If order was previously assigned, update existing delivery
      // otherwise create a new one
      const existingDelivery = await tx.delivery.findUnique({
        where: { order_id: order.id }
      });

      let delivery;
      if (existingDelivery) {
        delivery = await tx.delivery.update({
          where: { order_id: order.id },
          data: {
            rider_id: riderId,
            delivery_pin,
            assigned_at: new Date(),
          }
        });
      } else {
        delivery = await tx.delivery.create({
          data: {
            order_id: order.id,
            rider_id: riderId,
            delivery_pin,
          }
        });
      }

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: 'ASSIGNED' }
      });

      return { order: updatedOrder, delivery };
    });

    // Send SMS to customer notifying rider is on the way
    try {
      const { sendOrderNotification } = require('../services/notification.service');
      const fullOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { business: { select: { name: true } } }
      });
      await sendOrderNotification({
        customerPhone: fullOrder.customer_phone,
        customerName: fullOrder.customer_name,
        businessName: fullOrder.business.name,
        trackingUrl: fullOrder.tracking_url,
        trigger: 'assigned',
      });
    } catch (smsErr) {
      console.error('Assignment SMS failed:', smsErr.message);
    }

    // Send FCM push notification to rider
    const { sendPushNotification } = require('../services/firebase.service');
    await sendPushNotification(
      rider.fcm_token,
      'New delivery assigned',
      `${order.customer_name} — ${order.customer_address}`,
      {
        orderId: order.id,
        type: 'ORDER_ASSIGNED',
      }
    );

    res.json({
      message: 'Rider assigned successfully',
      order: result.order,
      delivery: {
        id: result.delivery.id,
        rider_id: result.delivery.rider_id,
        delivery_pin: result.delivery.delivery_pin,
      }
    });

  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/orders/:id/status
 * Updates order status. Called by the rider app as delivery progresses.
 * When status is DELIVERED, validates the 4-digit PIN.
 */
async function updateStatus(req, res, next) {
  try {
    const { status, pin } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        business_id: req.user.businessId,
      },
      include: { delivery: true }
    });

    if (!order) {
      return res.status(404).json({
        error: true,
        message: 'Order not found',
        code: 'NOT_FOUND'
      });
    }

    if (!order.delivery) {
      return res.status(400).json({
        error: true,
        message: 'No delivery assigned for this order',
        code: 'NO_DELIVERY'
      });
    }

    // PIN validation — required when marking as DELIVERED
    if (status === 'DELIVERED') {
      if (!pin) {
        return res.status(400).json({
          error: true,
          message: 'PIN is required to confirm delivery',
          code: 'PIN_REQUIRED'
        });
      }

      if (pin !== order.delivery.delivery_pin) {
        return res.status(400).json({
          error: true,
          message: 'Incorrect delivery PIN',
          code: 'INVALID_PIN'
        });
      }
    }

    // Build the delivery update data based on status
    const deliveryUpdate = {};
    if (status === 'PICKED_UP') deliveryUpdate.picked_up_at = new Date();
    if (status === 'DELIVERED') deliveryUpdate.delivered_at = new Date();

    const result = await prisma.$transaction(async (tx) => {
      if (Object.keys(deliveryUpdate).length > 0) {
        await tx.delivery.update({
          where: { id: order.delivery.id },
          data: deliveryUpdate
        });
      }

      return tx.order.update({
        where: { id: order.id },
        data: { status }
      });
    });

    res.json({
      message: 'Order status updated successfully',
      order: result
    });

  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/orders/:id/rate
 * Customer submits a 1-5 star rating after delivery.
 * This endpoint is called from the tracking page — no JWT required
 * since customers don't have accounts. We verify via tracking token instead.
 */
async function rateDelivery(req, res, next) {
  try {
    const { rating, rating_note } = req.body;

    // Find order by ID — for rating we look up by ID directly
    // The tracking page will have the order ID from the track endpoint
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { delivery: true }
    });

    if (!order || !order.delivery) {
      return res.status(404).json({
        error: true,
        message: 'Order not found',
        code: 'NOT_FOUND'
      });
    }

    if (order.status !== 'DELIVERED') {
      return res.status(400).json({
        error: true,
        message: 'Can only rate delivered orders',
        code: 'INVALID_STATUS'
      });
    }

    await prisma.delivery.update({
      where: { id: order.delivery.id },
      data: { rating, rating_note }
    });

    res.json({ message: 'Rating submitted successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/track/:token
 * PUBLIC endpoint — no JWT required.
 * Called by the customer tracking page.
 * Returns just enough info to show the tracking UI.
 */
async function trackOrder(req, res, next) {
  try {
    const order = await prisma.order.findUnique({
      where: { tracking_token: req.params.token },
      include: {
        business: {
          select: { name: true, logo_url: true, business_type: true,  }
        },
        delivery: {
          select: {
            id: true,
            delivery_pin: true,
            picked_up_at: true,
            delivered_at: true,
            rider: {
              select: { name: true }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        error: true,
        message: 'Invalid tracking link',
        code: 'NOT_FOUND'
      });
    }

    // Only expose the PIN when the order is in transit
    // Hide it once delivered
    const deliveryPin = order.status === 'IN_TRANSIT'
      ? order.delivery?.delivery_pin
      : null;

    // Get status labels based on business type
    const statusLabels = getStatusLabels(order.business.business_type || 'OTHER');

    res.json({
      business: {
        name: order.business.name,
        logo_url: order.business.logo_url,
        business_type: order.business.business_type,
      },
      customer_name: order.customer_name,
      customer_address: order.customer_address,
      status: order.status,
      status_label: statusLabels[order.status],    // human-readable label
      status_icon: getStatusIcon(order.status),    // icon identifier
      status_labels: statusLabels,                 // all labels for the stepper
      tracking_token: order.tracking_token,
      delivery_pin: deliveryPin,
      firestore_path: order.delivery
        ? `deliveries/${order.id}/location/current`
        : null,
      timestamps: {
        created_at: order.created_at,
        picked_up_at: order.delivery?.picked_up_at,
        delivered_at: order.delivery?.delivered_at,
      }
    });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  assignRider,
  updateStatus,
  rateDelivery,
  trackOrder,
};