const letters = document.querySelectorAll('.scoreboard-letter');
const loadingDiv = document.querySelector('.info-bar');
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init() {
    let currentGuess = '';
    let currentRow = 0;
    let isLoading = true;

    const response = await fetch('https://words.dev-apis.com/word-of-the-day');
    const responseObject = await response.json();
    const word = responseObject.word.toUpperCase();
    const wordParts = word.split("");
    let done = false;
    isLoading = false;
    setLoading(false);
    console.log(word);

    function addLetter(letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter;
        }
        else {
            /* replace the last letter */
            if (letter != currentGuess[currentGuess.length - 1])
                currentGuess[currentGuess.length - 1] = letter;
        }
        /* get the right cell */
        letters[currentRow * ANSWER_LENGTH + currentGuess.length - 1].innerText = letter;
    }

    async function commit() {
        if (currentGuess.length != ANSWER_LENGTH) {
            /* do nothing */
            return;
        }

        isLoading = true;
        setLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({word: currentGuess})
        });
        const resObject = await res.json();
        const validWord = resObject.validWord;
        
        isLoading = false;
        setLoading(false);

        if (!validWord) {
            markInvalidWord();
            return;
        }

        const guessParts = currentGuess.split("");
        const map = makeMap(wordParts);
        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessParts[i] === wordParts[i]) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add('correct');
                map[guessParts[i]]--;
            }
        }
        console.log(map);
        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessParts[i] == wordParts[i]) {
                // do nothing, already did it
            }
            else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add('close');
                map[guessParts[i]]--;
            }
            else {
                letters[currentRow * ANSWER_LENGTH + i].classList.add('wrong');
            }
        }
        // TODO did they win or lose

        currentRow++;
        if (currentGuess == word) {
            // win
            alert('You win!');
            document.querySelector('.brand').classList.add('winner');
            done = true;
            return;
        }
        else if (currentRow === ROUNDS) {
            alert(`you lose, the word was ${word}`);
            done = true;
            return;
        }
        currentGuess = '';
    }

    function backspace() {
        if (currentGuess.length) {
            currentGuess = currentGuess.substring(0, currentGuess.length - 1);
            letters[currentRow * ANSWER_LENGTH + currentGuess.length].innerText = '';
        }
    }

    function markInvalidWord() {
        // alert('not a valid word');
        for (let i = 0; i < ANSWER_LENGTH; i++) {
            letters[currentRow * ANSWER_LENGTH + i].classList.remove('invalid');
            setTimeout(function() {
                letters[currentRow * ANSWER_LENGTH + i].classList.add('invalid');
            }, 10);
        }
    }

    document.addEventListener('keydown', function handleKeyPress (event) {
        if (done || isLoading) {
            // do nothing
            return;
        }
        const action = event.key;

        if (action === 'Enter') {
            commit();
        }
        else if (action == 'Backspace') {
            backspace();
        }
        else if (isLetter(action)) {
            addLetter(action.toUpperCase());
        }
        else
            // do nothing
            ;
    });
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
    loadingDiv.classList.toggle('hidden', !isLoading);
}

function makeMap(array) {
    const obj = {}
    for (let i = 0; i < array.length; i++) {
        const letter = array[i];
        if (obj[letter])
            obj[letter]++;
        else
            obj[letter] = 1;
    }
    return obj;
}

init();