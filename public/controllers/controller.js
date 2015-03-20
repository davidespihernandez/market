var market = angular.module('market', ['chart.js','ui.bootstrap','ngSanitize','ngCsv'])  

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

market.controller('FileListController', ['$scope', '$http', function($scope, $http){
    console.log("FileListController!");
    $scope.currentDirectory = 'Markets/DA/LMP_By_SETTLEMENT_LOC'; //default dir
    $scope.showFileDownloading = false;
    $scope.showFilesLoading = false;
    
    $scope.currentPage = 1;
    $scope.itemsPerPage = 15;
    $scope.totalItems = 0;
    $scope.dateFromInput = "";
    $scope.dateToInput = "";
    $scope.fileList = []
    $scope.fileLoadedList = []
    $scope.pagedFileLoadedList = []

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
    
    $scope.setDir = function(dirName){
        console.log("Loading dir " + dirName);
        $scope.currentDirectory = dirName;
        $scope.fileList = []
        $scope.showFilesLoading = true;
        $http.get('/ftplist?currentDirectory=' + $scope.currentDirectory).success( function(response){
            console.log('Set dir ' + response.toString());
            $scope.fileList = response;
            $scope.showFilesLoading = false;
        });
    };
    
    $scope.listLoadedFiles = function(){
        console.log("Listing loaded files");
        $scope.fileLoadedList = [];
        $http.get('/loadedfilelist?dateFrom=' + $scope.dateFromInput + "&dateTo=" + $scope.dateToInput).success( function(response){
            console.log('Files retrieved ' + response.toString());
            $scope.fileLoadedList = response;
            $scope.totalItems = $scope.fileLoadedList.length;
            var indexFrom = ($scope.currentPage-1)*$scope.itemsPerPage;
            $scope.pagedFileLoadedList = $scope.fileLoadedList.slice(indexFrom, indexFrom + $scope.itemsPerPage);
        });
    };
    $scope.loadFile = function(fileName){
        console.log("Loading file " + fileName);
        var fullPath = $scope.currentDirectory + "/" + fileName;
        $scope.showFileDownloading = true;
        $http.post('/importfile?filePath=' + fullPath).success( function(response){
            $scope.showFileDownloading = false;
            //reload files
            $scope.listLoadedFiles();
        });
    };
    
    $scope.pageChanged = function(){
        console.log('Page changed to ' + $scope.currentPage);
        var indexFrom = ($scope.currentPage-1)*$scope.itemsPerPage;
        $scope.pagedFileLoadedList = $scope.fileLoadedList.slice(indexFrom, indexFrom + $scope.itemsPerPage)
    };
    
    $scope.splitCurrentDirectory = function(){
        var dirs = $scope.currentDirectory.split('/');
        console.log(dirs.toString());
        var arrayLength = dirs.length;
        var dirComponentsList = []
        for (var i = 0; i < arrayLength; i++) {
            var subDirFullString = ""
            for(var j = 0; j<=i; j++){
                if(subDirFullString != ""){
                    subDirFullString += "/";
                }
                subDirFullString += dirs[j];
            }
            var dirComponent = {
                subDirFullString: subDirFullString,
                subDirString: dirs[i]
            };
            dirComponentsList.push(dirComponent);
        }
        return(dirComponentsList);
    };
    
    //call the function to show loaded files
    $scope.listLoadedFiles();
    //list current dir files
    $scope.showFilesLoading = true;
    $http.get('/ftplist?currentDirectory=' + $scope.currentDirectory).success( function(response){
        $scope.fileList = response;
        $scope.showFilesLoading = false;
    });
}]);

////////////////////////////////
//   CONTROLLER FOR SEARCH PAGE
////////////////////////////////

market.controller('SearchController', ['$scope', '$http', function($scope, $http){
    console.log("SearchController!");
    $scope.showSearching = false;
    $scope.dateFromInput = "";
    $scope.dateToInput = "";
    $scope.locationInput = "";
    $scope.dataList = [];
    $scope.pageDataList = []
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
    
    $scope.currentPage = 1;
    $scope.itemsPerPage = 24;
    $scope.totalItems = 0;
    
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
            .get('/search?dateFrom=' + $scope.dateFromInput + "&dateTo=" + $scope.dateToInput + "&location=" + $scope.locationInput)
            .success(function(response){
                //console.log('Search response ' + response.toString());
                $scope.showSearching = false;
                $scope.dataList = response;
                $scope.totalItems = $scope.dataList.length;
                
                var indexFrom = ($scope.currentPage-1)*$scope.itemsPerPage;
                $scope.pageDataList = $scope.dataList.slice(indexFrom, indexFrom + $scope.itemsPerPage);
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
    
    $scope.exportData = function(){
        var finalData = [ ['Interval', 'Settlement_Location', 'Pnode', 'LMP', 'MLC', 'MCC', 'MEC'] ];
        $scope.dataList.forEach(function(item){
            finalData.push( [$scope.toUTCDateString(item.Interval), item.Settlement_Location, item.Pnode, item.LMP, item.MLC, item.MCC, item.MEC] )
        });
        return(finalData);
    };
    
    $scope.pageChanged = function(){
        console.log('Page changed to ' + $scope.currentPage);
        var indexFrom = ($scope.currentPage-1)*$scope.itemsPerPage;
        $scope.pageDataList = $scope.dataList.slice(indexFrom, indexFrom + $scope.itemsPerPage)

    };
    
    $scope.$on('create', function (event, chart) {
        console.log('chart created!');
        console.log(chart);
    });    
    
    $scope.fillLocations(function(){
        $scope.search();
    });
    
}]);

