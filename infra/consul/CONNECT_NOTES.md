# Consul Connect notes

No Consul-specific config is checked in here -- it depends on your existing
Consul setup (datacenter topology, ACLs, intentions, etc.), which this repo
has no visibility into. This is the shape of how WidgetGrid fits into it,
not a config file to copy in.

## Why Envoy + Connect, not Buf Connect

Deliberate choice: Consul Connect's default sidecar data plane *is* Envoy,
so if Consul Connect is already in place, Envoy is already deployed
alongside every service regardless of gRPC. Terminating gRPC-Web at that
already-present Envoy (via `envoy.filters.http.grpc_web`, see
`../envoy/envoy.yaml`) is free; standing up a proxy-free framework like Buf
Connect specifically to avoid a proxy that's already there for other
reasons solves a problem that doesn't exist in this environment.

## Topology

```
browser --> Envoy (public listener, terminates gRPC-Web + serves static)
              |
              | mTLS via Connect-injected certs, service discovered via Consul
              v
        widgetgrid-server (packages/server, plain @grpc/grpc-js, binds
        plaintext on 127.0.0.1:50051)
              |
              v
          PostgreSQL
```

`packages/server` only ever binds plaintext on localhost (see
`packages/server/src/index.js`) -- it never handles TLS or service
registration itself. That's the sidecar's job:

1. Register `widgetgrid-server` as a Consul service, with a Connect sidecar
   proxy alongside it, upstream-configured to the local
   `127.0.0.1:50051` listener.
2. Register (or run) an Envoy instance as the public-facing listener,
   configured with a Connect upstream for `widgetgrid-server` -- this
   replaces `envoy.yaml`'s static `widgetgrid_backend` cluster endpoint with
   Connect's dynamically-injected one.
3. Consul intentions control which services may call `widgetgrid-server`;
   set these per your existing security model, not prescribed here.

## What's NOT handled by this repo

- Any Consul service-definition HCL/JSON, sidecar proxy registration, or
  intentions -- these live in your Consul configuration, not this codebase.
- TLS/mTLS certificate management -- Connect's CA handles this.
- Multi-datacenter / multi-instance load balancing beyond what Consul's
  service discovery already provides.
