import { appendRoomElement, emptyRoomElement } from './views/room.mjs'
import { showInputModal } from './views/modal.mjs'


const username = sessionStorage.getItem('username');
const rooms_page = document.getElementById('rooms-page');
const game_page = document.getElementById('game-page');
const rooms_wrapper = document.getElementById('rooms-wrapper');
const room_btn = document.getElementById('add-room-btn');


const socket = io('', { query: { username } });
if (!username) {
    window.location.replace('/signin');
}



const onClickAddRoom = () => {
    
    showInputModal({
        title: 'Enter room name',
        onSubmit: roomName => {
            //create a new room element

            //TODO: enter room

            socket.emit("CREATE_ROOM",  roomName );
        }
    });

}

const updateRooms = rooms => {
    emptyRoomElement();
    rooms.forEach(room => {
        appendRoomElement({ name: room.id, numberOfUsers: 1, onJoin: () => {} });
    });
};
socket.on('UPDATE_ROOMS', updateRooms);

room_btn.addEventListener('click', onClickAddRoom);


