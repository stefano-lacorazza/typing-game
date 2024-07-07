import { createElement, addClass, removeClass } from '../helpers/dom-helper.mjs';




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

const getNumberOfUsersString = numberOfUsers => `${numberOfUsers} connected`;

const removeRoomElement = name => document.querySelector(`.room[data-room-name='${name}']`)?.remove();

export { appendRoomElement, updateNumberOfUsersInRoom, removeRoomElement, emptyRoomElement, removeRoomsPage, addGamePage, removeGamePage, addRoomsPage};
