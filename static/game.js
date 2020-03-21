// const $ = window.$ = window.jQuery = require('jquery');

var socket = io();
socket.emit('new player');

let isReady = false;
let wto;

$('#name').bind('propertychange change click keyup input paste', (event) => {
    clearTimeout(wto);
    wto = setTimeout(() => {
		console.log($(event.target).val())
		socket.emit('name', $(event.target).val())
    }, 500);
});

$(window).bind('beforeunload',() => {
	console.log('leave')
	socket.emit('leave');
});

$('#ready').change(() => {
	isReady = !isReady;
	console.log(isReady);
	socket.emit('ready', isReady);
});

socket.on('updateClient', (players) => {
	console.log('update client', players)
	let tbody = $('tbody')
	tbody.empty()
	players.forEach((player) => {
		if(player.id != socket.id) {
			console.log(player.ready)
			tbody.append($(
				`<tr>
					<td><span>${player.name}</span></td>
					<td><input type='checkbox' disabled ${player.ready ? 'checked' : ''}></td>
				</tr>`
			));
		} else {
			$('#name').val(player.name)
		}
	})
})