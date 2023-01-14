export default class User {
    #username;
    #hashedPassword;
    #salt;

    constructor(username, hashedPassword, salt) {
        this.#username = username;
        this.#hashedPassword = hashedPassword;
        this.#salt = salt;
    }

    getUsername () {
        return this.#username;
    }

    getHashedPassword () {
        return this.#hashedPassword;
    }

    getSalt () {
        return this.#salt;
    }
}