// models/Exchange.js
const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema({
  exchange_id:String,
  name: String,
  value:Number
});

module.exports = mongoose.model('Exchange', exchangeSchema);
