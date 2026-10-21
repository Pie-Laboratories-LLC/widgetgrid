import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

// DI seam for sending one email -- same local-vs-real split as
// smsSender.js. createConsoleEmailSender() (logs it, links and all, so a
// confirmation link can be clicked from the server log) is local dev;
// createSesEmailSender() is production (see index.js's EMAIL_PROVIDER
// switch). SES for the same all-AWS reason smsSender.js gives for SNS:
// a plain IAM-permissioned call from the pod's existing role.
//
// message: { to, subject, text, html, headers? } -- headers carries
// List-Unsubscribe/List-Unsubscribe-Post on post emails.
export function createConsoleEmailSender() {
  return {
    async send({ to, subject, text, headers = {} }) {
      const headerLines = Object.entries(headers).map(([k, v]) => `\n  ${k}: ${v}`).join('');
      console.log(`[emailSender] to ${to}: ${subject}${headerLines}\n${text}`);
    },
  };
}

// No explicit region/credentials -- the SDK's default chain picks them up
// from the environment EKS Pod Identity injects (see
// infra/cdk/lib/prod-eks-stack.js's WidgetgridServerRole). `from` must be
// an address on the SES-verified domain (infra/cdk/lib/dns-stack.js).
export function createSesEmailSender({ from, replyTo }) {
  const client = new SESv2Client({});
  return {
    async send({ to, subject, text, html, headers = {} }) {
      await client.send(new SendEmailCommand({
        FromEmailAddress: from,
        ReplyToAddresses: replyTo ? [replyTo] : undefined,
        Destination: { ToAddresses: [to] },
        Content: {
          Simple: {
            Subject: { Data: subject, Charset: 'UTF-8' },
            Body: {
              Text: { Data: text, Charset: 'UTF-8' },
              ...(html ? { Html: { Data: html, Charset: 'UTF-8' } } : {}),
            },
            Headers: Object.entries(headers).map(([Name, Value]) => ({ Name, Value })),
          },
        },
      }));
    },
  };
}
