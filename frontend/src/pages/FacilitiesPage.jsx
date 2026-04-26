import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { facilityApi } from '../api/facilityApi';
import { toast } from 'react-toastify';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineLocationMarker, HiOutlineUsers, HiOutlineClock } from 'react-icons/hi';
import ConfirmDialog from '../components/common/ConfirmDialog';
import './FacilitiesPage.css';

const TYPES = ['', 'LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const TYPE_LABELS = { LECTURE_HALL: 'Lecture Hall', LAB: 'Lab', MEETING_ROOM: 'Meeting Room', EQUIPMENT: 'Equipment' };
const TYPE_ICONS = { LECTURE_HALL: '🏫', LAB: '🔬', MEETING_ROOM: '🤝', EQUIPMENT: '📽️' };

export default function FacilitiesPage() {
  const { isAdmin } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState(null); // stores ID of facility to delete

  const fetchFacilities = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      const res = await facilityApi.getAll(params);
      setFacilities(res.data);
    } catch (err) {
      toast.error('Failed to load facilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFacilities(); }, [search, typeFilter]);

  const handleDelete = async (id) => {
    try {
      await facilityApi.delete(id);
      toast.success('Facility deleted');
      fetchFacilities();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingFacility) {
        await facilityApi.update(editingFacility.id, data);
        toast.success('Facility updated');
      } else {
        await facilityApi.create(data);
        toast.success('Facility created');
      }
      setShowForm(false);
      setEditingFacility(null);
      fetchFacilities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Facilities & Assets</h1>
            <p className="page-subtitle">Browse and book campus resources</p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => { setEditingFacility(null); setShowForm(true); }}>
              <HiOutlinePlus /> Add Facility
            </button>
          )}
        </div>

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

        {loading ? (
          <div className="grid grid-3">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 16 }} />)}
          </div>
        ) : facilities.length === 0 ? (
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
