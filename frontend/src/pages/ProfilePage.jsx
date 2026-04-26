import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineOfficeBuilding, HiOutlinePencil, HiOutlineCalendar, HiOutlineShieldCheck, HiOutlineBadgeCheck } from 'react-icons/hi';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    department: user?.department || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.updateProfile(form);
      updateUser(res.data);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <div className="page profile-page animate-fade-in">
      <div className="container">
        <div className="profile-hero glass-card">
          <div className="profile-cover-v2">
            <div className="cover-pattern"></div>
          </div>
          <div className="profile-hero-content">
            <div className="profile-avatar-large">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} />
              ) : (
                <div className="avatar-placeholder">{getInitials(user?.name)}</div>
              )}
              {editing && (
                <button className="avatar-upload-trigger" title="Upload New Photo">
                  <HiOutlinePencil />
                </button>
              )}
            </div>
            
            <div className="profile-identity">
              <div className="name-row">
                <h1 className="display-name">{user?.name}</h1>
                <HiOutlineBadgeCheck className="verified-icon" title="Verified Member" />
              </div>
              <div className="meta-row">
                <span className="role-tag">{user?.role?.replace('ROLE_', '')}</span>
                <span className="dot-separator">•</span>
                <span className="dept-text">{user?.department || 'General Department'}</span>
              </div>
            </div>

            <div className="hero-actions">
              {!editing ? (
                <button className="btn btn-primary btn-with-icon" onClick={() => setEditing(true)}>
                  <HiOutlinePencil /> Edit Profile
                </button>
              ) : (
                <div className="editing-indicator">
                  <span className="pulse-dot"></span> Editing Mode
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-layout-grid">
          <div className="layout-sidebar">
            <div className="glass-card sidebar-section">
              <h3 className="section-title">Contact Details</h3>
              <div className="detail-list">
                <div className="detail-item">
                  <div className="icon-box"><HiOutlineMail /></div>
                  <div className="item-content">
                    <span className="item-label">Email Address</span>
                    <span className="item-value">{user?.email}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="icon-box"><HiOutlinePhone /></div>
                  <div className="item-content">
                    <span className="item-label">Phone</span>
                    <span className="item-value">{user?.phoneNumber || '--'}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="icon-box"><HiOutlineOfficeBuilding /></div>
                  <div className="item-content">
                    <span className="item-label">Workplace</span>
                    <span className="item-value">{user?.department || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card sidebar-section security-section">
              <h3 className="section-title">Account Security</h3>
              <div className="security-item">
                <HiOutlineShieldCheck className="sec-icon green" />
                <span>Two-Factor Auth Enabled</span>
              </div>
              <button className="btn btn-outline btn-sm full-width" onClick={() => toast.info('Security settings coming soon')}>
                Manage Security
              </button>
            </div>
          </div>

          <div className="layout-main">
            {editing ? (
              <div className="glass-card profile-form-container">
                <div className="form-header">
                  <h2>Update Personal Information</h2>
                  <p>Changes will be reflected across your campus profile.</p>
                </div>
                <form onSubmit={handleSubmit} className="modern-form">
                  <div className="form-section">
                    <div className="form-group">
                      <label className="field-label">Full Name</label>
                      <input 
                        className="modern-input" 
                        value={form.name} 
                        onChange={(e) => setForm({...form, name: e.target.value})}
                        required
                        placeholder="Your full legal name"
                      />
                    </div>
                    
                    <div className="input-row">
                      <div className="form-group">
                        <label className="field-label">Phone Number</label>
                        <input 
                          className="modern-input" 
                          value={form.phoneNumber} 
                          onChange={(e) => setForm({...form, phoneNumber: e.target.value})}
                          placeholder="+94 7X XXX XXXX"
                        />
                      </div>
                      <div className="form-group">
                        <label className="field-label">Department</label>
                        <input 
                          className="modern-input" 
                          value={form.department} 
                          onChange={(e) => setForm({...form, department: e.target.value})}
                          placeholder="e.g. Computing"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="field-label">Professional Bio</label>
                      <textarea 
                        className="modern-textarea" 
                        value={form.bio} 
                        onChange={(e) => setForm({...form, bio: e.target.value})}
                        placeholder="Tell the community about your expertise and role..."
                        rows="5"
                      />
                    </div>
                  </div>

                  <div className="form-footer">
                    <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Discard</button>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                      {loading ? 'Saving Changes...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="main-content-stack">
                <div className="glass-card info-summary-card">
                  <div className="card-header-v2">
                    <HiOutlineUser />
                    <h2>About Profile</h2>
                  </div>
                  <p className="description-text">
                    {user?.bio || 'No professional bio has been added yet. A well-crafted bio helps other campus members understand your role and expertise.'}
                  </p>
                  
                  <div className="quick-stats-grid">
                    <div className="quick-stat">
                      <div className="stat-num">Active</div>
                      <div className="stat-desc">Account Status</div>
                    </div>
                    <div className="quick-stat">
                      <div className="stat-num">{new Date(user?.createdAt).toLocaleDateString()}</div>
                      <div className="stat-desc">Enrollment Date</div>
                    </div>
                    <div className="quick-stat">
                      <div className="stat-num">04</div>
                      <div className="stat-desc">Active Bookings</div>
                    </div>
                  </div>
                </div>

                <div className="glass-card activity-timeline">
                  <div className="card-header-v2">
                    <HiOutlineCalendar />
                    <h2>Recent Campus Activity</h2>
                  </div>
                  <div className="timeline-placeholder">
                    <div className="timeline-item-dummy">
                      <div className="time-marker">Today</div>
                      <div className="event-box">Successfully updated facility permissions</div>
                    </div>
                    <div className="timeline-item-dummy">
                      <div className="time-marker">Yesterday</div>
                      <div className="event-box">Booked Main Lecture Hall A for 2 hours</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

