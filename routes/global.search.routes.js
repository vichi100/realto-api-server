const express = require('express');
const router = express.Router();
const globalSearchController = require('../controllers/global.search.controller');

// POST routes: path names match controller method names
router.post('/getGlobalSearchResult', globalSearchController.getGlobalSearchResult);
router.post('/getAllGlobalListingByLocations', globalSearchController.getAllGlobalListingByLocations);

module.exports = router;
