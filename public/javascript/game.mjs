import { appendRoomElement, updateNumberOfUsersInRoom, removeRoomElement, emptyRoomElement, removeRoomsPage, addGamePage, addRoomsPage, removeGamePage, startCountdown } from './views/room.mjs'
import { showInputModal } from './views/modal.mjs'
import { appendUserElement, changeReadyStatus, setProgress, removeUserElement, emptyUserElement } from './views/user.mjs'


const username = sessionStorage.getItem('username');
const rooms_page = document.getElementById('rooms-page');
const game_page = document.getElementById('game-page');
const rooms_wrapper = document.getElementById('rooms-wrapper');
const room_btn = document.getElementById('add-room-btn');

let currentRoom = '';

const socket = io('', { query: { username } });
if (!username) {
    window.location.replace('/signin');
}



const onClickAddRoom = () => {
    
    showInputModal({
        title: 'Enter room name',
        onSubmit: roomName => {
            //create a new room element
            currentRoom = roomName;
            onClickJoin(roomName);
            //TODO: enter room

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

socket.on('UPDATE_PLAYERS', addUserElements);
socket.on('UPDATE_ROOMS', updateRooms);
socket.on('START_GAME', startCountdown);



room_btn.addEventListener('click', onClickAddRoom);


