import crypto from "node:crypto";

function base64UrlEncode(buffer) {
  return buffer.toString("base64url");
}

export function generateJWT(payload, secret) {
  try {
    const header = { alg: "HS256", typ: "JWT" };

    const encodedHeader = base64UrlEncode(Buffer.from(JSON.stringify(header)));
    const encodedPayload = base64UrlEncode(
      Buffer.from(JSON.stringify(payload))
    );

    const data = `${encodedHeader}.${encodedPayload}`;

    const signature = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("base64url");

    return `${data}.${signature}`;
  } catch (error) {
    console.error("Error generating JWT:", error.message);
    throw new Error("Failed to generate JWT");
  }
}

export function verifyJWT(token, secret) {
  try {
    const [header, payload, signature] = token.split(".");

    if (!header || !payload || !signature) {
      throw new Error("Invalid token format");
    }

    const data = `${header}.${payload}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("base64url");

    if (expectedSignature !== signature) {
      throw new Error("Invalid token signature");
    }

    return JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch (error) {
    console.error("Error verifying JWT:", error.message);
    throw new Error("Failed to generate JWT");
  }
}
