var express = require('express');
var app = express();
var mongoose = require('mongoose');
var Client = require('ftp');

mongoose.connect('mongodb://localhost/market');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  // yay!
    console.log('Succesfully connected to Mongo!');
    //download a file
    var c = new Client();
    var fileData = ""
    c.on('ready', function() {
        console.log('Connected to FTP!');

        c.get('Markets/DA/LMP_By_SETTLEMENT_LOC/2015/03/DA-LMP-SL-201503010100.csv', function(err, stream) {
            //ftp://pubftp.spp.org/Markets/DA/LMP_By_SETTLEMENT_LOC/2015/03/DA-LMP-SL-201503010100.csv
            if (err) throw err;
            stream.once('close', function() { c.end(); });
            
            var fileContents = ''
            stream.on('data',function(buffer){
                fileContents += buffer;
//                console.log('on readable data ' + buffer);
            }); 
            
            stream.on('end',function(){
                console.log('final output lines! ' + fileContents.split("\n").length );
                console.log('final output! ' + fileContents.length );
            });
            
        });
    });
    c.connect({host: 'pubftp.spp.org'});
});

//Mongo models
var marketSchema = mongoose.Schema({
    market : String, 
    type : String, 
    year : Number, 
    month : Number, 
    date : String, 
    records: Number
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

/*
var mk = new Market({
    market : 'MMMM', 
    type : 'MMMMMM', 
    year : 2015, 
    month : 1, 
    date : '02/01/2015', 
    records: 1
})

mk.save(function (err, fluffy) {
  if (err) return console.error(err);
});
*/

app.use(express.static(__dirname + "/public"));

app.get('/dayslist', function(req, res){
    console.log('Received days request!');
    Market.find(function (err, daysList) {
        if (err) return console.error(err);
        console.log('Retrieved -> ' + daysList)
        res.json(daysList);
    });   
});

app.listen(3000);

console.log('Server running on port 3000');
