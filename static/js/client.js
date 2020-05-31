const socket = io();
var name = '';
var isHost = false;
var client, players, showAnswer;

function show(id){
    $('body>div').each((_, el) => {
        el.id == id ? $(el).show() : $(el).hide();
    });
}

function startGame(categories, _players) {
    
    if(!isHost){
        console.log('load buzzer')
        loadBuzzer();
        return;
    }

    players = _players;
    socket.on('question', showQuestion);
    socket.on('board', showBoard);

    loadBoard(categories);
    loadQuestion();
    showBoard(board);
}

function loadBoard(categories) {

    categories.forEach( category => {
        $('#board thead').append($(`<th>${category}</th>`));
    });

    for(let row = 0; row < 5; row++ ){
        let tr = $('<tr></tr>');
        for(let i = 0; i < 5; i++){
            tr.append(`<td cat=${categories[row]} index=${i} enabled>${(row+1) * 100}</td>`);
        }
        $('#board tbody').append(tr);
    }

    $('td').click(event => {
        socket.emit('square chosen', $(event.target).attr('cat'), $(event.target).attr('index'));
        $('td').unbind();
    });
}

function showBoard(board) {
    
    $('#board td').click(event => {
        socket.emit('square chosen', $(event.target).attr('cat'), +$(event.target).attr('index'));
        $('td').unbind();
    });
    
    show('board')
}

function loadQuestion() {

    $('#incorrect').click(() => { socket.emit('incorrect'); });

    $('#correct').click(() => {
        socket.emit('correct');
        showAnswer();
    });

    socket.on('buzz', name => {
        alert(name + " has buzzed in");
        $('.validation').each( (_, el) => $(el).prop('disabled', false));
    });
}

function showQuestion(question){
    console.log(question)

    showAnswer = () => {
        $('#a').text(question.answer);
        $('.validation').each((_,el) => $(el).prop('disabled', true));
        $('#back').val('Back to Board');
        $('#back').click(() => socket.emit('back') );
    }

    $('.validation').each( (_, el) => $(el).prop('disabled', true));
    
    $('#back').click(() => {
        console.log(showAnswer);
        showAnswer();
    }).val('Show Answer');
    
    $('#q').text(question.question);
    show('question');
}


function loadBuzzer() {
    let button = $('#buzzer>input');
    
    function setButton(enabled){
        button.prop('disabled',!enabled);
    }

    socket.on('buzzerState', setButton);

    socket.on('score', (score, rank) => {
        $('#score').text(score);
        $('#rank').text(rank);
    })

    $('#buzzer>input').click(() => {
        console.log('buzz');
        socket.emit('buzz', new Date());
    });
    show('buzzer')
}

$( document ).ready( () => {

    $('#start-div').hide();
    $('#list-div').hide();
    show('login');
    $('.clientType').click(event => {
        let btn = $(event.target);
        if(btn.hasClass('btn-outline-dark')) {
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
        name = isHost ? 'host' : $('#name').val();
        socket.emit('ready', name);
        console.log('ready', isHost);
        socket.on('start', startGame);
        
        if(isHost) {
            $('#start').click(() => {
                socket.emit('start');
            }).prop('disabled', false);
            $('#start-div').slideDown();
        }
    });

    socket.on('players', (players, hasHost) => {
        console.log(players, hasHost, isHost);
        $('#isHost').prop('disabled', hasHost && !isHost);
        $('#players-list').empty();

        console.log('players', players);
        players.forEach((player) => {
            $('#players-list').append($(`<li class='list-group-item'>${player.name}</li>`));
        });
    });
});