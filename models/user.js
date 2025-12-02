const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  user_type: String, // employee or agent
  id: String,
  works_for: String,// Agent id for which the employee works
  expo_token: String,
  name: String,
  company_name: String,
  mobile: String,
  address: String,
  city: String,
  country_code: {type: String, default: "+91"}, // default is India
  employee_ids: {type: [String],default: []}, // if employee then it will be empty,
  liked_properties: {type: [String],default: []},
  liked_customers: {type: [String],default: []},
  assigned_residential_rent_properties:{type: [String],default: []},
  assigned_residential_sell_properties:{type: [String],default: []},
  assigned_commercial_rent_properties:{type: [String],default: []},
  assigned_commercial_sell_properties:{type: [String],default: []},
  assigned_residential_rent_customers:{type: [String],default: []},
  assigned_residential_buy_customers:{type: [String],default: []},
  assigned_commercial_rent_customers:{type: [String],default: []},
  assigned_commercial_buy_customers:{type: [String],default: []},
  email: String,
  last_backup_date: { type: Date },
  employee_role: String, // view, add, master, admin, 
  user_status: { type: String, default: "active" },  //"active", suspend, blocked, removed
  create_date_time: {
    type: Date, default: Date.now
  },
  update_date_time: {
    type: Date, default: Date.now
  }
});

module.exports = mongoose.model("user", userSchema);
//read: just able to see what is asign to him, 
// edit: will be able to read and add new but wont be able to delete which are asign to him,
//  master: will be able to see all the property and add new property, asign property to employees, 
// admin: will be able read delete add any property employee. All access 

// employees=[
//   { employee_id: String, employee_name: String, employee_mobile: String, access_rights:String}
// ]
