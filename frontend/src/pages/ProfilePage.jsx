import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineOfficeBuilding, HiOutlinePencil } from 'react-icons/hi';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
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
      setUser(res.data);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page profile-page">
      <div className="container">
        <div className="profile-header glass-card">
          <div className="profile-cover"></div>
          <div className="profile-info-main">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} />
                ) : (
                  <HiOutlineUser size={48} />
                )}
              </div>
              {editing && (
                <button className="avatar-edit-btn" onClick={() => toast.info('Avatar upload coming soon!')}>
                  <HiOutlinePencil />
                </button>
              )}
            </div>
            <div className="profile-title-area">
              <h1 className="profile-name">{user?.name}</h1>
              <p className="profile-role-badge">{user?.role?.replace('ROLE_', '')}</p>
            </div>
            {!editing && (
              <button className="btn btn-primary edit-profile-btn" onClick={() => setEditing(true)}>
                <HiOutlinePencil /> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="profile-content-grid">
          <div className="profile-sidebar">
            <div className="glass-card info-card">
              <h3>Contact Information</h3>
              <div className="info-row">
                <HiOutlineMail />
                <div>
                  <label>Email</label>
                  <p>{user?.email}</p>
                </div>
              </div>
              <div className="info-row">
                <HiOutlinePhone />
                <div>
                  <label>Phone</label>
                  <p>{user?.phoneNumber || 'Not provided'}</p>
                </div>
              </div>
              <div className="info-row">
                <HiOutlineOfficeBuilding />
                <div>
                  <label>Department</label>
                  <p>{user?.department || 'Not assigned'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-main">
            {editing ? (
              <div className="glass-card profile-form-card">
                <h2>Edit Your Profile</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      className="form-input" 
                      value={form.name} 
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input 
                        className="form-input" 
                        value={form.phoneNumber} 
                        onChange={(e) => setForm({...form, phoneNumber: e.target.value})}
                        placeholder="+94 7X XXX XXXX"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <input 
                        className="form-input" 
                        value={form.department} 
                        onChange={(e) => setForm({...form, department: e.target.value})}
                        placeholder="e.g. Computing, Engineering"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea 
                      className="form-textarea" 
                      value={form.bio} 
                      onChange={(e) => setForm({...form, bio: e.target.value})}
                      placeholder="Tell us a bit about yourself..."
                      rows="4"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="glass-card bio-card">
                <h2>About Me</h2>
                <p className="bio-text">
                  {user?.bio || 'No bio provided yet. Click "Edit Profile" to add one!'}
                </p>
                
                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-value">Active</span>
                    <span className="stat-label">Status</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{new Date(user?.createdAt).toLocaleDateString()}</span>
                    <span className="stat-label">Member Since</span>
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
