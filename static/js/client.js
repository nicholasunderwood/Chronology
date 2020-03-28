var player, players;
var canContest = false;

socket.on('start', (_player, _players) => {
	player = _player; players = _players;
	console.log(player)
	$("link[href='/static/css/index.css']").attr('href', '/static/css/client.css')
	$('body').load('/static/game.html', onLoad);
    // socket.removeAllListeners();
});

function onLoad() {
	$('#chatForm').submit(event => {
		event.preventDefault();
		socket.emit('chat recived', $('#chatInput').val());
		$('#chatInput').val('');
	});

	console.log('load complete');
	$('#name').text(player.name);
	$('#card1').append($(`<span>${player.cards[0]}</span>`));
	$('#card2').append($(`<span>${player.cards[1]}</span>`));
	
	$('.solo').click((e) => {
		console.log("play solo action")
		socket.emit('solo action', $(e.currentTarget).attr('id'))
	});

	$('.targeted').click((e) => {
		console.log("player targeted action");
		$('#targets').modal('show');
	});

	$('body').keydown(e => {
		if(e.keyCode = 32){
			socket.emit('contest');
		}
	});

	socket.on('new chat', (message, isServerMessage) => {
		console.log('new chat', message)
		$('#chat').append($(`
			<div ${ isServerMessage ? "class='serverMessage'" : "" }>${message}</div>
		`));
	});

	players.forEach((_player) => {
		if(_player.id == player.id) return;
		console.log(_player);
		$('#players').append(`
			<div class="player card">
				<div class="card-body">
				<h5 class="name card-title">${_player.name}</h5>
				<div class="hand">
					<div class="char ${_player.cards[0]}"><span>${_player.cards[0]}</span></div>
					<div class="char ${_player.cards[1]}"><span>${_player.cards[1]}</span></div>
				</div>
				<div class="balence">0</div>
			</div>
		`)
		console.log()
		$('#targets tbody').append(`
			<tr class="target"><td>${_player.name}</td></tr>
		`)
	})
}

socket.on('update', newHand => {
	console.log('update');
	hand = newHand;
	$('#balence').text(hand.balence);
});

socket.on('action played', status => {
	$('#status').text(status);
});