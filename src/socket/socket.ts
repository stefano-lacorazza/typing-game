import { Server, Socket } from 'socket.io';
import Room from '../models/room.mjs';
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
      const room = new Room(roomName,1, 'open', username);
      rooms.push(room);
      socket.join(room.id);
      io.to(room.id).emit("UPDATE_PLAYERS", room.playerList);
      io.emit("UPDATE_ROOMS", rooms);

    }); 

    socket.on("JOIN_ROOM", (roomId: string) => {
      const room = rooms.find(room => room.id === roomId);

      if (room ) {
            room.appendUsertoList(username);
            room.addPlayer();
            io.emit("UPDATE_ROOMS", rooms);
            socket.join(room.id);
            io.to(room.id).emit("UPDATE_PLAYERS", room.playerList);

        }
    });

    socket.on("LEAVE_ROOM", (roomId: string) => {
        const room = rooms.find(room => room.id === roomId);
        if (room) {
            room.removeUserFromList(username);
            room.OneLessPlayer();
            socket.leave(room.id);
            io.to(room.id).emit("UPDATE_PLAYERS", room.playerList);
            if (room.numberOfPlayers === 0) {
                rooms.splice(rooms.indexOf(room), 1);
            }
            io.emit("UPDATE_ROOMS", rooms);
        }
      });




    socket.on('TOGGLE_READY', (username: string, roomId : string) => {
        const room = rooms.find(room => room.id === roomId);
        if (room) {
          const player = room.playerList.find(player => player.username === username);
          if (player)
          {
            player.toggleReady();
            io.to(room.id).emit("UPDATE_PLAYERS", room.playerList);
          }
           if (room.allUsersReady() && room.numberOfPlayers > 1 ) {
            io.to(room.id).emit("START_GAME");
           }
        }

      });
})};
