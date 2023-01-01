import { Service, Inject, Container } from "typedi"
import AuthRepository from "./authRepository";
import crypto from "crypto";
import User from "../model/user";

@Service()
class AuthService {
    #authRepository = new AuthRepository();

    async logIn(username, password) {
        const user = await this.#authRepository.findOneByUsername(username);

        if (this.isExistUser(user)) {
            crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
                if (err) {
                    return cb(err);
                }
                
                //비밀번호가 다를 경우
                if(!(user.hashedPassword.toString() == hashedPassword.toString())) {
                    return cb(null, false, { message : "Incorrect password" });
                }

                return cb(null, user);
            })
        } else {
            //user가 없을 경우
            return cb(null, false, { message : "Incorrect username" });
        }
    }

    isExistUser(user) {
        return user && user.length > 0;
    }

    signUpByPhoneNum(phoneNum) {
        const salt = crypto.randomBytes(16);

        const initId = studentPhoneNum.replaceAll('-', '');
        const initPassword = getInitPassword(studentPhoneNum);
        const hashedPassword = getHashedPassword(initPassword, salt);
    
        const newUser = new User(initId, hashedPassword, salt);

        this.#authRepository.save(newUser);

    }

    getHashedPassword(password, salt) {
        let ret;

        crypto.pbkdf2(password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
            if (err) { 
              return next(err); 
            }
            ret = hashedPassword;
        });

        return ret;
    }


    //TODO: username 빼기
    isAdmin(user) {
        const ADMIN_ID = 'admin';
        return user.username === ADMIN_ID || user.username === 'test';
    }

    async changePassword(username, newPassword) {
        const salt = crypto.randomBytes(16);

        const id = await this.#authRepository.findIdByUsername(username);
        const hashedPassword = this.getHashedPassword(newPassword, salt);

        await this.#authRepository.updatePasswordById(id, hashedPassword, salt)
    }

}

//Container.set(AuthService, new AuthService());

export default AuthService