const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { sendSuccess, sendError } = require('../utils/responseUtils');

const notifPath = path.join(__dirname, '../data/notifications.json');
const getNotifications = () => JSON.parse(fs.readFileSync(notifPath, 'utf8'));
const saveNotifications = (data) => fs.writeFileSync(notifPath, JSON.stringify(data, null, 2));

const getUserNotifications = (req, res) => {
  const notifications = getNotifications();
  const userNotifs = notifications.filter(n => n.userId === req.user.id);
  
  sendSuccess(res, 200, 'Notifications retrieved', userNotifs);
};

const sendNotification = (req, res) => {
  const { userId, type, message } = req.body;
  const notifications = getNotifications();
  
  const newNotif = {
    id: uuidv4(),
    userId,
    type,
    message,
    read: false,
    createdAt: new Date().toISOString()
  };
  
  notifications.push(newNotif);
  saveNotifications(notifications);
  
  sendSuccess(res, 201, 'Notification sent', newNotif);
};

const markAsRead = (req, res) => {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === req.params.id && n.userId === req.user.id);
  
  if (index === -1) {
    return sendError(res, 404, 'Notification not found');
  }
  
  notifications[index].read = true;
  saveNotifications(notifications);
  
  sendSuccess(res, 200, 'Notification marked as read', notifications[index]);
};

module.exports = { getUserNotifications, sendNotification, markAsRead };
