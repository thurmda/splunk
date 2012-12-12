var EventEmitter = require('events').EventEmitter;

module.exports = Parser;

function Parser(options) {
    options = options || {};
    EventEmitter.call(this);
    this.buffer = '';
    this.processed = 0;
    this.head = options.head || 0;
    this.breakPattern = options.breakPattern || '},';
    this.breakLength = options.breakLength || this.breakPattern.length;
    this.breakPadding = options.breakPadding || this.breakPattern.length - 1;
};
Parser.prototype = Object.create(EventEmitter.prototype);

Parser.prototype.receive = function receive(buffer) {
    var recieved =  buffer.toString('utf8');
    if(this.processed === 0){
        recieved = recieved.substring(this.head);
    }
    this.buffer += recieved;
    this.processed += recieved.length;
    var index;
    var json;
    while ((index = this.buffer.indexOf(this.breakPattern)) > -1) {
        json = this.buffer.slice(0, index + this.breakPadding);
        this.buffer = this.buffer.slice(index + this.breakLength);
        if (json.length > 0) {
            try {
                json = JSON.parse(json);
                this.emit('object', json);
            } catch (error) {
                this.emit('error', error, json);
            }
        }
    }
};
