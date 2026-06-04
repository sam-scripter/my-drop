import { useState, useEffect } from 'react'
import api from '../api'
import DashboardLayout from '../components/DashboardLayout'

export default function RidersPage() {
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [tempPassword, setTempPassword] = useState(null)

  async function fetchRiders() {
    try {
      const res = await api.get('/users/riders')
      setRiders(res.data.riders)
    } catch {
      setError('Failed to load riders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRiders() }, [])

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleCreateRider(e) {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    try {
      const res = await api.post('/users/rider', form)
      setTempPassword(res.data.tempPassword)
      setForm({ name: '', phone: '', email: '' })
      fetchRiders()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create rider')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleToggle(riderId) {
    try {
      await api.put(`/users/riders/${riderId}/toggle`)
      setRiders(prev =>
        prev.map(r => r.id === riderId ? { ...r, is_active: !r.is_active } : r)
      )
    } catch {
      alert('Failed to update rider status')
    }
  }

  return (
    <DashboardLayout>
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>Riders</h1>
          <button onClick={() => { setShowForm(true); setTempPassword(null) }} style={styles.addBtn}>
            + Add Rider
          </button>
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <div style={styles.formTitle}>New Rider</div>

            {tempPassword ? (
              <div>
                <div style={styles.successMsg}>Rider created successfully! Login credentials have been sent to their email.</div>
                <div style={styles.tempBox}>
                  <div style={styles.tempLabel}>Temporary password (share with rider)</div>
                  <div style={styles.tempPassword}>{tempPassword}</div>
                </div>
                <button onClick={() => { setShowForm(false); setTempPassword(null) }} style={styles.doneBtn}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateRider}>
                {formError && <div style={styles.formError}>{formError}</div>}
                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Full name *</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      style={styles.input}
                      placeholder="e.g. James Mwangi"
                      required
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Phone *</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleFormChange}
                      style={styles.input}
                      placeholder="0712345678"
                      required
                    />
                  </div>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Email *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleFormChange}
                    style={styles.input}
                    placeholder="rider@email.com"
                    required
                  />
                </div>
                <div style={styles.formActions}>
                  <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" disabled={formLoading} style={{ ...styles.submitBtn, opacity: formLoading ? 0.7 : 1 }}>
                    {formLoading ? 'Creating...' : 'Create Rider'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {loading ? (
          <div style={styles.empty}>Loading riders...</div>
        ) : error ? (
          <div style={styles.errorMsg}>{error}</div>
        ) : riders.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>🏍️</div>
            <div style={styles.emptyText}>No riders yet</div>
            <div style={styles.emptySub}>Add your first rider to start assigning deliveries</div>
          </div>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <div style={styles.colName}>Name</div>
              <div style={styles.colPhone}>Phone</div>
              <div style={styles.colEmail}>Email</div>
              <div style={styles.colDeliveries}>Deliveries</div>
              <div style={styles.colStatus}>Status</div>
            </div>
            {riders.map(rider => (
              <div key={rider.id} style={styles.tableRow}>
                <div style={styles.colName}>
                  <div style={styles.avatar}>{rider.name.charAt(0).toUpperCase()}</div>
                  <span style={styles.riderName}>{rider.name}</span>
                </div>
                <div style={styles.colPhone}>{rider.phone}</div>
                <div style={styles.colEmail}>{rider.email}</div>
                <div style={styles.colDeliveries}>{rider._count?.deliveries ?? 0}</div>
                <div style={styles.colStatus}>
                  <button
                    onClick={() => handleToggle(rider.id)}
                    style={{
                      ...styles.statusBadge,
                      background: rider.is_active ? '#E8F5E9' : '#F1F3F4',
                      color: rider.is_active ? '#2E7D32' : '#5F6368',
                    }}
                  >
                    {rider.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            ))}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: 'bold', margin: 0 },
  addBtn: {
    padding: '10px 20px',
    background: '#1A73E8',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: '600',
  },
  formCard: {
    background: 'white',
    borderRadius: 12,
    padding: 28,
    maxWidth: 640,
    marginBottom: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    color: '#1A1A1A',
  },
  formError: {
    background: '#FFF5F5',
    border: '1px solid #FECACA',
    color: '#EA4335',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
  },
  successMsg: {
    background: '#E8F5E9',
    color: '#2E7D32',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
    fontWeight: '500',
  },
  tempBox: {
    background: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  tempLabel: { fontSize: 12, color: '#5F6368', marginBottom: 8 },
  tempPassword: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    letterSpacing: 2,
  },
  doneBtn: {
    padding: '10px 24px',
    background: '#1A73E8',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: '600',
  },
  row: { display: 'flex', gap: 16 },
  field: { flex: 1, marginBottom: 16 },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  formActions: {
    display: 'flex',
    gap: 12,
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '10px 24px',
    background: '#F1F3F4',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    color: '#5F6368',
  },
  submitBtn: {
    padding: '10px 24px',
    background: '#1A73E8',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: '600',
  },
  empty: { color: '#5F6368', fontSize: 14, padding: 16 },
  errorMsg: {
    background: '#FFF5F5',
    border: '1px solid #FECACA',
    color: '#EA4335',
    padding: '12px 16px',
    borderRadius: 8,
    fontSize: 14,
  },
  emptyCard: {
    background: 'white',
    borderRadius: 12,
    padding: 48,
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#5F6368' },
  table: {
    background: 'white',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    padding: '12px 20px',
    background: '#F8F9FA',
    borderBottom: '1px solid #E8EAED',
    fontSize: 12,
    fontWeight: '600',
    color: '#5F6368',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid #F1F3F4',
  },
  colName: { flex: 2, display: 'flex', alignItems: 'center', gap: 10 },
  colPhone: { flex: 1.5 },
  colEmail: { flex: 2 },
  colDeliveries: { flex: 1, textAlign: 'center' },
  colStatus: { flex: 1, textAlign: 'right' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#1A73E8',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 0,
  },
  riderName: { fontSize: 14, fontWeight: '500', color: '#1A1A1A' },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: 20,
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: '500',
  },
}
