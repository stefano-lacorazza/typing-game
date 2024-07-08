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