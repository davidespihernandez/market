var express = require('express');
var app = express();
var mongoose = require('mongoose');
var Client = require('ftp');
var fileService = require('./fileService.js');
var dataService = require('./dataService.js');

mongoose.connect('mongodb://localhost/market');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  // yay!
    console.log('Succesfully connected to Mongo!');
});


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
    console.log('Received ftp list request');
    console.log('Cur dir' + req.query.currentDirectory);
    fileService.listFiles(req.query.currentDirectory, function(list){
//        list.forEach(function (item){
//            console.log("Name -> " + item.name);
//            console.log("Size -> " + item.size);
//        });
        res.json(list);
    });
});

app.post('/importfile', function(req, res){
    console.log('Received importfile request');
    fileService.importFile(req.query.filePath, function(totalRows){
        console.log('After import rows: ' + totalRows.toString());
        res.json({ totalRows: totalRows });
    });   
});

app.get('/loadedfilelist', function(req, res){
    console.log('Received loaded file list request ');
    console.log('Cur dir' + req.query.currentDirectory);
    dataService.listLoadedFiles(req.query.currentDirectory, function(list){
//        list.forEach(function (item){
//            console.log("Name -> " + item.name);
//            console.log("Size -> " + item.size);
//        });
        res.json(list);
    });
});

app.get('/search', function(req, res){
    console.log('Received search request ' + req.body);
    dataService.search(req.body, function(detail, graphData){
        res.json({detail: detail, graphData: graphData});
    });
});


app.listen(3000);

console.log('Server running on port 3000');
