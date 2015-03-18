var models = require('./models');

exports.listLoadedFiles = function(callback) {
    console.log('Listing loaded files ');
    models.MarketFile.find(function (err, marketFiles) {
        if (err) return console.error(err);
        return callback(marketFiles);
    }
};

function aggregate(parameters, callback){
    console.log('Aggregate');
    
    Measure.aggregate([
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
        
}
                           
exports.search = function(parameters, callback) {
    console.log('Listing loaded files ');
    var query = Measure.find();
    if(parameters.dateFrom != ""){
        query = query.where('date').gte(parameters.dateFrom);
    }
    if(parameters.dateTo != ""){
        query = query.where('date').lte(parameters.dateTo);
    }
    if(parameters.location != ""){
        query = query.where('Settlement_Location').equals(parameters.location);
    }
    if(parameters.node != ""){
        query = query.where('Pnode').equals(parameters.node);
    }

    query.limit(100).exec(function (err, measures) {
        if (err) return console.error(err);
        //now perform que aggregation query
        aggregate(parameters, function(aggrResults){
            return callback(measures, aggrResults);
        });
    }
};


