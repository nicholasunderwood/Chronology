socket.on('start', (hand) => {
	var hand = hand;
	$('body').load('/static/game.html', onLoad);
    // socket.removeAllListeners();
});

function onLoad() {
	console.log('load complete')
	$('.action').click((e) => {
		console.log("play action")
		socket.emit('action', $(e.currentTarget).attr('id'))
	});
}

socket.on('update', (newHand) => {
	console.log('update');
	hand = newHand;
	$('#balence').text(hand.balence);
})