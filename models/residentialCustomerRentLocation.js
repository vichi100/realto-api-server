const mongoose = require("mongoose");
// var ObjectId = Schema.ObjectId;

const propertySchema = new mongoose.Schema({
  customer_id: String,
  agent_id: String,
  customer_status: { type: Number, default: 1 },// 0- close, 1- open
  customer_property_details: {
    house_type: String,
    bhk_type: String,
    furnishing_status: String,
    parking_type: String,
  },

  customer_rent_details: {
    expected_rent: { type: Number, default: 0 },
    expected_deposit: { type: Number, default: 0 },
    available_from: { type: Date },
    preferred_tenants: String
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

});

propertySchema.index({ location: "2dsphere" });

module.exports = mongoose.model("residential_customer_rent_location", propertySchema);
