import { Server } from 'socket.io';

import * as config from './config.js';


const rooms = [];


const getCurrentRoomId = socket => rooms.find(roomId => socket.rooms.has(roomId));


export default (io: Server) => {
    io.on('connection', socket => {
        const username = socket.handshake.query.username;


        socket.emit("UPDATE_ROOMS", rooms);

        socket.on("CREATE_ROOM", roomName => {
            const roomId = `${roomName}-${Date.now()}`;
            rooms.push(roomId);
            socket.join(roomId);
            io.emit("UPDATE_ROOMS", rooms);
        }





    });
};
