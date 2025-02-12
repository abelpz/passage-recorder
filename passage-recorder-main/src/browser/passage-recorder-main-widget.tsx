import * as React from 'react';
import { injectable, postConstruct, inject } from '@theia/core/shared/inversify';
import { AlertMessage } from '@theia/core/lib/browser/widgets/alert-message';
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
        const header = `This is a sample widget which simply calls the messageService
        in order to display an info message to end users. customize this widget to add your own functionality.`;
        return <div id='widget-container'>
            <AlertMessage type='INFO' header={header} />
            <button id='displayMessageButton' className='theia-button secondary' title='Display Message' onClick={_a => this.displayMessage()}>Display Message</button>
            <h1>File System Test</h1>
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
