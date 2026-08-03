const jwt = require("jsonwebtoken");

function customerPortalAuth(req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    return res.status(401).json({ msg: "Token not found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.user_type !== "customer_portal") {
      return res.status(403).json({ msg: "Customer portal token required" });
    }
    req.portalUser = decoded;
    next();
  } catch (err) {
    console.error("Customer portal JWT error:", err.message);
    return res.status(401).json({ msg: "Token is not valid" });
  }
}

module.exports = customerPortalAuth;
