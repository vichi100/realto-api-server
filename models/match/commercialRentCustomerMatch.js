const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  customer_id: String,
  agent_id: String,
  match_count: { type: Number, default: 0 },
  matched_property_id_mine: [{
    matched_percentage: Number,
    property_id: String,
    distance: Number
  }],
  matched_property_id_other: [{
    matched_percentage: Number,
    property_id: String,
    agent_id: String,
    distance: Number
  }],
  update_date_time: {
    type: Date
  }
});

module.exports = mongoose.model("commercial_rent_customer_match", propertySchema);