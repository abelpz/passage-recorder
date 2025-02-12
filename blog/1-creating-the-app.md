# Creating a Theia App

## Overview

In this post, we will be creating a new Theia app that will be used as a starting point for our Passage Recorder app.

## Prerequisites

- [Theia Yeoman Generator](https://github.com/eclipse-theia/generator-theia-extension)
- [Other Prerequisites](https://github.com/eclipse-theia/theia/blob/master/doc/Developing.md#prerequisites)

## Steps

### Install Theia Yeoman Generator globally

```bash
npm install -g yo generator-theia-extension
```

### Create a new Theia app

```bash
mkdir passage-recorder # Replace "passage-recorder" with your app name
cd passage-recorder
yo theia-extension # select the "No extension" option
```

To test the new app run the following commands from the root of the monorepo:

```bash
npm run build:browser
npm run start:browser
```

That's it! You have a new Theia app.

## Sources

- [Theia Documentation](https://theia-ide.org/docs/composing_applications/)
- [Theia GitHub Repository](https://github.com/eclipse-theia/theia)

## Next Steps

- [Create a new Widget](2-creating-the-widget.md)
