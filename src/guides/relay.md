---
title: The relay
summary: Reach your specs from claude.ai, the Claude app or another computer, also while the Mac is offline.
order: 3
---

## What the relay does

The relay is a remote MCP server that you host yourself. With it, Claude AI (claude.ai, the Claude app on your phone, or Claude Code on another computer) can list, read, make and start the specs of Spec Studio on your Mac, and send messages to the Claude session of a spec.

The relay keeps a copy of each spec in your own Temporal namespace. So Claude AI can read your specs and leave messages while the Mac is offline. The messages wait in the relay, and the Mac gets them when it connects again.

The Mac opens no port. The Spec Studio agent on the Mac connects out to the relay.

```text
Claude AI ──HTTPS (OAuth)──▶ relay ◀──WebSocket── studio agent (Mac)
                               │
                 Temporal (spec mirror, inboxes, sign-ins)
                 S3 bucket (attachments)
```

The relay is for you only. It has one owner password and no sign-up. Its code is public in [spec-studio-app/relay](https://github.com/spec-studio-app/relay).

## What you need

- A Temporal namespace: Temporal Cloud, or a Temporal that you host.
- A public HTTPS address for the relay, for example `https://relay.example.com`.
- Optional: a private S3-compatible bucket for attachments.
- Docker, or a Kubernetes cluster with Helm.

[Relay backends](/guides/backends/) explains each Temporal and bucket choice and every setting.

## Step 1: Make the secrets

Make the payload keys. The relay encrypts every Temporal payload with them. Keep a copy in a safe place: without the same keys, the relay cannot read its data.

```sh
docker run --rm ghcr.io/spec-studio-app/relay keys
```

Make the bcrypt hash of the owner password. You type this password on the relay's sign-in page. The command asks for the password, so it does not go into your shell history:

```sh
read -rs RELAY_PASSWORD && printf '%s' "$RELAY_PASSWORD" | docker run --rm -i ghcr.io/spec-studio-app/relay password-hash; unset RELAY_PASSWORD
```

## Step 2: Choose a Temporal backend

Use Temporal Cloud, or a Temporal that you host. On Temporal Cloud, add the relay's search attributes to the namespace first; a self-hosted Temporal gets them from the relay at start. See [Temporal](/guides/backends/#temporal) for the settings of each.

## Step 3: Choose a bucket (optional)

Attachments go to a private bucket, never into Temporal. Without a bucket the relay works, but messages cannot have attachments. Cloudflare R2, AWS S3 and MinIO all work. See [The attachment bucket](/guides/backends/#the-attachment-bucket).

## Step 4: Run the relay

Run it with Docker Compose, Helm or Docker, and put an HTTPS proxy (Caddy, Traefik, Cloudflare Tunnel) in front of port 8760. See [Ways to run the relay](/guides/backends/#ways-to-run-the-relay).

Run one relay process for each deploy. The relay keeps the one connection from the Mac in its process, so do not run two replicas of one deploy.

## Step 5: Pair the Mac

On its first start, the relay prints a pairing code in its log:

```text
Pairing code: K7QM-2XRD-9VHP
It works once, for 24 hours. On the Mac, run:
  studio agent pair wss://relay.example.com/agent K7QM-2XRD-9VHP
```

In Spec Studio, open **Settings** (⌘,) > **Remote Relay**. Enter the relay URL and the code, and click **Pair**.

![The Remote Relay pane in the Settings window, paired with a relay](shots/settings-relay.webp)

Or run the command from the log in a terminal:

```sh
studio agent pair wss://relay.example.com/agent K7QM-2XRD-9VHP
```

The code works once. For a new code, run `relay pair-code` where the relay runs:

```sh
docker compose exec relay relay pair-code
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

The payloads in Temporal are encrypted. The Web UI can show the payloads of the spec workflows through the relay's codec endpoints:

1. Set `UI_ORIGIN` to the origin of the Web UI, for example `https://cloud.temporal.io`.
2. Open `https://relay.example.com/codec/signin` and sign in with the owner password. The sign-in lasts 12 hours.
3. In the Web UI, set the codec endpoint to `https://relay.example.com/codec` and turn on "Include cross-origin credentials".
