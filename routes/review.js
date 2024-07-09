const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review");
const Listing = require("../models/listing");
const {isLoggedIn, validateReview, isReviewAuthor } = require("../middleware.js");

// REVIEW ROUTE
router.post(
    "/", 
    isLoggedIn,
    validateReview, 
    wrapAsync(async (req, res) => {
        const listing = await Listing.findById(req.params.id);
        const newReview = new Review(req.body.review);
        newReview.author = req.user._id;
        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();
        req.flash("success", "new Review Created!");
        res.redirect(`/listings/${listing._id}`);
    })
);

// DELETE REVIEW ROUTE
router.delete(
    "/:reviewId",
    isLoggedIn, 
    isReviewAuthor,
    wrapAsync(async (req, res) => {
        const { id, reviewId } = req.params;
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Review Deleted!");
        res.redirect(`/listings/${id}`);
    })
);

module.exports = router;