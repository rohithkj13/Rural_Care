import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <button onClick={handleMarkAllAsRead} className="bg-primary text-white px-6 py-2 rounded hover:bg-green-600">Mark All as Read</button>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-600">No notifications</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div key={notif._id} className={`bg-white rounded-lg shadow-md p-6 ${!notif.isRead ? 'border-l-4 border-primary' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{notif.title}</h3>
                    <p className="text-gray-700 mb-2">{notif.message}</p>
                    <p className="text-sm text-gray-500">{new Date(notif.createdAt).toLocaleString()}</p>
                  </div>
                  {!notif.isRead && (
                    <button onClick={() => handleMarkAsRead(notif._id)} className="text-primary hover:underline text-sm">Mark as Read</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
