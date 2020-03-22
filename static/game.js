module.exports = Game;

class Hand {
	constructor(parent){
		this.parent = parent;
		this.balence = 0;
		this.cards = [];
    }
    
    drawCards(deck){
        this.cards.push(deck.pop());
        this.cards.push(deck.pop());
    }

    get influence() { this.cards.length }
}
class Game {

    constructor(players, gameSettings){
        this.players = players;
        this.currentPlayer;
    }

    start () {
        const deck = this.generateDeck();
        const hands = [];
        this.players.forEach((player) => {
            player.hand = new Hand(player);
            hands.push(player);
            player.hand.drawCards(deck);
        });
        play();
    }

    play () {
        let playerIndex = 0;
        var hand, turnTimer;
        
        while(true) {
            hand = hands[playerIndex];
            this.currentPlayer = hand.parent;

            playerIndex++;
            if ( this.hasWon(hand) ) { break; }
        }
    }

    hasWon (hand) {
        hands.forEach((oppHand) => {
            if(hand != oppHnad && oppHand.influence != 0) {
                return false;
            }
        })
        return false;
    }

    static generateDeck(){
        const deck = [];
        const values = [...Array(15).keys()];
        let randNumber;
        for(let i = 14; i >= 0; i--) {
            randNumber = Math.floor(Math.random() * i);
            deck.push(values[randNumber]);
            values.splice(randNumber,1);
        }
        for(let i = 0; i < 15; i++){
            if(deck[i] < 3) {
                deck[i] = cards.DUKE; continue;
            } else if(deck[i] < 6) {
                deck[i] = cards.ASSASSIN; continue;
            } else if(deck[i] < 9){
                deck[i] = cards.AMBASSADOR; continue;
            } else if(deck[i] < 12){
                deck[i] = cards.CAPTAIN
            } else { deck[i] = cards.CONTESSA; }
        }
        return deck;
    }
    
}

