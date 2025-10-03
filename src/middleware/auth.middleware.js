const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ error: "Unauthorized: No token provided." });
  }
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userPayload) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden: Invalid token." });
    }

    req.user = userPayload;
    next();
  });
}

function authorizeRole(requiredRole) {
  return (req, res, next) => {
    if (req.user && req.user.role === requiredRole) {
      next();
    } else {
      res.status(403).json({
        error: "Forbidden: You do not have permission to perform this action.",
      });
    }
  };
}

module.exports = {
  authenticateToken,
  authorizeRole,
};
