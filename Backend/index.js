const express = require("express");
const routes = require("./routes/routes");
const path = require('path');

const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 4000;

const cors = require("cors");
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.set('trust proxy', true); // Enable proxy trust for X-Forwarded-For
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("./config/db").connect();

app.use("/v1", routes);

// Catch-all for debugging
app.use((req, res) => {
    console.log(`Unhandled request: ${req.method} ${req.url}`);
    res.status(404).send("Not Found");
  });

app.listen(PORT, () => {
    console.log(`App is listening at ${PORT}`);
});