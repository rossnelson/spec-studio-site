---
title: Relay backends
summary: The store, bucket and hosting choices of the relay, and every setting.
order: 4
---

The relay plugs into two backends that you choose: a **store** that holds the copy of each spec, the messages and the sign-ins, and an optional **bucket** that holds the attachments. The store is **JSON files** on a volume (the default) or your own **Temporal** namespace. The store can also be a **backend plugin** (see [Store plugins](#store-plugins)). You also choose **how to run** the relay. This guide gives the settings for each choice. The relay reads every setting from the environment.

`RELAY_STORE` selects the store: `json` or `temporal`. When `RELAY_STORE` is not set, the relay uses the Temporal store if `TEMPORAL_ADDRESS` is set, else the JSON store. When `RELAY_PLUGIN` or `RELAY_PLUGIN_URL` is set, the store is that plugin, and `RELAY_STORE` must be empty (see [Store plugins](#store-plugins)). At start, the relay logs the store and the reason (`store_selected`).

## The JSON store

The JSON store is the default. The relay is one container and a volume, with no other service. There is no Temporal, there are no payload keys and there are no codec endpoints.

The relay keeps its state in `RELAY_DATA_DIR` (default `/data`). Mount a persistent volume there: without a volume, the state is lost with the container. The image runs as uid 1000, and that user must be able to write to the folder. When it cannot, the relay stops at start with a message that names `RELAY_DATA_DIR`.

```sh
RELAY_STORE=json
RELAY_DATA_DIR=/data
```

Both settings are optional: with no Temporal settings, the relay uses the JSON store in `/data`.

The files are not encrypted, and they hold only hashes of the secrets and the tokens. Protect the volume as you protect the relay. Run one relay process on the volume: only that process writes the files. Run `relay pair-code` where the relay runs, on the same data folder.

## The Temporal store

Use the Temporal store when you already run Temporal. Set `TEMPORAL_ADDRESS` (or `RELAY_STORE=temporal` with `TEMPORAL_ADDRESS`), `PAYLOAD_KEYS` and the other Temporal settings below. The relay needs one Temporal namespace. Two relays can share a namespace when each has its own `DEPLOY_ID`.

Make the payload keys. The relay encrypts every Temporal payload with them. Keep a copy in a safe place: without the same keys, the relay cannot read its data. See [PAYLOAD_KEYS](#payload-keys).

```sh
docker run --rm ghcr.io/spec-studio-app/relay keys
```

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

To try the Temporal store on one machine, Docker Compose can run a local Temporal dev server for you (see [Docker Compose](#docker-compose)).

## Store plugins

The relay can keep its state in a backend plugin: a separate program that stores the relay's data. The relay keeps all the rules; the plugin only stores. The plugin protocol (`PROTOCOL.md` in [plugin-sdk](https://github.com/spec-studio-app/plugin-sdk)) defines the calls, so you can write a plugin for your own storage.

You do not need a plugin. **The JSON store stays the default**, and with no plugin setting, nothing changes.

The official plugins:

- [plugin-json](https://github.com/spec-studio-app/plugin-json): JSON files, as the JSON store.
- [plugin-temporal](https://github.com/spec-studio-app/plugin-temporal): Temporal, with the full history of each spec.

A later relay version uses them for `RELAY_STORE=json` and `RELAY_STORE=temporal`, with the same data and no step for you. Until then, those settings use the relay's built-in stores.

To use another plugin, set one of these, and leave `RELAY_STORE` empty:

- `RELAY_PLUGIN`: a plugin command, with its arguments. The relay starts it and talks to it on its stdin and stdout.
- `RELAY_PLUGIN_URL` and `RELAY_PLUGIN_TOKEN`: a plugin that runs as a sidecar, over HTTP. Give the plugin the same token (its `--token` flag or its `PLUGIN_TOKEN` variable): the plugin refuses a call with no token or another token. A plugin with no token listens only on a loopback address, so a sidecar in its own container always needs the token.

```sh
# A plugin command in the relay's container
RELAY_PLUGIN="/usr/local/bin/plugin-mine --data /data"

# A plugin sidecar
RELAY_PLUGIN_URL=http://plugin:7070/rpc
RELAY_PLUGIN_TOKEN=<a long random string, for example from openssl rand -hex 32>
```

The relay splits `RELAY_PLUGIN` into words as a shell does. In a shell or a Compose `.env` file, quote the value as above. In a `docker run --env-file` file, write it with no quotes: that file keeps the quotes as part of the value.

Each `RELAY_PLUGIN_<NAME>` setting goes to the plugin as the setting `<name>`, in lowercase. For example, `RELAY_PLUGIN_ADDRESS=temporal:7233` is the plugin setting `address`. The plugin's README names its settings. With Docker Compose, add each of these settings to the `environment` of the `relay` service in `compose.yaml`: the file passes only `RELAY_PLUGIN`, `RELAY_PLUGIN_URL` and `RELAY_PLUGIN_TOKEN` from `.env`.

At start, the relay logs the plugin's name, version, repo and capabilities. When the plugin does not start or refuses its settings, the relay stops with a message that gives the reason and what to check. When a plugin command stops, the relay starts it again; meanwhile, the tools say that the relay's store is not available. `compose.yaml` has an example of a sidecar in comments. For Helm, see [Helm](#helm).

With a plugin from `RELAY_PLUGIN`, the plugin can lock its storage while the relay runs. Then `relay pair-code` cannot open the storage: stop the relay, run `relay pair-code` with the same settings, and start the relay again. A sidecar plugin does not need this.

## Switch between stores

The relay does not move data from one store to the other. A relay on a new store starts empty:

- The Mac fills the new store with a short first sync of each spec (the state of the spec, its last 20 activity lines and its messages for Claude AI) when it has no sync cursors. So on the Mac, run `studio agent unpair --force` (it removes the pairing and the cursors on this Mac only), then pair again (see [Pair the Mac](/guides/relay/#step-5-pair-the-mac)).
- The messages that wait for the Mac in the old store are lost. The messages for Claude AI that Claude AI did not read are lost too. So switch when no message waits: the Mac is online and has each message, and Claude AI read its messages.
- The pairing and the sign-ins are in the store too. After the switch, sign in to the connector in Claude AI again.

An upgrade from relay 0.3 keeps Temporal: the old settings set `TEMPORAL_ADDRESS`, so the relay uses the Temporal store. With the Compose `dev` profile of 0.3, add `TEMPORAL_ADDRESS=temporal:7233` to `.env`, because the 0.4 `compose.yaml` does not set it.

## The attachment bucket

Attachments go to a private S3-compatible bucket, never into the store. The relay deletes the attachments of a spec when the spec is merged or dropped. Set all four of `BUCKET_ENDPOINT`, `BUCKET_NAME`, `BUCKET_ACCESS_KEY` and `BUCKET_SECRET_KEY`, or none.

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
```

Then run:

```sh
docker compose up
```

The relay uses the JSON store, with its data in the Docker volume `relay-data`.

With your own Temporal, also set `TEMPORAL_ADDRESS`, `PAYLOAD_KEYS` and the other Temporal settings in `.env`, then run `docker compose up`.

To try the Temporal store with a local Temporal dev server (data in a Docker volume, the Temporal Web UI on port 8233 of this machine only, because it has no sign-in), add these settings to `.env`:

```sh
TEMPORAL_ADDRESS=temporal:7233
PAYLOAD_KEYS=data:data-20261123:...,config:config-20261123:...
```

Then run:

```sh
docker compose --profile dev up
```

### Helm

With the JSON store (the default), the chart makes a PersistentVolumeClaim and keeps it when you remove the release:

```sh
helm install relay oci://ghcr.io/spec-studio-app/charts/relay --version <version> \
  --set publicUrl=https://relay.example.com \
  --set bucket.endpoint=https://<account id>.r2.cloudflarestorage.com \
  --set bucket.name=spec-studio-relay \
  --set existingSecret=relay-secrets
```

These values set the volume:

- `persistence.size`: the size of the claim. Default `1Gi`.
- `persistence.storageClass`: the storage class. Empty: the default storage class of the cluster.
- `persistence.existingClaim`: the name of a claim that you made. Empty: the chart makes the claim.

The chart runs one replica with the `Recreate` strategy, so an old pod and a new pod never write the files at the same time.

With the Temporal store, set `store=temporal` and the Temporal values:

```sh
helm install relay oci://ghcr.io/spec-studio-app/charts/relay --version <version> \
  --set publicUrl=https://relay.example.com \
  --set store=temporal \
  --set temporal.address=temporal-frontend.temporal.svc:7233 \
  --set temporal.namespace=studio-relay \
  --set existingSecret=relay-secrets
```

When `store` is empty, the chart uses the rule of the relay: `temporal` when `temporal.address` is set, else `json`.

For a [store plugin](#store-plugins), leave `store` empty and set one of these values:

- `plugin.command`: a plugin command in the image (`RELAY_PLUGIN`). The pod gets the volume at `/data` for its files.
- `plugin.url`: the URL of a plugin that runs as its own service (`RELAY_PLUGIN_URL`), with the token in `secrets.pluginToken` when the plugin has one.
- `plugin.sidecar.enabled=true` with `plugin.sidecar.image`: the plugin in a second container of the pod. It needs `secrets.pluginToken`. For a plugin that keeps files, set `plugin.sidecar.dataPath` (for example `/data`): the sidecar then gets the volume there.

`plugin.settings` holds the plugin's settings: each name becomes `RELAY_PLUGIN_<NAME>`. Put no secret there.

The Secret `existingSecret` has the key `OWNER_PASSWORD_HASH`, and as needed `PAYLOAD_KEYS` (Temporal store), `TEMPORAL_API_KEY`, `TEMPORAL_TLS_CERT`, `TEMPORAL_TLS_KEY`, `BUCKET_ACCESS_KEY`, `BUCKET_SECRET_KEY` and `PLUGIN_TOKEN` (a plugin sidecar, or a plugin service with a token). Or leave `existingSecret` empty and set `secrets.*` in your values: the chart then makes the Secret. Set `ingress.enabled=true` and `ingress.host` for an Ingress. The chart's `values.yaml` lists every value.

### Docker

```sh
docker run -d --name relay -p 8760:8760 -v relay-data:/data --env-file relay.env ghcr.io/spec-studio-app/relay:<version>
```

The volume `relay-data` holds the files of the JSON store. With the Temporal store, the relay does not use it.

## Every setting

A setting that is missing or not valid stops the start. The message names the setting and never shows its value. The settings marked "Temporal" are required only with the Temporal store. The JSON store ignores the Temporal settings.

| Setting | Required | Description |
|---|---|---|
| `PUBLIC_URL` | yes | The public origin of the relay. It is the OAuth issuer. |
| `OWNER_PASSWORD_HASH` | yes | The bcrypt hash of the owner password. |
| `RELAY_STORE` | no | `json` or `temporal`. Default: `temporal` when `TEMPORAL_ADDRESS` is set, else `json`. |
| `RELAY_DATA_DIR` | no | The folder of the JSON store. Default `/data`. |
| `RELAY_PLUGIN` | no | A backend plugin command, with its arguments. See [Store plugins](#store-plugins). Not with `RELAY_STORE` or `RELAY_PLUGIN_URL`. |
| `RELAY_PLUGIN_URL` | no | The URL of a backend plugin sidecar, for example `http://plugin:7070/rpc`. Not with `RELAY_STORE` or `RELAY_PLUGIN`. |
| `RELAY_PLUGIN_TOKEN` | no | The token of the plugin sidecar. |
| `RELAY_PLUGIN_<NAME>` | no | The plugin setting `<name>` (in lowercase). |
| `PAYLOAD_KEYS` | Temporal | The codec keys, from `relay keys`. See below. |
| `TEMPORAL_ADDRESS` | Temporal | `host:port` of Temporal. |
| `TEMPORAL_NAMESPACE` | no | The namespace. Default `default`. |
| `TEMPORAL_AUTH` | no | `plain`, `tls`, `mtls` or `api-key`. Default: from the other Temporal settings, else `plain`. |
| `TEMPORAL_API_KEY` | no | The API key (Temporal Cloud). |
| `TEMPORAL_TLS_CERT`, `TEMPORAL_TLS_KEY` | no | The client certificate and key for mTLS: PEM text, or the path of a PEM file. |
| `DEPLOY_ID` | no | The name of this deploy. Default `default`. Two relays on one namespace need two names. |
| `TASK_QUEUE` | no | The task queue of the worker. Default `relay-<DEPLOY_ID>`. The relay-config workflow uses `<TASK_QUEUE>-config`. |
| `BUCKET_ENDPOINT`, `BUCKET_NAME`, `BUCKET_ACCESS_KEY`, `BUCKET_SECRET_KEY` | no | The attachment bucket. Set all four, or none. |
| `BUCKET_REGION` | no | The bucket region. Default `auto` (R2). |
| `ATTACHMENT_MAX_BYTES` | no | The largest attachment. Default 10485760 (10 MB). |
| `UI_ORIGIN` | no | The origin of the Temporal Web UI for the codec endpoints (Temporal store). |
| `EXTRA_REDIRECT_URIS` | no | Comma-separated OAuth redirect URIs, besides the claude.ai and claude.com callbacks and loopback addresses. |
| `PORT` | no | The HTTP port. Default 8760. |
| `CALL_TIMEOUT_MS` | no | How long a tool call waits for the Mac. Default 90000. |

### PAYLOAD_KEYS

The Temporal store only. A comma-separated list of `<scope>:<key id>:<base64 key>`. The scope is `data` (the spec workflows) or `config` (the relay-config workflow). Each key is 32 random bytes; `relay keys` makes a new value. The first key of each scope encrypts. All keys of a scope decrypt, so you can change a key: put the new key first and keep the old key after it.

```sh
PAYLOAD_KEYS=data:data-2:<new>,data:data-1:<old>,config:config-1:<key>
```
