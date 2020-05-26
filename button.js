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
	response.sendFile(path.join(__dirname, 'game.html'));
});

// Starts the server.
server.listen(5000, function () {
	console.log('Starting server on port 5000: http://localhost:5000');
});

class Player {
	constructor(id, name){
		this.id = id;
		this.name = name;
		this.score = 0;
	}
}

function addRing(newRing) {
	if(ring == null){
		io.sockets.emit('buzzState', false);
		ring = newRing;
		setTimeout(() => {
			currentPlayer = ring.player;
			host.emit('buzz', ring.player.name);
			ring = null;
		}, 300);
	} else {
		if(newRing.time < ring.time){
			ring = newRing;
		}
	}
}

const finished = new Map();
const players = [];
const catagories = [];
var host, board;
var ring = null;
var question = null;
var currentPlayer = null;

fs.readFile("questions.json", 'utf8', (err, data) => {
	if (err) throw err;
	board = JSON.parse(data)
	for(key in board){
		catagories.push(key);
	}
});

// Add the WebSocket handlers
io.on('connection', socket => {
	var isHost = false;
	var player;

	socket.on('ready', name => {
		if(name){
			player = new Player(socket.id, name);
			players.push(player);

			socket.on('buzz', date => {
				addRing({'player': player, 'time': date});
			});
			
		} else {
			isHost = true;
			host = socket;

			socket.on('square choosen', (catagory, index) => {
				question = board[catagory][index]
				io.sockets.emit('buzzState', true);
				socket.emit('question', question);
			});

			socket.on('correct', () => {
				currentPlayer.score += question.value;
			});

			socket.on('incorrect', () => {
				io.sockets.emit('buzzState', true);
				currentPlayer.score -= question.value;
			});

			socket.on('back', () => {
				socket.emit('board', board);
			});

			socket.emit('board', board);
		}
	});
});