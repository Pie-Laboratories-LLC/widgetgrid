import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

// DI seam for actually sending a text to the owner's phone -- same shape
// as blogChangeNotifier.js's local-vs-real split. createConsoleSmsSender()
// (logs the message instead of texting it) is what local dev uses;
// createSnsSmsSender() is what production/EKS uses (see index.js's
// SMS_PROVIDER switch). SNS chosen over Twilio deliberately: no third-party
// account/rented number needed, and it's a plain IAM-permissioned API call
// -- fits the all-AWS pattern already used everywhere else in this stack
// (Cognito, RDS, etc.), and is priced comparably per-message with no
// standing rental cost.
//
// Was otpSender.js (login-code-only) until chatService.js also needed to
// text the owner about an offline visitor message -- same operation
// (text Matt's one phone number), so this generalized rather than growing
// a second near-identical seam.
export function createConsoleSmsSender() {
  return {
    async send(phoneNumber, message) {
      console.log(`[smsSender] to ${phoneNumber}: ${message}`);
    },
  };
}

// No explicit region/credentials config -- the SDK's default provider
// chain picks both up automatically from the environment EKS Pod Identity
// injects into this pod (see infra/cdk/lib/eks-stack.js's
// WidgetgridServerSnsRole/PodIdentity, same pattern already used for the
// aws-ebs-csi-driver addon's own IAM role).
export function createSnsSmsSender() {
  const client = new SNSClient({});
  return {
    async send(phoneNumber, message) {
      await client.send(new PublishCommand({
        PhoneNumber: phoneNumber,
        Message: message,
        // Transactional, not Promotional -- routes login codes/chat alerts
        // through carriers' higher-priority/higher-deliverability path,
        // the right choice for anything time-sensitive like an OTP.
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: 'Transactional' },
        },
      }));
    },
  };
}
