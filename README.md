#Splunk 

A working in progress to create a USEFUL splunk search streaming API

    bin/splunk -s 'search tab*.prod POST "/index.php?id=*"' -h 107.21.18.158 



###Example: redis

./examples/redis.js

You might want to delete keys before running this

   redis-cli -h 192.168.10.111 KEYS "hits*" |\
    xargs redis-cli -h 192.168.10.111 DEL


