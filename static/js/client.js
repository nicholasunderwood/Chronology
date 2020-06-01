const socket = io();
var name = '';
var isHost = false;

function show(id){
    console.log('show', id);
    $('.screen').each((_, el) => {
        console.log(el, el.id, el.id == id);
        if(el.id == id) $(el).show(); else $(el).hide();
    });
}

function startGame(categories) {
    console.log('start');
    socket.removeListener('start', startGame)
    
    if(!isHost){
        console.log('load buzzer')
        loadBuzzer();
        return;
    }

    socket.on('question', showQuestion);
    socket.on('board', showBoard);
    socket.on('scores', loadRankings);

    $('#rankings').show();
    loadBoard(categories);
    loadQuestion();
    showBoard(board);
}

function loadRankings(scores){
    console.log('load rankings', scores)
    
    let list = $('#rankings ul');
    let add = $('<input type="button" value="+" class="money-control add btn btn-success">');
    let sub = $('<input type="button" value="-" class="money-control add btn btn-danger">');

    scores.forEach(player => {
        console.log(player)
        list.append(
            $(`<li class="list-group-item" player=${player.id}></li>`)
                .append(add.clone().click(e => changeScore(e, 100)))
                .append(`<div><h5>${player.name}</h5><h5>$${player.score}</h5><div>`)
                .append(sub.clone().click(e => changeScore(e, -100)))
        )
    });

    socket.removeListener('scores', loadRankings);
    socket.on('scores', updateRankings);
}

function updateRankings(scores) {
    console.log('update rankings', scores)
    $('#rankings li div h5').each((i,el) => {
        let player = scores[Math.floor(i/2)];
        if(i % 2 == 0){
            console.log(player.name)
            $(`#rankings li:nth-child(${Math.floor(i/2)+1})`).attr('player', player.id);
            $(el).text(player.name);
        } else {
            console.log(player.score);
            $(el).text((player.score < 0 ? '-$' : '$') + Math.abs(player.score));
        }
    })

}

function loadBoard(categories) {

    categories.forEach( category => {
        $('#board thead').append($(`<th>${category}</th>`));
    });

    for(let row = 0; row < 5; row++ ){
        let tr = $('<tr></tr>')
        for(let i = 0; i < 5; i++){
            tr.append(`<td cat=${categories[row]} index=${i} answered='false'>${(row+1) * 100}</td>`);
        }
        $('#board tbody').append(tr);
    }

    $('td[answered="false"]').click(event => {
        let td = $(event.target);
        td.attr('answered', true);
        socket.emit('square chosen', $(event.target).attr('cat'), $(event.target).attr('index'));
        $('td').unbind();
    });
}

function showBoard() {
    $('#a','#q').text('');
    console.log('show board')
    $('#q').text('');
    $('#a').text('');
    
    $('#board td').click(event => {
        socket.emit('square chosen', $(event.target).attr('cat'), +$(event.target).attr('index'));
        $('td').unbind();
    });
    
    show('board')
}

function changeScore(event, delta) {
    console.log('change score', $(event.target), $(event.target).attr('player'))
    socket.emit('score change', $($(event.target).parent()).attr('player'), delta);
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

    $('.validation').each( (_, el) => $(el).prop('disabled', true));
    
    $('#back').unbind().click(() => {
        console.log(showAnswer);
        showAnswer();
    }).val('Show Answer');
    
    $('#q').text(question.question);
    show('question');
}

function showAnswer(answer) {
    $('#a').text(answer);
    $('.validation').each((_,el) => $(el).prop('disabled', true));
    $('#back').val('Back to Board');
    $('#back').unbind().click(() => socket.emit('back') );
}

function loadBuzzer() {

    function getEnding(score) {
        console.log(score, score%10)
        if(score > 3 && score < 21) return 'th';
        if(score % 10 == 1) return 'st';
        if(score % 10 == 2) return 'nd';
        if(score % 10 == 3) return 'rd';
        return 'th'
    }

    let button = $('#buzzer>input');
    
    function setButton(enabled){
        button.prop('disabled',!enabled);
    }

    socket.on('buzzState', setButton);

    socket.on('score', (score, rank) => {
        console.log("score", rank);
        $('#score').text((score < 0 ? '-$' : '$') + Math.abs(score));
        $('#rank').text(rank.toString() + getEnding(rank));

        // $('#rank').text('' + rank + digit == 1 ? "st" : digit == 2 ? 'nd' : digit == 3 ? 'rd' : 'th');
    })

    $('#buzzer>input').click(() => {
        socket.emit('buzz', new Date());
        setButton(false);
    });

    show('buzzer');
}

$( document ).ready( () => {
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
        $('#start-div').hide();
        e.preventDefault();
        isHost = $('#isHost').hasClass('btn-dark');
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
        $('#lst-div').show();
        $('#isHost').prop('disabled', hasHost && !isHost);
        $('#start').prop('disabled', players.length == 0);
        $('#players-list').empty();
        players.forEach((player) => {
            $('#players-list').append($(`<li class='list-group-item'>${player.name}</li>`));
        });
    });
});