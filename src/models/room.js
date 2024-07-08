import {User } from './user.mjs'
import * as config from '../socket/config.js'

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
      this.state = 'open';
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
    // add winner to list of not already in list
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