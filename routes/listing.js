const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema");
const Listing = require("../models/listing");

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// INDEX ROUTE - Shows all listings
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// CREATE ROUTE - creates new listing
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

router.post("/", validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "new Listing Created!");
    res.redirect("/listings");
}));

// SHOW ROUTE - shows particular listing
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));

// EDIT ROUTE - edit particular listing
router.get("/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing Not Found");
    }
    res.render("listings/edit.ejs", { listing });
}));

// UPDATE ROUTE - update particular listing
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, req.body.listing, { runValidators: true, new: true });
    if (!listing) {
        throw new ExpressError(404, "Listing Not Found");
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

// DELETE ROUTE - delete particular listing
router.delete("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    if (!listing) {
        throw new ExpressError(404, "Listing Not Found");
    }
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));


module.exports = router;