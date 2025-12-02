const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminder.controller');

// POST routes: path names match controller method names
router.post('/getReminderList', reminderController.getReminderList);
router.post('/getPropReminderList', reminderController.getPropReminderList);
router.post('/addNewReminder', reminderController.addNewReminder);
router.post('/getCustomerReminderList', reminderController.getCustomerReminderList);
router.post('/getReminderListByCustomerId', reminderController.getReminderListByCustomerId);

module.exports = router;
