import crypto from "node:crypto";

function base64UrlEncode(buffer) {
  return buffer.toString("base64url");
}

export function generateJWT(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };

  const encodedHeader = base64UrlEncode(Buffer.from(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(Buffer.from(JSON.stringify(payload)));

  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
}

export function verifyJWT(token, secret) {
  const [header, payload, signature] = token.split(".");

  const data = `${header}.${payload}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64url");

  return expectedSignature === signature
    ? JSON.parse(Buffer.from(payload, "base64url").toString())
    : null;
}
