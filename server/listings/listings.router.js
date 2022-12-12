const router = require("express").Router();
const listings  = require("./listings.models");
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
    try {
       res.send('Hello world')
    } catch (err) {
        res.send("Error " + err);
    }
});

module.exports = router;
