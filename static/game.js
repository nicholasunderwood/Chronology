var socket = io();


var canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 600;
var ctx = canvas.getContext('2d');

var movement = {
    up: false,
    down: false,
    left: false,
    right: false
}

document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
        case 65: // A
        movement.left = true;
        break;
        case 87: // W
        movement.up = true;
        break;
        case 68: // D
        movement.right = true;
        break;
        case 83: // S
        movement.down = true;
        break;
    }
});

document.addEventListener('keyup', function(event) {
	switch (event.keyCode) {
		case 65: // A
		movement.left = false;
		break;
		case 87: // W
		movement.up = false;
		break;
		case 68: // D
		movement.right = false;
		break;
		case 83: // S
		movement.down = false;
		break;
	}
});

socket.emit('new player');
setInterval(() => {
	socket.emit('movement', movement);
}, 1000 / 60);

socket.on('state', (data) => {
	console.log(data)
	ctx.clearRect(0, 0, 800, 600);
	for(var id in data){
		var player = data[id]
		ctx.beginPath();
		ctx.arc(player.x, player.y, 5, 0, Math.PI * 2)
		ctx.fill();
	}
});