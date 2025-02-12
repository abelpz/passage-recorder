# Creating the browser-only app

## Overview

In this post, we will be creating a new browser-only app in our project, this app will be wrapped with a tauri app to allow for mobile support.

We already have a browser-app, but that depends on a node server and is oriented towards desktop usage. We also have an electron-app, that is oriented towards desktop usage too. Since Theia@1.58, we can now create a browser-only app (no node server required), that is oriented towards web usage, this gives us the opportunity to wrap it in a tauri app for mobile support. Although we will still need to make UI adjustments to make it work on mobile.

## Steps

### Create a new browser-only app

Create a new directory in the root of the project, and name it `browser-only`. Or run the following command to create a new browser-only directory:

```bash
mkdir browser-only
```

### Create the package.json file

Create a new file in the `browser-only` directory, and name it `package.json`.

```json
{
  "private": true,
  "name": "browser-only",
  "version": "0.0.0",
  "dependencies": {
    ...
    "passage-recorder-main": "*"
  },
  "devDependencies": {
    "@theia/cli": "1.58.1"
  },
  "scripts": {
    ...
  },
  "theia": {
    "target": "browser-only",
     "frontend": {
      "config": {
        "applicationName": "Passage Recorder",
        "preferences": {
          "files.enableTrash": false
        }
      }
    }
  }
}
```

you can reuse the dependencies and scripts from the `package.json` file in `browser-app`. Make sure to add the `passage-recorder-main` (or your widget's package name) dependency to the `dependencies` array.

## Include the browser-only app in the project

Include the browser-only app in the project by adding it to the `workspaces` array in the root `package.json` file.

```diff
"workspaces": [
  "browser-app",
  "electron-app",
  "passage-recorder-main",
+ "browser-only"
]
```

also add the following scripts to the root `package.json` file:

```json
"scripts": {
  "start:browser-only": "yarn --cwd browser-only start",
  "build:browser-only": "yarn --cwd browser-only bundle",
  "watch:browser-only": "lerna run --parallel watch --scope browser-only"
}
```

## Sources

- [Theia Documentation (Browser Application)](https://theia-ide.org/docs/browser_application/)

## Next Steps

- [Create a tauri app wrapper](4-creating-the-tauri-app.md)
