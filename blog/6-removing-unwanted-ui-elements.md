# Removing unwanted UI elements

## Overview

In this post, we'll streamline our Theia-based app by removing unnecessary UI elements and contributions that aren't needed for our mobile-focused passage recorder. Theia comes with many built-in features designed for IDE use, but we want to create a focused, mobile-friendly experience.

## Prerequisites

- Completed [Adding File System Support](5-adding-file-system-support.md)
- Understanding of Theia's contribution system

## Steps

### Hide menu bar and status bar

Update the browser-only app's `package.json` to disable unnecessary features:

```json
"preferences": {
  "files.enableTrash": false,
  "window.menuBarVisibility": "compact",
  "workbench.statusBar.visible": false
}
```

this will hide the menu bar and status bar in the browser-only app, it will not remove them from the bundle since they are still needed for Theia to work properly. Check the [browser-only/package.json](../browser-only/package.json) file to see the changes made to the `theia.frontend.config.preferences` object.

### Remove unnecessary dependencies

Update the browser-only app's `package.json` to remove unwanted contributions already setup by default Theia dependencies:

```diff
"dependencies": {
  "@theia/core": "1.58.1",
  "@theia/messages": "1.58.1",
  "@theia/preferences": "1.58.1",
- "@theia/navigator": "1.58.1",
  "passage-recorder-main": "*",
}
```

Removing the "@theia/navigator" dependency will remove the file explorer sidebar widget.
see the current dependencies in the [browser-only/package.json](../browser-only/package.json) file to see a narrowed down list of official theia dependencies.

### Create a filter contribution to remove unwanted contributions

see the [passage-recorded-filter-contribution.ts](../passage-recorder-main/src/browser/passage-recorded-filter-contribution.ts) file to see an example of a filter contribution that removes unwanted contributions.

In our case we want to remove the outline view contribution and the outline view service.

## Sources

- [Theia Filter Contributions](https://theia-ide.org/docs/contribution_filter/)
- [Removing Unwanted UI Elements](https://github.com/eclipse-theia/theia/discussions/12676#discussioncomment-6332817)
- [Theia Core Preferences](https://github.com/eclipse-theia/theia/blob/32ed77fa7fea9503be9b6f0b95247d04fccb83a9/packages/core/src/browser/core-preferences.ts)

## Next Steps

- [Optimizing for Mobile](7-optimizing-for-mobile.md)
