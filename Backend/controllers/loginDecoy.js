// Enhanced XSS detection
const detectXSS = (payload) => {
    const preprocessed = preprocessInput(payload);
    const xssRegex = /<script|<iframe|<object|<embed|<img\s+src=["']?javascript:|<svg|on\w+\s*=|eval\(|alert\(|document\.cookie|window\.location|javascript:/i;
    const suspiciousChars = /[<>;=(){}]/g.test(preprocessed); // Heuristic for special chars
    const encodedPattern = /%3C|&#x3C;|&lt;/i.test(payload); // Encoded '<'
    return xssRegex.test(preprocessed) || (suspiciousChars && encodedPattern);
  };
  
  // Enhanced SQLi detection
  const detectSQLi = (payload) => {
    const preprocessed = preprocessInput(payload);
    const sqlRegex = /select|union|insert|update|delete|drop|truncate|exec|declare|cast|convert|--|\/\*|\*\/|'or\d+=\d+|'or'|'and\d+=\d+|;$/i;
    const sqlHeuristic = /['";-]/.test(preprocessed) && /\b(from|where|table|database)\b/i.test(preprocessed);
    const encodedPattern = /%27|&#x27;|&apos;/i.test(payload); // Encoded single quote
    return sqlRegex.test(preprocessed) || (sqlHeuristic && encodedPattern);
  };
  
  // Brute force heuristic (unchanged but included for completeness)
  const detectBruteForce = (payload) => payload.length < 50 && /\d/.test(payload); // Simple: short with numbers
  
  const isMalicious = (payload) => {
    return detectXSS(payload) || detectSQLi(payload) || detectBruteForce(payload);
  };

async function loginDecoy(req,res) {

}

module.exports = loginDecoy;