const crypto = require("crypto");

const getKey = () =>
  crypto
    .createHash("sha256")
    .update(process.env.PROSPECTING_CREDENTIAL_SECRET || process.env.JWT_SECRET || "staging-prospecting-credential-secret")
    .digest();

const encryptCredentialPayload = (payload = {}) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const plaintext = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
};

const decryptCredentialPayload = (encryptedPayload) => {
  const raw = Buffer.from(encryptedPayload, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  return JSON.parse(plaintext);
};

const fingerprintCredentialPayload = (payload = {}) => {
  const stable = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash("sha256").update(stable).digest("hex").slice(0, 16);
};

module.exports = {
  encryptCredentialPayload,
  decryptCredentialPayload,
  fingerprintCredentialPayload,
};
