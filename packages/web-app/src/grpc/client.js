// Wraps the protoc-gen-grpc-web generated Promise clients so the rest of
// the app only ever deals in plain camelCase objects, not generated
// getter-based class instances. See normalize.js for the List-suffix
// naming quirk this works around.
import { GetPageLayoutRequest } from '@widgetgrid/proto-gen-web/widgetgrid/v1/page_pb.js';
import { PageServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/page_grpc_web_pb.js';
import { GetWidgetContentRequest } from '@widgetgrid/proto-gen-web/widgetgrid/v1/widget_pb.js';
import { WidgetServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/widget_grpc_web_pb.js';
import { ListBlogPostsRequest } from '@widgetgrid/proto-gen-web/widgetgrid/v1/blog_pb.js';
import { BlogServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/blog_grpc_web_pb.js';
import { normalizeLayoutResponse, normalizeWidgetContentResponse, normalizeBlogPostsResponse } from './normalize.js';

// Defaults to same-origin as the app itself -- the production topology has
// Envoy as the single public origin, routing this path prefix to the
// backend and everything else to static assets (see infra/envoy/envoy.yaml),
// so there's normally no separate host/port to configure or any CORS
// concern. Override via VITE_GRPC_WEB_ORIGIN for local-k8s/ testing, where
// the SPA dev server and the Envoy gateway are genuinely different origins
// (see local-k8s/README.md) -- e.g. a .env.local with
// VITE_GRPC_WEB_ORIGIN=http://localhost:8080.
const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';

const pageServiceClient = new PageServicePromiseClient(GRPC_WEB_ORIGIN);
const widgetServiceClient = new WidgetServicePromiseClient(GRPC_WEB_ORIGIN);
const blogServiceClient = new BlogServicePromiseClient(GRPC_WEB_ORIGIN);

export const pageClient = {
  async getPageLayout(slug) {
    const request = new GetPageLayoutRequest();
    request.setSlug(slug);
    const response = await pageServiceClient.getPageLayout(request, {});
    return normalizeLayoutResponse(response.toObject());
  },
};

export const widgetClient = {
  async getWidgetContent(widgetIds) {
    const request = new GetWidgetContentRequest();
    request.setWidgetIdsList(widgetIds);
    const response = await widgetServiceClient.getWidgetContent(request, {});
    return normalizeWidgetContentResponse(response.toObject());
  },
};

export const blogClient = {
  async listBlogPosts() {
    const response = await blogServiceClient.listBlogPosts(new ListBlogPostsRequest(), {});
    return normalizeBlogPostsResponse(response.toObject());
  },
};
