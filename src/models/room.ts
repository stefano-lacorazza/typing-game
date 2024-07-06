

class Room  {
    id: string;
    numberOfPlayers: number;
    state: 'open' | 'closed';
  
    constructor(id: string, numberOfPlayers: number = 1, state: 'open' | 'closed' = 'open') {
      this.id = id;
      this.numberOfPlayers = numberOfPlayers;
      this.state = state;
    }
  }


  export default Room;