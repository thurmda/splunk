var splunkjs = require('splunk-sdk');

var service = new splunkjs.Service({
    username: "dthurman", 
    password: "chicken",
    host: "107.21.18.158",
    port: 8089,
   scheme: "https"});

service.login(function(err, success) {
    if (err) {
	console.dir(err);
        throw err;
    }

    console.log("Login was successful: " + success);
    service.jobs().fetch(function(err, jobs) {
        var jobList = jobs.list();
        for(var i = 0; i < jobList.length; i++) {
            console.log("Job " + i + ": " + jobList[i].sid);
        }
    });
});
