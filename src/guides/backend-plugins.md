---
title: Backend plugins
summary: Keep a copy of each spec and its history in a plugin, and choose the plugin in Settings.
order: 5
---

> **Coming soon.** The JSON and Temporal plugins are not released yet. The Backend pane is in the app now, and it shows **Not reachable** until you install a plugin. This guide shows how the plugins will work.

## What a backend plugin keeps

A backend plugin is a small program that keeps data for Spec Studio. The app starts one plugin and sends it a copy of each spec. The plugin keeps these items:

- The state of each spec (`state.json`).
- The activity of each spec, one event for each line of `activity.jsonl`. Only a plugin with history keeps these.

The local files stay the working state. The `studio` command and the app read and write them as before. The plugin only gets a copy. If the plugin is not available, nothing in the stages changes.

The relay has its own store. See [Relay backends](/guides/backends/). A backend plugin is a different setting. It works on the Mac and keeps the copy of the app.

## The two official plugins

The **JSON plugin** is the default. It keeps the state of each spec in JSON files in a folder in the support folder of the app. It gives no history.

The **Temporal plugin** keeps the state of each spec and the full history of its activity. With the history, a later version of the app can replay a spec from its start. The plugin uses a Temporal namespace that you give. This can be Temporal Cloud or your own Temporal.

| | JSON | Temporal |
|---|---|---|
| State of each spec | Yes | Yes |
| History and replay | No | Yes |
| Needs a Temporal namespace | No | Yes |

## Install a plugin

The plugins are coming soon. When they are released, install the plugin that you want to use with Homebrew. The JSON plugin is the default:

```sh
brew install spec-studio-app/tap/plugin-json
```

For history and replay, install the Temporal plugin:

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

- **JSON** (the default).
- **Temporal**.
- **Other**. Type the path of the binary of your own plugin, then click **Use This Plugin** (or press Return). You can also click **Choose…** and select the binary.

When the plugin that you choose is not installed, the pane says so. It shows the `brew install` command and a button to copy it. After you install the plugin, click **Send Now**. The app looks for the plugin again and starts it.

A change of plugin asks for confirmation. Click **Change** to shut down the old plugin and start the new one. Click **Cancel** to keep the old plugin.

### The settings of a plugin

The pane shows a field for each setting that the plugin declares. It marks the required fields. The Temporal plugin has settings for the address and the namespace of Temporal, for example.

- The app keeps the values that are not secret in a file in its support folder.
- The app keeps each secret value in the keychain. A secret is never in a file and never in a log.

When you save a setting, the app restarts the plugin. The plugin then gets the new value.

## The queue

The app puts each item in a queue on disk before it sends the item to the plugin. The app removes an item only after the plugin has taken it.

It is safe to work offline. When the plugin is not reachable, the items stay in the queue. When the plugin is back, the app sends them in order. Nothing is lost when you quit the app or restart the Mac.

When the plugin stops, the app starts it again. It waits a short time and then a longer time each time, up to 30 seconds. The pane shows the number of items in the queue. To skip the wait, click **Send Now**. The app then connects at once and sends the queue.

The app does not try again by itself when the problem needs you: the plugin is not installed, a setting is wrong, or the plugin refuses the app's protocol version. The pane shows the reason. Fix the problem, then save the settings or click **Send Now**.

## The first contact sends the history

The first time the app meets a spec in a plugin, it checks what the plugin has. If the plugin gives history, the app sends each line of `activity.jsonl` that the plugin does not have. So an old spec gets its full history. A line that the plugin already has is not sent twice.

This also happens when you change to a plugin with history. The plugin gets the history of each spec from the first contact. A plugin with no history, such as the JSON plugin, gets only the state of each spec.

## Links

- [plugin-json](https://github.com/spec-studio-app/plugin-json): the JSON plugin, its settings and its data layout.
- [plugin-temporal](https://github.com/spec-studio-app/plugin-temporal): the Temporal plugin, its settings, history and replay.
- [plugin-sdk](https://github.com/spec-studio-app/plugin-sdk): the protocol, the SDK and the conformance runner. Use it to write your own plugin. The conformance runner shows if your plugin follows the protocol.
