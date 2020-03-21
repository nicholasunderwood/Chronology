// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});// Starts the server.
server.listen(5000, function() {
	console.log('Starting server on port 5000');
});

class Player {
	constructor(id, name, ready){
		this.id = id;
		this.name = name || '';
		this.ready = ready || false;
	}
}

function updateClient(){
	io.sockets.emit('updateClient', players)
	if(players.every((val) => val.ready)){
		startGame();
	}
}

function startGame() {
	console.log("start game")
	
}

var players = [];

// Add the WebSocket handlers
io.on('connection', (socket) => {
	let player;

	socket.on('new player', ()  => {
		console.log('new player');
		player = new Player(socket.id, `Player ${players.length}`);
		players.push(player);
		updateClient();
	});

	socket.on('ready', (ready) => {
		if(!player) return;
		console.log(ready)
		player.ready = ready;
		updateClient()
	});

	socket.on('name', (name) => {
		if(!player) return;
		console.log(name);
		player.name = name;
		updateClient()
	});

	socket.on('leave', () => {
		if(!player) return;
		players.splice(players.indexOf(player));
		console.log(`${player.name} left`)
		updateClient();
	})
});

