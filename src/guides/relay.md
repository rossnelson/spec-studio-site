---
title: The relay
summary: Reach your specs from claude.ai, the Claude app or another computer, also while the Mac is offline.
order: 3
---

## What the relay does

The relay is a remote MCP server that you host yourself. With it, Claude AI (claude.ai, the Claude app on your phone, or Claude Code on another computer) can list, read, make and start the specs of Spec Studio on your Mac, and send messages to the Claude session of a spec.

The relay keeps a copy of each spec in a store. The default store is JSON files on a volume. You can also use your own Temporal namespace. So Claude AI can read your specs and leave messages while the Mac is offline. The messages wait in the relay, and the Mac gets them when it connects again.

The Mac opens no port. The Spec Studio agent on the Mac connects out to the relay.

```text
Claude AI ──HTTPS (OAuth)──▶ relay ◀──WebSocket── studio agent (Mac)
                               │
                 JSON files on a volume, or Temporal (spec mirror, inboxes, sign-ins)
                 S3 bucket (attachments, optional)
```

The relay is for you only. It has one owner password and no sign-up. Its code is public in [spec-studio-app/relay](https://github.com/spec-studio-app/relay).

## What you need

- A public HTTPS address for the relay, for example `https://relay.example.com`.
- Docker, or a Kubernetes cluster with Helm.
- For the JSON store (the default): a persistent volume for the data folder of the relay.
- For the Temporal store (optional): a Temporal namespace, on Temporal Cloud or on a Temporal that you host.
- Optional: a private S3-compatible bucket for attachments.

[Relay backends](/guides/backends/) explains each store, bucket and hosting choice, and every setting.

## Step 1: Make the password hash

Make the bcrypt hash of the owner password. You type this password on the relay's sign-in page. The command asks for the password, so it does not go into your shell history:

```sh
read -rs RELAY_PASSWORD && printf '%s' "$RELAY_PASSWORD" | docker run --rm -i ghcr.io/spec-studio-app/relay password-hash; unset RELAY_PASSWORD
```

## Step 2: Choose the store

The relay keeps its copy of the specs, the messages and the sign-ins in one of two stores. `RELAY_STORE` selects the store: `json` or `temporal`. When `RELAY_STORE` is not set, the relay uses the Temporal store if `TEMPORAL_ADDRESS` is set, else the JSON store.

- **The JSON store** (the default): JSON files in `RELAY_DATA_DIR` (default `/data`). Mount a persistent volume there. The relay is one container and a volume, with no other service. There are no payload keys and no codec endpoints. See [The JSON store](/guides/backends/#the-json-store).
- **The Temporal store**: your own Temporal namespace, on Temporal Cloud or on a Temporal that you host. Use it when you already run Temporal. This store also needs the payload keys. See [The Temporal store](/guides/backends/#the-temporal-store).

To use the Temporal store, make the payload keys. The relay encrypts every Temporal payload with them. Keep a copy in a safe place: without the same keys, the relay cannot read its data.

```sh
docker run --rm ghcr.io/spec-studio-app/relay keys
```

The relay does not move data from one store to the other. See [Switch between stores](/guides/backends/#switch-between-stores) before you change the store.

## Step 3: Choose a bucket (optional)

Attachments go to a private bucket, never into the store. Without a bucket the relay works, but messages cannot have attachments. Cloudflare R2, AWS S3 and MinIO all work. See [The attachment bucket](/guides/backends/#the-attachment-bucket).

## Step 4: Run the relay

Run it with Docker Compose, Helm or Docker, and put an HTTPS proxy (Caddy, Traefik, Cloudflare Tunnel) in front of port 8760. See [Ways to run the relay](/guides/backends/#ways-to-run-the-relay).

Run one relay process for each deploy. The relay keeps the one connection from the Mac in its process, so do not run two replicas of one deploy. With the JSON store, the state is in the files of that one process too.

## Step 5: Pair the Mac

On its first start, the relay prints a pairing code in its log:

```text
Pairing code: K7QM-2XRD-9VHP
It works once, for 24 hours. On the Mac, run:
  studio agent pair wss://relay.example.com/agent K7QM-2XRD-9VHP
```

In Spec Studio, open **Settings** (⌘,) > **Remote Relay**. Enter the relay URL and the code, and click **Pair**.

![The Remote Relay pane: the relay URL and the pairing code go in, Pair, and the status changes to Connected](proto:settings-relay)

Or run the command from the log in a terminal:

```sh
studio agent pair wss://relay.example.com/agent K7QM-2XRD-9VHP
```

The code works once. For a new code, run `relay pair-code` where the relay runs. With the JSON store, run it on the same data folder as the relay:

```sh
docker compose exec relay relay pair-code
kubectl exec deploy/relay -- relay pair-code
```

The relay keeps only the SHA-256 of the Mac's secret. To unpair, use the Remote Relay pane, or run `studio agent unpair`.

## Step 6: Add the connector in Claude AI

In Claude AI, add a custom connector with the URL `https://relay.example.com/mcp`. Sign in with the owner password. The sign-in stays after a relay restart.

Then ask Claude, for example: "Which of my specs need me?" or "Tell the notes spec to use a red badge."

## The tools

| Tool | Mac online | Mac offline |
|---|---|---|
| `list_repos` | The Mac answers. | The repos from the last connection of the Mac, with its time. |
| `list_specs` | The Mac answers. | The relay's copy of each spec, with the time of its last sync. |
| `read_spec` | The Mac answers. | The state, the turn and the last 20 events. No `spec.md` or `plan.md` text. |
| `make_spec` | The Mac answers. | Fails at once. |
| `start_spec` | The Mac answers. | Fails at once. |
| `send_message` | The relay keeps the message and sends it to the Mac. | The relay keeps the message until the Mac connects. |
| `read_messages` | The messages that the sessions sent with `studio message`. | The same. |
| `upload_attachment` | Stores a file for `send_message`. | The same. |

A message reaches the spec's Claude session as "Message from Claude AI". The session answers with `studio message`, and you read the answer with `read_messages`.

## The Temporal Web UI

This section is for the Temporal store only. A relay on the JSON store has no codec endpoints.

The payloads in Temporal are encrypted. The Web UI can show the payloads of the spec workflows through the relay's codec endpoints:

1. Set `UI_ORIGIN` to the origin of the Web UI, for example `https://cloud.temporal.io` or `http://localhost:8233`.
2. Open `https://relay.example.com/codec/signin` and sign in with the owner password. The sign-in lasts 12 hours.
3. In the Web UI, set the codec endpoint to `https://relay.example.com/codec` and turn on "Include cross-origin credentials".
