import { inject, injectable } from '@theia/core/shared/inversify';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { RecordingsListWidget } from './recordings-list-widget';
import { FrontendApplicationContribution, FrontendApplication } from '@theia/core/lib/browser';
import { TabBarToolbarContribution, TabBarToolbarRegistry } from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { Command, CommandRegistry } from '@theia/core/lib/common/command';
import { FrontendApplicationStateService } from '@theia/core/lib/browser/frontend-application-state';

export namespace RecordingsListCommands {
    export const REFRESH_RECORDINGS: Command = {
        id: 'recordings-list:refresh',
        label: 'Refresh Recordings'
    };
}

@injectable()
export class RecordingsListContribution extends AbstractViewContribution<RecordingsListWidget> implements FrontendApplicationContribution, TabBarToolbarContribution {
    
    constructor() {
        super({
            widgetId: RecordingsListWidget.ID,
            widgetName: RecordingsListWidget.LABEL,
            defaultWidgetOptions: {
                area: 'left'
            },
            toggleCommandId: 'recordingsList:toggle',
            toggleKeybinding: 'ctrlcmd+shift+r'
        });
    }

    @inject(FrontendApplicationStateService)
   protected readonly stateService: FrontendApplicationStateService;
    
    /**
     * This function is called when the application starts.
     * It opens the widget when the application is ready.
     * @param app
     * @returns
     */
    onStart(app: FrontendApplication): Promise<void> {
        this.stateService.reachedState('ready').then(
           () => this.openView({ reveal: true })
        );
        return Promise.resolve();
    }

    async initializeLayout(app: FrontendApplication): Promise<void> {
        await this.openView();
    }

    registerCommands(registry: CommandRegistry): void {
        super.registerCommands(registry);
        
        registry.registerCommand(RecordingsListCommands.REFRESH_RECORDINGS, {
            execute: () => this.refreshRecordings()
        });
    }

    async registerToolbarItems(toolbar: TabBarToolbarRegistry): Promise<void> {
        toolbar.registerItem({
            id: RecordingsListCommands.REFRESH_RECORDINGS.id,
            command: RecordingsListCommands.REFRESH_RECORDINGS.id,
            tooltip: 'Refresh Recordings List',
            priority: 0
        });
    }

    private async refreshRecordings(): Promise<void> {
        const widget = await this.widget;
        // TODO: Implement refresh logic when we add persistence
        widget.update();
    }
} 