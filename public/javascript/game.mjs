import { appendRoomElement, emptyRoomElement, removeRoomsPage, addGamePage, addRoomsPage, removeGamePage, startCountdown, highlightText,restartGamePage,toggleReadyButton } from './views/room.mjs'
import { showInputModal, showMessageModal, showResultsModal } from './views/modal.mjs'
import { appendUserElement, setProgress,  emptyUserElement } from './views/user.mjs'
import { removeClass } from './helpers/dom-helper.mjs'


const username = sessionStorage.getItem('username');
const room_btn = document.getElementById('add-room-btn');

let currentRoom = '';
let text = '';
let currentPosition = 0;
let MAXIMUM_USERS_FOR_ONE_ROOM;
let SECONDS_TIMER_BEFORE_START_GAME;
let SECONDS_FOR_GAME;


const socket = io('', { query: { username } });
if (!username) {
    window.location.replace('/signin');
}

/**
 * Handles the click event for adding a new room.
 * 
 * This function is triggered when the user clicks on the "Add Room" button. It displays an input modal
 * where the user can enter the name of the room they wish to create. Upon submitting the form in the modal,
 * it emits a "CREATE_ROOM" event through the socket, passing the entered room name as data.
 */
const onClickAddRoom = () => {
    showInputModal({
        title: 'Enter room name',
        onSubmit: roomName => {
            socket.emit("CREATE_ROOM",  roomName );
        }
    });
}

/**
 * Updates the displayed room name and sets up the "Ready" button click event.
 * 
 * This function finds the HTML element with the ID 'room-name' and updates its text content to the specified `roomName`.
 * It then calls `addReadyButtonOnClick`, a function responsible for attaching an event listener to the "Ready"
 * button, enabling users to indicate their readiness for game or chat room activities.
 * 
 * @param {string} roomName - The name of the room to be displayed.
 */
const changeRoomName = (roomName) => {
    const roomNameElement = document.getElementById('room-name');
    roomNameElement.textContent = roomName;
    addReadyButtonOnClick();
}

/**
 * Handles the event when a user clicks to join a room.
 * 
 * This function is triggered when a user selects a room to join. It performs several actions to transition the user's
 * interface from the room selection to the game or chat interface for the selected room:
 * 
 * 1. Sets the `currentRoom` variable to the ID of the room the user has chosen to join.
 * 2. Calls `addBackToRoomsOnClick` to enable a UI element that allows the user to navigate back to the room selection page.
 * 3. Calls `removeRoomsPage` to hide or remove the room selection UI from the display.
 * 4. Calls `addGamePage` to display the game or chat UI for the selected room.
 * 5. Calls `changeRoomName` with the room ID to update the UI with the name of the current room.
 * 6. Emits a 'JOIN_ROOM' event through the socket, signaling the server that this client wishes to join the specified room.
 * 
 * @param {string} roomid - The ID of the room the user wishes to join.
 */
const onClickJoin = (roomid) => {
    currentRoom = roomid;
    addBackToRoomsOnClick();
    removeRoomsPage();
    addGamePage();
    changeRoomName(roomid);
    socket.emit('JOIN_ROOM', roomid);
}

/**
 * Attaches an event listener to the "Back to Rooms" button to handle room leaving.
 * 
 * This function selects the HTML element with the ID 'quit-room-btn' and attaches a click event listener to it.
 * When the button is clicked, the function emits a 'LEAVE_ROOM' event through the socket, signaling the server
 * that the user wishes to leave the current room identified by `currentRoom`. It then clears the `currentRoom`
 * variable, indicating that the user is no longer in a room. Finally, it calls `removeGamePage` to hide or remove
 * the game interface from the display and `addRoomsPage` to show the room selection interface, allowing the user
 * to join another room if desired.
 */
const addBackToRoomsOnClick = () => {
    const backToRoomsButton = document.getElementById('quit-room-btn');
    backToRoomsButton.addEventListener('click', () => {
        socket.emit('LEAVE_ROOM', currentRoom);
        currentRoom = '';
        removeGamePage();
        addRoomsPage();
    });
}

