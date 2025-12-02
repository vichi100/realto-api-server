const mongoose = require("mongoose");
const encryptFieldsPlugin = require('../plugins/encryptFieldsPlugin');
// var ObjectId = Schema.ObjectId;

const propertySchema = new mongoose.Schema({
  property_id: String,
  agent_id: String,
  property_type: String,
  property_for: String,
  property_status: { type: Number, default: 1 }, // 0- close, 1- open
  is_close_successfully: String, // yes, no
  match_count: { type: Number, default: 0 },
  owner_details: {
    name: mongoose.Schema.Types.Mixed,
    mobile1: mongoose.Schema.Types.Mixed,
    address: mongoose.Schema.Types.Mixed
  },

  location: {
    type: {
      type: String, // GeoJSON type (e.g., "Point")
      enum: ["Point"], // Only "Point" is allowed in this case
      required: true
    },
    coordinates: {
      type: [Number], // Array of numbers: [longitude, latitude]
      required: true
    }
  }, 

  property_address: {
    city: String,
    main_text: mongoose.Schema.Types.Mixed,
    formatted_address: mongoose.Schema.Types.Mixed,
    flat_number: mongoose.Schema.Types.Mixed,
    building_name: mongoose.Schema.Types.Mixed,
    landmark_or_street: mongoose.Schema.Types.Mixed,
    pin: mongoose.Schema.Types.Mixed
  },

  property_details: {
    property_used_for: String,
    building_type: String,
    ideal_for: { type: [String], default: [] },
    parking_type: String,
    property_age: String,
    power_backup: String,
    property_size: { type: Number, default: 0 }
  },

  rent_details: {
    expected_rent: { type: Number, default: 0 },
    expected_deposit: { type: Number, default: 0 },
    available_from: { type: Date }
  },

  image_urls: { type: [{ url: String }], default: [] }, 
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

propertySchema.index({ location: "2dsphere" });

/**
 * Declare encrypted fields for global decrypt plugin
 */
propertySchema.options.encryptedPaths = [
  'owner_details.name',
  'owner_details.mobile1',
  'owner_details.address',

  'property_address.main_text',
  'property_address.formatted_address',
  'property_address.landmark_or_street',
  'property_address.flat_number',
  'property_address.building_name',
];

// Apply plugins
propertySchema.plugin(encryptFieldsPlugin, { paths: propertySchema.options.encryptedPaths });
module.exports = mongoose.model("commercial_property_rent", propertySchema);
