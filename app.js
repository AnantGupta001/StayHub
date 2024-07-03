const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const MONGO_URL = 'mongodb://127.0.0.1:27017/StayHub';
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

app.engine("ejs", ejsMate);

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.error(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
    res.redirect("/listings");
});

// INDEX ROUTE
app.get(
    "/listings",
    wrapAsync(async (req, res) => {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    })
);

// CREATE ROUTE
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

app.post(
    "/listings",
    wrapAsync(async (req, res) => {
        if(!req.body.listing){
            throw new ExpressError(400, "Send valid data to add listing");
        }
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    })
);

// SHOW ROUTE
app.get(
    "/listings/:id",
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            throw new ExpressError(404, "Listing Not Found");
        }
        res.render("listings/show.ejs", { listing });
    })
);

// EDIT ROUTE
app.get(
    "/listings/:id/edit",
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            throw new ExpressError(404, "Listing Not Found");
        }
        res.render("listings/edit.ejs", { listing });
    })
);

// UPDATE ROUTE
app.put(
    "/listings/:id",
    wrapAsync(async (req, res) => {
        if(!req.body.listing){
            throw new ExpressError(400, "Send valid data to update listing");
        }
        let { id } = req.params;
        await Listing.findByIdAndUpdate(id, req.body.listing, { runValidators: true, new: true });
        res.redirect(`/listings/${id}`);
    })
);

// DELETE ROUTE
app.delete(
    "/listings/:id",
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        await Listing.findByIdAndDelete(id);
        res.redirect("/listings");
    })
);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "PAGE NOT FOUND"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "SOMETHING WENT WRONG" } = err;
    res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("Server is listening...");
});
