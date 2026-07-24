import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthToken {
  userId: string;
  role: "admin" | "editor";
}

export function createToken(payload: AuthToken): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): AuthToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("userId" in decoded) ||
      !("role" in decoded)
    ) {
      return null;
    }

    return decoded as AuthToken;
  } catch {
    return null;
  }
}