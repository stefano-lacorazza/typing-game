class User {
    constructor(username) {
        this.username = username;
        this.ready = false;
        this.keys = 0;
    }

    toggleReady() {
        this.ready = !this.ready;
    }
    addKey() {
        this.keys += 1;
    }
}

export { User }