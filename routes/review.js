const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review");
const Listing = require("../models/listing");

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// REVIEW ROUTE
router.post("/", validateReview, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        throw new ExpressError(404, "Listing Not Found");
    }
    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "new Review Created!");
    res.redirect(`/listings/${listing._id}`);
}));

// DELETE REVIEW ROUTE
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;