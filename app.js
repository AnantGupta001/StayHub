const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/StayHub';

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

const sessionOptions = {
    secret : "Mysupersecret",
    resave : false,
    saveUninitialized : true,
    cookie: {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.engine("ejs", ejsMate);

main()
    .then(() => console.log("connected to DB"))
    .catch(err => console.error(err));

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
    res.send("Hi,. I'm root route");;
});

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "PAGE NOT FOUND"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "SOMETHING WENT WRONG" } = err;
    res.status(statusCode).render("error", { err });
});

app.listen(8080, () => {
    console.log("Server is listening...");
});
