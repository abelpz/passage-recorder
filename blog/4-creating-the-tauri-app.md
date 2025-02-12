# Creating the Tauri App Wrapper

## Overview

In this post, we will create a Tauri app that wraps our browser-only app. Tauri is a toolkit for building cross-platform applications with web technologies, offering better performance and smaller bundle sizes compared to Electron. This wrapper will allow us to deploy our app to mobile platforms while reusing our existing web-based UI.

## Prerequisites

- Rust and Cargo installed (required for Tauri)
- Node.js and yarn
- The browser-only app from the previous step

## Steps

### Create the Tauri App Directory

First, create a new tauri project using the executable package from Tauri:

```bash
yarn create tauri-app
```

when prompted, choose the following options:

- Project name: tauri-app
- Language: TypeScript
- Package manager: yarn
- Template: Vanilla
- Flavor: TypeScript

### Configure the Tauri App

Create or modify `tauri-app/src-tauri/tauri.conf.json` with the following configuration:

```diff
{
  ...
  "build": {
+   "beforeDevCommand": "cd ../browser-only && yarn start",
+   "devUrl": "http://localhost:3000",
+   "beforeBuildCommand": "cd ../browser-only && yarn bundle",
+   "frontendDist": "../browser-only/lib/frontend"
  },
  "app": {
    ...
  },
  "bundle": {
   ...
  }
}
```

This will link the browser-only app to the tauri app, so that the browser-only app is bundled within the tauri app.

### Add Tauri App to Workspace

Add the Tauri app to the workspace by modifying the root `package.json`:

```diff
"workspaces": [
  "browser-app",
  "electron-app",
  "passage-recorder-main",
  "browser-only",
+ "tauri-app"
]
```

Also add the following scripts:

```json
"scripts": {
  "start:tauri": "yarn --cwd tauri-app tauri dev",
  "build:tauri": "yarn --cwd tauri-app tauri build",
  "start:android": "yarn --cwd tauri-app tauri android dev ",
  "build:android": "yarn --cwd tauri-app tauri android build"
}
```

## Running the App

You can now run the Desktop Tauri app in development mode:

```bash
yarn start:tauri
```

Or build it for production:

```bash
yarn build:tauri
```

You can also run the Android app in development mode:

```bash
yarn start:android
```

Or build it for production:

```bash
yarn build:android
```

## Sources

- [Tauri Documentation](https://v2.tauri.app/start/create-project/#scaffold-a-new-project)

## Next Steps

- [Add file system support](5-adding-file-system-support.md)
