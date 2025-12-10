import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const ROLE_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
];

function AdminDashboard() {
  const { role, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = role === 'admin';

  useEffect(() => {
    if (!isAdmin || !user) {
      setUsers([]);
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, { credentials: 'include' });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Unable to load users.');
        }
        setUsers(data.users);
      } catch (err) {
        setError(err.message || 'Unable to load users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin, user]);

  const updateRole = async (targetUserId, newRole) => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/updateRole`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId: targetUserId, newRole }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to update role.');
      }
      setUsers((prev) =>
        prev.map((entry) => (entry.id === data.user.id ? { ...entry, role: data.user.role } : entry))
      );
    } catch (err) {
      setError(err.message || 'Unable to update role.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="page-container">
        <h1>Admin Dashboard</h1>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Admin Dashboard</h1>
      {error && <p className="editor-warning">{error}</p>}
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.name}</td>
                  <td>{entry.email}</td>
                  <td>{entry.role}</td>
                  <td>{new Date(entry.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="admin-actions">
                      {ROLE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`admin-action-button ${
                            entry.role === option.value ? 'admin-action-button--active' : ''
                          }`}
                          onClick={() => updateRole(entry.id, option.value)}
                          disabled={entry.id === user?.id && option.value !== 'admin'}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
