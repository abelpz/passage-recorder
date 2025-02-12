import { inject, injectable } from '@theia/core/shared/inversify';
import { MenuModelRegistry } from '@theia/core';
import { PassageRecorderMainWidget } from './passage-recorder-main-widget';
import { AbstractViewContribution, FrontendApplication, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { Command, CommandRegistry } from '@theia/core/lib/common/command';
import { FrontendApplicationStateService } from '@theia/core/lib/browser/frontend-application-state';

export const PassageRecorderMainCommand: Command = { id: 'passage-recorder-main:command' };

@injectable()
export class PassageRecorderMainContribution extends AbstractViewContribution<PassageRecorderMainWidget> implements FrontendApplicationContribution {

    /**
     * `AbstractViewContribution` handles the creation and registering
     *  of the widget including commands, menus, and keybindings.
     * 
     * We can pass `defaultWidgetOptions` which define widget properties such as 
     * its location `area` (`main`, `left`, `right`, `bottom`), `mode`, and `ref`.
     * 
     */
    constructor() {
        super({
            widgetId: PassageRecorderMainWidget.ID,
            widgetName: PassageRecorderMainWidget.LABEL,
            defaultWidgetOptions: { area: 'main', mode: 'tab-replace',  },
            toggleCommandId: PassageRecorderMainCommand.id,
        });
    }

    @inject(FrontendApplicationStateService)
   protected readonly stateService: FrontendApplicationStateService;
    
    onStart(app: FrontendApplication): Promise<void> {
        this.stateService.reachedState('ready').then(
           () => this.openView({ reveal: true })
        );
        return Promise.resolve();
    }

    /**
     * Example command registration to open the widget from the menu, and quick-open.
     * For a simpler use case, it is possible to simply call:
     ```ts
        super.registerCommands(commands)
     ```
     *
     * For more flexibility, we can pass `OpenViewArguments` which define 
     * options on how to handle opening the widget:
     * 
     ```ts
        toggle?: boolean
        activate?: boolean;
        reveal?: boolean;
     ```
     *
     * @param commands
     */
    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(PassageRecorderMainCommand, {
            execute: () => super.openView({ activate: false, reveal: true })
        });
    }

    /**
     * Example menu registration to contribute a menu item used to open the widget.
     * Default location when extending the `AbstractViewContribution` is the `View` main-menu item.
     * 
     * We can however define new menu path locations in the following way:
     ```ts
        menus.registerMenuAction(CommonMenus.HELP, {
            commandId: 'id',
            label: 'label'
        });
     ```
     * 
     * @param menus
     */
    registerMenus(menus: MenuModelRegistry): void {
        super.registerMenus(menus);
    }
}
