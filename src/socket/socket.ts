import { Server, Socket } from 'socket.io';
import Room from '../models/room.js';
import * as config from './config.js';
import { texts } from '../data.js';

const rooms: Room[] = [];
const connectedUsers: string[] = [];



/**
 * Sets up WebSocket event handlers for a game server.
 * 
 * This function initializes WebSocket event listeners for the game server, handling user connections, room management,
 * and game configuration. It performs the following actions:
 * 
 * - On a new connection, it checks if the connecting user's username already exists in the `connectedUsers` array.
 *   If the username exists, it emits a "USERNAME_ALREADY_EXISTS" event to the client. Otherwise, it adds the username
 *   to the `connectedUsers` array.
 * 
 * - Sends initial game configuration to the connected client by emitting an "INITIAL_CONFIG" event with configuration
 *   details such as maximum users per room, timer before the start of the game, and game duration.
 * 
 * - Emits an "UPDATE_ROOMS" event to the connected client with the current list of rooms.
 * 
 * - Listens for a "CREATE_ROOM" event from the client, which includes a room name. If a room with the provided name
 *   already exists, it emits a "ROOM_NOT_CREATED" event to the client. Otherwise, it creates a new room, adds it to
 *   the list of rooms, joins the creating user to the room, and emits a "ROOM_CREATED" event to the client. It also
 *   updates all clients with the new list of rooms and the players in the newly created room.
 * 
 * - `JOIN_ROOM`: Handles a player's request to join a specific room. It searches for the room by ID, adds the player to the room's
 *   player list, increments the player count, and emits updates to all clients about the current rooms and to the room's clients
 *   about the updated player list.
 * 
 * - `LEAVE_ROOM`: Manages a player's departure from a room. It removes the player from the room's list, decrements the player count,
 *   and if the room becomes empty, removes the room from the list of available rooms. It also checks if all remaining players are ready
 *   and starts the game if conditions are met.
 * 
 * - `TOGGLE_READY`: Allows a player to toggle their readiness state. If all players in the room are ready and the player count is more
 *   than one, the room is closed for new joiners, and the game starts.
 * 
 * - `UPDATE_PROGRESS`: Updates a player's progress in the game. It finds the player in the room and updates their progress percentage.
 *   Then, it emits an update to all clients in the room about the current progress of all players.
 * 
  * - `END_GAME`: Triggered when a game in a specific room ends. It resets all players' progress and readiness state in the room,
 *   empties the winner list, and if the room has fewer players than the maximum allowed, it reopens the room for new players.
 *   Then, it emits an update to all clients in the room with the updated player list and their progress.
 * 
 * - `FINISHED`: Occurs when a player finishes the game. It adds the player to the room's winner list. If all players in the room
 *   have finished, it emits a "GAME_OVER" event to all clients in the room with the list of winners.
 * 
 * - `disconnect`: Handles a player's disconnection. It removes the disconnected player from the connected users list, their room,
 *   and the winner list if applicable. It updates the room's player count and emits the updated player list and progress to the room.
 *   If the room becomes empty, it is removed from the list of available rooms. Additionally, if all remaining users are ready and
 *   the number of players is more than one, it starts a new game.
 * 
 * @param io - The Socket.IO Server instance.
 */
export default (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const username = socket.handshake.query.username as string;
    if (connectedUsers.includes(username)) {
      socket.emit("USERNAME_ALREADY_EXISTS");
    }
    else {
      connectedUsers.push(username);
    }
    socket.emit("INITIAL_CONFIG", { MAXIMUM_USERS_FOR_ONE_ROOM: config.MAXIMUM_USERS_FOR_ONE_ROOM, SECONDS_TIMER_BEFORE_START_GAME: config.SECONDS_TIMER_BEFORE_START_GAME, SECONDS_FOR_GAME: config.SECONDS_FOR_GAME});
    socket.emit("UPDATE_ROOMS", rooms);
    socket.on("CREATE_ROOM", (roomName: string) => {
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
            room.removeWinner(username);
            room.OneLessPlayer();
            socket.leave(room.id);
            io.to(room.id).emit("UPDATE_PLAYERS", room.playerList);
            io.to(room.id).emit("UPDATE_PROGRESS_RESPONSE", room.playerList);
            if (room.numberOfPlayers === 0) {
                rooms.splice(rooms.indexOf(room), 1);
            }
            
            io.emit("UPDATE_ROOMS", rooms);
            if (room.allUsersReady() && room.numberOfPlayers > 1 && room.isOpen()) {
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
        const room = rooms.find(room => room.id === roomId);
        if (room) {
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
                io.to(room.id).emit("GAME_OVER", room.winnerList);
            }
        }
    });

    socket.on('disconnect', () => {
      connectedUsers.splice(connectedUsers.indexOf(username), 1);
      const room = rooms.find(room => room.isUserInRoom(username));
  
        if (room) {
          room.removeUserFromList(username);
          room.removeWinner(username);
          room.OneLessPlayer();
          socket.leave(room.id);
          io.to(room.id).emit("UPDATE_PLAYERS", room.playerList);
          io.to(room.id).emit("UPDATE_PROGRESS_RESPONSE", room.playerList);
          if (room.numberOfPlayers === 0) {
              rooms.splice(rooms.indexOf(room), 1);
          }
          
          io.emit("UPDATE_ROOMS", rooms);
          if (room.allUsersReady() && room.numberOfPlayers > 1 && room.isOpen()) {
            io.to(room.id).emit("START_GAME", randomText());
           }
        }
      
  });

})};


const randomText = () => {
  return texts[Math.floor(Math.random() * texts.length)];
}


