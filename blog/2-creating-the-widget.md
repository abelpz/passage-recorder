# Creating the Passage Recorder Widget/View

## Overview

In this post, we will be creating a new Widget containing the Passage Recorder React App.
We will not be creating multiple widgets that communicate with each other for simplicity, but we will be using a single widget that contains the Passage Recorder React App.

## Steps

### Create a new Widget

We will be using the Theia Yeoman Generator to create a new Widget, which will be used as a starting point for our Passage Recorder Widget.

```bash
yo theia-extension --extensionType widget --standalone
```

As you can see, we are adding the `--standalone` flag, this will just add the new widget directory to the existing app.

### Wire the new widget to our workspace and existing apps

We will be adding the new widget to the existing apps, for that open the package.json file of the browser-app and electron-app and add the following to the `dependencies`:

```json
"passage-recorder-main": "*"
```

This will allow us to use the new widget in the browser-app and electron-app.

Let's also add the new widget repository to the main package.json of our monorepo in the workspaces section:

```json
"workspaces": [
  "browser-app",
  "electron-app",
  "passage-recorder-main" // Add the new widget repository to the workspaces section
]
```

To test the new widget run the following commands from the root of the monorepo:

```bash
npm run build:browser
npm run start:browser
```

open the browser-app in your browser, then open display the widget by selecting it from the top menu `View` -> `PassageRecorderMain Widget` or whatever you named it.

### Place the widget in the main area

To place the widget in the main area, we need to modify the `PassageRecorderMainContribution` class.

```diff
// passage-recorder-main-contribution.ts

@injectable()
export class PassageRecorderMainContribution extends AbstractViewContribution<PassageRecorderMainWidget> {
    constructor() {
        super({
            widgetId: PassageRecorderMainWidget.ID,
            widgetName: PassageRecorderMainWidget.LABEL,
-           defaultWidgetOptions: { area: 'left' },
+           defaultWidgetOptions: { area: 'main', mode: 'tab-replace' },
        });
    }
}
```

### Make the widget visible on startup

To make the widget visible on startup, we need to modify the `PassageRecorderMainContribution` class.

```typescript
// passage-recorder-main-contribution.ts

import { inject, injectable } from '@theia/core/shared/inversify';
import { FrontendApplication, FrontendApplicationContribution } from '@theia/core/lib/browser';

@injectable()
export class PassageRecorderMainContribution extends AbstractViewContribution<PassageRecorderMainWidget> implements FrontendApplicationContribution {
    ...

    @inject(FrontendApplicationStateService)
    protected readonly stateService: FrontendApplicationStateService;

    onStart(app: FrontendApplication): void {
        this.stateService.reachedState('ready').then(
           () => this.openView({ reveal: true })
       );
    }
}
```

we made the widget a `FrontendApplicationContribution` so we can make the widget visible on startup, and we used the `FrontendApplicationStateService` to wait for the application to be ready before opening the widget.

### Customize the widget content

To customize the widget content, we need to modify the `PassageRecorderMainWidget` class, specifically the `render` method.

```typescript
// passage-recorder-main-widget.ts

import { ReactWidget } from '@theia/core/lib/browser';

@injectable()
export class PassageRecorderMainWidget extends ReactWidget {
    ...
    render(): React.ReactElement {
        return <div>
            <h1>Passage Recorder</h1>
        </div>
    }
}
```

You can import a react component and render it in the widget. Creating the content of the widget is out of the scope of this guide, we will be using the default content for now.

## Sources

- [Theia Documentation (Widget)](https://theia-ide.org/docs/widgets/)
- [Theia Documentation (Frontend Application)](https://theia-ide.org/docs/frontend_application_contribution/)

## Next Steps

- [Create a new Widget](3-creating-the-widget.md)
