// Its own gRPC-Web client, same reasoning as widgets/blog/src/blogClient.js:
// independently built/deployed widgets can't reach into packages/web-app's
// own client setup.
import {
  RequestLoginCodeRequest,
  VerifyLoginCodeRequest,
  LogoutRequest,
} from '@widgetgrid/proto-gen-web/widgetgrid/v1/auth_pb.js';
import { AuthServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/auth_grpc_web_pb.js';

const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';
const client = new AuthServicePromiseClient(GRPC_WEB_ORIGIN);

export const authClient = {
  async requestLoginCode() {
    await client.requestLoginCode(new RequestLoginCodeRequest(), {});
  },
  // Returns '' on a wrong/expired code -- see authService.js's
  // VerifyLoginCode for why this is a plain empty-string response rather
  // than a gRPC error (a wrong code isn't exceptional, it's just "no").
  async verifyLoginCode(code) {
    const request = new VerifyLoginCodeRequest();
    request.setCode(code);
    const response = await client.verifyLoginCode(request, {});
    return response.toObject().token;
  },
  async logout(token) {
    const request = new LogoutRequest();
    request.setToken(token);
    await client.logout(request, {});
  },
};
