import express from "express";
import AuthService from "./authService";
import passport from "./passportConfig";
import Container from "typedi";

console.log("auth");

const authService = new AuthService();

var router = express.Router();

/* GET /login
 *
 * This route prompts the user to log in.
 *
 * The 'login' view renders an HTML form, into which the user enters their
 * username and password.  When the user submits the form, a request will be
 * sent to the `POST /login/password` route.
 */
router.get('/login', function(req, res, next) {
    res.render('signform/login');
});

/* POST /login/password
 *
 * This route authenticates the user by verifying a username and password.
 *
 * A username and password are submitted to this route via an HTML form, which
 * was rendered by the `GET /login` route.  The username and password is
 * authenticated using the `local` strategy.  The strategy will parse the
 * username and password from the request and call the `verify` function.
 *
 * Upon successful authentication, a login session will be established.  As the
 * user interacts with the app, by clicking links and submitting forms, the
 * subsequent requests will be authenticated by verifying the session.
 *
 * When authentication fails, the user will be re-prompted to login and shown
 * a message informing them of what went wrong.
 */
router.post('/login/password', passport.authenticate('local', {
    failureMessage: true,
    failWithError: true
}), function(req, res, next) {
    res.format({
        'text/html': function() {
            if(authService.isAdmin(req.user)) {
                res.redirect('/classList');
            } else{
                res.redirect('/class');
            }
        },
        'application/json': function() {
            res.json({ ok: true, location: '/' });
        }
    });
}, function(err, req, res, next) {
  // console.log(err);
    if (err.status !== 401) { return next(err); }
    res.format({
        'text/html': function() {
            res.redirect('/login');
        },
        'application/json': function() {
            res.json({ ok: false, location: '/login' });
        }
    });
});

/* POST /logout
 *
 * This route logs the user out.
 */
router.post('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { 
            return next(err); 
        }
        res.redirect('/');
    });

});

/* GET /signup
 *
 * This route prompts the user to sign up.
 *
 * The 'signup' view renders an HTML form, into which the user enters their
 * desired username and password.  When the user submits the form, a request
 * will be sent to the `POST /signup` route.
 */
// router.get('/signup', function(req, res, next) {
//   res.render('signform/signup');
// });

/* POST /signup
 *
 * This route creates a new user account.
 *
 * A desired username and password are submitted to this route via an HTML form,
 * which was rendered by the `GET /signup` route.  The password is hashed and
 * then a new user record is inserted into the database.  If the record is
 * successfully created, the user is logged in.
 */
// router.post('/signup', function(req, res, next) {
//   var salt = crypto.randomBytes(16);
//   // console.log(req.body.password);
//   db.query("USE classdb");
//   crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
//     if (err) { return next(err); }
//     db.query('INSERT INTO accounts (username, hashed_password, salt) VALUES (?, ?, ?)', [
//       req.body.username,
//       hashedPassword,
//       salt
//     ], function(err) {
//       if (err) { return next(err); }
//       var user = {
//         id: this.lastID,
//         username: req.body.username
//       };
//       req.login(user, function(err) {
//         if (err) { return next(err); }
//         res.redirect('/');
//       });
//     });
//   });
// });

router.post("/change-password", function(req, res, next) {
    const username = req.user.username;
    const newPassword = req.body.newPassword;

    authService.changePassword(username, newPassword);
    
    req.logout(function(err) {
        if (err) { 
            return next(err); 
        }
        res.redirect('/');
    });
});



// signUpByStudentPhoneNum('01024730603');

export { router }
