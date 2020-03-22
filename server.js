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

// Starts the server.
server.listen(5000, function() {
	console.log('Starting server on port 5000');
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
	io.sockets.emit("start");

	const deck = generateDeck();
	console.log(deck);
}



function updateClient(){
	console.log('update client', players)
	io.sockets.emit('updateClient', players)
	if(players.every((val) => val.ready)){
		startGame();
	}
}

var players = [
	new Player(1, "Player 1", true),
	new Player(2, "Player 2", true),
	new Player(3, "Player 3", true)
];

var sockets = [];

// Add the WebSocket handlers
io.on('connection', (socket) => {
	startGame()
	

	socket.on('new player', ()  => {
		console.log('new player');
		let player = new Player(
			socket.id,
			`Player ${players.length + 1}`
		);

		io.sockets.emit('cards', cards)

		players.push(player);
		sockets.push(socket);

		if(players.length == 1){
			socket.emit('host')
		}

		updateClient();

		socket.on('ready', (ready) => {
			player.ready = ready;
			updateClient()
		});
	
		socket.on('name', (name) => {
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
		})
	});
});
