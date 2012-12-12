var splunk = require('./lib/splunk');
var redis = require('redis');
var rx = /POST.*index.php\?id=(\d+)/;

var redisClient = redis.createClient();
var count = 0;
var hits = {};
redisClient.del('hits:*');
/*
redis-cli -h 192.168.10.111 KEYS "hits*" |\
    xargs redis-cli -h 192.168.10.111 DEL
*/

//using stream to argregate data with REDIS
var stream = splunk.Stream('search tab*.prod POST "/index.php?id=*"', {hostname: '107.21.18.158'});
    stream.on('object', function(d){
        count++;
        var m = rx.exec(d._raw);
        var key;
        if(m){
            key = ['hits' , d._time.substr(0,10), d._time.substr(11,2)].join(':');
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
