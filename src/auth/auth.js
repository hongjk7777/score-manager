import express from "express";
import passport from "passport";
import LocalStrategy from "passport-local";
import crypto from "crypto";
import db from "../db/dbConfig";

console.log("auth");
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
passport.use(new LocalStrategy(function verify(username, password, cb) {
  db.query("USE classdb");
  db.query('SELECT * FROM accounts WHERE username = ?', [ username ], function(err, row) {
    if (err) { return cb(err); }
    if (row.length === 0) { return cb(null, false, { message: 'Incorrect username or password.' }); }
    // console.log(row);
    // console.log(password);
    crypto.pbkdf2(password, row[0].salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) { return cb(err); }
      if (!(row[0].hashed_password.toString() == hashedPassword.toString())) {
        return cb(null, false, { message: 'Incorrect username or password.' });
      }
      return cb(null, row[0]);
    });
  });
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
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
  // console.log(user);
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
  // console.log(user);
});


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
      if(isAdmin(req.user)) {
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
    if (err) { return next(err); }
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
  db.query("USE classdb");
  var salt = crypto.randomBytes(16);
  console.log(req.user);
  db.query('SELECT id FROM accounts WHERE username = ?', [ req.user.username ], function(err, row) {
    if (err) { console.log(err); return next(); }
    if (row.length === 0) { return next(); }
    const id = row[0].id;
    crypto.pbkdf2(req.body.newPassword, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) { return next(err); }
  
     
      db.query(`UPDATE accounts SET hashed_password = ?, salt = ? WHERE id = ?`, [hashedPassword, salt, id], function(err) {
        if (err) { return next(err); }
        var user = {
          id: this.lastID,
          username: req.body.username
        };
        req.logout(function(err) {
          if (err) { return next(err); }
          res.redirect('/');
        });
      });
    });
  });
  
});

function isAdmin(user) {
  const ADMIN_ID = 'admin';
  return user.username === ADMIN_ID || user.username === 'test';
}

const isAuthenticated = function (req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
};

function isAdminAuthenticated(req, res, next) {
  const ADMIN_ID = 'admin';
  if(req.isAuthenticated() && (req.user.username === ADMIN_ID || req.user.username === 'test')) {
    return next();
  } else {
    res.redirect("/login");
  }
}

function signUpByStudentPhoneNum(studentPhoneNum) {
    var salt = crypto.randomBytes(16);
    const initId = studentPhoneNum.replaceAll('-', '');
    const initPassword = studentPhoneNum += '5';
    crypto.pbkdf2(initPassword, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      console.log(initId, hashedPassword, salt);
      if (err) { 
        return next(err); }
      // console.log(hashedPassword);
      db.query("USE classdb");
      db.query('INSERT INTO accounts (username, hashed_password, salt) VALUES (?, ?, ?)', [
        initId,
        hashedPassword,
        salt
      ]);
      
      //위 함수가 에러가 나면 어카지?
    });
}



// signUpByStudentPhoneNum('01024730603');

export { isAuthenticated, isAdminAuthenticated, signUpByStudentPhoneNum, isAdmin }
export { router }
