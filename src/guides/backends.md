---
title: Relay backends
summary: The Temporal, bucket and hosting choices of the relay, and every setting.
order: 4
---

The relay keeps no state of its own. It plugs into two backends that you choose: a **Temporal** namespace that holds the copy of each spec, the messages and the sign-ins, and an optional **bucket** that holds the attachments. You also choose **how to run** it. This guide gives the settings for each choice. The relay reads every setting from the environment.

## Temporal

The relay needs one Temporal namespace. Two relays can share a namespace when each has its own `DEPLOY_ID`.

### Temporal Cloud with an API key

1. Make a namespace, and an API key for it.
2. Add the relay's search attributes to the namespace (see below). The relay cannot add them on Temporal Cloud: at start it prints the attributes that are missing and stops.
3. Set the settings:

```sh
TEMPORAL_ADDRESS=<namespace>.<account>.tmprl.cloud:7233
TEMPORAL_NAMESPACE=<namespace>.<account>
TEMPORAL_API_KEY=<the API key>
```

You can also use the regional API key endpoint for `TEMPORAL_ADDRESS`. The relay knows Temporal Cloud from the API key or from a `*.tmprl.cloud` address, and then never registers a namespace or search attributes.

### Temporal Cloud with mTLS

Do steps 1 and 2 as above, with a client certificate for the namespace in place of the API key. Then set `TEMPORAL_TLS_CERT` and `TEMPORAL_TLS_KEY`, as PEM text or as the path of a PEM file:

```sh
TEMPORAL_ADDRESS=<namespace>.<account>.tmprl.cloud:7233
TEMPORAL_NAMESPACE=<namespace>.<account>
TEMPORAL_TLS_CERT=/secrets/client.pem
TEMPORAL_TLS_KEY=/secrets/client.key
```

### The search attributes

Add each of these to a Temporal Cloud namespace:

| Name | Type |
|---|---|
| RepoKey | Keyword |
| SpecSlug | Keyword |
| SpecTitle | Text |
| Stage | Keyword |
| Status | Keyword |
| Mode | Keyword |
| NeedsYou | Bool |
| PendingForMac | Bool |
| PendingForCoordinator | Bool |
| RelayDeployId | Keyword |

```sh
tcld namespace search-attributes add -n <namespace>.<account> --sa "RepoKey=Keyword"
# ... one line for each attribute
```

### Self-hosted Temporal

Set `TEMPORAL_ADDRESS` and `TEMPORAL_NAMESPACE`. At start, the relay registers the namespace (30 days of retention) when it does not exist, and it registers the search attributes. Choose the auth with `TEMPORAL_AUTH`:

- `plain` (the default): a frontend with no TLS, for example on a private network.
- `tls`: a frontend with server TLS.
- `mtls`: server TLS and a client certificate, with `TEMPORAL_TLS_CERT` and `TEMPORAL_TLS_KEY`.

```sh
TEMPORAL_ADDRESS=temporal-frontend.temporal.svc:7233
TEMPORAL_NAMESPACE=studio-relay
TEMPORAL_AUTH=plain
```

