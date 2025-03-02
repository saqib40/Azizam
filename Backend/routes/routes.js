const express = require("express");
const router = express.Router();

const loginAdmin = require("../controllers/loginAdmin");
const auth = require("../protected/auth");
const {block, unblock, metaDataEverything} = require("../protected/adminWork");
const loginDecoy = require("../controllers/loginDecoy");

router.post("/login", loginAdmin);
router.post("/block/:ip", auth, block);
router.post("/unblock/:ip", auth, unblock);
router.get("/", auth, metaDataEverything);

router.post("/userlogin", loginDecoy);

module.exports = router;