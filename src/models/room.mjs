class Room {
  constructor(id, numberOfPlayers = 1, state = 'open') {
      this.id = id;
      this.numberOfPlayers = numberOfPlayers;
      this.state = state;
      this.playerList = [];
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
    this.playerList.push(user)
  }
  removeUserfromList(user){
    this.playerList = this.playerList.filter((player) => player !== user)
  }

}
  


  export default Room;