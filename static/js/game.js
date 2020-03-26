
const cards = {
	DUKE: "Duke",
	ASSASSIN: "Assassin",
	AMBASSADOR: "Ambassador",
	CAPTAIN: "Captain",
	CONTESSA: "Contessa"
}

const actions = {
	INCOME: {
		act: (hand) => hand.balence++,
		actor: false,
		blockers: false,
		str: "Income"
	},
	FOREIGN_AID: {
		act: (hand) => hand.balence += 2,
		actor: false,
		blockers: [cards.DUKE],
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
		actor: cards.ASSASSIN,
		blockers: [cards.CONTESSA],
		str: "Assassinate"
	},
	EXCHANGE: {
		act: (hand) => hand.exchange(),
		actor: cards.AMBASSADOR,
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
		actor: cards.CAPTAIN,
		blockers: [cards.CAPTAIN, cards.CONTESSA],
		str: "Steal"
	}
}

class Hand {
	constructor(){
		this.balence = 0;
		this.cards = [];
	}
	
	drawCards(deck){
		this.cards.push(deck.pop());
		this.cards.push(deck.pop());
	}

	get influence() { this.cards.length }

	loseInfluence() {}

	exchange() {
		
	}
}

class Game {

	constructor(players, gameSettings){
		this.players = players;

		this.deck = this.generateDeck();
		this.players.forEach((player) => {
			player.hand = new Hand();
			player.hand.drawCards(this.deck);
		});
		
		this.playerIndex = 0;
		this.player = this.players[this.playerIndex]
		this.contestTimer;
	}

	updatePlayer(){
		this.playerIndex = (this.playerIndex + 1 >= this.players.length) ? 0 : this.playerIndex + 1;
		this.player = this.players[this.playerIndex];
		console.log(this.playerIndex, this.player)
	}

	get hand() { return this.player.hand }
	   
	contest(contestee) {
		if(!this.currentAction) return true;
		this.contestee.cards.forEach((card) => {
			action.blockers.forEach( (blocker) => {
				if(card == blocker){
					hand.loseInfluence()
					this.contestPromise.resolve()
					return true;
				}
			});
		});
		contestee.loseInfluence();
		this.contestPromise.reject()
		return false;
	}

	async playAction(action, target) {
		this.currentAction = action
		this.contestPromise = new Promise(resolve => {
			setTimeout(() => {
				if(target){
					action.act(this.hand, target);
				} else {
					action.act(this.hand)
				}
				resolve();
			}, 5000);
		}, reject => {
			reject();
		});
		await this.contestPromise;
		this.updatePlayer();
		this.currentAction = null;
		this.contestPromise = null;
	}

	hasWon (hand) {
		hands.forEach((oppHand) => {
			if(hand != oppHnad && oppHand.influence != 0) {
				return false;
			}
		})
		return false;
	}

	generateDeck () {
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

module.exports = {Game, cards, actions};