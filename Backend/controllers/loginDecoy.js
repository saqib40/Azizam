const crypto = require('crypto');
const Attack = require('../models/AttackLog');
const BlockedIP = require('../models/BlockedIPs');

// Preprocess input for consistency
const preprocessInput = (payload) => {
  let decoded = payload;
  try {
    decoded = decodeURIComponent(payload);
    decoded = decoded.replace(/&#x?[\da-fA-F]+;/gi, (match) => String.fromCharCode(parseInt(match.replace(/&#x?/i, '').replace(';', ''), 16)));
  } catch (e) {}
  return decoded.toLowerCase().replace(/\s+/g, '');
};

// Enhanced XSS detection
const detectXSS = (payload) => {
  const preprocessed = preprocessInput(payload);
  const xssRegex = /<script|<iframe|<object|<embed|<img\s+src=["']?javascript:|<svg|on\w+\s*=|eval\(|alert\(|document\.cookie|window\.location|javascript:/i;
  const suspiciousChars = /[<>;=(){}]/g.test(preprocessed);
  const encodedPattern = /%3C|<|</i.test(payload);
  return xssRegex.test(preprocessed) || (suspiciousChars && encodedPattern);
};

// Enhanced SQLi detection
const detectSQLi = (payload) => {
  const preprocessed = preprocessInput(payload);
  const sqlRegex = /select|union|insert|update|delete|drop|truncate|exec|declare|cast|convert|--|\/\*|\*\/|'or\d+=\d+|'or'|'and\d+=\d+|;$/i;
  const sqlHeuristic = /['";-]/.test(preprocessed) && /\b(from|where|table|database)\b/i.test(preprocessed);
  const encodedPattern = /%27|'|'/i.test(payload);
  return sqlRegex.test(preprocessed) || (sqlHeuristic && encodedPattern);
};

// Advanced Fingerprinting
const getAdvancedFingerprint = (req, navigatorData = null) => {
  let basicFingerprint = `${req.headers['user-agent'] || 'unknown'}-${req.headers['accept-language'] || 'unknown'}`;
  if (navigatorData) {
    basicFingerprint += `-${navigatorData.userAgent || ''}-${navigatorData.language || ''}-${navigatorData.platform || ''}-${navigatorData.hardwareConcurrency || ''}-${navigatorData.deviceMemory || ''}-${navigatorData.maxTouchPoints || ''}-${req.body.screen?.width || ''}-${req.body.screen?.height || ''}-${req.body.screen?.colorDepth || ''}-${new Date().getTimezoneOffset()}`;
  }
  return crypto.createHash('md5').update(basicFingerprint).digest('hex');
};

// Brute Force detection with fingerprint
const detectBruteForce = async (req, payload, fingerprint) => {
  const MAX_ATTEMPTS = 5;
  const TIME_FRAME = 10 * 60 * 1000; // 10 minutes
  const recentAttacks = await Attack.countDocuments({
    fingerprint,
    timestamp: { $gte: new Date(Date.now() - TIME_FRAME) },
  });
  const isShortPayload = payload.length < 50 && (/\d/.test(payload) || /admin|test|pass/.test(payload.toLowerCase()));
  return recentAttacks >= MAX_ATTEMPTS || isShortPayload;
};

// Determine attack type
const getAttackType = async (req, payload, fingerprint) => {
  if (detectXSS(payload)) return "XSS";
  if (detectSQLi(payload)) return "SQLi";
  if (await detectBruteForce(req, payload, fingerprint)) return "Brute";
  return "Brute"; // Default
};

// Block IP and update models
const blockIP = async (ip, reason) => {
  const alreadyBlocked = await BlockedIP.findOne({ ip });
  if (!alreadyBlocked) {
    await BlockedIP.create({
      ip,
      reason,
      blockedAt: new Date(),
    });
    console.log(`[SECURITY] Blocked IP: ${ip} for ${reason}`);
  }
};

async function loginDecoy(req, res) {
  const { username, password } = req.body;
  const rawPayload = JSON.stringify({ username, password });
  const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || 'unknown';
  const fingerprint = getAdvancedFingerprint(req, req.body.navigator);
  const attackType = await getAttackType(req, rawPayload, fingerprint);

  // Log the attack
  const recentAttacks = await Attack.findOne({
    fingerprint,
    timestamp: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
  });

  let attack;
  if (recentAttacks) {
    attack = recentAttacks;
    attack.attemptCount += 1;
    attack.ip = ip;
    attack.payload = attackType;
    attack.timestamp = new Date();
    await attack.save();
  } else {
    attack = new Attack({
      ip,
      payload: attackType,
      method: req.method,
      path: req.path,
      fingerprint,
      attemptCount: 1,
    });
    await attack.save();
  }

  console.log(`[DEBUG] Attack logged - IP: ${ip}, Fingerprint: ${fingerprint}, Type: ${attackType}, Attempts: ${attack.attemptCount}`);

  // Blocking Logic
  if (attackType === "SQLi" || attackType === "XSS") {
    // Instant block for SQLi or XSS
    await blockIP(ip, attackType);
    return res.status(403).json({ message: "Access denied. Your IP has been blocked due to malicious activity." });
  } else if (attackType === "Brute") {
    // Brute Force: Block all IPs with this fingerprint if threshold reached
    const recentAttacksCount = await Attack.countDocuments({
      fingerprint,
      timestamp: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
    });

    if (recentAttacksCount >= 5) {
      // Find all IPs associated with this fingerprint
      const relatedAttacks = await Attack.find({
        fingerprint,
        timestamp: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
      }).distinct('ip');

      for (const relatedIP of relatedAttacks) {
        await blockIP(relatedIP, "Brute");
      }
      return res.status(403).json({ message: "Access denied. Your IP has been blocked due to excessive login attempts." });
    }
  }

  // Simulate failed login if not blocked
  res.status(401).json({ message: "Login failed" });
}

module.exports = loginDecoy;