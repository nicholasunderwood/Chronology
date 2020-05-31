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

function sendScores() {
	const temp = [...players];
	const ranked = [];
	var rank = 1;
	while(temp.length > 0) {
		let index = 0;
		let max = players[0];
		players.forEach((player, i) => {
			if(player.score > max.score){
				max = player;
				index = i;
			}
		});
		temp.splice(index,1);
		if(ranked.length > 0 && ranked[ranked.length - 1].score > max.score) rank++;
		sockets.get(max.id).emit('score', max.score, rank);
		ranked.push(max);
		host.emit('scores', ranked);		
	}
}

const finished = new Map();
const sockets = new Map();
const players = [];
const catagories = [];
var board;
var host = null
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
	var player = null;
	sockets.set(socket.id, socket);

	socket.on('ready', name => {
		console.log(name, name == 'host');
		if(player){
			isHost = false;
			players.splice(players.indexOf(player));
			player = null;
		}
		if(name != 'host'){
			player = new Player(socket.id, name);
			players.push(player);

			socket.on('buzz', date => {
				addRing({'player': player, 'time': date});
				socket.emit('buzzState', false);
			});
		} else {
			isHost = true;
			host = socket;

			socket.on('start', () => {
				io.sockets.emit('start', Object.keys(board));
				console.log('start');
			});

			socket.on('square chosen', (catagory, index) => {
				question = board[catagory][index]
				io.sockets.emit('buzzState', true);
				socket.emit('question', question);
			});

			socket.on('correct', () => {
				currentPlayer.score += question.value;
				sendScores()
			});

			socket.on('incorrect', () => {
				io.sockets.emit('buzzState', true);
				currentPlayer.score -= question.value;
				sendScores()
			});

			socket.on('back', () => {
				socket.emit('board', Object.keys(board), players);
			});
		}

		socket.on('leave', () => {
			if(!isHost) {
				players.splice(players.indexOf(player));
				console.log(`${player.name} left`);
				io.socket.emit('players', players, host != null);
			} else {
				console.log('fucked');
			}
		});

		io.sockets.emit('players', players, host != null);
	});
});