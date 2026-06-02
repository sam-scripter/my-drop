// RidersPage.jsx — Rider management
import { useEffect, useState } from 'react'
import api from '../api'
import DashboardLayout from '../components/DashboardLayout'

export default function RidersPage() {
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadRiders() }, [])

  async function loadRiders() {
    setLoading(true)
    try {
      const res = await api.get('/users/riders')
      setRiders(res.data.riders)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await api.post('/users/rider', form)
      setForm({ name: '', phone: '', email: '' })
      setShowForm(false)
      loadRiders()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create rider')
    } finally {
      setCreating(false)
    }
  }

  async function handleToggle(riderId, isActive) {
    try {
      await api.put(`/users/riders/${riderId}/toggle`)
      loadRiders()
    } catch (err) {
      alert('Failed to update rider status')
    }
  }

  return (
    <DashboardLayout>
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>Riders</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            style={styles.addBtn}
          >
            {showForm ? 'Cancel' : '+ Add Rider'}
          </button>
        </div>

        {/* Add rider form */}
        {showForm && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Add New Rider</h3>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleCreate}>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Full name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={styles.input}
                    placeholder="Rider's full name"
                    required
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Phone *</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={styles.input}
                    placeholder="0712345678"
                    required
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={styles.input}
                    placeholder="rider@email.com"
                    required
                  />
                </div>
              </div>
              <p style={styles.note}>
                A temporary password will be generated and shown to you.
                The rider should change it on first login.
              </p>
              <button
                type="submit"
                disabled={creating}
                style={{ ...styles.submitBtn, opacity: creating ? 0.7 : 1 }}
              >
                {creating ? 'Creating...' : 'Create Rider Account'}
              </button>
            </form>
          </div>
        )}

        {/* Riders table */}
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span>Name</span>
            <span>Phone</span>
            <span>Email</span>
            <span>Deliveries</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading riders...</div>
          ) : riders.length === 0 ? (
            <div style={styles.empty}>
              No riders yet. Add your first rider above.
            </div>
          ) : (
            riders.map((rider) => (
              <div key={rider.id} style={styles.tableRow}>
                <div style={styles.riderName}>{rider.name}</div>
                <div style={styles.cell}>{rider.phone}</div>
                <div style={styles.cell}>{rider.email}</div>
                <div style={styles.cell}>
                  {rider._count?.deliveries ?? 0}
                </div>
                <div>
                  <span style={{
                    ...styles.statusBadge,
                    background: rider.is_active ? '#E8F5E9' : '#F5F5F5',
                    color: rider.is_active ? '#34A853' : '#9AA0A6',
                  }}>
                    {rider.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => handleToggle(rider.id, rider.is_active)}
                    style={styles.toggleBtn}
                  >
                    {rider.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
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
  addBtn: {
    background: '#1A73E8',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: 14,
  },
  formCard: {
    background: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  formTitle: { fontSize: 16, fontWeight: '600', margin: '0 0 16px' },
  error: {
    background: '#FFF5F5',
    border: '1px solid #FECACA',
    color: '#EA4335',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 12,
  },
  row: { display: 'flex', gap: 16 },
  field: { flex: 1, marginBottom: 12 },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  },
  note: {
    color: '#5F6368',
    fontSize: 12,
    margin: '8px 0 16px',
  },
  submitBtn: {
    background: '#1A73E8',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '10px 24px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: '600',
  },
  table: {
    background: 'white',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr 1fr 1fr',
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
    gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr 1fr 1fr',
    padding: '14px 16px',
    alignItems: 'center',
    borderBottom: '1px solid #F1F3F4',
    fontSize: 14,
  },
  loading: { padding: 32, textAlign: 'center', color: '#5F6368' },
  empty: { padding: 32, textAlign: 'center', color: '#5F6368' },
  riderName: { fontWeight: '500' },
  cell: { color: '#5F6368', fontSize: 13 },
  statusBadge: {
    padding: '3px 8px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: '600',
  },
  toggleBtn: {
    background: '#F1F3F4',
    border: 'none',
    borderRadius: 6,
    padding: '5px 12px',
    cursor: 'pointer',
    fontSize: 12,
    color: '#5F6368',
  },
}