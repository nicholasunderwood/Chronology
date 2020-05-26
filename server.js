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
	response.sendFile(path.join(__dirname, 'gane.html'));
});

// Starts the server.
server.listen(5000, function () {
	console.log('Starting server on port 5000: http://localhost:5000');
});

class Player {
	constructor(id, name) {
		this.id = id;
		this.name = name;
		this.isSelecting = false;
		this.score = 0;
	}
}

function startGame() {
	console.log("start game");
	sockets.forEach((socket, player) => {
		console.log(player);
		socket.emit('start', player, players);
	})
}

function updateClient() {
	io.sockets.emit('updateClient', players);
	if (players.every(val => val.ready)) {
		startGame();
	}
}

function sendServerMessage(message) {
	console.log(message)
	io.sockets.emit("new chat", message, true)
}

const players = [];
const chat = [];
const sockets = new Map();
var board;
const catagories = [];
var hasStarted = false;

fs.readFile("questions.json", 'utf8', (err, data) => {
	if (err) throw err;
	board = JSON.parse(data);
	for(key in board){
		catagories.add(key);
	}
});


// Add the WebSocket handlers
io.on('connection', socket => {

	socket.on('new player', () => {
		let player = new Player(
			socket.id,
			`Player ${players.length + 1}`
		);
		sendServerMessage(`${player.name} joined`)
		players.push(player);
		sockets.set(player, socket);

		if (players.length == 1) {
			socket.emit('host')
		}
		updateClient();

		socket.on('ready', ready => {
			player.ready = ready;
			updateClient()
		});

		socket.on('name', name => {
			player.name = name;
			updateClient()
		});

		socket.on('catagory choice', (catagory, card) => {
			if( !player.isSelecting ) return;
			player.isSelecting = false;
		});

		socket.on('chat recived', message => {
			message = player.name + ": " + message
			chat.push(message);
			io.sockets.emit('new chat', message, false);
		});

		socket.on('leave', () => {
			let index = players.indexOf(player)
			if (index < 0) return;
			players.splice(index);
			sockets.delete(player);
			console.log(`${player.name} left`);
			updateClient();
		});
	});
});