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
}

export { User }