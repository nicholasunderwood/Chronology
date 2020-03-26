var player, players;
var canContest = false;

socket.on('start', (_player, _players) => {
	player = _player; players = _players;
	console.log(player)
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
	$('#card1').text(player.hand.cards[0]);
	$('#card2').text(player.hand.cards[1]);
	$('.action').click((e) => {
		console.log("play action")
		socket.emit('action', $(e.currentTarget).attr('id'))
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
}

socket.on('update', newHand => {
	console.log('update');
	hand = newHand;
	$('#balence').text(hand.balence);
});

socket.on('action played', status => {
	$('#status').text(status);
});