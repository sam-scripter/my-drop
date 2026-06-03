// businessType.js — Status label mapping per business type
//
// Different businesses use different language for order statuses.
// A pharmacy "dispenses" while a restaurant "prepares".
// This file centralises that mapping so it's consistent across
// the API, dashboard, and tracking page.

/**
 * Returns the appropriate status labels for a given business type.
 * Used by the tracking page and dashboard to display human-readable
 * status text instead of the raw enum value.
 *
 * @param {string} businessType - e.g. 'FOOD', 'RETAIL', 'PHARMACY'
 * @returns {object} Map of OrderStatus enum values to display labels
 */
function getStatusLabels(businessType) {
  const labels = {
    FOOD: {
      PENDING: 'Order Received',
      ASSIGNED: 'Preparing',
      PICKED_UP: 'Picked Up',
      IN_TRANSIT: 'On the Way',
      DELIVERED: 'Delivered',
      FAILED: 'Could Not Deliver',
    },
    RETAIL: {
      PENDING: 'Order Received',
      ASSIGNED: 'Packing',
      PICKED_UP: 'Picked Up',
      IN_TRANSIT: 'On the Way',
      DELIVERED: 'Delivered',
      FAILED: 'Could Not Deliver',
    },
    PHARMACY: {
      PENDING: 'Order Received',
      ASSIGNED: 'Dispensing',
      PICKED_UP: 'Picked Up',
      IN_TRANSIT: 'On the Way',
      DELIVERED: 'Delivered',
      FAILED: 'Could Not Deliver',
    },
    COURIER: {
      PENDING: 'Received',
      ASSIGNED: 'Processing',
      PICKED_UP: 'Collected',
      IN_TRANSIT: 'In Transit',
      DELIVERED: 'Delivered',
      FAILED: 'Could Not Deliver',
    },
    OTHER: {
      PENDING: 'Order Received',
      ASSIGNED: 'Processing',
      PICKED_UP: 'Picked Up',
      IN_TRANSIT: 'On the Way',
      DELIVERED: 'Delivered',
      FAILED: 'Could Not Deliver',
    },
  };

  return labels[businessType] || labels.OTHER;
}

/**
 * Returns a neutral icon name for each status.
 * These are text identifiers — the frontend maps them to actual icons.
 * Using text keys instead of emoji keeps the backend agnostic of
 * how the frontend renders them.
 *
 * @param {string} status - OrderStatus enum value
 * @returns {string} icon identifier
 */
function getStatusIcon(status) {
  const icons = {
    PENDING: 'package',
    ASSIGNED: 'clock',
    PICKED_UP: 'check',
    IN_TRANSIT: 'truck',
    DELIVERED: 'check-circle',
    FAILED: 'x-circle',
  };
  return icons[status] || 'package';
}

module.exports = { getStatusLabels, getStatusIcon };