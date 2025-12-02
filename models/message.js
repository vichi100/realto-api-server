const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const messageSchema = new Schema({
  message_id: String,
  sender_details: {
    id: String,
    name: String,
    mobile: String,
    city: String,
    company_name: String
  }, // agent_id
  receiver_details: {
    id: String // agent_id
  },
  subject: {
    subject_id: String, // property_id or buyer_id
    subject_category: String, // property, customer
    subject_type: String, // commercial, residential
    subject_for: String // buy, sell, rent
  },
  message: String,
  expo_token: String,
  create_date_time: {
    type: Date
  },
  update_date_time: {
    type: Date
  }
});

module.exports = mongoose.model("message", messageSchema);
