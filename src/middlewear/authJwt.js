import jwt from "jsonwebtoken";
import StatusCode from "../helper/statusCode.js";
import { config } from "../configs/config.js";

const SECRET = config.ADMIN_JWT_SECRET;

function signAdminToken(admin, options = {}) {
  const payload = {
    id: admin.id,
    userName: admin.userName,
    email: admin.email,
    role: "admin",
  };

  const signOptions = {
    expiresIn: options.expiresIn || "10m",
  };

  return jwt.sign(payload, SECRET, signOptions);
}

function signCustomerToken(user, options = {}) {
  const payload = {
    id: user.id,
    userName: user.userName,
    email: user.email,
    role: "customer",
  };

  const signOptions = {
    expiresIn: options.expiresIn || "60m",
  };

  return jwt.sign(payload, SECRET, signOptions);
}

function _extractToken(req) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}

function verifyToken(requiredRole) {
  return (req, res, next) => {
    try {
      const token = _extractToken(req);
      if (!token) return res.status(401).json(StatusCode.UNAUTHENTICATED("No authorization header provided"));

      let decoded;
      try {
        decoded = jwt.verify(token, SECRET);
      } catch (err) {
        return res.status(401).json(StatusCode.UNAUTHENTICATED("Invalid or expired token"));
      }

      if (!decoded) return res.status(401).json(StatusCode.UNAUTHENTICATED("Invalid token payload"));

      // Role checks
      if (requiredRole) {
        if (requiredRole === "admin" && decoded.role !== "admin") {
          return res.status(403).json(StatusCode.PERMISSION_DENIED("Admin access required"));
        }
        if (requiredRole === "customer" && decoded.role !== "customer") {
          return res.status(403).json(StatusCode.PERMISSION_DENIED("Customer access required"));
        }
      }

      // Attach to req.user and also set req.admin for backward compatibility when role is admin
      req.user = decoded;
      if (decoded.role === "admin") req.admin = decoded;

      next();
    } catch (error) {
      console.error("authJwt error:", error);
      return res.status(500).json(StatusCode.UNKNOWN("Authentication middleware error"));
    }
  };
}

const verifyAdminToken = verifyToken("admin");
const verifyCustomerToken = verifyToken("customer");
const verifyAnyToken = verifyToken();

export default {
  signAdminToken,
  signCustomerToken,
  verifyAdminToken,
  verifyCustomerToken,
  verifyAnyToken,
};
