/*
 *
 * I run this example like so:
 *
 *node ajax-error-import.js -s '"search /conversationbuddy/ajax/"' -c ajax -h HOST -a LOGIN:PASSWORD -x
 *
 *
 *
 */
var mongo = require('mongodb');
var splunk = require('../lib/splunk');
var argv = require('optimist')
    .usage('Usage:\n $0 -s "SEARCH_TERMS" -c collection_name -h splunk_host -a splunk_auth [-x CLEARS_B4_IMPORT]')
    .demand(['s', 'c'])
    .argv;


var collection;

var db = new mongo.Db('ajax', new mongo.Server('localhost', 27017), {safe:true});
db.open(function(err, client){
    collection = new mongo.Collection(client,argv.c);
    if(argv.x){
        collection.remove({}, function(){
            importData(collection);
        });
    }else{
        importData(collection);
    }
});

function importData(collection){
    var count = 0;
    var inserted = 0;
    var rx = /\/conversationbuddy\/ajax\/(\w+).*HTTP\/1\.1"\s(\d+)\s.*\/|"([a-z.]+\.buddymedia.com)"/;
    var stream = splunk.Stream(argv.s ,{hostname: argv.h , auth: argv.a});
    stream.on('object', function(d){
        count++;
        var m = d._raw.match(rx);
        var doc = {
            raw : d._raw,
            ts : d._time
        }
        if(m && m.length > 2){
            doc.method = m[1];
            doc.code = parseInt(m[2]);
            doc.domain = m[3];
        }
        collection.insert(doc, {safe: true}, function(){
            inserted++;
        });
        if(count % 10000 === 0){
            console.log('Pulled %d, inserted %d, currently working on :\n', count, inserted);
            console.dir(doc);
            console.dir(d);
        }
    });
    stream.on('error', function(d,j){
        console.log('error');
        console.dir(arguments);
    });
}
