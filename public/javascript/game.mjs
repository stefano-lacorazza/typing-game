import { appendRoomElement } from './views/room.mjs'
import { showInputModal } from './views/modal.mjs'


const username = sessionStorage.getItem('username');
const rooms_page = document.getElementById('rooms-page');
const game_page = document.getElementById('game-page');
const rooms_wrapper = document.getElementById('rooms-wrapper');
const room_btn = document.getElementById('add-room-btn');

if (!username) {
    window.location.replace('/signin');
}

const onClickAddRoom = () => {
    //create a modalwindow asking for the name of the room
    showInputModal({
        title: 'Enter room name',
        onSubmit: roomName => {
            //create a new room element
            appendRoomElement({ name: roomName });
            socket.emit("CREATE_ROOM", { roomName });
        }
    });

}

room_btn.addEventListener('click', onClickAddRoom);

const socket = io('', { query: { username } });
