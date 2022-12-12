const router = require("express").Router();
const users = require("./users.models");

router.post("/signUp", async (req, res) => {
    try {
        res.send();
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post("/signIn", async (req, res) => {
    try {
        res.send();
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;
