import { set_content } from "/js/common.js"

const fishbowlId = "fishbowl";
const gameStateCookie = "fishbowl_game_state";
const timeLimit = 5; // seconds
const minWords = 1;

/**
 * Game states.
 */
class States {
    static LOBBY = "lobby";
    static GAME_INITIALIZE = "game_initialize";
    static ROUND_START = "round_start";
    static TURN_START = "turn_start";
    static DRAWING = "drawing";
    static TURN_END = "turn_end";
    static END = "end";
}

/**
 * Rounds of the game.
 */
const Rounds = [
    {
        name: "Round 1",
        description: "Describe the word without using the word itself.",
        timeLimit: timeLimit,
    },
    {
        name: "Round 2",
        description: "Act out the word without speaking.",
        timeLimit: timeLimit,
    },
    {
        name: "Round 3",
        description: "Use only one word to describe the word.",
        timeLimit: timeLimit,
    },
    {
        name: "Round 4",
        description: "Use only sounds to describe the word.",
        timeLimit: timeLimit,
    },
]

/**
 * A list of random words.
 */
const random_word_list = [
    "Apple", "Banana", "Cat", "Dog", "Elephant", "Fish", "Guitar", "House",
    "Ice cream", "Jungle", "Kangaroo", "Lion", "Mountain", "Notebook",
    "Ocean", "Piano", "Queen", "Rainbow", "Sunflower", "Tiger", "Umbrella",
    "Violin", "Whale", "Xylophone", "Yacht", "Zebra"
];

/**
 * Check whether a word is valid.
 *
 * @param {String} word The word.
 *
 * @returns True if the word is valid.
 */
function is_valid_word(word) {
    const regex = /^[a-zA-Z]+$/;
    return regex.test(word);
}

/**
 * Class representing the state of the fishbowl game.
 */
class Game {
    constructor() {
        this.root = document.getElementById(fishbowlId);
        this.gameState = undefined;
        this.reset_game_state();
    }

    /**
     * Reset the game state.
     */
    reset_game_state() {
        this.gameState = {
            team1: [],
            team2: [],
            state: States.LOBBY,
            currentRound: 0,
            currentTeam: 1,
            currentTeam1Index: 0,
            currentTeam2Index: 0,
            currentWordIndex: 0,
            team1Score: 0,
            team2Score: 0,
            currentTurnScore: 0,
            words: [],
        };
    }

    /**
     * Save the state to cookies.
     */
    save() {
        // Set the cookie to expire in 1 year.
        document.cookie = `${gameStateCookie}=${encodeURIComponent(JSON.stringify(this.gameState))}; path=/; max-age=31536000`;
    }

    /**
     * Load the state from cookies.
     */
    load() {
        const cookies = document.cookie.split("; ");
        for (const cookie of cookies) {
            const [name, value] = cookie.split("=");
            if (name === gameStateCookie) {
                this.gameState = JSON.parse(decodeURIComponent(value));
                return;
            }
        }
    }

    /**
     * Clear the saved game state.
     */
    clear() {
        document.cookie = `${gameStateCookie}=; path=/; max-age=0`;
    }

    /**
     * Whether an existing game is in progress.
     *
     * @returns {boolean} True if a game is in progress, false otherwise.
     */
    is_game_in_progress() {
        const cookies = document.cookie.split("; ");
        for (const cookie of cookies) {
            const [name, value] = cookie.split("=");
            if (name === gameStateCookie) {
                return true;
            }
        }
        return false;
    }

    /**
     * Advance to the next state and render it.
     */
    next() {
        if (this.gameState.state === States.LOBBY) {
            this.render_lobby();
            // Avoid saving in the lobby state. This would overwrite an existing game.
            return;
        } else if (this.gameState.state === States.GAME_INITIALIZE) {
            this.render_game_initialize();
        } else if (this.gameState.state === States.ROUND_START) {
            this.render_round_start();
        } else if (this.gameState.state === States.TURN_START) {
            this.render_turn_start();
        } else if (this.gameState.state === States.DRAWING) {
            this.render_drawing();
        } else if (this.gameState.state === States.TURN_END) {
            this.render_turn_end();
        } else if (this.gameState.state === States.END) {
            this.render_end();
        }
        this.save();
    }