/**
 * Updates the list of available rooms displayed to the user.
 * 
 * This function is responsible for updating the UI with the current list of rooms that users can join. It first clears
 * the existing list of rooms by calling `emptyRoomElement`. Then, it iterates over the `rooms` array, which contains
 * information about each room. For each room, if its state is 'open', it calls `appendRoomElement` to add the room to
 * the UI. The `appendRoomElement` function is passed an object containing the room's name (using its ID), the number of
 * users currently in the room, and an `onJoin` function. The `onJoin` function is a callback that will be called when
 * the user clicks to join the room, and it triggers the `onClickJoin` function with the room's ID as an argument.
 * 
 * @param {Array} rooms - An array of objects, each representing a room with its id, state, and numberOfPlayers.
 */
const updateRooms = rooms => {
    emptyRoomElement();
    rooms.forEach(room => {
        if (room.state == 'open')
            appendRoomElement({ 
                name: room.id, 
                numberOfUsers: room.numberOfPlayers, 
                onJoin: () => onClickJoin(room.id) 
            });
    });
};

/**
 * Populates the user interface with elements representing each user.
 * 
 * This function takes an array of user objects and updates the UI to display each user. It starts by calling
 * `emptyUserElement` to clear any existing user elements from the UI. Then, it iterates over the `users` array,
 * creating and appending a new element for each user by calling `appendUserElement`.
 * 
 * For the current user (identified by comparing each user's username with the global `username` variable), the
 * function passes an object with `isCurrentUser` set to true along with the user's username and ready status.
 * For all other users, it sets `isCurrentUser` to false. This distinction allows the UI to differentiate and
 * possibly style the current user's element differently from others.
 * 
 * @param {Array} users - An array of user objects, each containing a username and a ready status.
 */
const addUserElements = users => {
    emptyUserElement();
    users.forEach(user => {
        if (user.username === username) {
            appendUserElement({
                username: user.username,
                ready: user.ready,
                isCurrentUser: true
            });
        }
        else{
            appendUserElement({
                username: user.username,
                ready: user.ready,
                isCurrentUser: false,
            });
        }
    });
};

/**
 * Attaches a click event listener to the "Ready" button in the UI.
 * 
 * This function selects the HTML element with the ID 'ready-btn' and attaches a click event listener to it. When the
 * "Ready" button is clicked, two actions are performed:
 * 
 * 1. `toggleReadyButton` is called to change the visual state of the button, indicating whether the user is ready or not.
 * 2. A 'TOGGLE_READY' event is emitted through the socket, along with the `username` and `currentRoom` variables. This
 *    signals to the server that the user has toggled their ready state in the current room.
 * 
 * This setup allows for real-time communication of the user's readiness state with the server and other clients in the room.
 */
const addReadyButtonOnClick = () => {
    const readyButton = document.getElementById('ready-btn');
    readyButton.addEventListener('click', () => {
        toggleReadyButton();
        socket.emit('TOGGLE_READY', username, currentRoom);
    });
};

/**
 * Initializes the game with a given text and sets up the game environment.
 * 
 * This function is called to start the game with a specific text that players will interact with. It performs the
 * following actions to set up the game:
 * 
 * 1. Sets the global variable `text` to the `randomText` provided. This text is likely what the players need to type or interact with during the game.
 * 2. Calls `activateKeyStrokes` to enable keyboard input. This function likely listens for player keystrokes and processes them as part of the game mechanics.
 * 3. Calls `addTimeRemaining` to initiate a countdown or display the remaining time for the game. This adds a time-based challenge to the game.
 * 
 * @param {string} randomText - The text to be used in the game, provided at the start.
 */
const startGame = (randomText) => {
    text = randomText;
    activateKeyStrokes();
    addTimeRemaining();

};

/**
 * Activates key stroke detection for the game.
 * 
 * This function listens for 'keydown' events on the document. When a key is pressed, it checks if the pressed key
 * matches the current expected character in the `text` string (a global variable representing the game's text).
 * If the key matches, it:
 * 
 * 1. Increments `currentPosition`, which tracks the player's progress through the text.
 * 2. Calculates the completion percentage of the text based on `currentPosition`.
 * 3. Calls `highlightText` with the new `currentPosition` to visually indicate progress.
 * 4. Emits an 'UPDATE_PROGRESS' event through the socket, notifying the server of the player's current progress.
 * 5. If the completion percentage reaches 100%, it emits a 'FINISHED' event, signaling that the player has completed the text.
 * 
 * This setup allows for real-time tracking of player progress and game completion in a typing game scenario.
 */
