import { verify, generateSecret } from "otplib";

export async function verifyTotp(options: { token: string; secret: string }) {
  return verify({ token: options.token, secret: options.secret });
}

export function generateTotpSecret() {
  return generateSecret();
}
