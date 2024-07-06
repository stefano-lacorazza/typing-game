import { Server, Socket } from 'socket.io';
import Room from '../models/room.js';
import * as config from './config.js';


const rooms: Room[] = [];

// Assuming Room has an id of type string
const getCurrentRoomId = (socket: Socket): string | undefined => 
  rooms.find(room => socket.rooms.has(room.id))?.id;

export default (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const username = socket.handshake.query.username as string;

    socket.emit("UPDATE_ROOMS", rooms);

    socket.on("CREATE_ROOM", (roomName: string) => {
      const room = new Room(roomName,1, 'open');
      rooms.push(room);
      socket.join(room.id);
      io.emit("UPDATE_ROOMS", rooms);
    }); 

    socket.on("JOIN_ROOM", (roomId: string) => {
        const room = rooms.find(room => room.id === roomId);
        if (room && room.numberOfPlayers < config.MAXIMUM_USERS_FOR_ONE_ROOM) {
            room.numberOfPlayers++;
            socket.join(room.id);
            io.emit("UPDATE_ROOMS", rooms);
        }
        });
  });
};