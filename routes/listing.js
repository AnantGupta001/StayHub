const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing");
const {isLoggedIn, isOwner, validateListing } = require("../middleware.js");

// INDEX ROUTE - Shows all listings
router.get(
    "/", 
    wrapAsync(async (req, res) => {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    })
);

// CREATE ROUTE - creates new listing
router.get(
    "/new", 
    isLoggedIn, 
    (req, res) => {
        res.render("listings/new.ejs");
    }
);

router.post(
    "/", 
    isLoggedIn,
    validateListing, 
    wrapAsync(async (req, res, next) => {
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success", "new Listing Created!");
        res.redirect("/listings");
    })
);

// SHOW ROUTE - shows particular listing
router.get(
    "/:id", 
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id)
        .populate({path : "reviews", 
            populate : {
                path : "author"
            },
        })
        .populate("owner");
        if(!listing){
            req.flash("error", "Listing you requested for does not exist!");
            res.redirect("/listings");
        }
        res.render("listings/show.ejs", { listing });
    })
);

// EDIT ROUTE - edit particular listing
router.get(
    "/:id/edit", 
    isLoggedIn,  
    isOwner,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            throw new ExpressError(404, "Listing Not Found");
        }
        res.render("listings/edit.ejs", { listing });
    })
);

// UPDATE ROUTE - update particular listing
router.put(
    "/:id", 
    isLoggedIn,
    isOwner,
    validateListing, 
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    })
);

// DELETE ROUTE - delete particular listing
router.delete(
    "/:id", 
    isLoggedIn,
    isOwner,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findByIdAndDelete(id);
        req.flash("success", "Listing Deleted!");
        res.redirect("/listings");
    })
);

module.exports = router;