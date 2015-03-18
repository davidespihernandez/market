var mongoose = require('mongoose');

//Mongo models
var marketFileSchema = mongoose.Schema({
    filePath: {type: String, index: true},
    market: {type: String, index: true},
    marketType: {type: String, index: true},
    year: {type: Number, index: true},
    month: {type: Number, index: true},
    date: {type: Date, index: true}
});

var MarketFile = mongoose.model('MarketFile', marketFileSchema);

var measureSchema = mongoose.Schema({
    marketFile: {type: mongoose.Schema.Types.ObjectId, ref: 'MarketFile'},
    market: {type: String, index: true},
    marketType: {type: String, index: true},
    year: {type: Number, index: true},
    month: {type: Number, index: true},
    date: {type: Date, index: true},
    Interval: {type: Date, index: true},
    GMTIntervalEnd: {type: Date, index: true},
    Settlement_Location: {type: String, index: true},
    Pnode: {type: String, index: true},
    LMP: Number,
    MLC: Number,
    MCC: Number,
    MEC: Number
});

var Measure = mongoose.model('Measure', measureSchema);

module.exports = {
    MarketFile: MarketFile,
    Measure: Measure
}