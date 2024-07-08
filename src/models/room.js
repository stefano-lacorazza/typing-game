import {User } from './user.mjs'
import * as config from '../socket/config.js'


/**
 * Represents a game room with players and game state management.
 * 
 * The Room class encapsulates the properties and behaviors of a game room, including its ID, number of players, state,
 * list of players, and list of winners. It provides methods to manage players and the room's state.
 * 
 * Methods:
 * - `addPlayer()`: Increments the number of players in the room. If the number of players reaches the maximum allowed,
 *   the room's state is set to 'closed'.
 * 
 * - `OneLessPlayer()`: Decrements the number of players in the room.
 * 
 * - `isOpen()`: Returns a boolean indicating whether the room is open for new players.
 * 
 * - `open()`: Sets the room's state to 'open', allowing new players to join.
 * 
 * - `close()`: Sets the room's state to 'closed', preventing new players from joining.
 * 
 * - `appendUsertoList(user)`: Adds a new user to the room's player list.
 * 
 * - `removeUserFromList(user)`: Removes a user from the room's player list based on the username.
 * 
 * - `isUserInRoom(user)`: Checks if a user is in the room's player list.
 * 
 * - `allUsersReady()`: Checks if all users in the room are ready.
 * 
 * - `addWinner(winner)`: Adds a winner to the room's winner list if not already present.
 * 
 * - `removeWinner(winner)`: Removes a winner from the room's winner list based on the winner's ID.
 * 
 * - `emptyWinnerList()`: Clears the room's winner list.
 */
class Room {
  constructor(id, numberOfPlayers = 1, state = 'open', username) {
      this.id = id;
      this.numberOfPlayers = numberOfPlayers;
      this.state = state;
      this.playerList = [];
      this.winnerList = [];
  }

  addPlayer() {
      this.numberOfPlayers += 1;
      if (this.numberOfPlayers >= config.MAXIMUM_USERS_FOR_ONE_ROOM) {
          this.state = 'closed';
      }
  }

  OneLessPlayer() {
      this.numberOfPlayers -= 1;
  }

  isOpen() {
      return this.state === 'open';
  }

  open() {
      this.state = 'open';
  }

  close() {
      this.state = 'closed';
  }

  appendUsertoList (user){
    this.playerList.push(new User(user))
  }

  removeUserFromList(user){
    this.playerList = this.playerList.filter((player) => player.username !== user)
  }

  isUserInRoom(user) {
        return this.playerList.some(player => player.username === user);
    }

  allUsersReady() {
      return this.playerList.every(player => player.ready);
  }

  addWinner(winner) {
    if (!this.winnerList.includes(winner))
    {
        this.winnerList.push(winner);
    }
  }

  removeWinner(winner) {
      this.winnerList = this.winnerList.filter((player) => player.id !== winner);
  }

  emptyWinnerList() {
      this.winnerList = [];
  }
}
  


  export default Room;