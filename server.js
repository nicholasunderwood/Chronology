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
});

const imps = require('./static/game.js');
const Game = imps["Game"];
const cards = imps["cards"];
const actions = imps["actions"]

// Starts the server.
server.listen(5000, function() {
	console.log('Starting server on port 5000: http://localhost:5000');
});

class Player {
	constructor(id, name, ready) {
		this.id = id;
		this.name = name || '';
		this.ready = ready || false;
		this.cards;
	}

	drawCards(){
		if(!this.cards){
			this.cards = [];
			this.cards.push(deck.pop())
			this.cards.push(deck.pop())
		}
	}
}


function startGame() {
	console.log("start game")
	io.sockets.emit("start", actions);
	game = new Game(players, null)
}



function updateClient(){
	io.sockets.emit('updateClient', players)
	if(players.every((val) => val.ready)){
		startGame();
	}
}

var players = [
	// new Player(1, "Player 1", true),
	// new Player(2, "Player 2", true),
	// new Player(3, "Player 3", true)
];

var sockets = [];
var game;

// Add the WebSocket handlers
io.on('connection', socket => {

	socket.on('new player', () => {
		let player = new Player(
			socket.id,
			`Player ${players.length + 1}`
		);
		console.log(`${player.name} joined`);
		players.push(player);
		sockets.push(socket);

		if(players.length == 1){
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
	
		socket.on('leave', () => {
			let index = players.indexOf(player)
			if(index < 0) return;
			players.splice(index);
			sockets.splice(index)
			if(index == 0) {
				// sockets[0].emit('host')
			}
			console.log(`${player.name} left`)
			updateClient();
		});

		socket.on('action', async (action, id) => {
			if(game.player.id != player.id) return;
			console.log('play action', action);
			action = actions[action.toUpperCase()];
			const result = game.playAction(action, null);
			await result;
			socket.emit('update', player.hand);
		});

		socket.on('contest', () => {
			resault = game.contest(hand)
		});

		startGame();
	});
});