const activateKeyStrokes = () => {
    document.addEventListener('keydown', (event) => {
        let total = text.length;
        if (event.key === text[currentPosition]) { 
            currentPosition++; 
            let percentage = Math.floor((currentPosition / total) * 100);
            highlightText(currentPosition);
            socket.emit('UPDATE_PROGRESS', percentage, username, currentRoom);
            if (percentage == 100) {
                socket.emit('FINISHED', username, currentRoom);
            } 
        }
    });
};

/**
 * Updates the progress of all users in the game.
 * 
 * This function iterates over an array of user objects and updates each user's progress in the game UI. For each user,
 * it calls `setProgress`, a function responsible for visually updating the progress indicator for that user
 * in the UI. The `setProgress` function is passed an object containing the user's username and their current progress
 * percentage.
 * 
 * @param {Array} users - An array of user objects, each containing a username and a progress property indicating the user's current progress in the game.
 */
const updateProgressAll = (users) => {
    users.forEach(user => {
        setProgress({ username: user.username, progress: user.progress });
    });
};

/**
 * Ends the game, removes key stroke detection, and displays the game results.
 * 
 * This function is called to end the current game session. It performs several cleanup and state reset actions:
 * 
 * 1. Removes the 'keydown' event listener for detecting key strokes, effectively disabling game input.
 * 2. Resets `currentPosition` to 0 and clears the `text` variable, preparing for a new game session.
 * 3. Checks if a `winnerList` is provided; if not, it defaults to a list containing 'No winner'.
 * 4. Calls `showResultsModal` to display the game results. This function is passed an object with the sorted list of users
 *    (winners or participants) and a callback function for the modal's onClose event. The onClose callback emits an 'END_GAME'
 *    event with the `currentRoom` identifier to notify the server that the game has ended, and calls `restartGamePage` to reset
 *    the game page for a new session.
 * 
 * @param {Array} winnerList - An optional array of winners or participants to be displayed in the results modal. Defaults to ['No winner'] if not provided.
 */
const endGame = (winnerList) => {
    document.removeEventListener('keydown', activateKeyStrokes);
    currentPosition = 0;
    text = '';
    if (!winnerList) {
        winnerList = ['No winner']
    }
    showResultsModal({ usersSortedArray : winnerList, onClose : () => {
        socket.emit('END_GAME', currentRoom); 
        restartGamePage();
    } })
};

/**
 * Starts a countdown timer for the game and displays it in the UI.
 * 
 * This function initializes a countdown timer for the duration of the game, using the `SECONDS_FOR_GAME` constant to
 * determine the total time. It performs the following steps:
 * 
 * 1. Retrieves and stores the `game-timer` and `game-timer-seconds` elements from the document.
 * 2. Sets the inner text of the `game-timer-seconds` element to the initial time, making the remaining time visible to the user.
 * 3. Removes the 'display-none' class from the `game-timer` element, ensuring the timer is visible in the UI.
 * 4. Starts a `setInterval` timer that decrements the displayed time every second.
 * 5. Checks if the time has run out (time < 0). If so, it clears the interval to stop the countdown and calls `endGame` to
 *    handle the end of the game logic, such as displaying results and resetting the game environment.
 */
const addTimeRemaining = () => {
    let time = SECONDS_FOR_GAME;
    const gameTimer = document.getElementById("game-timer");
    const timer = document.getElementById("game-timer-seconds");
    timer.innerText = time;
    removeClass(gameTimer, 'display-none');
    const countdown = setInterval(() => {
        timer.innerText = time;
        time--;
        if (time < 0) {
            clearInterval(countdown);
            endGame();
        }
    }, 1000);
}

/**
 * Handles the action of a user leaving a room.
 * 
 * This function is responsible for managing the process when a user decides to leave a room. It performs the following actions:
 * 
 * 1. Emits a 'LEAVE_ROOM' event through the socket, signaling to the server that the user wishes to leave the current room identified by `currentRoom`.
 * 2. Resets `currentRoom` to an empty string, indicating that the user is no longer in any room.
 * 3. Resets local game-related variables (`text`, `currentPosition`) to their initial states, preparing for a new game session if needed.
 * 4. Calls `removeGamePage` to hide or remove the game interface from the display, clearing any game-specific content or UI elements.
 * 5. Calls `addRoomsPage` to show the room selection interface, allowing the user to join another room if desired.
 */
