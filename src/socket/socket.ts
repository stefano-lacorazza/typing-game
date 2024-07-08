import { Server, Socket } from 'socket.io';
import Room from '../models/room.mjs';
import * as config from './config.js';
import { texts } from '../data.js';

const rooms: Room[] = [];

// Assuming Room has an id of type string
const getCurrentRoomId = (socket: Socket): string | undefined => 
  rooms.find(room => socket.rooms.has(room.id))?.id;


export default (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const username = socket.handshake.query.username as string;

    socket.emit("UPDATE_ROOMS", rooms);

    socket.on("CREATE_ROOM", (roomName: string) => {

      //check if room already exists
      const room2 = rooms.find(room => room.id === roomName);
      if (room2)
      {
        socket.emit('ROOM_NOT_CREATED');
      }
      else {
        const room = new Room(roomName,0, 'open', username);
        rooms.push(room);
        socket.join(room.id);
        socket.emit('ROOM_CREATED', room.id);
        io.to(room.id).emit("UPDATE_PLAYERS", room.playerList);
        io.emit("UPDATE_ROOMS", rooms);
      }



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
            io.to(room.id).emit("UPDATE_PROGRESS_RESPONSE", room.playerList);
            if (room.numberOfPlayers === 0) {
                rooms.splice(rooms.indexOf(room), 1);
            }
            room.removeWinner(username);
            io.emit("UPDATE_ROOMS", rooms);
            if (room.allUsersReady() && room.numberOfPlayers > 1 ) {
              io.to(room.id).emit("START_GAME", randomText());
             }
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
            room.close();
            io.to(room.id).emit("START_GAME", randomText());
           }
        }

      });

    socket.on('UPDATE_PROGRESS', (percentage: number, username: string, roomId: string) => {

      const room = rooms.find(room => room.id === roomId);
      if (room) {

        const player = room.playerList.find(player => player.username === username);

        if (player) {
          player.updateProgress(percentage);
          io.to(room.id).emit("UPDATE_PROGRESS_RESPONSE", room.playerList);
        }
      }
    });

    socket.on('END_GAME', (roomId: string) => {
        console.log("end game received");
        const room = rooms.find(room => room.id === roomId);
        if (room) {
            console.log("found room");
            room.playerList.forEach(player => {
                player.resetProgress();
                player.toggleReady();
                room.emptyWinnerList();
            });
            if (room.numberOfPlayers < config.MAXIMUM_USERS_FOR_ONE_ROOM) {
                room.open();
            }
            io.to(room.id).emit("UPDATE_PLAYERS", room.playerList);
            io.to(room.id).emit("UPDATE_PROGRESS_RESPONSE", room.playerList);
        }
        
    });

    socket.on('FINISHED', (username: string, roomId: string) => {
        const room = rooms.find(room => room.id === roomId);
        if (room) {
            room.addWinner(username);
            if (room.winnerList.length === room.numberOfPlayers) {
              console.log(room.winnerList)
                io.to(room.id).emit("GAME_OVER", room.winnerList);
            }

        }

    });



})};


const randomText = () => {
  return texts[Math.floor(Math.random() * texts.length)];
}
