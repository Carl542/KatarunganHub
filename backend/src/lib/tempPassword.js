const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

// Excludes visually ambiguous characters (0/O, 1/l/I) since staff hand-write
// this password on a slip for the resident to take home.
export function generateTempPassword(length = 10) {
  let password = "";
  for (let i = 0; i < length; i++) {
    password += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return password;
}
