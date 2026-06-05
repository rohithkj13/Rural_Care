import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import DoctorLayout from '../components/DoctorLayout';
import { FaBell, FaCheckDouble, FaCalendarAlt, FaFileMedical, FaInfoCircle } from 'react-icons/fa';

const TYPE_ICON = {
  appointment: FaCalendarAlt,
  prescription: FaFileMedical,
  general: FaInfoCircle,
};
const TYPE_COLOR = {
  appointment: 'text-blue-500 bg-blue-50',
  prescription: 'text-orange-500 bg-orange-50',
  general: 'text-gray-500 bg-gray-100',
};

const DoctorNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
    } catch (err) { console.error(err); }
  };

  const markAll = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
    } catch (err) { console.error(err); }
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <DoctorLayout notifications={unread}>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          {unread > 0 && (
            <button
              onClick={markAll}
              className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <FaCheckDouble /> Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <FaBell className="text-5xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const Icon = TYPE_ICON[n.type] || FaInfoCircle;
              const colorClass = TYPE_COLOR[n.type] || TYPE_COLOR.general;
              return (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markRead(n._id)}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer
                    ${n.isRead ? 'bg-white border-gray-100' : 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default DoctorNotifications;
