import passport from "passport";
import LocalStrategy from "passport-local";
import crypto from "crypto";
import db from "../domain/repository/dbConfig";
import AuthRepository from "./authRepository";
import AuthService from "./authService";
import AuthDTO from "../domain/dto/authDTO";
import StudentRepository from "../domain/repository/studentRepository";

/* Configure password authentication strategy.
 *
 * The `LocalStrategy` authenticates users by verifying a username and password.
 * The strategy parses the username and password from the request and calls the
 * `verify` function.
 *a
 * The `verify` function queries the database for the user record and verifies
 * the password by hashing the password supplied by the user and comparing it to
 * the hashed password stored in the database.  If the comparison succeeds, the
 * user is authenticated; otherwise, not.
 */

const authRepository = new AuthRepository();
const studentRepository = new StudentRepository();

passport.use(new LocalStrategy(async function verify(username, password, cb) {
    const user = await authRepository.findOneByUsername(username);
    const student = await studentRepository.findOneByPhoneNum(username);

    if (user === null) {
        return cb(null, false, { message: '해당하는 유저가 없습니다.' });
    }

    if(checkPassword(user, password)) {
        //일반인일 경우
        if(student) {
            return cb(null, new AuthDTO(user.getUsername(), student.name));
        }

        //관리자일 경우
        return cb(null, new AuthDTO(user.getUsername()));
    }

    return cb(null, false, { message: '비밀번호가 틀렸습니다' });

    // checkPassword(user, password, cb);

}));


/* Configure session management.
 *
 * When a login session is established, information about the user will be
 * stored in the session.  This information is supplied by the `serializeUser`
 * function, which is yielding the user ID and username.
 *
 * As the user interacts with the app, subsequent requests will be authenticated
 * by verifying the session.  The same user information that was serialized at
 * session establishment will be restored when the session is authenticated by
 * the `deserializeUser` function.
 *
 * Since every request to the app needs the user ID and username, in order to
 * fetch todo records and render the user element in the navigation bar, that
 * information is stored in the session.
 */
passport.serializeUser(function(authDto, cb) {
    process.nextTick(function() {
        cb(null, { username: authDto.username, studentName: authDto.studentName });
    });
    // console.log(user);
});
  
passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
    // console.log(user);
});

//TODO: crypto.pbkdf2 async await 하기
function checkPassword(user, password) {
    const hexPassword = crypto.pbkdf2Sync( password, user.getSalt(), 310000, 32, 'sha256').toString("hex");
    //이전 버전에서는 'hex'로 저장하지 않아서 예전 버전 비밀번호 호환용이다
    const inputPassword = crypto.pbkdf2Sync( password, user.getSalt(), 310000, 32, 'sha256').toString();

    return (user.getHashedPassword().toString() === hexPassword) || (user.getHashedPassword().toString() === inputPassword);
}

export default passport;