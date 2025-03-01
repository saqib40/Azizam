const Attack = require("../models/AttackLog");
const BlockedIP = require("../models/BlockedIPs");

// Block IP if it appears 5 times within 1 minute
const MAX_ATTEMPTS = 5;
const TIME_FRAME = 1 * 60 * 1000; // 1 minute

const detectAndBlock = async (req, res, next) => {
    const ip = req.ip;  // Get the attacker's IP
    const currentTime = Date.now();

    try {
        // Count recent attack attempts from the same IP within the time frame
        const recentAttacks = await Attack.countDocuments({
            ip: ip,
            timestamp: { $gte: new Date(currentTime - TIME_FRAME) }
        });

        if (recentAttacks >= MAX_ATTEMPTS) {
            console.log(`[SECURITY] Blocking IP: ${ip} due to excessive attacks.`);

            // Check if already blocked
            const alreadyBlocked = await BlockedIP.findOne({ ip });
            if (!alreadyBlocked) {
                await BlockedIP.create({
                    ip,
                    reason: "Brute",
                    blockedAt: new Date()
                });
            }

            return res.status(403).json({ message: "Access denied. Your IP has been blocked." });
        }

        next(); // Allow request if it's not exceeding attack limit
    } catch (error) {
        console.error("[ERROR] Security middleware failed:", error);
        next(); // Move to the next middleware even if error occurs
    }
};

module.exports = detectAndBlock;
