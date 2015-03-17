var express = require('express');
var app = express();
var mongoose = require('mongoose');
var Client = require('ftp');
var fileManager = require('./fileManager.js');

mongoose.connect('mongodb://localhost/market');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  // yay!
    console.log('Succesfully connected to Mongo!');
});


//Mongo models
var marketSchema = mongoose.Schema({
    filePath: String
});

var Market = mongoose.model('Market', marketSchema);

var measureSchema = mongoose.Schema({
    market: {type: mongoose.Schema.Types.ObjectId, ref: 'Market'},
    Interval: String,
    GMTIntervalEnd: String,
    Settlement_Location: String,
    Pnode: String,
    LMP: Number,
    MLC: Number,
    MCC: Number,
    MEC: Number
});

var Measure = mongoose.model('Measure', measureSchema);

app.use(express.static(__dirname + "/public"));

app.get('/dayslist', function(req, res){
    console.log('Received days request!');
    Market.find(function (err, daysList) {
        if (err) return console.error(err);
        console.log('Retrieved -> ' + daysList)
        res.json(daysList);
    });   
});

app.get('/ftplist', function(req, res){
    console.log('Received ftp list request ' + req);
    fileManager.listFiles(req.currentDirectory, res).then(function(param){
        console.log('After listing ' + param);
    });   
});

app.post('/importfile', function(req, res){
    console.log('Received importfile request ' + req);
    fileManager.importFile(req.filePath).then(function(param){
        console.log('After listing ' + param);
    });   
});


app.listen(3000);

console.log('Server running on port 3000');
