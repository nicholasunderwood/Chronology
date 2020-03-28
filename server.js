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

const imps = require('./static/js/game.js');
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
	}

	start(){
		this.cards = [];
		this.balence = 0;
	}

	drawCards(deck){
		if(!this.cards){
			this.cards = deck.slice(0,2);
			deck.splice(0,2);
		}
	}

	get influence() { this.cards.length }

	loseInfluence() {
		sockets[this].emit('lost influence');
	}

	exchange(deck) {
		deck.concat(cards);
		this.drawCards();
	}


}


function startGame() {
	console.log("start game");
	game = new Game(players, null);
	sockets.forEach((socket, player) => {
		console.log(player);
		socket.emit('start', player, players);
	})

}

function updateClient(){
	io.sockets.emit('updateClient', players);
	if(players.every(val => val.ready)) {
		startGame();
	}
}

function getActionStatus(actor, action, target){
	switch(action){
		case actions.INCOME: return actor + " collected income";
		case actions.FOREIGN_AID: return actor + " collected foreign aid";
		case actions.COUP: return actor + " couped " + target;
		case actions.TAX: return actor + " collected tax";
		case actions.ASSASSINATE: return actor + " assassinated " + target;
		case actions.EXCHANGE: return actor + " exchanged their cards";
		case actions.STEAL: return actor + " stole from " + target;
	}
}

function sendServerMessage(message) {
	io.sockets.emit("new chat", message, true)
}

var players = [];
var chat = [];
var sockets = new Map();
var game;
var hasStarted = false;

// Add the WebSocket handlers
io.on('connection', socket => {

	socket.on('new player', () => {
		let player = new Player(
			socket.id,
			`Player ${players.length + 1}`
		);
		console.log(`${player.name} joined`);
		sendServerMessage(`${player.name} joined`)
		players.push(player);
		sockets.set(player, socket);

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
		
		socket.on('chat recived', message => {
			message = player.name + ": " + message
			chat.push(message);
			io.sockets.emit('new chat', message, false);
		});
		
		socket.on('leave', () => {
			let index = players.indexOf(player)
			if(index < 0) return;
			players.splice(index);
			sockets.delete(player);
			console.log(`${player.name} left`);
			updateClient();
		});

		socket.on('action', async (action, target) => {
			if(game.player.id != player.id) return;
			console.log('play action', action.str);
			action = actions[action.toUpperCase()];
			const result = game.playAction(action, null);
			io.sockets.emit('action played', getActionStatus(player.name, action, target ? target.name : null));
			await result;
			socket.emit('update', player);
		});

		socket.on('contest', () => {
			console.log('contest');
			resault = game.contest(player)
		});

	});
});

