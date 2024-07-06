interface Room {
    id: string;
    numberOfPlayers: number;
    state: 'open' | 'closed';
  }