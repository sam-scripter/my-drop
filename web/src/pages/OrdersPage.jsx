// OrdersPage.jsx — Full orders list with filters and assign rider
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import DashboardLayout from '../components/DashboardLayout'

const STATUSES = [null, 'PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED']
const STATUS_LABELS = ['All', 'Pending', 'Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Failed']

const STATUS_COLORS = {
  PENDING: '#9AA0A6',
  ASSIGNED: '#FBBC04',
  PICKED_UP: '#FF6D00',
  IN_TRANSIT: '#1A73E8',
  DELIVERED: '#34A853',
  FAILED: '#EA4335',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [riders, setRiders] = useState([])
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [assigningOrder, setAssigningOrder] = useState(null)

  useEffect(() => {
    loadOrders()
    loadRiders()
  }, [selectedStatus])

  async function loadOrders() {
    setLoading(true)
    try {
      const params = selectedStatus ? `?status=${selectedStatus}` : ''
      const res = await api.get(`/orders${params}`)
      setOrders(res.data.orders)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadRiders() {
    try {
      const res = await api.get('/users/riders')
      setRiders(res.data.riders.filter(r => r.is_active))
    } catch (err) {
      console.error(err)
    }
  }

  async function handleAssign(orderId, riderId) {
    try {
      await api.post(`/orders/${orderId}/assign`, { riderId })
      setAssigningOrder(null)
      loadOrders()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign rider')
    }
  }

  return (
    <DashboardLayout>
      <div style={styles.page}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Orders</h1>
          <Link to="/orders/new" style={styles.newBtn}>+ New Order</Link>
        </div>

        {/* Status filters */}
        <div style={styles.filters}>
          {STATUSES.map((status, i) => (
            <button
              key={i}
              onClick={() => setSelectedStatus(status)}
              style={{
                ...styles.filterBtn,
                background: selectedStatus === status ? '#1A73E8' : 'white',
                color: selectedStatus === status ? 'white' : '#5F6368',
                border: `1px solid ${selectedStatus === status ? '#1A73E8' : '#E8EAED'}`,
              }}
            >
              {STATUS_LABELS[i]}
            </button>
          ))}
        </div>

        {/* Orders table */}
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span>Customer</span>
            <span>Address</span>
            <span>Items</span>
            <span>Status</span>
            <span>Rider</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div style={styles.empty}>No orders found</div>
          ) : (
            orders.map((order) => {
              const color = STATUS_COLORS[order.status] || '#9AA0A6'
              return (
                <div key={order.id} style={styles.tableRow}>
                  <div>
                    <div style={styles.customerName}>{order.customer_name}</div>
                    <div style={styles.customerPhone}>{order.customer_phone}</div>
                  </div>
                  <div style={styles.cell}>{order.customer_address}</div>
                  <div style={styles.cell}>
                    {order.items_description || '—'}
                  </div>
                  <div>
                    <span style={{
                      ...styles.badge,
                      background: color + '20',
                      color,
                    }}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={styles.cell}>
                    {order.delivery?.rider?.name || (
                      order.status === 'PENDING' ? (
                        <button
                          onClick={() => setAssigningOrder(order.id)}
                          style={styles.assignBtn}
                        >
                          Assign
                        </button>
                      ) : '—'
                    )}
                  </div>
                  <div style={styles.actions}>
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.trackLink}
                    >
                      Track
                    </a>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Assign rider modal */}
        {assigningOrder && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>Assign Rider</h3>
              {riders.length === 0 ? (
                <p style={{ color: '#5F6368' }}>No active riders available</p>
              ) : (
                riders.map((rider) => (
                  <div key={rider.id} style={styles.riderOption}>
                    <div>
                      <div style={styles.riderName}>{rider.name}</div>
                      <div style={styles.riderPhone}>{rider.phone}</div>
                    </div>
                    <button
                      onClick={() => handleAssign(assigningOrder, rider.id)}
                      style={styles.selectBtn}
                    >
                      Select
                    </button>
                  </div>
                ))
              )}
              <button
                onClick={() => setAssigningOrder(null)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

const styles = {
  page: {
    padding: 32,
    marginLeft: 240,
    minHeight: '100vh',
    background: '#F8F9FA',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: 'bold', margin: 0 },
  newBtn: {
    background: '#1A73E8',
    color: 'white',
    padding: '10px 20px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: 14,
  },
  filters: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '6px 14px',
    borderRadius: 20,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: '500',
  },
  table: {
    background: 'white',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1fr 1fr 0.5fr',
    padding: '12px 16px',
    fontSize: 12,
    fontWeight: '600',
    color: '#5F6368',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    background: '#F8F9FA',
    borderBottom: '1px solid #E8EAED',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1fr 1fr 0.5fr',
    padding: '14px 16px',
    alignItems: 'center',
    borderBottom: '1px solid #F1F3F4',
    fontSize: 14,
  },
  loading: { padding: 32, textAlign: 'center', color: '#5F6368' },
  empty: { padding: 32, textAlign: 'center', color: '#5F6368' },
  customerName: { fontWeight: '500' },
  customerPhone: { color: '#5F6368', fontSize: 12 },
  cell: {
    color: '#5F6368',
    fontSize: 13,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  badge: {
    padding: '3px 8px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: '600',
  },
  actions: { display: 'flex', gap: 8 },
  trackLink: { color: '#1A73E8', textDecoration: 'none', fontSize: 13 },
  assignBtn: {
    background: '#1A73E8',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    padding: '4px 10px',
    cursor: 'pointer',
    fontSize: 12,
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: 16,
    padding: 24,
    width: 400,
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', margin: '0 0 16px' },
  riderOption: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #F1F3F4',
  },
  riderName: { fontWeight: '500', fontSize: 14 },
  riderPhone: { color: '#5F6368', fontSize: 12 },
  selectBtn: {
    background: '#1A73E8',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: 13,
  },
  cancelBtn: {
    width: '100%',
    marginTop: 16,
    padding: '10px',
    background: '#F1F3F4',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    color: '#5F6368',
  },
}