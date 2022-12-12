const router = require("express").Router();
const chats = require("./chats.models");
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  try {
    res.send();
  } catch (err) {
    res.send("Error " + err);
  }
});



module.exports = router;

// do you have an android version of this app?
