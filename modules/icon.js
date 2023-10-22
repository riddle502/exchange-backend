const mongoose = require('mongoose');

const iconSchema=new mongoose.Schema({
    exchange_id:String,
    url:String
})

module.exports = mongoose.model('Icon', iconSchema);
