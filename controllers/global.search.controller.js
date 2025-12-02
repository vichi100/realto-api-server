const GlobalSearchService = require('../services/global.search.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getGlobalSearchResult = catchAsync(async (req, res, next) => {
  const searchParams = req.body;
  const results = await GlobalSearchService.getGlobalSearchResult(searchParams);
  res.status(200).json({
    status: 'success',
    data: results
  });
});

exports.getAllGlobalListingByLocations = catchAsync(async (req, res, next) => {
  const locationParams = req.body;
  const listings = await GlobalSearchService.getAllGlobalListingByLocations(locationParams);
  res.status(200).json({
    status: 'success',
    data: listings
  });
});