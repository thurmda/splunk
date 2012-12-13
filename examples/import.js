var splunk = require('../lib/splunk');
var redis = require('redis');
var argv = require('optimist')
    .usage('Usage:\n $0 -s "SEARCH" [-k redis key prefix]')
    .demand(['s', 'k'])
    .argv;


var redisClient = redis.createClient();
var count = 0;
var hits = {};
var rx = /id=(\d+)/;
// 'search tab*.prod POST "/index.php?id=*"',

console.dir(argv);
//using stream to argregate data with REDIS
var stream = splunk.Stream(argv.s ,{hostname: '107.21.18.158'});
    stream.on('object', function(d){
        count++;
        var m = rx.exec(d._raw);
        var key;
        if(m){
            key = [argv.k , d._time.substr(0,10), d._time.substr(11,2)].join(':');
            redisClient.zincrby(key, 1, m[1]);
        }else{
            console.log('BOGUS ' + d._raw);
        }
        if(count % 100 === 0){
            console.dir(d);
        }
    });
    stream.on('error', function(d,j){
        console.log('error');
        console.dir(arguments);
    });
