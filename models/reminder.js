const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const reminderSchema = new Schema({
  reminder_id: {
    type: String
  },
  meeting_creator_id: String, // this will be req_use_id
  agent_id_of_client: String, 
  category_ids: { type: [String], default: [] },// property_id or buyer_id
  category: String, // property, customer
  category_type: String, // commercial, residential
  category_for: String, // buy, sell rent
  expo_token: {
    type: String
  },

  reminder_for: {
    // call, meeting, prop visit
    type: String,
    required: true
  },
  client_id: String, // Customer id
  client_name: {
    type: String
  },
  client_mobile: {
    type: String,
    required: true
  },
  meeting_date: { type: Date },

  meeting_time: {
    type: String
  },

  create_date_time: {
    type: Date
  },
  update_date_time: {
    type: Date
  }
});

module.exports = mongoose.model("reminders", reminderSchema);


// ### Remider create logic
// 1) I m creating reminder for my property with my customer then I should be able to see both proerty and customer original deatils
// 2) I m creating reminder for my property but with Other customer then I should be able to see my property details but I should not
//    be able to customer original details but should see customer Agent details
// 3) I m creating reminder for my customer but with other property then I should be able to see my customer original deatils but not able to see
//    property original addess deatils and owner details , owner details should be replace with agent details
