const socket = io();
var name = '';
var isHost = false;
var board, client, players;

function show(id){
    $('body>div').each((_, el) => {
        el.id == id ? $(el).show() : $(el).hide();
    });
}

function startGame(_board, _client, _players) {
    if(!isHost){
        loadBuzzer();
        return;
    }
    board = _board; client = _client; players = _players;
    socket.on('question', loadQuestion);
    socket.on('board', loadBoard);
    

    loadBoard();
    loadQuestion();
    showBoard(board);
}

function loadBoard() {
    for(let i = 0; i < 5; i++ ){
        tbody.append('<tr></tr>');
    }

    for(let key in board) {
        console.log('key', board[key]);
        thead.append($(`<th>${key}</th>`));
        board[key].forEach((question, i) => {
            $(tbody.children().eq(i)).append(`<td cat=${key} index=${i} enabled>${i * 100}</td>`)
        });
    }

    $('td:enabled').click(event => {
        socket.emit('square chosen', event.target.cat, event.target.index);
        $('td').unbind();
    });
}

function loadQuestion(question) {

    $('#correct').click(() => {
        socket.emit('correct');
        $('#answer>span').text(question.answer);
        $('#back').prop('disabled', false);
    });

    $('#incorrect').click(() => { socket.emit('incorrect'); });
    $('#back').click(() => { socket.emit('back'); })

    socket.on('buzz', name => {
        alert(name + " has buzzed in");
        $('.validation').prop('disabled', false);
    });

    
}

function showBoard(board) {
    
    
    $('td:enabled').click(event => {
        socket.emit('square chosen', event.target.cat, event.target.index);
        $('td').unbind();
    });

}

function showQuestion(question){
    show('question');

    let hidden = $('#question>.hidden');
    let visable = $('#question>.visable');
    hidden.text(question.question);
    let wordList = question.question.split(' ');

    let interval = setInterval(() => {
        let word = wordList.shift();
        visable.append(word + wordList == 0 ? '' : ' ')
        hidden.text(hidden.text().slice(word.length));
        if(wordList.length == 0){ clearInterval(interval); }
    }, 100);
}


function loadBuzzer() {
    let button = $('#buzzer>input');
    
    function setButton(enabled){
        button.prop('disabled',!enabled);
    }

    socket.on('buzzerState', setButton);

    $('#buzzer>input').click(() => {
        console.log('buzz');
        socket.emit('buzz', new Date());
    });
}

$( document ).ready( () => {
    show('login');
    $('.clientType').click(event => {
        let btn = $(event.target);
        if(btn.hasClass('btn-outline-dark')){
            $('.clientType')
                .toggleClass('btn-outline-dark')
                .toggleClass('btn-dark')
                .attr('selected', (_, attr) => attr == 'true' ? 'false' : 'true' );
            $('#name-group').slideToggle();
        }
    });

    $('#login form').submit((e) => {
        e.preventDefault();
        isHost = $('#isHost').hasClass("btn-dark");
        socket.emit('ready', isHost ? 'host' : 'player');
        console.log('ready', isHost)
        socket.on('start', startGame);
    })

});

socket.on('player', () => {
    console.log('player');
    show('login');
    $('#login form').submit((event) => {
        event.preventDefault();
        if(!name) return; 
        show('ringer');

    });
});