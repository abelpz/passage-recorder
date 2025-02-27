import * as React from 'react';
import { injectable, postConstruct, inject } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core';
import { Message } from '@theia/core/lib/browser';
import FileSystemTest from './components/FileSystemTest';

@injectable()
export class PassageRecorderMainWidget extends ReactWidget {

    static readonly ID = 'passage-recorder-main:widget';
    static readonly LABEL = 'Passage Recorder';

    @inject(MessageService)
    protected readonly messageService!: MessageService;

    @postConstruct()
    protected init(): void {
        this.doInit()
    }

    protected async doInit(): Promise <void> {
        this.id = PassageRecorderMainWidget.ID;
        this.title.label = PassageRecorderMainWidget.LABEL;
        this.title.caption = PassageRecorderMainWidget.LABEL;
        this.title.closable = false;
        this.title.iconClass = 'fa fa-window-maximize'; // example widget icon.
        this.update();
        this.activate();
        this.show();
    }

    

    render(): React.ReactElement {
        return <div id='widget-container'>
            <FileSystemTest />
        </div>
    }

    protected displayMessage(): void {
        this.messageService.info('Congratulations: PassageRecorderMain Widget Successfully Created!');
    }

    protected onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        const htmlElement = document.getElementById('displayMessageButton');
        if (htmlElement) {
            htmlElement.focus();
        }
    }
}
