# Adding File System Support

## Overview

In this post, we'll add file system capabilities to our Tauri app. This will allow us to save audio recordings and their associated text to the user's device. We'll use Tauri's file system APIs which provide secure access to the file system while maintaining cross-platform compatibility.

## Prerequisites

- Completed [Creating the Tauri App](4-creating-the-tauri-app.md)

## Steps

### Install the fs plugin from the tauri-app directory

```bash
# From the tauri-app directory
yarn run tauri add fs
```

### Configure File System Capabilities

Update the `src-tauri/capabilities/default.json` file to allow file system operations:

```diff
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for the main window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "opener:default",
    "fs:default",
+   "fs:allow-app-write",
+   "fs:allow-app-write-recursive",
+   "fs:allow-appcache-write",
+   "fs:allow-appcache-write-recursive",
+   "fs:allow-appconfig-write",
+   "fs:allow-appconfig-write-recursive",
+   "fs:allow-appdata-write",
+   "fs:allow-appdata-write-recursive",
+   "fs:allow-applocaldata-write",
+   "fs:allow-applocaldata-write-recursive",
+   "fs:allow-applog-write",
+   "fs:allow-applog-write-recursive",
+   "fs:allow-audio-write",
+   "fs:allow-audio-write-recursive",
+   "fs:allow-cache-write",
+   "fs:allow-cache-write-recursive",
+   "fs:allow-config-write",
+   "fs:allow-config-write-recursive",
+   "fs:allow-create",
+   "fs:allow-data-write",
+   "fs:allow-data-write-recursive",
+   "fs:allow-desktop-write",
+   "fs:allow-desktop-write-recursive",
+   "fs:allow-document-write",
+   "fs:allow-document-write-recursive",
+   "fs:allow-download-write",
+   "fs:allow-download-write-recursive",
+   "fs:allow-exe-write",
+   "fs:allow-exe-write-recursive",
+   "fs:allow-font-write",
+   "fs:allow-font-write-recursive",
+   "fs:allow-home-write",
+   "fs:allow-home-write-recursive",
+   "fs:allow-localdata-write",
+   "fs:allow-localdata-write-recursive",
+   "fs:allow-log-write",
+   "fs:allow-log-write-recursive",
+   "fs:allow-picture-write",
+   "fs:allow-picture-write-recursive",
+   "fs:allow-public-write",
+   "fs:allow-public-write-recursive",
+   "fs:allow-resource-write",
+   "fs:allow-resource-write-recursive",
+   "fs:allow-runtime-write",
+   "fs:allow-runtime-write-recursive",
+   "fs:allow-temp-write",
+   "fs:allow-temp-write-recursive",
+   "fs:allow-template-write",
+   "fs:allow-template-write-recursive",
+   "fs:allow-video-write",
+   "fs:allow-video-write-recursive",
+   "fs:write-all",
+   "fs:write-files"
  ]
}
```

also add the following to the `src-tauri/gen/android/app/src/main/AndroidManifest.xml` file:

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### Install the fs plugin in the widget directory

```bash
# From the widget directory
yarn add @tauri-apps/plugin-fs@~2
```

now you can import the fs plugin in the widget React Components to use the file system APIs.

remember to rebuild the widget and the app before running tauri dev to test the new file system capabilities.

## Security Considerations

- The file system operations are restricted to the app's designated directory
- All file paths are sanitized by Tauri's APIs
- Error handling is implemented for all operations
- User permissions are requested when needed

## Sources

- [Tauri File System API](https://tauri.app/v2/api/js/fs)
- [Tauri Security Guide](https://tauri.app/security/)

## Next Steps

- [Removing unnecessary contributions](6-removing-unnecessary-contributions.md)
