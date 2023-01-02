import { Service, Inject, Container } from "typedi"
import AuthRepository from "./authRepository";
import crypto from "crypto";
import User from "../model/user";
import { getInitPassword } from "./initPw.js";

@Service()
class AuthService {
    #authRepository = new AuthRepository();

    async signUpByPhoneNum(phoneNum) {
        const salt = crypto.randomBytes(16).toString("hex");

        const initId = phoneNum.replaceAll('-', '');
        const initPassword = getInitPassword(initId);
        const hashedPassword = this.getHashedPassword(initPassword, salt);
    
        const newUser = new User(initId, hashedPassword, salt);

        return await this.#authRepository.save(newUser);

    }

    getHashedPassword(password, salt) {     
        return crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString("hex");
    }


    //TODO: username 빼기
    isAdmin(user) {
        const ADMIN_ID = 'admin';
        return user.username === ADMIN_ID || user.username === 'test';
    }

    async changePassword(username, newPassword) {
        const salt = crypto.randomBytes(16).toString("hex");

        const id = await this.#authRepository.findIdByUsername(username);
        const hashedPassword = this.getHashedPassword(newPassword, salt);

        return await this.#authRepository.updatePasswordById(id, hashedPassword, salt)
    }

    async initPassword(username) {
        const salt = crypto.randomBytes(16).toString("hex");

        return await this.changePassword(username, getInitPassword(username));
    }

}

//Container.set(AuthService, new AuthService());

export default AuthService