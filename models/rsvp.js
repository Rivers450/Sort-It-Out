const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rsvpSchema = new Schema ({
    connection: {type: Schema.Types.ObjectId, ref: "Crawl"},
    user: {type: Schema.Types.ObjectId, ref: "User"},
    status: {type: String, enum: ["Yes", "No", "Maybe"]}
});

//collection name is rsvps in database
module.exports = mongoose.model('Rsvp', rsvpSchema);