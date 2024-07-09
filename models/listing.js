const mongoose = require("mongoose");
const Review = require("./review");

const defaultImageUrl = "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
        set : (v) => v === '' ? defaultImageUrl : v,
    },
    price: {
        type: Number,
    },
    location: {
        type: String,
    },
    country: {
        type: String,
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    }
});

listingSchema.post("findOneAndDelete", async function(listing) {
    if (listing) {
        await Review.deleteMany({
            _id: { $in: listing.reviews }
        });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
