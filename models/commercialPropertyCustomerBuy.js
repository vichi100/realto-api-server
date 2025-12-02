const mongoose = require("mongoose");
const encryptFieldsPlugin = require('../plugins/encryptFieldsPlugin');
// var ObjectId = Schema.ObjectId;

const propertySchema = new mongoose.Schema({
  customer_id: String,
  agent_id: String,
  // property_type: String,
  // property_for: String, // rent ,sell
  customer_status: { type: Number, default: 1 }, // 0- close, 1- open
  is_close_successfully: String, // yes, no, open
  match_count: { type: Number, default: 0 },
  customer_details: {
    name: mongoose.Schema.Types.Mixed,
    mobile1: mongoose.Schema.Types.Mixed,
    address: mongoose.Schema.Types.Mixed
  },
  location: [// this we are using to display the location names on screen
    {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  ],
  customer_locality: {
    city: String,
    location_area: { type: Array, default: [] },
    property_type: String,
    property_for: String, // rent ,sell
    pin: String
  },

  customer_property_details: {
    building_type: String,
    parking_type: String,
    property_used_for: String,
    property_size: { type: Number, default: 0 }
  },

  customer_buy_details: {
    expected_buy_price: { type: Number, default: 0 },
    maintenance_charge: { type: Number, default: 0 },
    available_from: { type: Date },
    negotiable: String
  },

  reminders: { type: [String], default: [] },
  assigned_to_employee:{ type: [String], default: [] },
  assigned_to_employee_name:{ type: [String], default: [] },
  create_date_time: {
    type: Date
  },
  update_date_time: {
    type: Date
  }
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

module.exports = mongoose.model("commercial_customer_buy", propertySchema);