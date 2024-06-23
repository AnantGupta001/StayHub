const express = require("express");
const app = express();
const mongoose = require("mongoose");

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

app.listen(8080, () => {
    console.log("Server is listening...");
})