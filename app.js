const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const MONGO_URL = 'mongodb://127.0.0.1:27017/StayHub';

main()
    .then((res) => {
        console.log("connected to DB")
    })
    .catch((err) => {
        console.log(err)
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
    res.send("Hoii, I'm root..");
});

app.get("/testListing", async (req, res) => {
    let sampleListing = new Listing(
        {
            title : "Home",
            description : "Near the beach",
            price : 1200,
            location : "Goa",
            country : "India"
        }
    );

    await sampleListing.save();
    console.log("SAMPLE SAVED");
    res.send("SUCCESSFULL");
});

app.listen(8080, () => {
    console.log("Server is listening...");
})