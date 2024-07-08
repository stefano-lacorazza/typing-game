import { appendRoomElement, updateNumberOfUsersInRoom, removeRoomElement, emptyRoomElement, removeRoomsPage, addGamePage, addRoomsPage, removeGamePage, startCountdown, highlightText,restartGamePage } from './views/room.mjs'
import { showInputModal, showResultsModal } from './views/modal.mjs'
import { appendUserElement, changeReadyStatus, setProgress, removeUserElement, emptyUserElement } from './views/user.mjs'
import { createElement, addClass, removeClass } from './helpers/dom-helper.mjs'

const username = sessionStorage.getItem('username');
const rooms_page = document.getElementById('rooms-page');
const game_page = document.getElementById('game-page');
const rooms_wrapper = document.getElementById('rooms-wrapper');
const room_btn = document.getElementById('add-room-btn');

let currentRoom = '';
let text = '';
let currentPosition = 0;

const socket = io('', { query: { username } });
if (!username) {
    window.location.replace('/signin');
}



const onClickAddRoom = () => {
    showInputModal({
        title: 'Enter room name',
        onSubmit: roomName => {
            currentRoom = roomName;
            onClickJoin(roomName);
            socket.emit("CREATE_ROOM",  roomName );
        }
    });
}

const changeRoomName = (roomName) => {
    const roomNameElement = document.getElementById('room-name');
    roomNameElement.textContent = roomName;
    addReadyButtonOnClick();
}

const onClickJoin = (roomid) => {
    currentRoom = roomid;
    addBackToRoomsOnClick();
    removeRoomsPage();
    addGamePage();
    changeRoomName(roomid);
    socket.emit('JOIN_ROOM', roomid);
}

const addBackToRoomsOnClick = () => {
    const backToRoomsButton = document.getElementById('quit-room-btn');
    backToRoomsButton.addEventListener('click', () => {
        socket.emit('LEAVE_ROOM', currentRoom);
        currentRoom = '';
        removeGamePage();
        addRoomsPage();
    });

}

const updateRooms = rooms => {
    emptyRoomElement();
    rooms.forEach(room => {
        if (room.state == 'open')
            appendRoomElement({ 
                name: room.id, 
                numberOfUsers: room.numberOfPlayers, 
                onJoin: () => onClickJoin(room.id) // Pass room.id to onClickJoin
            });
        console.log(room);
    });
};

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

const addReadyButtonOnClick = () => {
    const readyButton = document.getElementById('ready-btn');
    readyButton.addEventListener('click', () => {
        socket.emit('TOGGLE_READY', username, currentRoom);
    });
};

const startGame = (randomText) => {
    text = randomText;
    activateKeyStrokes();
    addTimeRemaining();

};

const activateKeyStrokes = () => {
    document.addEventListener('keydown', (event) => {
        console.log('event');
        let total = text.length;
        if (event.key === text[currentPosition]) { // Check if the pressed key matches the current character
            currentPosition++; // Move to the next character

            let percentage = Math.floor((currentPosition / total) * 100);
            highlightText(currentPosition);


            socket.emit('UPDATE_PROGRESS', percentage, username, currentRoom);

            if (percentage == 100) {
                //end keydown event
                socket.emit('FINISHED', username, currentRoom);

            } 
        }
    });
};

const updateProgressAll = (users) => {
    users.forEach(user => {
        setProgress({ username: user.username, progress: user.progress });
    });
    


};

const endGame = (winnerList) => {
    document.removeEventListener('keydown', activateKeyStrokes);
    currentPosition = 0;
    text = '';

    if (!winnerList) {
        winnerList = ['No winner']
    }
    //show modal window
    showResultsModal({ usersSortedArray : winnerList, onClose : () => {
        socket.emit('END_GAME', currentRoom); //TODO: unready everyone and restart progress
        restartGamePage();

    } })

    




};





const addTimeRemaining = () => {
    let time = 120;
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

const leaveRoom = () => {
    socket.emit('LEAVE_ROOM', currentRoom);
    currentRoom = '';
    let text = '';
    let currentPosition = 0;
    removeGamePage();
    addRoomsPage();
}







socket.on('UPDATE_PLAYERS', addUserElements);
socket.on('UPDATE_ROOMS', updateRooms);
socket.on('START_GAME', (randomText) => {

    //TODO: REFACTOR TO RECIEVE TEXT ID FROM SERVER AND GET TEXT FROM SERVER
    startCountdown(randomText);
    setTimeout(() => startGame(randomText), 6000); 
});
socket.on("UPDATE_PROGRESS_RESPONSE", updateProgressAll);
socket.on('GAME_OVER', endGame);


room_btn.addEventListener('click', onClickAddRoom);


