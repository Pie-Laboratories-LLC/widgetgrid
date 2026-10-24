// Cognito custom message trigger: the wording of the codes Cognito emails.
// Without it, every code -- a password reset included -- goes out in the
// pool's one verification template, which talks about finishing a
// registration. Here each gets its own. Anything else (an admin-created
// user's invitation) keeps Cognito's default.
//
// Works only because the pool sends through SES (EmailSendingAccount
// DEVELOPER); with Cognito's own sender a custom body is refused.

const SITE = 'Pie Laboratories';

const MESSAGES = {
  CustomMessage_SignUp: registration,
  CustomMessage_ResendCode: registration,
  CustomMessage_ForgotPassword: (code) => ({
    subject: `Reset your ${SITE} password`,
    body: `Your password reset code is ${code}. Enter it on the sign-in page to choose a new password.`
      + "<br><br>If you didn't ask to reset your password, you can ignore this email: your password hasn't changed.",
  }),
  CustomMessage_UpdateUserAttribute: emailChange,
  CustomMessage_VerifyUserAttribute: emailChange,
};

function registration(code) {
  return {
    subject: `Your ${SITE} verification code`,
    body: `Your verification code is ${code}. Enter it on the registration page to finish creating your account.`,
  };
}

function emailChange(code) {
  return {
    subject: `Confirm your ${SITE} email address`,
    body: `Your verification code is ${code}. Enter it on the site to confirm this email address.`,
  };
}

export async function handler(event) {
  const message = MESSAGES[event.triggerSource]?.(event.request.codeParameter);
  if (message) {
    event.response.emailSubject = message.subject;
    event.response.emailMessage = message.body;
  }
  return event;
}
