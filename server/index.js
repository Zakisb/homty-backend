const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require('./config/db');
const app = express();
const dotenv = require('dotenv').config();
const port = process.env.PORT || 5000;

connectDB();

app.use(express.json({limit: "90mb"}));
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use("/images", express.static(path.join(__dirname, "images")));

//users routes
const users = require("./users/users.router");
app.use("/users", users);

//properties routes
const properties = require("./properties/properties.router");
app.use("/properties", properties);

//chats routes
const chats = require("./chats/chats.router");
app.use("/", chats);

//roons routes
const rooms = require("./rooms/rooms.router");
app.use("/rooms", rooms);

app.listen(port, () => console.log(`Server started on port ${port}`));