const leaveRoom = () => {
    socket.emit('LEAVE_ROOM', currentRoom);
    currentRoom = '';
    let text = '';
    let currentPosition = 0;
    removeGamePage();
    addRoomsPage();
}

/**
 * Handles the 'INITIAL_CONFIG' event received from the server via WebSocket.
 * 
 * This event listener is set up to receive the initial configuration for the game from the server. When the 'INITIAL_CONFIG'
 * event is received, it updates several global variables with configuration values provided by the server. These variables
 * control key aspects of the game's behavior:
 * 
 * - `MAXIMUM_USERS_FOR_ONE_ROOM`: Sets the maximum number of users that can join a single game room.
 * - `SECONDS_TIMER_BEFORE_START_GAME`: Configures the delay, in seconds, before the game starts after reaching the required number of players.
 * - `SECONDS_FOR_GAME`: Determines the total duration, in seconds, of the game.
 * 
 * Each of these variables is set by converting the corresponding value from the `config` object to a number, ensuring that
 * the values used in the game logic are of the correct type.
 */
socket.on('INITIAL_CONFIG', (config) => {
    MAXIMUM_USERS_FOR_ONE_ROOM = Number(config.MAXIMUM_USERS_FOR_ONE_ROOM);
    SECONDS_TIMER_BEFORE_START_GAME = Number(config.SECONDS_TIMER_BEFORE_START_GAME);
    SECONDS_FOR_GAME = Number(config.SECONDS_FOR_GAME);
});

/**
 * Handles various socket events related to the game's multiplayer functionality.
 * 
 * - `UPDATE_PLAYERS`: This event is received when there is an update to the list of players in the current room.
 *   The `addUserElements` function is called in response, which updates the UI to reflect the current list of players.
 * 
 * - `UPDATE_ROOMS`: Triggered when there is an update to the list of available rooms. The `updateRooms` function is
 *   called, updating the UI to show the latest rooms that players can join.
 * 
 * - `ROOM_CREATED`: Occurs when a new room has been successfully created by the user. The received `roomName` is set
 *   as the `currentRoom`, and `onClickJoin` is called with `roomName` to handle the user's joining of the newly created room.
 * 
 * - `ROOM_NOT_CREATED`: This event is received if the room creation attempt was unsuccessful (e.g., a room with the
 *   same name already exists). In response, `showMessageModal` is called with a message indicating that the room
 *   already exists, informing the user of the issue.
 * * - `START_GAME`: Triggered when the server signals the start of the game. It calls `startCountdown` with the `randomText`
 *   provided by the server, initiating a countdown before the game starts. After a 6-second delay, `startGame` is called
 *   with the same `randomText` to officially start the game.
 * 
 * - `UPDATE_PROGRESS_RESPONSE`: Listens for updates on the progress of all players in the game. When received, it calls
 *   `updateProgressAll` to update the UI with the current progress of each player.
 * 
 * - `GAME_OVER`: Triggered when the game has ended. It calls `endGame` to handle the game's conclusion, such as displaying
 *   the winner and resetting the game state for a new session.
 * 
 * - `USERNAME_ALREADY_EXISTS`: Occurs when the chosen username already exists in the current game session. It clears the
 *   session storage, potentially removing any saved game state or user information, and displays a modal message informing
 *   the user that the username already exists. Upon closing the modal, the user is redirected to the sign-in page.
 */
socket.on('UPDATE_PLAYERS', addUserElements);

socket.on('UPDATE_ROOMS', updateRooms);

socket.on('ROOM_CREATED', (roomName) => {
    currentRoom = roomName;
    onClickJoin(roomName);
});

socket.on('ROOM_NOT_CREATED', () => {
    showMessageModal({ message: 'Room already exists' });
});


socket.on('START_GAME', (randomText) => {
    startCountdown(randomText);
    setTimeout(() => startGame(randomText), 6000); 
});
socket.on("UPDATE_PROGRESS_RESPONSE", updateProgressAll);
socket.on('GAME_OVER', endGame);
socket.on('USERNAME_ALREADY_EXISTS', () => {sessionStorage.clear();
    
    
    showMessageModal({ message: 'Username already exists' , onClose : () => {window.location.replace('/signin');}});
});


room_btn.addEventListener('click', onClickAddRoom);

export { SECONDS_TIMER_BEFORE_START_GAME };