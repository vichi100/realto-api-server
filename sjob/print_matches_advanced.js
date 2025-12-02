


/**
 * How to run:    node print_matches_advanced.js
 */




/**
 * ADVANCED MATCH REPORT GENERATOR (FINAL, CORRECTED, WORKING)
 * -----------------------------------------------------------
 * Features:
 *  ✔ Filter by agent
 *  ✔ Filter by property type
 *  ✔ Sort by score
 *  ✔ Group by property
 *  ✔ Export CSV
 *  ✔ Export Excel
 * 
 * 100% Correct Customer Name + Property Address
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const XLSX = require("xlsx");

// Load ROOT-level .env
require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});

// =============================================================
// 1. CONFIG (Hardcoded)
// =============================================================
const CONFIG = {
  FILTER_AGENT: null,               // e.g. "AGENT102" or null
  FILTER_PROPERTY_TYPE: null,       // e.g. "Residential Rent", "Commercial Buy", etc.
  SORT_BY_SCORE: true,
  GROUP_BY_PROPERTY: true,
  EXPORT_CSV: true,
  EXPORT_EXCEL: true,
};

// =============================================================
// 2. CONNECT DB
// =============================================================
async function connectDB() {
  const MONGO_URI =
    process.env.DB_URL ||
    "mongodb://realto:realto123@207.180.239.115:27017/realtodb";

  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("✅ MongoDB Connected\n");
}

// =========================
// 3. IMPORT MODELS
// =========================
const ResRentMatch = require("../models/match/residentialRentPropertyMatch");
const ResBuyMatch = require("../models/match/residentialBuyPropertyMatch");
const ComRentMatch = require("../models/match/commercialRentPropertyMatch");
const ComBuyMatch = require("../models/match/commercialBuyPropertyMatch");

// PROPERTY MODELS
const ResRentProp = require("../models/residentialPropertyRent");
const ResBuyProp = require("../models/residentialPropertySell");
const ComRentProp = require("../models/commercialPropertyRent");
const ComBuyProp = require("../models/commercialPropertySell");

// CUSTOMER MODELS
const ResRentCust = require("../models/residentialPropertyCustomerRent");
const ResBuyCust = require("../models/residentialPropertyCustomerBuy");
const ComRentCust = require("../models/commercialPropertyCustomerRent");
const ComBuyCust = require("../models/commercialPropertyCustomerBuy");


// =============================================================
// 6. HELPERS (PROPERTY + CUSTOMER LOOKUP)
// =============================================================
async function getPropertyInfo(type, propertyID) {
  if (type === "Residential Rent") return ResRentProp.findOne({ property_id: propertyID }).lean();
  if (type === "Residential Buy")  return ResBuyProp.findOne({ property_id: propertyID }).lean();
  if (type === "Commercial Rent")  return ComRentProp.findOne({ property_id: propertyID }).lean();
  if (type === "Commercial Buy")   return ComBuyProp.findOne({ property_id: propertyID }).lean();
}

async function getCustomerInfo(type, customerID) {
  if (type === "Residential Rent") return ResRentCust.findOne({ customer_id: customerID }).lean();
  if (type === "Residential Buy")  return ResBuyCust.findOne({ customer_id: customerID }).lean();
  if (type === "Commercial Rent")  return ComRentCust.findOne({ customer_id: customerID }).lean();
  if (type === "Commercial Buy")   return ComBuyCust.findOne({ customer_id: customerID }).lean();
}

// =============================================================
// 7. BUILD ROWS (Final Correct Logic)
// =============================================================
async function buildRows(matches, type) {
  const rows = [];

  for (const match of matches) {
    const all = [
      ...(match.matched_customer_id_mine || []),
      ...(match.matched_customer_id_other || []),
    ];

    for (const m of all) {
      const prop = await getPropertyInfo(type, match.property_id);
      const cust = await getCustomerInfo(type, m.customer_id);

      // PROPERTY ADDRESS (final correct format)
      const addr = prop?.property_address || {};
      const fullAddress = [
        addr.flat_number,
        addr.building_name,
        addr.main_text
      ].filter(Boolean).join(" ");

      // CUSTOMER NAME (final correct path)
      const customerName = cust?.customer_details?.name || "";

      rows.push({
        MatchType: type,
        PropertyID: match.property_id,
        PropertyAddress: fullAddress,
        PropertyAgent: match.agent_id,

        CustomerID: m.customer_id,
        CustomerName: customerName,
        CustomerAgent: m.agent_id,

        Distance: Math.round(m.distance || 0),
        Score: m.matched_percentage || 0,
        // UpdatedAt: match.update_date_time || "",
      });
    }
  }

  return rows;c
}

// =============================================================
// 8. EXPORT HELPERS
// =============================================================
function exportCSV(rows, filePath) {
  const header = Object.keys(rows[0]).join(",");
  const body = rows.map(r => Object.values(r).join(",")).join("\n");
  fs.writeFileSync(filePath, header + "\n" + body);
  console.log("📦 CSV Saved:", filePath);
}

function exportExcel(rows, filePath) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Matches");
  XLSX.writeFile(wb, filePath);
  console.log("📘 Excel Saved:", filePath);
}

// =============================================================
// 9. MAIN
// =============================================================
async function generateReport() {
  await connectDB();

  const resRent = await ResRentMatch.find().lean();
  const resBuy  = await ResBuyMatch.find().lean();
  const comRent = await ComRentMatch.find().lean();
  const comBuy  = await ComBuyMatch.find().lean();

  let rows = [
    ...await buildRows(resRent, "Residential Rent"),
    ...await buildRows(resBuy,  "Residential Buy"),
    ...await buildRows(comRent, "Commercial Rent"),
    ...await buildRows(comBuy,  "Commercial Buy"),
  ];

  // FILTERS
  if (CONFIG.FILTER_AGENT) {
    rows = rows.filter(r =>
      r.PropertyAgent === CONFIG.FILTER_AGENT ||
      r.CustomerAgent === CONFIG.FILTER_AGENT
    );
  }

  if (CONFIG.FILTER_PROPERTY_TYPE) {
    rows = rows.filter(r => r.MatchType === CONFIG.FILTER_PROPERTY_TYPE);
  }

  // SORT
  if (CONFIG.SORT_BY_SCORE) {
    rows.sort((a, b) => b.Score - a.Score);
  }

  // GROUP BY PROPERTY
  if (CONFIG.GROUP_BY_PROPERTY) {
    rows.sort((a, b) => {
      if (a.PropertyID === b.PropertyID) return b.Score - a.Score;
      return a.PropertyID.localeCompare(b.PropertyID);
    });
  }

  // DISPLAY
  console.log("\n📊 FINAL MATCH REPORT");
  console.table(rows);

  // EXPORT
  const outDir = path.resolve(__dirname, "exports");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  if (CONFIG.EXPORT_CSV) {
    exportCSV(rows, path.join(outDir, "match_report.csv"));
  }

  if (CONFIG.EXPORT_EXCEL) {
    exportExcel(rows, path.join(outDir, "match_report.xlsx"));
  }

  process.exit(0);
}

generateReport().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
