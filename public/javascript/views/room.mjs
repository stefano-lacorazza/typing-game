import { createElement, addClass, removeClass } from '../helpers/dom-helper.mjs';
import { SECONDS_TIMER_BEFORE_START_GAME } from '../game.mjs';




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

const emptyRoomElement = () => {
    const roomsContainer = document.querySelector('#rooms-wrapper');
    roomsContainer.innerHTML = '';
};

const updateNumberOfUsersInRoom = ({ name, numberOfUsers }) => {
    const roomConnectedUsersElement = document.querySelector(`.connected-users[data-room-name='${name}']`);
    roomConnectedUsersElement.innerText = getNumberOfUsersString(numberOfUsers);
    roomConnectedUsersElement.dataset.roomNumberOfUsers = numberOfUsers;
};

const addRoomsPage = () => {
    const roomsPageElement = document.getElementById("rooms-page");
    if (roomsPageElement) {
        removeClass(roomsPageElement, 'display-none');
        addClass(roomsPageElement, 'full-screen');
    } else {
        console.error("Element with ID 'rooms-page' not found.");
    }


}


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

const removeGamePage = () => {
    const gamePage = document.getElementById("game-page");
    if (gamePage) {
        removeClass(gamePage, 'full-screen');
        addClass(gamePage, 'display-none');
    }
}


const startCountdown = ( randomText ) => {

    
    const readybtn = document.getElementById("ready-btn");
    const timer = document.getElementById("timer");

    removeClass(timer, 'display-none');
    addClass(readybtn, 'display-none');
    
    let time =  Number(SECONDS_TIMER_BEFORE_START_GAME);
    // Update the count down every 1 second
    const countdown = setInterval(() => {
        timer.innerText = time;
        time--;
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




const insertRandomText = (randomText) => {
    const randomTextElement = document.getElementById("text-container");
    removeClass(randomTextElement, 'display-none');
    randomTextElement.innerText = randomText;
}

const highlightText = (currentPosition) => {
    const randomTextElement = document.getElementById("text-container");
    const text = randomTextElement.innerText;
    let beforeText = text.substring(0, currentPosition);
    let currentPositionChar = text.charAt(currentPosition);
    const afterText = text.substring(currentPosition+1);

    //underline the first character of currentPositionChar

    currentPositionChar = `<span class="underline">${currentPositionChar}</span>`;


    beforeText = `<span class="highlight">${beforeText}</span>`;
    
    randomTextElement.innerHTML = beforeText + currentPositionChar + afterText;
}

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
