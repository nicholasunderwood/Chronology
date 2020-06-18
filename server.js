// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var fs = require("fs");
app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));// Routing
app.get('/', function (request, response) {
	response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server.
server.listen(5000, function () {
	console.log('Starting server on port 5000: http://localhost:5000');
});

function addRing(ring){
	for(let i = rings.length-1; i >= 0; i++){
		if(ring.time > rings[i].time){
			rings.splice(i+1, 0, ring);
			return;
		}
	}
	rings.unshift(ring);
}

var hosts = [];
const rings = []

// Add the WebSocket handlers
io.on('connection', socket => {
	var isHost = false;

	socket.on('host', () => {
		isHost = true;
		hosts.push(socket);
		socket.on('clear', () => {
			rings.splice(0,rings.length);
		});
		socket.emit('ring', rings);
	});

	socket.on('player', () => {
		socket.on('ring', newRing => {
			addRing(newRing);
			hosts.forEach(host => host.emit('ring', rings));
		});
	});
});