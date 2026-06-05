import React, { useContext, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function AdminProfile() {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [msg, setMsg] = useState('');

  const save = async (e) => {
    e.preventDefault();
    await authAPI.updateProfile({ name, phone });
    setMsg('Profile updated');
  };

  return (
    <AdminLayout>
      <div className="max-w-xl bg-white border rounded-xl p-5">
        <h1 className="text-xl font-bold mb-4">Admin Profile</h1>
        <form onSubmit={save} className="space-y-3">
          <input className="w-full border rounded-lg p-2 text-sm" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <input className="w-full border rounded-lg p-2 text-sm" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">Save</button>
          {msg && <p className="text-sm text-emerald-600">{msg}</p>}
        </form>
      </div>
    </AdminLayout>
  );
}
