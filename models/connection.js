const { DateTime } = require('luxon');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const crawlSchema = new Schema({
    title: {type: String, required: [true, 'Event name is required']},
    category: {type: String, required: [true, 'Category is required']},
    details: {type: String, required: [true, 'Details are required']},
    date: {type: Date, required: [true, 'Date is required']},
    location: {type: String, required: [true, 'Location is required']},
    startTime: {type: String, required: [true, 'Start time is required']},
    endTime: {type: String, required: [true, 'End time is required']},
    host: {type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Host is required']},
    image: {type: String, required: [true, 'Image is required']}
});

//collection name is crawls in database
module.exports = mongoose.model('Crawl', crawlSchema);