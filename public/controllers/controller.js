var market = angular.module('market', ['chart.js','ui.bootstrap','ngSanitize','ngCsv'])  

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

market.controller('FileListController', ['$scope', '$http', function($scope, $http){
    console.log("FileListController!");
    $scope.currentDirectory = 'Markets/DA/LMP_By_SETTLEMENT_LOC/2015/03'; //default dir
    $scope.showFilesLoading = true;
    $scope.showFileDownloading = false;
    $http.get('/ftplist?currentDirectory=' + $scope.currentDirectory).success( function(response){
        console.log('Initial File list ' + response.toString());
        $scope.fileList = response;
        $scope.showFilesLoading = false;
    });
    
    $scope.listDir = function(dirName){
        console.log("Loading dir " + dirName);
        $scope.currentDirectory = $scope.currentDirectory + "/" + dirName;
        $scope.fileList = []
        $scope.showFilesLoading = true;
        $http.get('/ftplist?currentDirectory=' + $scope.currentDirectory).success( function(response){
            console.log('Load dir ' + response.toString());
            $scope.fileList = response;
            $scope.showFilesLoading = false;
        });
    };
    $scope.listPreviousDir = function(){
        $scope.currentDirectory = $scope.currentDirectory.substring(0, $scope.currentDirectory.lastIndexOf("/"));
        console.log("Previous dir " + $scope.currentDirectory);
        $scope.fileList = []
        $scope.showFilesLoading = true;
        $http.get('/ftplist?currentDirectory=' + $scope.currentDirectory).success( function(response){
            console.log('Load dir ' + response.toString());
            $scope.fileList = response;
            $scope.showFilesLoading = false;
        });
    };
    $scope.listLoadedFiles = function(){
        console.log("Listing loaded files");
        $scope.fileLoadedList = []
        $http.get('/loadedfilelist').success( function(response){
            console.log('Files retrieved ' + response.toString());
            $scope.fileLoadedList = response;
        });
    };
    $scope.loadFile = function(fileName){
        console.log("Loading file " + fileName);
        var fullPath = $scope.currentDirectory + "/" + fileName;
        $scope.showFileDownloading = true;
        $http.post('/importfile?filePath=' + fullPath).success( function(response){
            console.log('Loaded! ' + fullPath);
            $scope.showFileDownloading = false;
            //reload files
            $scope.listLoadedFiles();
        });
    };
    
    //call the function to show loaded files
    $scope.listLoadedFiles();
    
}]);

market.controller('SearchController', ['$scope', '$http', function($scope, $http){
    console.log("SearchController!");
    $scope.showSearching = false;
    $scope.dateFromInput = "";
    $scope.dateToInput = "";
    $scope.locationInput = "";
    $scope.dataList = [];
    $scope.graphSelectedSeries = "ALL";
    $scope.locations = [];
    $scope.averageLMP = 0; $scope.averageMLC = 0; $scope.averageMCC = 0; $scope.averageMEC = 0; 
    $scope.labels = [" ", " "];
    
    $scope.series = ["LMP", "MLC", "MCC", "MEC"];
    $scope.graphData = [
        [0, 0],
        [0, 0]
    ];
    $scope.graphOptions = { 
                            //datasetFill : false, 
                            pointDotRadius : 3
                          };
    
    $scope.labelsFilter = function (label,index){return false;};
    
    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };
    
    //angular bootstrap
    $scope.openFrom = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedFrom = true;
    };
    $scope.openTo = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedTo = true;
    };
    
    $scope.toUTCDate = function(dateStr){
        var date = new Date(dateStr)
        var _utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        return _utc;
    };
    
    $scope.toUTCDateString = function(dateStr){
        var date = new Date(dateStr);
        var _utc = pad((date.getUTCMonth()+1),2) + "-" + pad(date.getUTCDate(),2) + "-" + date.getUTCFullYear()  + " " + pad(date.getUTCHours(),2) + ":" + pad(date.getUTCMinutes(),2);
        return _utc;
    };
    
    
    $scope.populateGraph = function(){
        var serie = $scope.graphSelectedSeries;
        $scope.labels = [];
        var LMP = [], MLC = [], MCC = [], MEC = [];
        $scope.graphData = [];
        var avgLMP = 0, avgMLC = 0, avgMCC = 0, avgMEC = 0;
        $scope.dataList.forEach(function(item){
            avgLMP += item.LMP; avgMLC += item.MLC; avgMCC += item.MCC; avgMEC += item.MEC;
            $scope.labels.push($scope.toUTCDateString(item.Interval));
            LMP.push(item.LMP);
            MLC.push(item.MLC);
            MCC.push(item.MCC);
            MEC.push(item.MEC);
        });
        $scope.averageLMP = (avgLMP / $scope.dataList.length).toFixed(2); 
        $scope.averageMLC = (avgMLC / $scope.dataList.length).toFixed(2); 
        $scope.averageMCC = (avgMCC / $scope.dataList.length).toFixed(2); 
        $scope.averageMEC = (avgMEC / $scope.dataList.length).toFixed(2); 
        if(serie === "ALL" || serie === "LMP"){
            $scope.graphData.push(LMP);
        }
        if(serie === "ALL" || serie === "MLC"){
            $scope.graphData.push(MLC);
        }
        if(serie === "ALL" || serie === "MCC"){
            $scope.graphData.push(MCC);
        }
        if(serie === "ALL" || serie === "MEC"){
            $scope.graphData.push(MEC);
        }
    };

    $scope.search = function(){
        console.log("Searching ");
        $scope.dataList = []
        $scope.showSearching = true;
         $http
            .get('/search?dateFrom=' + $scope.dateFromInput + "&dateTo=" + $scope.dateToInput + "&location=" + $scope.locationInput + "&node=" + $scope.nodeInput)
            .success(function(response){
                //console.log('Search response ' + response.toString());
                $scope.showSearching = false;
                $scope.dataList = response;
                //fill the graph data
                $scope.populateGraph();
            })
            .error(function(response){
                console.log('Error searching!: ' + response);
            });
        
    };
    
    $scope.filterSeries = function(serie){
        $scope.graphSelectedSeries = serie;
        $scope.populateGraph();
    };
    
    $scope.fillLocations = function(callback){
        $http
            .get('/locations')
            .success(function(response){
                //console.log('Search response ' + response.toString());
                $scope.locations = response;
                if($scope.locations.length>0){
                    $scope.locationInput = $scope.locations[0]
                    console.log('First location ' + $scope.locationInput);
                }
                //TODO: select the first location
                callback();
            })
            .error(function(response){
                console.log('Error searching!: ' + response);
            });
    };
    
    $scope.fillLocations(function(){
        $scope.search();
    });
    
}]);

