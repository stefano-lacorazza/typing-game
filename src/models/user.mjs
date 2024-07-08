/**
 * Represents a user in the game with a username, readiness, and progress state.
 * 
 * The User class encapsulates the properties and behaviors of a game user, including their username, readiness for the game,
 * and their progress in the game. It provides methods to manage the user's readiness and progress.
 * 
 * Constructor:
 * - Initializes a new instance of the User class with a specified username. The user's readiness is set to false by default,
 *   and their progress is initialized to 0.
 * 
 * Methods:
 * - `toggleReady()`: Toggles the user's readiness state. If the user is not ready, they are set to ready, and vice versa.
 * 
 * - `updateProgress(progress)`: Updates the user's progress in the game. The progress is a numerical value representing how
 *   far the user has advanced in the game.
 * 
 * - `resetProgress()`: Resets the user's progress to 0. This is typically used at the start of a new game or when the user
 *   needs to restart their progress.
 */

class User {
    constructor(username) {
        this.username = username;
        this.ready = false;
        this.progress = 0;
    }

    toggleReady() {
        this.ready = !this.ready;
    }
    updateProgress(progress) {
        this.progress = progress;
    }
    resetProgress() {
        this.progress = 0;
    }
}

export { User }