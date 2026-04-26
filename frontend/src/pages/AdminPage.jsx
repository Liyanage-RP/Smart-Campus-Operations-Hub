import { useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';
import { HiOutlineUserGroup, HiOutlineShieldCheck, HiOutlineCog } from 'react-icons/hi';
import './AdminPage.css';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await authApi.getAllUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await authApi.updateRole(userId, newRole);
      toast.success('Role updated successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phoneNumber: '', department: '', bio: '' });

  const handleEditClick = (user) => {
    setEditUser(user);
    setEditForm({
      name: user.name || '',
      phoneNumber: user.phoneNumber || '',
      department: user.department || '',
      bio: user.bio || ''
    });
  };

  const handleAdminUpdate = async (e) => {
    e.preventDefault();
    try {
      await authApi.adminUpdateProfile(editUser.id, editForm);
      toast.success('User profile updated');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user profile');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return <HiOutlineShieldCheck style={{ color: 'var(--accent-danger)' }} />;
      case 'ROLE_TECHNICIAN': return <HiOutlineCog style={{ color: 'var(--accent-warning)' }} />;
      default: return <HiOutlineUserGroup style={{ color: 'var(--accent-info)' }} />;
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users and their access roles</p>
        </div>

        {loading ? (
          <div className="glass-card" style={{ padding: 24 }}>
            <div className="skeleton" style={{ height: 400, borderRadius: 8 }} />
          </div>
        ) : (
          <div className="glass-card users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Role</th>
                  <th>Update Role</th>
                  <th>Profile</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {u.avatarUrl ? <img src={u.avatarUrl} alt="" /> : u.name[0].toUpperCase()}
                        </div>
                        <span className="user-name">{u.name}</span>
                      </div>
                    </td>
                    <td><span className="user-email">{u.email}</span></td>
                    <td><span className="user-date">{new Date(u.createdAt).toLocaleDateString()}</span></td>
                    <td>
                      <div className="role-cell">
                        {getRoleIcon(u.role)}
                        <span>{u.role.replace('ROLE_', '')}</span>
                      </div>
                    </td>
                    <td>
                      <select 
                        className="form-select role-select" 
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        <option value="ROLE_USER">User</option>
                        <option value="ROLE_TECHNICIAN">Technician</option>
                        <option value="ROLE_ADMIN">Admin</option>
                      </select>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEditClick(u)}>Edit Profile</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editUser && (
          <div className="modal-overlay" onClick={() => setEditUser(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Edit Profile: {editUser.name}</h2>
                <button className="modal-close" onClick={() => setEditUser(null)}>✕</button>
              </div>
              <form onSubmit={handleAdminUpdate}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" value={editForm.phoneNumber} onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" value={editForm.department} onChange={(e) => setEditForm({...editForm, department: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-textarea" value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} rows="3" />
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditUser(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
