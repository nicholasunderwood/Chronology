// const $ = window.$ = window.jQuery = require('jquery');

const socket = io();
socket.emit('new player');

let isReady = false;
let wto;
var players, clientPlayer;

console.log('start script')


$('#name').bind('propertychange change keyup input paste', (event) => {
    clearTimeout(wto);
    wto = setTimeout(() => {
		let newName = $(event.target).val();
		if(newName){
			socket.emit('name', newName)
		}
    }, 500);
});




$(window).bind('beforeunload',() => {
	socket.emit('leave');
});

$('#ready').change(() => {
	isReady = !isReady;
	socket.emit('ready', isReady);
});

//Socket Listeners
socket.on('updateClient', (_players) => {
	players = _players
	console.log('update client', players)
	let tbody = $('tbody')
	tbody.empty()
	players.forEach((player) => {
		if(player.id != socket.id) {
			tbody.append($(
				`<tr>
					<td></td>
					<td><span>${player.name}</span></td>
					<td><input type='checkbox' disabled ${player.ready ? 'checked' : ''}></td>
				</tr>`
			));
		} else {
			$('#name').val(player.name);
			clientPlayer = player;
		}
	})
});

