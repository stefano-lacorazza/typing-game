import { createElement, addClass, removeClass } from '../helpers/dom-helper.mjs';
import { SECONDS_TIMER_BEFORE_START_GAME } from '../game.mjs';



/**
 * Appends a room element to the rooms container.
 * 
 * This function dynamically creates a new room element with the specified name and number of users,
 * and appends it to the rooms container in the DOM. It also sets up a 'Join' button for each room,
 * with an event listener that triggers the provided `onJoin` callback when clicked.
 * 
 * @param {Object} options - The options for creating the room element.
 * @param {string} options.name - The name of the room.
 * @param {number} options.numberOfUsers - The current number of users in the room.
 * @param {Function} [options.onJoin] - An optional callback function to be called when the 'Join' button is clicked.
 *                                      Defaults to a no-op function if not provided.
 * @returns {HTMLElement} The created room element.
 */
const appendRoomElement = ({ name, numberOfUsers, onJoin = () => {} }) => {
    const roomsContainer = document.querySelector('#rooms-wrapper');

    const nameElement = createElement({
        tagName: 'div',
        className: 'room-name',
        attributes: { 'data-room-name': name },
        innerElements: [name]
    });

    const numberOfUsersString = getNumberOfUsersString(numberOfUsers);
    const connectedUsersElement = createElement({
        tagName: 'div',
        className: 'connected-users',
        attributes: { 'data-room-name': name, 'data-room-number-of-users': numberOfUsers },
        innerElements: [numberOfUsersString]
    });

    const joinButton = createElement({
        tagName: 'button',
        className: 'join-btn',
        attributes: { 'data-room-name': name },
        innerElements: ['Join']
    });

    const roomElement = createElement({
        tagName: 'div',
        className: 'room',
        attributes: { 'data-room-name': name },
        innerElements: [nameElement, connectedUsersElement, joinButton]
    });

    roomsContainer.append(roomElement);

    joinButton.addEventListener('click', onJoin);

    return roomElement;
};


/**
 * Clears the content of the rooms container.
 * 
 * This function selects the HTML element with the ID 'rooms-wrapper' and sets its innerHTML to an empty string,
 * effectively removing all child elements. It is typically used to reset the rooms display area before
 * repopulating it with updated room information.
 */
const emptyRoomElement = () => {
    const roomsContainer = document.querySelector('#rooms-wrapper');
    roomsContainer.innerHTML = '';
};

/**
 * Updates the displayed number of users in a specific room.
 * 
 * This function finds the HTML element representing the number of connected users in a room by its data attribute
 * `data-room-name` matching the provided room name. It then updates the inner text of this element to a formatted
 * string representing the number of users, and also updates a custom data attribute `data-room-number-of-users`
 * with the new user count. This allows for dynamic updating of user counts in the UI without needing to refresh
 * or rebuild the entire room element.
 * 
 * @param {Object} options - The options for updating the user count.
 * @param {string} options.name - The name of the room to update.
 * @param {number} options.numberOfUsers - The new number of users in the room.
 */
const updateNumberOfUsersInRoom = ({ name, numberOfUsers }) => {
    const roomConnectedUsersElement = document.querySelector(`.connected-users[data-room-name='${name}']`);
    roomConnectedUsersElement.innerText = getNumberOfUsersString(numberOfUsers);
    roomConnectedUsersElement.dataset.roomNumberOfUsers = numberOfUsers;
};


/**
 * Displays the rooms page by modifying its CSS classes.
 * 
 * This function selects the HTML element with the ID 'rooms-page'. If the element is found,
 * it removes the 'display-none' class (which presumably hides the element by setting its display
 * style to 'none') and adds the 'full-screen' class (which presumably ensures the element occupies
 * the full screen). If the element with the specified ID is not found, it logs an error message
 * to the console indicating the element was not found.
 */
const addRoomsPage = () => {
    const roomsPageElement = document.getElementById("rooms-page");
    if (roomsPageElement) {
        removeClass(roomsPageElement, 'display-none');
        addClass(roomsPageElement, 'full-screen');
    } else {
        console.error("Element with ID 'rooms-page' not found.");
    }
}

/**
 * Hides the rooms page by modifying its CSS classes.
 * 
 * This function selects the HTML element with the ID 'rooms-page'. If the element is found,
 * it removes the 'full-screen' class (which presumably makes the element occupy the full screen)
 * and adds the 'display-none' class (which hides the element by setting its display style to 'none').
 * If the element with the specified ID is not found, it logs an error message to the console indicating
 * the element was not found.
 */
function removeRoomsPage() {
    const roomsPageElement = document.getElementById("rooms-page");
    if (roomsPageElement) {
        removeClass(roomsPageElement, 'full-screen');
        addClass(roomsPageElement, 'display-none');
        
    } else {
        console.error("Element with ID 'rooms-page' not found.");
    }
}

const addGamePage = () => {
    const gamePage = document.getElementById("game-page");
    if (gamePage) {
        removeClass(gamePage, 'display-none');
        addClass(gamePage, 'full-screen');
    }
    else {
        console.error("Element with ID 'game-page' not found.");
    }
}

/**
 * Displays the game page by modifying its CSS classes.
 * 
 * This function selects the HTML element with the ID 'game-page'. If the element is found,
 * it removes the 'display-none' class (which presumably hides the element by setting its display
 * style to 'none') and adds the 'full-screen' class (which presumably ensures the element occupies
 * the full screen). If the element with the specified ID is not found, it logs an error message
 * to the console indicating the element was not found.
 */
