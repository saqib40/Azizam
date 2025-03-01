const crypto = require('crypto');
const Attack = require('../models/AttackLog'); // Assuming your Attack model is defined elsewhere

// Preprocess input for consistency
const preprocessInput = (payload) => {
  let decoded = payload;
  try {
    decoded = decodeURIComponent(payload); // URL decoding
    decoded = decoded.replace(/&#x?[\da-fA-F]+;/gi, (match) => String.fromCharCode(parseInt(match.replace(/&#x?/i, '').replace(';', ''), 16))); // HTML entity decoding
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
  return crypto.createHash('md5').update(basicFingerprint).digest('hex'); // Hash for consistency
};

// Detect repeated attempts across IPs using fingerprint
const detectRepeatedAttempts = async (fingerprint) => {
  const recentAttacks = await Attack.countDocuments({
    fingerprint,
    timestamp: { $gte: new Date(Date.now() - 10 * 60 * 1000) }, // Last 10 minutes
  });
  return recentAttacks >= 5; // Block if 5+ attempts
};

// Updated Brute Force detection
const detectBruteForce = async (req, payload) => {
  const fingerprint = getAdvancedFingerprint(req, req.body.navigator); // Client-side data if provided
  const isRepeated = await detectRepeatedAttempts(fingerprint);
  const isShortPayload = payload.length < 50 && (/\d/.test(payload) || /admin|test|pass/.test(payload.toLowerCase()));
  return isRepeated || isShortPayload; // Block if fingerprint repeats OR payload looks like brute force
};

const isMalicious = async (req, payload) => {
  return detectXSS(payload) || detectSQLi(payload) || (await detectBruteForce(req, payload));
};

// Login Decoy Handler
async function loginDecoy(req, res) {
  const { username, password } = req.body;
  const payload = JSON.stringify({ username, password });
  const fingerprint = getAdvancedFingerprint(req, req.body.navigator); // Expect client-side data in req.body

  // Check recent attacks with this fingerprint
  const recentAttacks = await Attack.findOne({
    fingerprint,
    timestamp: { $gte: new Date(Date.now() - 10 * 60 * 1000) }, // Last 10 minutes
  });

  let attack;
  if (recentAttacks) {
    attack = recentAttacks;
    attack.attemptCount += 1;
    attack.ip = req.ip; // Update IP if changed
    attack.payload = payload; // Update latest payload
    attack.timestamp = new Date(); // Update timestamp
    await attack.save();
  } else {
    attack = new Attack({
      ip: req.ip,
      payload,
      method: req.method,
      path: req.path,
      fingerprint,
      attemptCount: 1,
    });
    await attack.save();
  }

  // Check if malicious (XSS, SQLi, or Brute Force)
  const malicious = await isMalicious(req, payload);
  if (malicious || attack.attemptCount >= 5) {
    console.log(`Blocked: ${fingerprint} - ${malicious ? 'Malicious payload' : 'Excessive attempts'} from IP: ${req.ip}`);
    return res.status(403).send('Access denied - suspicious activity detected');
  }

  // Simulate failed login for honeypot
  res.status(401).send('Login failed');
}

module.exports = loginDecoy;