To try the relay on one machine, Docker Compose can run a local Temporal dev server for you (see [Docker Compose](#docker-compose)).

## The attachment bucket

Attachments go to a private S3-compatible bucket, never into Temporal. The relay deletes the attachments of a spec when the spec is merged or dropped. Set all four of `BUCKET_ENDPOINT`, `BUCKET_NAME`, `BUCKET_ACCESS_KEY` and `BUCKET_SECRET_KEY`, or none.

### Cloudflare R2

1. Make a bucket, for example `spec-studio-relay`. Do not make it public.
2. Make an R2 API token with "Object Read & Write" on that bucket.
3. Set the settings. R2 needs no region: the default `auto` is right.

```sh
BUCKET_ENDPOINT=https://<account id>.r2.cloudflarestorage.com
BUCKET_NAME=spec-studio-relay
BUCKET_ACCESS_KEY=<the token's access key ID>
BUCKET_SECRET_KEY=<the token's secret access key>
```

### AWS S3

Make a private bucket and an IAM user with read and write access to it. S3 needs its real region:

```sh
BUCKET_ENDPOINT=https://s3.us-east-1.amazonaws.com
BUCKET_REGION=us-east-1
BUCKET_NAME=spec-studio-relay
BUCKET_ACCESS_KEY=<access key ID>
BUCKET_SECRET_KEY=<secret access key>
```

### MinIO

Any S3-compatible service works. The relay uses path-style addresses, so MinIO needs no DNS for each bucket:

```sh
BUCKET_ENDPOINT=https://minio.example.com
BUCKET_REGION=us-east-1
BUCKET_NAME=spec-studio-relay
BUCKET_ACCESS_KEY=<access key>
BUCKET_SECRET_KEY=<secret key>
```

### No bucket

Leave all the `BUCKET_*` settings out. The relay works, but messages cannot have attachments: `upload_attachment` answers "The relay has no bucket for attachments."

## Ways to run the relay

Each release publishes the image `ghcr.io/spec-studio-app/relay:<version>` (linux/amd64 and linux/arm64, signed with cosign) and the Helm chart `oci://ghcr.io/spec-studio-app/charts/relay`. Run one relay process for each deploy, and put an HTTPS proxy (Caddy, Traefik, Cloudflare Tunnel) in front of port 8760.

### Docker Compose

Get `compose.yaml` from the [relay repo](https://github.com/spec-studio-app/relay). Put the settings in a `.env` file next to it. Put the password hash in single quotes, because it has `$` characters:

```sh
PUBLIC_URL=https://relay.example.com
OWNER_PASSWORD_HASH='$2b$12$...'
PAYLOAD_KEYS=data:data-20261123:...,config:config-20261123:...
```

To try the relay with a local Temporal dev server (data in a Docker volume, the Temporal Web UI on port 8233 of this machine only, because it has no sign-in):

```sh
docker compose --profile dev up
```

With your own Temporal, set `TEMPORAL_ADDRESS` and the other Temporal settings in `.env`, then:

```sh
docker compose up
```

### Helm

```sh
helm install relay oci://ghcr.io/spec-studio-app/charts/relay --version <version> \
  --set publicUrl=https://relay.example.com \
  --set temporal.address=temporal-frontend.temporal.svc:7233 \
  --set temporal.namespace=studio-relay \
  --set bucket.endpoint=https://<account id>.r2.cloudflarestorage.com \
  --set bucket.name=spec-studio-relay \
  --set existingSecret=relay-secrets
```

The Secret `existingSecret` has the keys `OWNER_PASSWORD_HASH`, `PAYLOAD_KEYS`, and as needed `TEMPORAL_API_KEY`, `TEMPORAL_TLS_CERT`, `TEMPORAL_TLS_KEY`, `BUCKET_ACCESS_KEY` and `BUCKET_SECRET_KEY`. Or leave `existingSecret` empty and set `secrets.*` in your values: the chart then makes the Secret. Set `ingress.enabled=true` and `ingress.host` for an Ingress. The chart's `values.yaml` lists every value.

### Docker

```sh
docker run -d --name relay -p 8760:8760 --env-file relay.env ghcr.io/spec-studio-app/relay:<version>
```

## Every setting

A setting that is missing or not valid stops the start. The message names the setting and never shows its value.

| Setting | Required | Description |
|---|---|---|
| `PUBLIC_URL` | yes | The public origin of the relay. It is the OAuth issuer. |
| `OWNER_PASSWORD_HASH` | yes | The bcrypt hash of the owner password. |
| `PAYLOAD_KEYS` | yes | The codec keys, from `relay keys`. See below. |
| `TEMPORAL_ADDRESS` | yes | `host:port` of Temporal. |
| `TEMPORAL_NAMESPACE` | no | The namespace. Default `default`. |
| `TEMPORAL_AUTH` | no | `plain`, `tls`, `mtls` or `api-key`. Default: from the other Temporal settings, else `plain`. |
| `TEMPORAL_API_KEY` | no | The API key (Temporal Cloud). |
| `TEMPORAL_TLS_CERT`, `TEMPORAL_TLS_KEY` | no | The client certificate and key for mTLS: PEM text, or the path of a PEM file. |
| `DEPLOY_ID` | no | The name of this deploy. Default `default`. Two relays on one namespace need two names. |
| `TASK_QUEUE` | no | The task queue of the worker. Default `relay-<DEPLOY_ID>`. The relay-config workflow uses `<TASK_QUEUE>-config`. |
| `BUCKET_ENDPOINT`, `BUCKET_NAME`, `BUCKET_ACCESS_KEY`, `BUCKET_SECRET_KEY` | no | The attachment bucket. Set all four, or none. |
| `BUCKET_REGION` | no | The bucket region. Default `auto` (R2). |
| `ATTACHMENT_MAX_BYTES` | no | The largest attachment. Default 10485760 (10 MB). |
| `UI_ORIGIN` | no | The origin of the Temporal Web UI for the codec endpoints. |
| `EXTRA_REDIRECT_URIS` | no | Comma-separated OAuth redirect URIs, besides the claude.ai and claude.com callbacks and loopback addresses. |
| `PORT` | no | The HTTP port. Default 8760. |
| `CALL_TIMEOUT_MS` | no | How long a tool call waits for the Mac. Default 90000. |

### PAYLOAD_KEYS

A comma-separated list of `<scope>:<key id>:<base64 key>`. The scope is `data` (the spec workflows) or `config` (the relay-config workflow). Each key is 32 random bytes; `relay keys` makes a new value. The first key of each scope encrypts. All keys of a scope decrypt, so you can change a key: put the new key first and keep the old key after it.

```sh
PAYLOAD_KEYS=data:data-2:<new>,data:data-1:<old>,config:config-1:<key>
```
