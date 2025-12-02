// utils/matchEngine.js
// Modular scoring engine with fully separated RENT and BUY/SELL scoring blocks
// Updated according to final confirmed weights

// --- CONFIGURABLE CONSTANTS ---
const LOCATION_RADIUS_METERS = 10000; // 10km
const MIN_SCORE_THRESHOLD = 60;

function rangedScore(maxScore, diff, range) {
  if (diff > range) return 0;
  return maxScore * (1 - diff / range);
}

module.exports = {
  LOCATION_RADIUS_METERS,
  MIN_SCORE_THRESHOLD,

  // ----------------------------------------------------
  // LOCATION (Mandatory filter, applies to all)
  // ----------------------------------------------------
  scoreLocation(distance) {
    if (distance > LOCATION_RADIUS_METERS) return { ok: false, score: 0 };
    return { ok: true, score: 40 }; // Highest weight across all categories
  },

  // ----------------------------------------------------
  // BHK (Residential Only)
  // ----------------------------------------------------
  scoreBHK(propertyBHK, customerBHK) {
    if (propertyBHK === customerBHK) return 25;        // Increased sensitivity
    if (Math.abs(propertyBHK - customerBHK) === 1) return 10;
    return 0;
  },

  // ----------------------------------------------------
  // RESIDENTIAL RENT BLOCK
  // ----------------------------------------------------
  scoreRentPrice(pRent, cRent) {
    const diff = Math.abs(pRent - cRent);
    const range = cRent * 0.20;
    return rangedScore(25, diff, range);               // Increased from 20 → 25
  },

  scoreRentDeposit(pDeposit, cDeposit) {
    const diff = Math.abs(pDeposit - cDeposit);
    const range = cDeposit * 0.50;
    return rangedScore(10, diff, range);               // Reduced from 15 → 10
  },

  scoreRentPreferredTenants(pTenant, cTenant) {
    return pTenant === cTenant ? 3 : 0;                // Reduced from 5 → 3
  },

  scoreRentNonVeg(pAllow, cAllow) {
    return pAllow === cAllow ? 1 : 0;
  },

  // ----------------------------------------------------
  // RESIDENTIAL BUY BLOCK
  // ----------------------------------------------------
  scoreBuyPrice(pPrice, cPrice) {
    const diff = Math.abs(pPrice - cPrice);
    const range = cPrice * 0.20;
    return rangedScore(25, diff, range);               // Increased residential sensitivity
  },

  // ----------------------------------------------------
  // COMMERCIAL RENT + BUY BLOCK
  // ----------------------------------------------------
  scoreCommercialPrice(pPrice, cPrice) {
    const diff = Math.abs(pPrice - cPrice);
    const range = cPrice * 0.20;
    return rangedScore(30, diff, range);               // Commercial price very sensitive
  },

  scoreCommercialSize(pSize, cSize) {
    const diff = Math.abs(pSize - cSize);
    const range = pSize * 0.30;
    return rangedScore(25, diff, range);               // Increased 5 → 25
  },

  scoreIdealFor(propertyIdealFor, customerUse) {
    if (!Array.isArray(propertyIdealFor)) return 0;
    return propertyIdealFor.includes(customerUse) ? 5 : 0;
  },

  scorePropertyUsedFor(pUsed, cUsed) {
    return pUsed === cUsed ? 5 : 0;                    // Increased from 2 → 5
  },

  // ----------------------------------------------------
  // COMMON BLOCKS
  // ----------------------------------------------------
  scoreFurnishing(pFurnish, cFurnish) {
    return pFurnish === cFurnish ? 3 : 0;
  },

  scoreParking(pPark, cPark) {
    return pPark === cPark ? 2 : 0;
  },

  scoreAvailableFrom(pDate, cDate, isCommercial = false) {
    const diff = Math.abs(new Date(pDate) - new Date(cDate));
    const range = (isCommercial ? 90 : 30) * 86400000;
    return rangedScore(2, diff, range);
  },

  // ----------------------------------------------------
  // FINAL SCORE AGGREGATION
  // ----------------------------------------------------
  computeFinalScore(scores) {
    return Object.values(scores).reduce((sum, v) => sum + v, 0);
  }
};
