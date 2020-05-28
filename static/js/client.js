const socket = io();
let name = '';

function show(el){
    ['login','ringer','host'].forEach(str => {
        el == str ? $(`#${str}`).show() : $(`#${str}`).hide();
    })
}

function loadClient(){
    socket.emit('player');
    show('ringer');
    $('#bell').click(() => {
        socket.emit('ring', {"name": name, "time": new Date()});
    });

}

function loadHost(){
    
    socket.emit('host');
    show('host');

    $('#clear').click(() => {
        socket.emit('clear');
        $('li').not(':first').remove();
    });

    socket.on('ring', rings => {
        $('#host li').not(':first').remove();
        console.log(rings);
        rings.forEach(ring => {
            $('#host #order').append($(`<li class='list-group-item'>${ring.name}</li>`))
        });
    });
}

$( document ).ready( () => {
    show('login');
    $('.clientType').click(event => {
        let btn = $(event.target);
        if(btn.attr('selected')){
            $('.clientType')
                .toggleClass('btn-outline-dark')
                .toggleClass('btn-dark')
                .each((_,el) => $(el).attr('selected',!$(el).attr('selected')));
            setTimeout(() => $('#client-type-div').toggleClass('mt-2'), 200);
            $('#name-group').slideToggle();
        }
    });

    $('#login form').submit((e) => {
        e.preventDefault();
        if($('#isHost').hasClass("btn-dark")){
            loadHost();
        } else {
            name = $("#name").val();
            loadClient();
        }
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