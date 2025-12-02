const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

// POST /analytics/total-listing-summary
router.post('/getTotalListingSummary', analyticsController.getTotalListingSummary);

module.exports = router;
