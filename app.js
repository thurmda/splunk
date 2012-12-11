var splunk = require('./lib/splunk');

var rx = /POST.*index.php\?id=(\d+)/;

/*
//splunk('savedsearch "thurmda1"', function(data){
//splunk('search tab*.prod POST "/index.php?id=*"', function(data){
splunk.search('search "POST /fanpage/index.php?id=*"', function(data){
    console.log(data.length);
    //data.forEach(function(req){
    //    var m = rx.exec(req._raw);
    //    if(m){
    //        console.dir(m);
    //    }
    //});
});
*/

splunk.stream('savedsearch "thurmda1"', function(){


});
