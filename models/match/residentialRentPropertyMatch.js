const mongoose = require("mongoose");

// This is for matching residential rent properties with customers
// This schema will store the matched customers for a property
// The matched customers will be divided into two categories:
// 1. Customers whose agent_id matches with the property's agent_id
// 2. Customers whose agent_id does not match with the property's agent_id

const propertySchema = new mongoose.Schema({
  property_id: String,
  agent_id: String,
  match_count: { type: Number, default: 0 },
  matched_customer_id_mine: [{
    matched_percentage: Number,
    customer_id: String,
    distance: Number
  }],
  matched_customer_id_other: [{
    matched_percentage: Number,
    customer_id: String,
    agent_id: String,
    distance: Number
  }],
  
  update_date_time: {
    type: Date
  }
});

module.exports = mongoose.model("residential_rent_property_match", propertySchema);