    /**
     * Render the lobby state.
     */
    render_lobby() {
        let buttons = `<button class="btn btn-primary mx-1" id="fishbowl-button-start">Start Game</button>`;
        if (this.is_game_in_progress()) {
            buttons += `<button class="btn btn-secondary mx-1" id="fishbowl-button-resume">Resume Game</button>`;
        }

        this.root.innerHTML = `
            <h2>Fishbowl Rules</h2>
            <ul class="list-unstyled">
                ${Rounds.map(round => `<li><strong>${round.name}:</strong> ${round.description} (Time limit: ${round.timeLimit} seconds)</li>`).join('')}
            </ul>
            <div class="d-flex flex-row text-center justify-content-center">
                ${buttons}
            </div>
        `;

        // Start game button handler.
        const start_button = document.getElementById("fishbowl-button-start");
        start_button.onclick = () => {
            this.gameState.state = States.GAME_INITIALIZE;
            this.next();
        };

        // Resume button handler.
        const resume_button = document.getElementById("fishbowl-button-resume");
        if (resume_button) {
            resume_button.onclick = () => {
                this.load();
                this.next();
                console.log("Resuming game:", this.gameState.state);
            };
        }
    }

    /**
     * Render the game initialization state.
     */
    render_game_initialize() {
        this.root.innerHTML = `
            <h2>New Game</h2>

            <label for="team-names-1">Team 1 (comma-separated):</label>
            <input type="text" id="team-names-1" class="form-control mb-2" placeholder="Alice, Bob">
            <div id="team-names-1-error-message" class="text-danger mb-2"></div>

            <label for="team-names-2">Team 2 (comma-separated):</label>
            <input type="text" id="team-names-2" class="form-control mb-2" placeholder="Charlie, Dana">
            <div id="team-names-2-error-message" class="text-danger mb-2"></div>

            <label for="word-list">Add word (press "Add" after each word) -- We recommend every player enter in at least 3 words.</label>
            <div class="input-group mb-2">
                <input type="text" id="fishbowl-input-add-word" class="form-control" placeholder="Banana">
                <div class="input-group-append">
                    <button class="btn btn-secondary" id="fishbowl-button-add-word">Add</button>
                </div>
            </div>
            <div id="fishbowl-err-add-word" class="text-danger mb-2"></div>
            <br>

            <button class="btn btn-primary" id="fishbowl-button-begin">Begin Game</button>
        `;

        const errorMessage = document.getElementById("fishbowl-err-add-word");
        const addWordInput = document.getElementById("fishbowl-input-add-word");
        const addWordButton = document.getElementById("fishbowl-button-add-word");

        const addWordHandler = () => {
            const word = addWordInput.value.trim();
            if (is_valid_word(word)) {
                this.gameState.words.push(word.toLowerCase());

                // Set the placeholder to a random word for inspiration.
                const randomWord = random_word_list[Math.floor(Math.random() * random_word_list.length)];
                addWordInput.value = "";
                addWordInput.placeholder = randomWord;
                errorMessage.textContent = "";
                this.save();
            } else {
                errorMessage.textContent = "Invalid word. Please enter one word at a time without spaces or special characters.";
            }
        }

        // Add word button handlers.
        addWordButton.onclick = addWordHandler;
        addWordInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                addWordHandler();
            }
        });

        // Begin game button handler.
        const begin_button = document.getElementById("fishbowl-button-begin");
        begin_button.onclick = () => {
            const team1Input = document.getElementById("team-names-1").value.trim();
            const team2Input = document.getElementById("team-names-2").value.trim();
            if (!team1Input) {
                const errorMessage = document.getElementById("team-names-1-error-message");
                errorMessage.textContent = "Please enter at least one player for Team 1.";
                return;
            }
            if (!team2Input) {
                const errorMessage = document.getElementById("team-names-2-error-message");
                errorMessage.textContent = "Please enter at least one player for Team 2.";
                return;
            }
            if (this.gameState.words.length < minWords) {
                const errorMessage = document.getElementById("fishbowl-err-add-word");
                errorMessage.textContent = `Please add at least ${minWords} words to the word list.`;
                return;
            }

            for (const name of team1Input.split(",")) {
                this.gameState.team1.push(name.trim());
            }
            for (const name of team2Input.split(",")) {
                this.gameState.team2.push(name.trim());
            }

            this.gameState.state = States.ROUND_START;
            this.next();
        };
    }

    /**
     * Render the round start state.
     */
    render_round_start() {
        // Game over.
        if (this.gameState.currentRound >= Rounds.length) {
            this.gameState.state = States.END;
            this.next();
            return;
        }

        const round = Rounds[this.gameState.currentRound];
        this.root.innerHTML = `
            <h2>${round.name}: ${round.description}</h2>
            <p>Time limit: ${round.timeLimit} seconds per turn</p>
            <button class="btn btn-primary" id="fishbowl-button-next-round">Start Round</button>
        `;
        const next_round_button = document.getElementById("fishbowl-button-next-round");
        next_round_button.onclick = () => {
            this.gameState.state = States.TURN_START;

            // Alternate starting team each round.
            this.gameState.currentTeam = Math.floor(this.gameState.currentRound % 2) + 1;

            // Shuffle the words for the new round.
            this.gameState.words = this.gameState.words.sort(() => Math.random() - 0.5);
            this.gameState.currentWordIndex = 0;

            this.next();
        };
    }

    /**
     * Render the turn start state.
     */
    render_turn_start() {
        const round = Rounds[this.gameState.currentRound];
        const team = this.gameState.currentTeam === 1 ? this.gameState.team1 : this.gameState.team2;
        const playerIndex = this.gameState.currentTeam === 1 ? this.gameState.currentTeam1Index : this.gameState.currentTeam2Index;
        const player = team[playerIndex];

        this.root.innerHTML = `
            <h2>Next Turn: ${player}</h2>
            <p class="m-0">${round.description}</p>
            <p><strong>Time Limit:</strong> ${round.timeLimit} seconds</p>
            <button class="btn btn-primary" id="fishbowl-button-start-turn">Start Turn</button>
        `;
        const start_turn_button = document.getElementById("fishbowl-button-start-turn");
        start_turn_button.onclick = () => {
            this.gameState.state = States.DRAWING;
            this.next();
        };
    }

    /**
     * Render the drawing state.
     */
    render_drawing() {
        const round = Rounds[this.gameState.currentRound];
        const team = this.gameState.currentTeam === 1 ? this.gameState.team1 : this.gameState.team2;
        const playerIndex = this.gameState.currentTeam === 1 ? this.gameState.currentTeam1Index : this.gameState.currentTeam2Index;
        const player = team[playerIndex];
        const word = this.gameState.words[this.gameState.currentWordIndex];
        const wordsRemaining = this.gameState.words.length - this.gameState.currentWordIndex;
        this.gameState.currentTurnScore = 0;

        this.root.innerHTML = `
            <h1><i><span id="fishbowl-current-word">${word}</span></i></h1>
            <div class="p-1 my-2 mx-auto border border-secondary border-circle d-flex flex-column justify-content-center align-items-center">
                <h2 id="fishbowl-timer">${round.timeLimit}</h2>
            </div>
            <div class="py-3">
                <p class="m-0"><strong>Words Remaining</strong> <span id="fishbowl-words-remaining">${wordsRemaining}</span> seconds</p>
                <p class="m-0"><strong>Current Turn Score:</strong> <span id="fishbowl-turn-score">0</span> </p>
            </div>
            <button class="btn btn-danger mx-2" id="fishbowl-button-pass">Pass</button>
            <button class="btn btn-success mx-2" id="fishbowl-button-correct">Correct</button>
        `;

        const currentWordElement = document.getElementById("fishbowl-current-word");
        const wordsRemainingElement = document.getElementById("fishbowl-words-remaining");
        const timerElement = document.getElementById("fishbowl-timer");
        const turnScoreElement = document.getElementById("fishbowl-turn-score");

        // Update the timer every second.
        let timeRemaining = round.timeLimit;
        const timerInterval = setInterval(() => {
            // Clear the timer if the state has changed for some reason.
            if (this.gameState.state !== States.DRAWING) {
                clearInterval(timerInterval);
                return;
            }

            // Otherwise decrement the timer.
            timeRemaining -= 1;
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                this.gameState.state = States.TURN_END;
                this.next();
            }
            timerElement.textContent = timeRemaining;
        }, 1000);

        // Correct button handler.
        const correct_button = document.getElementById("fishbowl-button-correct");
        correct_button.onclick = () => {
            this.gameState.currentTurnScore += 1;
            this.gameState.currentWordIndex += 1;

            if (this.gameState.currentWordIndex >= this.gameState.words.length) {
                // No more words left, end the turn.
                this.gameState.state = States.TURN_END;
                this.next();
            }

            const wordsRemaining = this.gameState.words.length - this.gameState.currentWordIndex;
            wordsRemainingElement.textContent = wordsRemaining;
            currentWordElement.textContent = this.gameState.words[this.gameState.currentWordIndex];
            turnScoreElement.textContent = this.gameState.currentTurnScore;
        };

        // Pass button handler.
        const pass_button = document.getElementById("fishbowl-button-pass");
        pass_button.onclick = () => {
            this.gameState.currentTurnScore -= 1;
            this.gameState.currentWordIndex += 1;

            if (this.gameState.currentWordIndex >= this.gameState.words.length) {
                // No more words left, end the turn.
                this.gameState.state = States.TURN_END;
                this.next();
            }

            const wordsRemaining = this.gameState.words.length - this.gameState.currentWordIndex;
            wordsRemainingElement.textContent = wordsRemaining;
            currentWordElement.textContent = this.gameState.words[this.gameState.currentWordIndex];
            turnScoreElement.textContent = this.gameState.currentTurnScore;
        };
    }

    /**
     * Render the turn end state.
     */
    render_turn_end() {
        const team = this.gameState.currentTeam === 1 ? this.gameState.team1 : this.gameState.team2;
        const playerIndex = this.gameState.currentTeam === 1 ? this.gameState.currentTeam1Index : this.gameState.currentTeam2Index;
        const player = team[playerIndex];

        // Update the scores.
        if (this.gameState.currentTeam === 1) {
            this.gameState.team1Score += this.gameState.currentTurnScore;
            this.gameState.currentTeam1Index = (this.gameState.currentTeam1Index + 1) % this.gameState.team1.length;
        } else {
            this.gameState.team2Score += this.gameState.currentTurnScore;
            this.gameState.currentTeam2Index = (this.gameState.currentTeam2Index + 1) % this.gameState.team2.length;
        }

        // If all words have been used, end the round.
        let nextButton = "";
        if (this.gameState.currentWordIndex >= this.gameState.words.length) {
            nextButton = `<button class="btn btn-primary" id="fishbowl-button-next-round">Next Round</button>`;
        } else {
            nextButton = `<button class="btn btn-primary" id="fishbowl-button-next-turn">Next Turn</button>`;
        }

        this.root.innerHTML = `
            <h2>Turn Over!!</h2>
            <h3>Score: <strong>${this.gameState.currentTurnScore}</strong></h3>
            <div class="row">
                <div class="border border-secondary rounded col mx-1 my-3 p-3">
                    <h3>Team 1</h3>
                    <h4 class="m-0">${this.gameState.team1Score}</h4>
                </div>
                <div class="border border-secondary rounded col mx-1 my-3 p-3">
                    <h3>Team 2</h3>
                    <h4 class="m-0">${this.gameState.team2Score}</h4>
                </div>
            </div>
            ${nextButton}
        `;

        const next_turn_button = document.getElementById("fishbowl-button-next-turn");
        if (next_turn_button) {
            next_turn_button.onclick = () => {
                this.gameState.currentTeam = this.gameState.currentTeam === 1 ? 2 : 1;
                this.gameState.state = States.TURN_START;
                this.next();
            };
        }

        const next_round_button = document.getElementById("fishbowl-button-next-round");
        if (next_round_button) {
            next_round_button.onclick = () => {
                this.gameState.currentRound += 1;
                this.gameState.state = States.ROUND_START;
                this.next();
            };
        }
    }

    /**
     * Render the end state.
     */
    render_end() {
        console.log("Rendering game end...");
        let winner = "It's a tie!";
        if (this.gameState.team1Score > this.gameState.team2Score) {
            winner = "Team 1 wins!";
        } else if (this.gameState.team2Score > this.gameState.team1Score) {
            winner = "Team 2 wins!";
        }

        const winningTeam = this.gameState.team1Score > this.gameState.team2Score ? this.gameState.team1 : this.gameState.team2;
        const players = winningTeam.join(", ");

        this.root.innerHTML = `
            <h2>Game Over</h2>
            <p><strong>Final Score:</strong> Team 1: ${this.gameState.team1Score}, Team 2: ${this.gameState.team2Score}</p>
            <h3>${winner}</h3>
            <p>${players}</p>
            <button class="btn btn-primary" id="fishbowl-button-new-game">New Game</button>
        `;

        const new_game_button = document.getElementById("fishbowl-button-new-game");
        new_game_button.onclick = () => {
            this.reset_game_state();
            this.clear();
            this.state = States.LOBBY;
            this.next();
        }
    }
}

const game = new Game();
game.next();