const removeGamePage = () => {
    const gamePage = document.getElementById("game-page");
    if (gamePage) {
        removeClass(gamePage, 'full-screen');
        addClass(gamePage, 'display-none');
    }
}


/**
 * Initiates a countdown for the game start, displaying a timer and playing a sound.
 * 
 * This function starts a countdown timer visible to the user, beginning from the value specified
 * by `SECONDS_TIMER_BEFORE_START_GAME`. It updates the displayed timer every second. When the timer
 * reaches 3 seconds or less, a beep sound is played to indicate the impending start of the game.
 * Upon reaching 0, the timer is hidden, and a "START WRITING..." message is displayed briefly before
 * the actual game text (`randomText`) is shown, marking the start of the game.
 * 
 * @param {string} randomText - The text players will start typing once the countdown finishes.
 */
const startCountdown = ( randomText ) => {
    
    const readybtn = document.getElementById("ready-btn");
    const timer = document.getElementById("timer");
    const beepSound = new Audio('../../audio/mariostart.mp3');

    removeClass(timer, 'display-none');
    addClass(readybtn, 'display-none');
    
    let time =  Number(SECONDS_TIMER_BEFORE_START_GAME);
    // Update the count down every 1 second
    const countdown = setInterval(() => {
        timer.innerText = time;
        time--;
        if (time < 3) {
            beepSound.play();

        }
        if (time < 0) {
            clearInterval(countdown);

            addClass(timer, 'display-none');
            insertRandomText("START WRITING...")
            // one second delay
            setTimeout(() => {
                insertRandomText(randomText);
            }, 1000);
        }
    }, 1000);
}

/**
 * Prepares the game page for a new game session.
 * 
 * This function resets the game page to its initial state in preparation for a new game. It performs the following actions:
 * - Hides the main timer element by adding the 'display-none' class to it.
 * - Shows the 'Ready' button by removing the 'display-none' class from it.
 * - Hides the text container element that displays the game text, preparing it for the next game's text.
 * - Hides the game duration timer.
 * 
 * These actions ensure that the game page is clean and ready for players to indicate they are ready for the next game.
 */
const restartGamePage = () => {
    const readybtn = document.getElementById("ready-btn");
    const timer = document.getElementById("timer");
    const randomTextElement = document.getElementById("text-container");
    const gameTimer = document.getElementById("game-timer");

    addClass(timer, 'display-none');
    removeClass(readybtn, 'display-none');
    addClass(randomTextElement, 'display-none');
    addClass(gameTimer, 'display-none');
}


/**
 * Inserts the provided text into the 'text-container' element and makes it visible.
 * 
 * This function selects the HTML element with the ID 'text-container', ensures it is visible by removing
 * the 'display-none' class, and sets its inner text to the provided `randomText`.
 * @param {string} randomText - The text to be displayed in the 'text-container' element.
 */
const insertRandomText = (randomText) => {
    const randomTextElement = document.getElementById("text-container");
    removeClass(randomTextElement, 'display-none');
    randomTextElement.innerText = randomText;
}


/**
 * Highlights the character at the current position in the text displayed in the 'text-container' element.
 * 
 * This function retrieves the text from the 'text-container' element and splits it into three parts:
 * the text before the current position, the character at the current position, and the text after the current position.
 * It then wraps the text before the current position in a `<span>` with the class 'highlight',
 * and the character at the current position in a `<span>` with the class 'underline'. These classes are expected
 * to apply specific styling, such as background color for highlighting and an underline for the current character.
 * Finally, it updates the 'text-container' element's innerHTML with the newly formatted text, visually indicating
 * the current position in the text to the user.
 * 
 * @param {number} currentPosition - The index of the current character in the text to highlight.
 */
const highlightText = (currentPosition) => {
    const randomTextElement = document.getElementById("text-container");
    const text = randomTextElement.innerText;
    let beforeText = text.substring(0, currentPosition);
    let currentPositionChar = text.charAt(currentPosition);
    const afterText = text.substring(currentPosition+1);
    currentPositionChar = `<span class="underline">${currentPositionChar}</span>`;
    beforeText = `<span class="highlight">${beforeText}</span>`;
    randomTextElement.innerHTML = beforeText + currentPositionChar + afterText;
}

/**
 * Toggles the text of the "ready" button between "READY" and "UNREADY".
 * 
 * This function selects the HTML element with the ID 'ready-btn' and checks its current inner text.
 * If the text is "READY", it changes it to "UNREADY". If the text is anything else (implicitly "UNREADY"),
 * it changes it back to "READY". This is typically used in a multiplayer game room setting, allowing
 * users to indicate their readiness to start a game.
 */
const toggleReadyButton = () => {
    const readybtn = document.getElementById("ready-btn");
    const readybtnText = readybtn.innerText;
    if (readybtnText === "READY") {
        
        readybtn.innerText = "UNREADY";
    }
    else {
        readybtn.innerText = "READY";
    }
}



const getNumberOfUsersString = numberOfUsers => `${numberOfUsers} connected`;

const removeRoomElement = name => document.querySelector(`.room[data-room-name='${name}']`)?.remove();

export { appendRoomElement, updateNumberOfUsersInRoom, removeRoomElement, emptyRoomElement, removeRoomsPage, addGamePage, removeGamePage, addRoomsPage, startCountdown, highlightText, restartGamePage, toggleReadyButton };
