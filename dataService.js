var models = require('./models');

exports.listLoadedFiles = function(parameters, callback) {
    console.log('Listing loaded files ');
    var query = models.MarketFile.find();
    if(parameters.dateFrom && parameters.dateFrom != "undefined"){
        console.log('Date from ' + parameters.dateFrom);
        query = query.where('date').gte(parameters.dateFrom);
    }
    if(parameters.dateTo && parameters.dateTo != "undefined"){
        console.log('Date to ' + parameters.dateTo);
        query = query.where('date').lte(parameters.dateTo);
    }
    
    query.sort({ date: 'asc' }).exec(function (err, marketFiles) {
        if (err) return console.error(err);
        return callback(marketFiles);
    });
};

function aggregate(parameters, callback){
    console.log('Aggregate');
    
    models.Measure.aggregate([
        { $match: {
            //TODO: add matches using parameters
            //_id: accountId
        }},
        { $group: {
            _id: "$Interval",
            sum_LMP: { $sum: "$LMP"  },
            sum_MLC: { $sum: "$MLC"  },
            sum_MCC: { $sum: "$MCC"  },
            sum_MEC: { $sum: "$MEC"  }
        }}
    ], function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('Aggr result ' + result);
        return callback(result);
    });        
};

exports.distinctLocations = function (callback){
    console.log('Distinct locations');
    models.Measure.distinct('Settlement_Location', function(err, locations){
        callback(locations);
    });        
};
                           
exports.search = function(parameters, callback) {
    console.log('Searching data ' + parameters.toString());
    var query = models.Measure.find();
    if(parameters.dateFrom && parameters.dateFrom != "undefined"){
        console.log('Date from ' + parameters.dateFrom);
        query = query.where('date').gte(parameters.dateFrom);
    }
    if(parameters.dateTo && parameters.dateTo != "undefined"){
        console.log('Date to ' + parameters.dateTo);
        query = query.where('date').lte(parameters.dateTo);
    }
    if(parameters.location && parameters.location != "undefined"){
        console.log('Location ' + parameters.location);
        query = query.where('Settlement_Location').equals(parameters.location);
    }

    query.sort({ Interval: 'asc' }).exec(function (err, measures) {
        if (err) return console.error(err);
        //console.log("Return data -> " + measures.toString());
        return callback(measures);
        //now perform que aggregation query
//        aggregate(parameters, function(aggrResults){
//            return callback(measures, aggrResults);
//        });
    });
};


