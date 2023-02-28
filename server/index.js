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
app.use("/documents", express.static(path.join(__dirname, "documents")));

//users routes
const users = require("./users/users.router");
app.use("/users", users);

//properties routes
const properties = require("./properties/properties.router");
app.use("/properties", properties);

//chats routes
const chats = require("./chats/chats.router");
app.use("/", chats);

//rooms routes
const rooms = require("./rooms/rooms.router");
app.use("/rooms", rooms);

//applications routes
const applications = require("./applications/applications.router");
app.use("/applications", applications);

//payments routes
const payments = require("./payments/payments.router");
app.use("/payments", payments);

app.listen(port, () => console.log(`Server started on port ${port}`));
