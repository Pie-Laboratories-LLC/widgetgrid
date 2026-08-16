// DI seam for actually delivering the login code -- same shape as
// blogChangeNotifier.js's local-vs-real split. createConsoleOtpSender()
// (logs the code instead of texting it) is what's wired up now. A real
// createTwilioOtpSender() is documented-but-not-built: no way to test an
// SMS provider without real credentials, same reasoning as blogSource.js's
// unbuilt S3 half.
export function createConsoleOtpSender() {
  return {
    async send(phoneNumber, code) {
      console.log(`[otpSender] login code for ${phoneNumber}: ${code}`);
    },
  };
}
