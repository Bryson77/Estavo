import rateLimit from "express-rate-limit";

// Auth limits: 5 requests per hour per IP
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: "Too many authentication attempts from this IP, please try again after an hour" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Gate limits: 10 requests per hour per IP
export const gateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: "Gate trigger limit exceeded. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Emergency limits: 3 requests per hour per IP
export const emergencyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { error: "Emergency alert limit exceeded to prevent spam." },
  standardHeaders: true,
  legacyHeaders: false,
});
