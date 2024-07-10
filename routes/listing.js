const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const {isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

router.get(
    "/", 
    wrapAsync(listingController.showAllListings)
);

router.get(
    "/new", 
    isLoggedIn, 
    listingController.newListingForm
);

router.post(
    "/", 
    isLoggedIn, 
    validateListing, 
    wrapAsync(listingController.createListing)
);

router.get(
    "/:id", 
    wrapAsync(listingController.showListingDetails)
);

router.get(
    "/:id/edit", 
    isLoggedIn, 
    isOwner, 
    wrapAsync(listingController.editListingForm)
);

router.put(
    "/:id", 
    isLoggedIn, 
    isOwner, 
    validateListing, 
    wrapAsync(listingController.updateListing)
);

router.delete(
    "/:id", 
    isLoggedIn, 
    isOwner, 
    wrapAsync(listingController.deleteListing)
);

module.exports = router;