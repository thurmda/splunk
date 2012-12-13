var redis = require('redis');
var argv = require('optimist').argv;

var redisClient = redis.createClient();
var date = argv.d || '2012-12-11';
var hrs = ['',':00',':01',':02',':03',':04',':05',':06',':07',':08',':09',':10',':11',
    ':12',':13',':14',':15',':16',':17',':18',':19',':20',':21',':22',':23'];

var outputKey = 'out:'+date;
var d1 = keysForDate(date);
var args = d1;

//var d2 = keysForDate('2012-11-29');
//var args = d1.concat(d2);

args.unshift(args.length);
args.unshift(outputKey);
//console.dir(args);

redisClient.ZUNIONSTORE(args, function(err,r){
    if(err){
        throw err;
    }
});
redisClient.ZREVRANGE(outputKey, 0,  200, 'WITHSCORES', function(err, r){
    if(err){
        throw err;
    }
    console.log('Report for ' + date);
    console.dir(r);
});
redisClient.quit();


function keysForDate(date){
    var keys = hrs.join(' tv:'+date).split(' ');
    keys.shift();
    return keys;
}
