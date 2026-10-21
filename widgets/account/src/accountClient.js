// AccountService over gRPC-Web -- see proto/widgetgrid/v1/account.proto.
// Own client per widget, same reasoning as widgets/blog/src/blogClient.js.
import {
  CheckUsernameRequest, RegisterRequest, ConfirmRegistrationRequest,
  ResendRegistrationCodeRequest, ChooseUsernameRequest,
} from '@widgetgrid/proto-gen-web/widgetgrid/v1/account_pb.js';
import { AccountServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/account_grpc_web_pb.js';
import { authMetadata } from '@widgetgrid/auth-web';

const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';
const client = new AccountServicePromiseClient(GRPC_WEB_ORIGIN);

export const accountClient = {
  // { available, problem }
  async checkUsername(username) {
    const request = new CheckUsernameRequest();
    request.setUsername(username);
    const response = await client.checkUsername(request, {});
    return { available: response.getAvailable(), problem: response.getProblem() };
  },
  async register({ email, username, password, captchaToken }) {
    const request = new RegisterRequest();
    request.setEmail(email);
    request.setUsername(username);
    request.setPassword(password);
    request.setCaptchaToken(captchaToken);
    await client.register(request, {});
  },
  async confirm({ email, code }) {
    const request = new ConfirmRegistrationRequest();
    request.setEmail(email);
    request.setCode(code);
    await client.confirmRegistration(request, {});
  },
  async resendCode(email) {
    const request = new ResendRegistrationCodeRequest();
    request.setEmail(email);
    await client.resendRegistrationCode(request, {});
  },
  // The caller's username afterwards (theirs already, if they had one).
  async chooseUsername(username) {
    const request = new ChooseUsernameRequest();
    request.setUsername(username);
    return (await client.chooseUsername(request, await authMetadata())).getUsername();
  },
};

// gRPC-Web errors carry the server's message, written for the form;
// anything else (network) gets a generic one.
export function describe(err) {
  return typeof err?.code === 'number' && err.message ? err.message : 'Something went wrong. Please try again later.';
}
