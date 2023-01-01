import 'reflect-metadata'; // We need this in order to use @Decorators

import express from "express";
import passport from "passport";
import bodyParser from "body-parser";
import session from "express-session";
import MySQLStore from "express-mysql-session";
import compression from "compression";
import classRouter from "./classes/class.js";
import adminRouter from "./classes/classList.js";
import {router as authRouter} from "./auth/authController.js";
import settingsRouter from "./settings/profile.js";
import favicon from "serve-favicon";
import path from "path";
import config from "./config.json";
import { getCommontTestExcel } from "./db/out/export";



const app = express();

//gzip/deflate outgoing responses
app.use(compression());

//setup bodyparser 
app.use(bodyParser.json());
app.use(express.urlencoded({extended : false}));

// setup session 
const options = {
  host: config.local_db.host,
  port: config.local_db.port,
  user: config.local_db.user,
  password: config.local_db.password,
  database: config.local_db.database,
};

// const options = {
//   host     : config.remote_db.host,
//   port: config.remote_db.port,
//   user     : config.remote_db.user,
//   password : config.remote_db.password,
//   database : config.remote_db.database,
// };

const sessionStore = new MySQLStore(options);

app.use(
  session({
      secret: "user key",
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
  })
);

//setup passport
app.use(passport.initialize());
app.use(passport.session());

//set up view engine and file dir
// app.engine('html', engines.mustache);
// app.set("view engine", "html);
app.set("view engine", "pug");
app.set("views", __dirname + "/client/views/pug");

//set favicon
app.use(favicon(path.join(__dirname, 'client', '/views/img/favicon.ico')));

app.use("/public", express.static(__dirname + "/client"));
// app.use(express.static(__dirname + "/public/views"));

app.get("/", (req, res) => {
  res.render("home", {authentication : req.isAuthenticated(), user: req.user});
});

app.use("/health", function(req, res) {
  res.send({'title': 'success'});
});

app.use("/test", async function(req, res) {
  throw new Error('Async 사용자 정의 에러 발생');
  res.send({'title': 'success'});
});

app.use("/test2", function(req, res) {
  throw new Error('Async 사용자 정의 에러 발생');
  res.send({'title': 'success'});
});

//set routers
app.use("/", authRouter);
app.use("/class", classRouter);
app.use("/classList", adminRouter);
app.use("/settings", settingsRouter);

export default app;
// getCommontTestExcel(2);


// app.use(passport.authenticate('session'));
// const api = functions.https.onRequest(app);
// module.exports(api);
