require("dotenv").config();
const mongoose = require("mongoose");
const { encryptValue } = require("../utils/cryptoUtil");

const ResidentialPropertyRent = require("../models/residentialPropertyRent");
const ResidentialPropertySell = require("../models/residentialPropertySell");
const CommercialPropertyRent = require("../models/commercialPropertyRent");
const CommercialPropertySell = require("../models/commercialPropertySell");

const ResidentialCustomerRent = require("../models/residentialPropertyCustomerRent");
const ResidentialCustomerBuy = require("../models/residentialPropertyCustomerBuy");
const CommercialCustomerRent = require("../models/commercialPropertyCustomerRent");
const CommercialCustomerBuy = require("../models/commercialPropertyCustomerBuy");

// Detect if field is already encrypted
function isEncrypted(v) {
  return (
    v &&
    typeof v === "object" &&
    v.iv &&
    v.content &&
    v.tag
  );
}

async function encryptField(doc, path, updateObj) {
  const value = doc.get(path);
  if (!value) return;

  if (isEncrypted(value)) return; // Skip already encrypted

  updateObj[path] = encryptValue(value);
}

async function migrate(Model, name, encryptedPaths) {
  console.log(`\n🔍 Migrating: ${name}`);

  const cursor = Model.find({}).cursor();
  let count = 0;
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    const update = {};

    // Encrypt each configured path
    for (const path of encryptedPaths) {
      await encryptField(doc, path, update);
    }

    // Only update if encryption happened
    if (Object.keys(update).length > 0) {
      await Model.updateOne({ _id: doc._id }, { $set: update });
      count++;
      if (count % 50 === 0) console.log(`   ✔ ${count} documents encrypted...`);
    }
  }

  console.log(`✅ Completed: ${name} — Total encrypted = ${count}`);
}

async function start() {
  console.log("🔗 Connecting to DB...");
  await mongoose.connect(process.env.DB_URL);
  console.log("✅ Connected");

  // Property encryption fields
  const propertyPaths = [
    "owner_details.name",
    "owner_details.mobile1",
    "owner_details.address",

    "property_address.main_text",
    "property_address.formatted_address",
    "property_address.landmark_or_street",
    "property_address.flat_number",
    "property_address.building_name",
    "property_address.pin",
  ];

  // Customer encryption fields
  const customerPaths = [
    "customer_details.name",
    "customer_details.mobile1",
    "customer_details.address",
  ];

  await migrate(ResidentialPropertyRent, "ResidentialPropertyRent", propertyPaths);
  await migrate(ResidentialPropertySell, "ResidentialPropertySell", propertyPaths);

  await migrate(CommercialPropertyRent, "CommercialPropertyRent", propertyPaths);
  await migrate(CommercialPropertySell, "CommercialPropertySell", propertyPaths);

  await migrate(ResidentialCustomerRent, "ResidentialCustomerRent", customerPaths);
  await migrate(ResidentialCustomerBuy, "ResidentialCustomerBuy", customerPaths);

  await migrate(CommercialCustomerRent, "CommercialCustomerRent", customerPaths);
  await migrate(CommercialCustomerBuy, "CommercialCustomerBuy", customerPaths);

  console.log("\n🎉 ALL ENCRYPTIONS COMPLETE\n");
  process.exit(0);
}

start();

