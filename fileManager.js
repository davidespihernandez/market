var Client = require('ftp');

function getMarket(filePath, callback){
    Market.findOne({filePath: filePath}, function (err, marketDoc) {
        if (err) return console.error(err);
        console.log('Retrieved -> ' + marketDoc)
        if(marketDoc){
            console.log('Found market row ' + marketDoc);
            callback(marketDoc);
        } 
        else{
            console.log('NOT Found market row');
            var mk = new Market({ filePath : filePath });
            mk.save(function (err, mkt) {
                if (err) return console.error(err);
                callback(mkt);
            });
        }
    });   
}

exports.importFile = function(filePath, callback) {
    //connect to ftp server
    var c = new Client();
    //download a file
    var fileData = "";
    var mkt = null;
    c.on('ready', function() {
        console.log('Connected to FTP!');
        //c.get('Markets/DA/LMP_By_SETTLEMENT_LOC/2015/03/DA-LMP-SL-201503010100.csv', function(err, stream) {
        c.get(filePath, function(err, stream) {
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
                var lines = fileContents.split("\n")
                getMarket(filePath, function(marketDoc){
                    console.log("Got market doc " + marketDoc);
                    //insert Measures
                    for (var i = 1, len = lines.length; i < len; i++) {
                        var fields = lines[i].split(',')
                        
                        var measureDoc = new Measure({
                            market : marketDoc, 
                            Interval: fields[0],
                            GMTIntervalEnd: fields[1],
                            Settlement_Location: fields[2],
                            Pnode: fields[3],
                            LMP: fields[4],
                            MLC: fields[5],
                            MCC: fields[6],
                            MEC: fields[7]
                        });
                        
                        console.log('Inserting measure ' + i);

                        measureDoc.save(function (err, mDoc) {
                          if (err) return console.error(err);
                        });
                        
                    }
                    console.log('Inserted ' + lines.length);
                    callback(lines.length);
                });
                
                
            });
            
        });
    });
    c.connect({host: 'pubftp.spp.org'});
};

exports.listFiles = function(currentDir, callback) {
    console.log('Listing files for ' + currentDir);
    var c = new Client();
    c.on('ready', function() {
        c.list(currentDir, function(err, list) {
            if (err) throw err;
            console.log('File list ' + list);
            c.end();
            callback(list);
        });
      });    
    c.connect({host: 'pubftp.spp.org'});
};

