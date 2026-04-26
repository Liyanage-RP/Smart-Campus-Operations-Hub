import { bookingApi } from '../api/bookingApi';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineLocationMarker, HiOutlineUsers, HiOutlineClock, HiOutlineTable, HiOutlineChartBar, HiOutlineCalendar, HiOutlineSparkles, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import ConfirmDialog from '../components/common/ConfirmDialog';
import AIChatbot from '../components/chat/AIChatbot';
import './FacilitiesPage.css';

// ... (consts stay the same)

export default function FacilitiesPage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('catalogue'); // 'catalogue', 'calendar', 'analytics'
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Form & Confirm state
  const [showForm, setShowForm] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      
      const [facRes, bookRes] = await Promise.all([
        facilityApi.getAll(params),
        bookingApi.getAll()
      ]);
      
      setFacilities(facRes.data);
      setBookings(bookRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search, typeFilter]);

  // ... (handlers stay similar)

  const renderCatalogue = () => (
    <>
      <div className="facilities-toolbar">
        <div className="search-wrapper">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by name, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="facility-search"
          />
        </div>
        <div className="filter-pills">
          {TYPES.map(t => (
            <button
              key={t}
              className={`filter-pill ${typeFilter === t ? 'active' : ''}`}
              onClick={() => setTypeFilter(t)}
            >
              {t ? TYPE_LABELS[t] : 'All'}
            </button>
          ))}
        </div>
      </div>

      {facilities.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏛️</div>
          <div className="empty-state-title">No facilities found</div>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {facilities.map(f => (
            <Link key={f.id} to={`/facilities/${f.id}`} className="facility-card glass-card">
              <div className="facility-card-header">
                <span className="facility-type-icon">{TYPE_ICONS[f.type] || '🏢'}</span>
                <span className={`badge badge-${f.status.toLowerCase()}`}>{f.status.replace('_', ' ')}</span>
              </div>
              <h3 className="facility-name">{f.name}</h3>
              <p className="facility-desc">{f.description?.substring(0, 80)}...</p>
              <div className="facility-meta">
                <span><HiOutlineLocationMarker /> {f.location}</span>
                <span><HiOutlineUsers /> {f.capacity}</span>
                <span title="Total Approved Bookings">📊 {f.usageCount || 0} Uses</span>
                {f.availabilityStartTime && <span><HiOutlineClock /> {f.availabilityStartTime} - {f.availabilityEndTime}</span>}
              </div>
              {isAdmin && (
                <div className="facility-actions" onClick={(e) => e.preventDefault()}>
                  <button className="btn btn-sm btn-secondary" onClick={(e) => { e.preventDefault(); setEditingFacility(f); setShowForm(true); }}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={(e) => { e.preventDefault(); setDeleteConfirm(f.id); }}>Delete</button>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  );

  const renderCalendar = () => {
    const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const approvedBookings = bookings.filter(b => b.status === 'APPROVED');

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(<div key={`e-${i}`} className="calendar-cell empty"></div>);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayBookings = approvedBookings.filter(b => b.bookingDate === dateStr);
      const isToday = new Date().toDateString() === new Date(calendarDate.getFullYear(), calendarDate.getMonth(), d).toDateString();
      cells.push(
        <div key={d} className={`calendar-cell ${isToday ? 'today' : ''}`}>
          <span className="day-number">{d}</span>
          <div className="day-bookings">
            {dayBookings.map(b => (
              <div key={b.id} className="calendar-event" title={`${b.facilityName}: ${b.startTime}-${b.endTime}`}>{b.facilityName.split(' ')[0]}</div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="glass-card calendar-mini">
        <div className="calendar-header">
          <h3>{monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}</h3>
          <div className="calendar-nav">
            <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))} className="nav-btn"><HiOutlineChevronLeft /></button>
            <button onClick={() => setCalendarDate(new Date())} className="nav-btn today-btn">Today</button>
            <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))} className="nav-btn"><HiOutlineChevronRight /></button>
          </div>
        </div>
        <div className="calendar-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className="weekday-header">{d}</div>)}
          {cells}
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    const sortedFacs = [...facilities].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)).slice(0, 5);
    const maxUsage = Math.max(...facilities.map(f => f.usageCount || 1));

    return (
      <div className="glass-card analytics-mini">
        <div className="analytics-grid">
          <div className="chart-group">
            <h3 className="chart-title">Top Resources by Usage</h3>
            <div className="bar-chart">
              {sortedFacs.map((f, i) => (
                <div key={i} className="bar-row">
                  <span className="bar-label">{f.name}</span>
                  <div className="bar-wrapper">
                    <div className="bar-fill" style={{ width: `${((f.usageCount || 0) / maxUsage) * 100}%` }}></div>
                    <span className="bar-value">{f.usageCount || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-group">
            <h3 className="chart-title">Usage Statistics</h3>
            <div className="stat-summary-grid">
              <div className="summary-card">
                <span className="summary-val">{facilities.reduce((a, b) => a + (b.usageCount || 0), 0)}</span>
                <span className="summary-lbl">Total Bookings</span>
              </div>
              <div className="summary-card">
                <span className="summary-val">{facilities.filter(f => f.status === 'ACTIVE').length}</span>
                <span className="summary-lbl">Active Units</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page facilities-hub">
      <div className="container">
        <div className="page-header">
          <div className="title-section">
            <h1 className="page-title">Facilities & Smart Assets</h1>
            <p className="page-subtitle">Unified resource management system</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary chat-btn-inline" onClick={() => toast.info('Click the sparkle icon at the bottom right for AI help!')}>
              <HiOutlineSparkles /> AI Assistant
            </button>
            {isAdmin && (
              <button className="btn btn-primary" onClick={() => { setEditingFacility(null); setShowForm(true); }}>
                <HiOutlinePlus /> Add Facility
              </button>
            )}
          </div>
        </div>

        <div className="hub-tabs glass-card">
          <button className={`hub-tab ${activeTab === 'catalogue' ? 'active' : ''}`} onClick={() => setActiveTab('catalogue')}>
            <HiOutlineTable /> Catalogue
          </button>
          <button className={`hub-tab ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
            <HiOutlineCalendar /> Availability
          </button>
          <button className={`hub-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <HiOutlineChartBar /> Analytics
          </button>
        </div>

        {loading ? (
          <div className="grid grid-3">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 16 }} />)}
          </div>
        ) : (
          <div className="tab-content animate-fade">
            {activeTab === 'catalogue' && renderCatalogue()}
            {activeTab === 'calendar' && renderCalendar()}
            {activeTab === 'analytics' && renderAnalytics()}
          </div>
        )}

        <AIChatbot />

        {showForm && (
          <FacilityFormModal
            facility={editingFacility}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditingFacility(null); }}
          />
        )}
        
        {deleteConfirm && (
          <ConfirmDialog
            isOpen={!!deleteConfirm}
            title="Delete Facility"
            message="Are you sure you want to delete this facility? This action cannot be undone."
            confirmText="Delete"
            type="danger"
            onConfirm={() => handleDelete(deleteConfirm)}
            onCancel={() => setDeleteConfirm(null)}
          />
        )}
      </div>
    </div>
  );
}

function FacilityFormModal({ facility, onSave, onClose }) {
  const [form, setForm] = useState({
    name: facility?.name || '',
    type: facility?.type || 'LECTURE_HALL',
    capacity: facility?.capacity || 1,
    location: facility?.location || '',
    description: facility?.description || '',
    imageUrl: facility?.imageUrl || '',
    status: facility?.status || 'ACTIVE',
    availabilityStartTime: facility?.availabilityStartTime || '08:00',
    availabilityEndTime: facility?.availabilityEndTime || '18:00',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Facility name is required';
    if (!form.location.trim()) newErrors.location = 'Location is required';
    if (form.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
    
    if (form.availabilityStartTime && form.availabilityEndTime) {
      if (form.availabilityEndTime <= form.availabilityStartTime) {
        newErrors.time = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'capacity' ? parseInt(value) || 0 : value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(form);
    } else {
      toast.error('Please fix the errors before submitting');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{facility ? 'Edit Facility' : 'Add New Facility'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input 
              className={`form-input ${errors.name ? 'input-error' : ''}`} 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              id="facility-name" 
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select className="form-select" name="type" value={form.type} onChange={handleChange} id="facility-type">
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="LAB">Lab</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Capacity *</label>
              <input 
                className={`form-input ${errors.capacity ? 'input-error' : ''}`} 
                type="number" 
                name="capacity" 
                min="1" 
                value={form.capacity} 
                onChange={handleChange} 
                id="facility-capacity" 
              />
              {errors.capacity && <p className="error-text">{errors.capacity}</p>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Location *</label>
            <input 
              className={`form-input ${errors.location ? 'input-error' : ''}`} 
              name="location" 
              value={form.location} 
              onChange={handleChange} 
              id="facility-location" 
            />
            {errors.location && <p className="error-text">{errors.location}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange} id="facility-description" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Available From</label>
              <input 
                className={`form-input ${errors.time ? 'input-error' : ''}`} 
                type="time" 
                name="availabilityStartTime" 
                value={form.availabilityStartTime} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Available To</label>
              <input 
                className={`form-input ${errors.time ? 'input-error' : ''}`} 
                type="time" 
                name="availabilityEndTime" 
                value={form.availabilityEndTime} 
                onChange={handleChange} 
              />
            </div>
          </div>
          {errors.time && <p className="error-text" style={{ marginTop: -8, marginBottom: 12 }}>{errors.time}</p>}
          
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" name="status" value={form.status} onChange={handleChange}>
              <option value="ACTIVE">Active</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="facility-save">{facility ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
