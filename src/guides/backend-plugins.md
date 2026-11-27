---
title: Backend plugins
summary: The plugin keeps the state and the history of each spec. JSON is built in. Choose Temporal in Settings.
order: 5
---

## What a backend plugin keeps

A backend plugin is a small program that keeps data for Spec Studio. The plugin is the only store of a spec's state and history. The app and the `studio` command read and write the plugin. There is no local copy and no queue.

The plugin keeps these items:

- The state of each spec.
- The activity of each spec, one event for each line. Only a plugin with history keeps these.

If the backend is not available, a change fails. The `studio` command exits with a message that names the plugin, the cause and what to do. The app shows the same cause in the strip of the spec and in **Settings > Backend**. Nothing is saved in another place.

The relay has its own store. See [Relay backends](/guides/backends/). A backend plugin is a different setting. It works on the Mac.

## The two official plugins

The **JSON plugin** is built in. Spec Studio ships plugin-json inside the app. You do not install it with Homebrew, and it needs no setup. It is the default. Its data is in the support folder of the app, in the folder `backend/json`.

The **Temporal plugin** keeps the state of each spec and the full history of its activity. With the history, a later version of the app can replay a spec from its start. The plugin uses a Temporal namespace that you give. This can be Temporal Cloud or your own Temporal.

| | JSON | Temporal |
|---|---|---|
| Built in | Yes | No, install it |
| State of each spec | Yes | Yes |
| History and replay | No | Yes |
| Needs a Temporal namespace | No | Yes |

## Install the Temporal plugin

JSON needs no install. To use Temporal, install plugin-temporal with Homebrew:

```sh
brew install spec-studio-app/tap/plugin-temporal
```

The app looks for the plugin in `/opt/homebrew/bin` and then in `/usr/local/bin`.

## Choose a plugin in Settings

Open **Spec Studio > Settings…** (⌘,) and go to the **Backend** pane. The pane shows the plugin in use:

- Its name and its version, and a link to its repo.
- What it gives, in plain words: **Specs**, **History and replay**, **Files** and **Live changes**.
- Its status: **Connected**, **Starting** or **Not reachable**. When the plugin is not reachable, the pane shows the reason.

Choose one of these plugins:

- **JSON** (the default, built in).
- **Temporal**.
- **Other**. Type the path of the binary of your own plugin, then click **Use This Plugin** (or press Return). You can also click **Choose…** and select the binary.

When the plugin that you choose is not installed, the pane says so. It shows the `brew install` command and a button to copy it. Install the plugin, then choose it again.

A change of plugin asks for confirmation. Click **Change** to shut down the old plugin and start the new one. Click **Cancel** to keep the old plugin. A change of plugin does not move your data. To move it, see [Move your data to another backend](#move-your-data-to-another-backend).

### The settings of a plugin

The pane shows a field for each setting that the plugin declares. It marks the required fields. The Temporal plugin has settings for the address and the namespace of Temporal, for example.

- The app keeps the values that are not secret in a file in its support folder.
- The app keeps each secret value in the keychain. A secret is never in a file and never in a log.

When you save a setting, the app restarts the plugin. The plugin then gets the new value.

## Work offline with Temporal

The Temporal plugin needs a Temporal server. When the server does not answer, a change fails with a clear message. To work offline:

1. Run a local Temporal server: `temporal server start-dev`.
2. In **Settings > Backend**, point the plugin at it. Set the address to `localhost:7233`.

```sh
temporal server start-dev
```

To go back, set the address of your own Temporal server again in **Settings > Backend**. The local dev server keeps its own data. Move the data if you need it on your server (see below).

## Move your data to another backend

To change the backend and keep your data, use the move. It copies everything to the new plugin, checks the counts, then switches. If a count is wrong, the setting stays on the old plugin and the command names the spec and the counts.

```sh
studio backend move --to temporal
studio backend move --to json
```

You can also click **Move my data** in **Settings > Backend**. Click it, confirm, and the app does the same move. It shows the counts or the error.

## Links

- [plugin-json](https://github.com/spec-studio-app/plugin-json): the JSON plugin, its settings and its data layout.
- [plugin-temporal](https://github.com/spec-studio-app/plugin-temporal): the Temporal plugin, its settings, history and replay.
- [plugin-sdk](https://github.com/spec-studio-app/plugin-sdk): the protocol, the SDK and the conformance runner. Use it to write your own plugin. The conformance runner shows if your plugin follows the protocol.
