import jwt from "jsonwebtoken";
import StatusCode from "../helper/statusCode.js";
import { config } from "../configs/config.js";

const SECRET = config.ADMIN_JWT_SECRET;

function signAdminToken(admin, options = {}) {
  // admin can be an object - pick safe fields
  const payload = {
    userName: admin.userName,
    email: admin.email,
    role: "admin",
  };

  const signOptions = {
    expiresIn: options.expiresIn || "10m",
  };

  return jwt.sign(payload, SECRET, signOptions);
}

function verifyAdminToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader) {
      return res.status(401).json(StatusCode.UNAUTHENTICATED("No authorization header provided"));
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json(StatusCode.UNAUTHENTICATED("Invalid authorization format"));
    }

    const token = parts[1];
    let decoded;
    try {
      decoded = jwt.verify(token, SECRET);
    } catch (err) {
      return res.status(401).json(StatusCode.UNAUTHENTICATED("Invalid or expired token"));
    }

    // Ensure token represents an admin
    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json(StatusCode.PERMISSION_DENIED("Admin access required"));
    }

    // Attach admin info to request for downstream handlers
    req.admin = decoded;
    next();
  } catch (error) {
    console.error("authJwt error:", error);
    return res.status(500).json(StatusCode.UNKNOWN("Authentication middleware error"));
  }
}

export default {
  signAdminToken,
  verifyAdminToken,
};
