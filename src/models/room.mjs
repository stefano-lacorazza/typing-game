import {User } from './user.mjs'
class Room {
  constructor(id, numberOfPlayers = 1, state = 'open', username) {
      this.id = id;
      this.numberOfPlayers = numberOfPlayers;
      this.state = state;
      this.playerList = [new User(username)];
  }

  addPlayer() {
      this.numberOfPlayers += 1;
      if (this.numberOfPlayers >= 3) {
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

}
  


  export default Room;