var util = require('util');
var https = require('https');
var querystring = require("querystring");
var xml2js = require('xml2js');

var parser = new xml2js.Parser();
var options = {
    hostname: '107.21.18.158',
    port: 8089,
    path: '/services/search/jobs',
    method: 'POST',
    auth: 'dthurman:chicken',
    headers: {
        'Content-Length': 0 // set ME!!! i.e. postData.length
    }
};


//search('savedsearch "thurmda1"');

module.exports = {
    search: search,
    stream: stream
};
function stream(query, callback){
    var postData = querystring.stringify({
        search: query 
    });
    options.path += '/export';
    options.headers['Content-Length'] = postData.length;
    var req = https.request(options, function(res) {
        var response = '';
        res.on('data', function(d) {
            response += d;
            console.log(d.toString());
        });
        res.on('end', function(){
            console.log('ENNNNNNNNNNNNNNNNNNNNNNNND');
       });
    });
    req.end(postData);
}

function search(query, callback){
    var postData = querystring.stringify({
        search: query 
    });
    options.headers['Content-Length'] = postData.length;
    var req = https.request(options, function(res) {
        var response = '';
        res.on('data', function(d) {
            response += d;
        });
        res.on('end', function(){
            parseJobId(response, function(id){
                console.log('Started Job : ' + id);
                //NEXT
                pollingLoop(id, callback);
            }); 
        });
    });
    req.end(postData);
}

function pollingLoop(jobId, cb){
    var counter = 0;
    var maxTries = 20;
    var wait = 2 * 1000;
    options.method = 'GET';
    options.path = '/services/search/jobs/' + jobId ;
    delete options.headers['Content-Length'];

    poll();
    function poll(){
        var req = https.request(options, function(res) {
                var response = '';
                res.on('data', function(d) {
                    response += d;
                });
                res.on('end', function(){
                    //testing for isDone flag in XML
                    if(/<s:key name="isDone">1<\/s:key>/.exec(response)){
                        //NEXT
                        getResults(jobId, cb);
                    }else{
                        counter++;
                        if(counter > maxTries){
                            console.log('Reached max number of tries ('+maxTries+') for jobId : ' + jobId);
                        }else{
                            console.log('waiting for results for job : ' + jobId);
                            setTimeout(poll, wait);
                        }
                    }
                });
            });
            req.end();
    }
}

function getResults(jobId, cb){
    options.method = 'GET';
    options.path = '/services/search/jobs/' + jobId + '/results/';
    options.path += '?output_mode=json';
    delete options.headers['Content-Length'];

    var req = https.request(options, function(res) {
        var response = '';
        res.on('data', function(d) {
            response += d;
        });
        res.on('end', function(){
            //NEXT
            processResults(response, cb);
        });
    });
    req.end();
}

function processResults(json, cb){
    var results = JSON.parse(json);
    //console.dir(results);
    cb(results);
}

function parseJobId(xml, cb){
    parser.parseString(xml, function (err, result) {
        cb(result.response.sid[0]);
    });
}
