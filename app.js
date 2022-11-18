//require modules
const express = require("express");
const morgan = require("morgan");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const mainRoutes = require("./routes/mainRoutes");
const userRoutes = require("./routes/userRoutes");
const choreRoutes = require("./routes/choreRoutes");
const groupRoutes = require("./routes/groupRoutes");
const friendRoutes = require("./routes/friendRoutes");

//create apps
const app = express();

//configure app
let port = process.env.PORT || 8080;
let host = process.env.HOST || "localhost";
app.set("view engine", "ejs");

const mongoDbUri =
  process.env.MONGO_URI || "mongodb://localhost:27017/Roaring20s";
//connect to database
mongoose
  .connect(mongoDbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(port, host, () => {
      console.log("Server is running on port", host, port);
    });
  })
  .catch((err) => console.log(err.message));

//mount middleware
app.use(
  session({
    secret: "ajfeirf90aeu9eroejfoefj",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongoUrl: mongoDbUri }),
    cookie: { maxAge: 60 * 60 * 1000 },
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.name = req.session.name || null;
  res.locals.errorMessages = req.flash("error");
  res.locals.successMessages = req.flash("success");
  next();
});
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(methodOverride("_method"));

//set up routes
app.use("/users", userRoutes);
app.use("/chores", choreRoutes);
app.use("/groups", groupRoutes);
app.use("/friends", friendRoutes);
app.use("/", mainRoutes);

app.use((req, res, next) => {
  let err = new Error("The server cannot locate " + req.url);
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  if (!err.status) {
    err.status = 500;
    err.message = "Internal Server Error";
  }

  res.status(err.status);
  res.render("error", { error: err });
});
