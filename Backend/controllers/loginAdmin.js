const adminModel = require("../models/admin");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");

async function loginAdmin(req,res) {
    try {
        // get the data
        const {email, password} = req.body;
        // check for registered user
        let admin = await adminModel.findOne({email});
        // if user doesn't exist
        if (!admin) {
            return res.status(401).json({
              success: false,
              message: "Admin is not registered",
            });
        }
        // verify password and generate a JWT token
        if (await bcrypt.compare(password, admin.password)) {
            const payload = {
              email: admin.email,
              id: admin._id,
            };
            let token = jwt.sign(payload, process.env.JWT_SECRET, {
              expiresIn: "2h",
            });
            res.status(200).json({
                success: true,
                token,
                message: "Admin logged in successfully",
            });
        }
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Login failure",
        });
    }
}

module.exports = loginAdmin;