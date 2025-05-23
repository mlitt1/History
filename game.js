class Game {
    constructor() {
        this.storyOutput = document.getElementById('storyOutput');
        this.choicesDiv = document.getElementById('choices');
        this.userInput = document.getElementById('userInput');
        this.player = {
            money: 50,
            health: 100,
            reputation: 50,
            hasOpenedBox: false,
            location: 'constantinople',
            inventory: [],
            hasBoat: false,
            hasEarplugs: false,
            hasVisitedTown: false,
            hasCrossedSea: false
        };
        this.gameState = 'start';
        this.setupEventListeners();
        this.startGame();
    }

    setupEventListeners() {
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleInput(this.userInput.value);
                this.userInput.value = '';
            }
        });
    }

    writeToScreen(text) {
        this.storyOutput.innerHTML += text + '\n';
        this.storyOutput.scrollTop = this.storyOutput.scrollHeight;
    }

    showChoices(choices) {
        this.choicesDiv.innerHTML = '';
        choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.onclick = () => this.handleChoice(choice.nextState);
            this.choicesDiv.appendChild(button);
        });
    }

    handleInput(input) {
        this.writeToScreen(`> ${input}`);
    }

    handleChoice(nextState) {
        this.gameState = nextState;
        this.updateGame();
    }

    startGame() {
        this.writeToScreen("The Mysterious Box - A Merchant's Tale");
        this.writeToScreen("\nYou and your fellow merchant have been entrusted with a mysterious box to deliver from Constantinople to Damascus. The client was vague about its contents but offered a handsome reward upon delivery.");
        this.writeToScreen("\nYou start with 50 gold coins and a basic caravan.");
        this.showChoices([
            { text: "Begin your journey", nextState: 'journey_start' },
            { text: "Ask for more details about the delivery", nextState: 'ask_details' }
        ]);
    }

    updateGame() {
        switch(this.gameState) {
            case 'journey_start':
                this.writeToScreen("\nYou set out from Constantinople with your fellow merchant. The road ahead is long and dangerous.");
                this.showChoices([
                    { text: "Take the main trade route (safer but longer)", nextState: 'main_route' },
                    { text: "Take the shortcut through the mountains (dangerous but faster)", nextState: 'mountain_route' }
                ]);
                break;

            case 'ask_details':
                this.writeToScreen("\nThe client remains mysterious, only saying: 'The contents are valuable, and time is of the essence. Deliver it safely, and you'll be well rewarded.'");
                this.showChoices([
                    { text: "Begin your journey", nextState: 'journey_start' }
                ]);
                break;

            case 'main_route':
            case 'mountain_route':
                this.writeToScreen("\nAfter several days of travel, you come across a small town.");
                this.showChoices([
                    { text: "Enter the town", nextState: 'town_encounter' },
                    { text: "Continue past the town", nextState: 'mediterranean_encounter' }
                ]);
                break;

            case 'town_encounter':
                if (!this.player.hasVisitedTown) {
                    this.writeToScreen("\nYou arrive at a bustling town. Merchants and travelers from all over gather here.");
                    this.player.hasVisitedTown = true;
                    this.showChoices([
                        { text: "Visit the local market", nextState: 'market' },
                        { text: "Rest at the inn (restores health)", nextState: 'rest' },
                        { text: "Continue your journey", nextState: 'mediterranean_encounter' }
                    ]);
                } else {
                    this.writeToScreen("\nYou've already visited this town. Best to continue your journey.");
                    this.showChoices([
                        { text: "Continue journey", nextState: 'mediterranean_encounter' }
                    ]);
                }
                break;

            case 'market':
                this.writeToScreen("\nThe market is filled with various goods and merchants.");
                const marketChoices = [
                    { text: "Buy a small boat (30 gold)", nextState: 'buy_boat' },
                    { text: "Buy earplugs (10 gold)", nextState: 'buy_earplugs' },
                    { text: "Leave the market", nextState: 'town_encounter' }
                ];
                this.showChoices(marketChoices);
                break;

            case 'buy_boat':
                if (this.player.money >= 30) {
                    this.player.money -= 30;
                    this.player.hasBoat = true;
                    this.writeToScreen("\nYou purchase a small boat. This will help you cross the Mediterranean Sea.");
                } else {
                    this.writeToScreen("\nYou don't have enough gold for the boat.");
                }
                this.showChoices([
                    { text: "Continue shopping", nextState: 'market' }
                ]);
                break;

            case 'buy_earplugs':
                if (this.player.money >= 10) {
                    this.player.money -= 10;
                    this.player.hasEarplugs = true;
                    this.writeToScreen("\nYou purchase earplugs. The merchant mentions they might be useful against the Sirens' song.");
                } else {
                    this.writeToScreen("\nYou don't have enough gold for the earplugs.");
                }
                this.showChoices([
                    { text: "Continue shopping", nextState: 'market' }
                ]);
                break;

            case 'rest':
                this.player.health = Math.min(100, this.player.health + 30);
                this.player.money -= 5;
                this.writeToScreen(`\nYou rest at the inn and recover some health. Current health: ${this.player.health}`);
                this.showChoices([
                    { text: "Return to town", nextState: 'town_encounter' }
                ]);
                break;

            case 'mediterranean_encounter':
                this.writeToScreen("\nYou reach the shores of the Mediterranean Sea. The journey to Damascus will require crossing these waters.");
                if (this.player.hasBoat) {
                    this.writeToScreen("\nYou prepare your boat for the crossing.");
                    this.showChoices([
                        { text: "Set sail", nextState: 'siren_encounter' }
                    ]);
                } else {
                    this.writeToScreen("\nYou need a boat to cross the sea. You should return to the town to purchase one.");
                    this.showChoices([
                        { text: "Return to town", nextState: 'town_encounter' }
                    ]);
                }
                break;

            case 'siren_encounter':
                this.writeToScreen("\nAs you sail across the Mediterranean, you hear the enchanting song of the Sirens...");
                if (this.player.hasEarplugs) {
                    this.writeToScreen("\nThankfully, your earplugs protect you from the Sirens' song. You continue your journey safely.");
                    this.showChoices([
                        { text: "Continue to Beirut", nextState: 'beirut_arrival' }
                    ]);
                } else {
                    this.writeToScreen("\nThe Sirens' song is too powerful to resist. You jump into the water...");
                    this.writeToScreen("\nGame Over - The Sirens claimed another victim.");
                    this.showChoices([
                        { text: "Play Again", nextState: 'start' }
                    ]);
                }
                break;

            case 'beirut_arrival':
                this.writeToScreen("\nAfter a long journey, you arrive at the Bay of Beirut. As you prepare to continue to Damascus, the box accidentally falls and opens...");
                this.writeToScreen("\nTo your astonishment, the box contains rare diamonds and other valuables worth a fortune!");
                this.showChoices([
                    { text: "Take the valuables and become a fugitive", nextState: 'become_fugitive' },
                    { text: "Continue the delivery to Damascus", nextState: 'damascus_arrival' }
                ]);
                break;

            case 'become_fugitive':
                this.writeToScreen("\nYou take the valuables and flee to Sardinia. With your newfound wealth, you purchase a beautiful villa and live a life of luxury.");
                this.writeToScreen("\nGame Over - You chose the path of a fugitive.");
                this.showChoices([
                    { text: "Play Again", nextState: 'start' }
                ]);
                break;

            case 'damascus_arrival':
                this.writeToScreen("\nYou arrive in Damascus and meet with your client's group. As you hand over the box, they draw their blades...");
                this.writeToScreen("\n'Thanks for this,' they say with a sinister smile. 'Now, we can't have any witnesses...'");
                this.showChoices([
                    { text: "Accept defeat", nextState: 'accept_defeat' },
                    { text: "Plead for your life", nextState: 'plead' },
                    { text: "Grab the knife and fight", nextState: 'final_fight' },
                    { text: "Try to run", nextState: 'run' }
                ]);
                break;

            case 'accept_defeat':
                this.writeToScreen("\nYou accept your fate. The client's men make quick work of you.");
                this.writeToScreen("\nGame Over - You met your end in Damascus.");
                this.showChoices([
                    { text: "Play Again", nextState: 'start' }
                ]);
                break;

            case 'plead':
                this.writeToScreen("\nYour pleas fall on deaf ears. The client's men are merciless.");
                this.writeToScreen("\nGame Over - Your pleas were in vain.");
                this.showChoices([
                    { text: "Play Again", nextState: 'start' }
                ]);
                break;

            case 'final_fight':
                this.writeToScreen("\nIn a desperate move, you grab the knife and fight back! Your determination and skill surprise them.");
                this.writeToScreen("\nYou manage to defeat the client's men and escape with the valuables. With your newfound wealth, you establish yourself in Damascus, becoming a respected merchant.");
                this.writeToScreen("\nGame Over - You survived and thrived in Damascus.");
                this.showChoices([
                    { text: "Play Again", nextState: 'start' }
                ]);
                break;

            case 'run':
                this.writeToScreen("\nYou try to run, but they catch up to you quickly. Your attempt to flee ends in failure.");
                this.writeToScreen("\nGame Over - You couldn't escape your fate.");
                this.showChoices([
                    { text: "Play Again", nextState: 'start' }
                ]);
                break;
        }
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
}; 