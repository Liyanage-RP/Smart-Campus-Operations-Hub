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
                  <th>Provider</th>
                  <th>Joined</th>
                  <th>Role</th>
                  <th>Action</th>
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
                    <td><span className={`badge badge-${u.provider === 'google' ? 'info' : 'secondary'}`}>{u.provider}</span></td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
