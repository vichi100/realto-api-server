const mongoose = require("mongoose");
const encryptFieldsPlugin = require('../plugins/encryptFieldsPlugin');

const propertySchema = new mongoose.Schema({
  customer_id: String,
  agent_id: String,
  property_type: String,
  property_for: String,
  customer_status: { type: Number, default: 1 },
  is_close_successfully: String,
  match_count: { type: Number, default: 0 },

  customer_details: {
    name: mongoose.Schema.Types.Mixed,
    mobile1: mongoose.Schema.Types.Mixed,
    address: mongoose.Schema.Types.Mixed
  },

  customer_locality: {
    city: String,
    location_area: { type: Array, default: [] },
    property_type: String,
    property_for: String,
    preferred_tenants: String
  },

  customer_property_details: {
    house_type: String,
    bhk_type: String,
    furnishing_status: String,
    parking_type: String,
    lift: String
  },

  customer_rent_details: {
    expected_rent: { type: Number },
    expected_deposit: { type: Number },
    available_from: { type: Date }
  },

  reminders: { type: [String], default: [] },
  assigned_to_employee:{ type: [String], default: [] },
  assigned_to_employee_name:{ type: [String], default: [] },

  create_date_time: { type: Date },
  update_date_time: { type: Date }

}, { minimize: false });

/**
 * Declare encrypted fields for global decrypt plugin
 */
propertySchema.options.encryptedPaths = [
  "customer_details.name",
  "customer_details.mobile1",
  "customer_details.address"
];

// Apply plugins
propertySchema.plugin(encryptFieldsPlugin, { paths: propertySchema.options.encryptedPaths });
module.exports = mongoose.model("residential_customer_rent", propertySchema);
