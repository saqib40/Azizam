const AttackLog = require("../models/AttackLog");
const BlockedIP = require("../models/BlockedIPs");


async function metaDataEverything(req,res) {
    try {
        const attackLogs = await AttackLog.find({}).sort({ timestamp: -1 }); //latest first
        const blockedIPs = await BlockedIP.find({});
        res.status(200).json({ attackLogs, blockedIPs });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve data" });
    }
}

async function block(req,res) {
    try {
        const { ip } = req.params;
        const alreadyBlocked = await BlockedIP.findOne({ ip });
        if (alreadyBlocked) {
            return res.status(400).json({ message: "IP already blocked" });
        }
        await BlockedIP.create({ ip, blockedAt: new Date() });
        res.status(200).json({ message: `IP ${ip} has been blocked successfully` });
    } catch(error) {
        res.status(500).json({ error: "Failed to block IP" });
    }
}

async function unblock(req,res) {
    try {
        const {ip} = req.params;
        const blocked = await BlockedIP.findOne({ ip });
        if (!blocked) {
            return res.status(400).json({ message: "IP is not blocked" });
        }
        await BlockedIP.deleteOne({ ip });
        res.status(200).json({ message: `IP ${ip} has been unblocked successfully` });
    } catch(error) {
        res.status(500).json({ error: "Failed to unblock IP" });
    }
}

module.exports = {metaDataEverything, block, unblock};