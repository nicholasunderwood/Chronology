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

    loseInfluence() {
		
    }
}

class Game {

    constructor(players, gameSettings){
        this.players = players;
        this.currentPlayer;
    }

    static cards = {
        DUKE: "Duke",
        ASSASSIN: "Assassin",
        AMBASSADOR: "Ambassador",
        CAPTAIN: "Captain",
        CONTESSA: "Contessa"
    }

    static actions = {
        INCOME: {
            act: (hand) => hand.balence++,
            actor: false,
            blockers: false,
            str: "Income"
        },
        FOREIGN_AID: {
            act: (hand) => hand.balence += 2,
            actor: false,
            blockers: [Card.DUKE],
            str: "Foreign Aid"
        },
        COUP: {
            act: (target) => target.loseInfluence(),
            actor: false,
            blockers: false,
            str: "Coup"
        },
        TAX: {
            act: (hand) => hand.balence += 3,
            actor: cards.DUKE,
            blockers: false,
            str: "Tax"
        },
        ASSASSINATE: {
            act: (target) => target.loseInfluence(),
            actor: this.cards.ASSASSIN,
            blockers: [this.cards.CONTESSA],
            str: "Assassinate"
        },
        EXCHANGE: {
            act: (hand) => hand.exchange(),
            actor: this.cards.AMBASSADOR,
            blockers: false,
            str: "Exchange"
        },
        STEAL: {
            act: (hand, target) => {
                if(hand.balence >= 2){
                    hand.balence += 2;
                    target.balence -= 2;
                } else {
                    hand.balence += target.balence
                    target.balence = 0;
                }
            },
            actor: this.cards.CAPTAIN,
            blockers: [this.cards.CAPTAIN, this.cards.CONTESSA],
            str: "Steal"
        }
    }

    start () {
        const deck = this.generateDeck();
        this.hands = [];
        this.players.forEach((player) => {
            player.hand = new Hand(player);
            hands.push(player);
            player.hand.drawCards(deck);
        });
		this.currentHand = hands[i]
    }

       
	contest(contestee) {
		clearTimeout(contestTimer);
		hand.cards.forEach( (card) => {
			action.blockers.forEach( (blocker) => {
				if(card == blocker){
					hand.loseInfluence()
					return true;
				}
			});
		});
		contestee.loseInfluence();
		return false;
	}

	playAction(action, target) {
		currentAction = action
		this.playAction = (action) => {};
		this.contest  = contest;
		contestTimer = setTimeout(() => {
			this.contest = (hand) => {};
			this.playAction = playAction;
			if(target){
				action.act(hand, target);
			} else {
				action.act(hand)
			}
		}, 5000);
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

