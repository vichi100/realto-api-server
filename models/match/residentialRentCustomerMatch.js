const mongoose = require("mongoose");

// This is for matching residential rent customers with properties
// This schema will store the matched properties for a customer
// The matched properties will be divided into two categories:
// 1. Properties whose agent_id matches with the customer's agent_id will be in matched_property_id_mine
// 2. Properties whose agent_id does not match with the customer's agent_id will be in matched_property_id_other

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

module.exports = mongoose.model("residential_rent_customer_match", propertySchema);