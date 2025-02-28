import * as React from 'react';
import { injectable, postConstruct, inject } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core';
import { Message } from '@theia/core/lib/browser';
import { RecordingsListWidget, Recording } from './recordings-list-widget';
import { v4 as uuidv4 } from 'uuid';
import { FileSystemService, IFileSystemService } from './filesystem/file-system-service';
import { Mic, Square, Play, Save, X, Headphones, Circle } from 'lucide-react';

@injectable()
export class PassageRecorderMainWidget extends ReactWidget {
    static readonly ID = 'passage-recorder-main:widget';
    static readonly LABEL = 'Passage Recorder';

    @inject(MessageService)
    protected readonly messageService!: MessageService;

    @inject(RecordingsListWidget)
    protected readonly recordingsListWidget: RecordingsListWidget;

    @inject(FileSystemService)
    protected readonly fileSystem: IFileSystemService;

    protected recording: boolean = false;
    protected startTime: number = 0;
    protected currentRecordingName: string = '';
    protected mediaRecorder: MediaRecorder | null = null;
    protected chunks: Blob[] = [];
    protected stream: MediaStream | null = null;
    protected previewBlob: Blob | null = null;
    protected previewUrl: string | null = null;
    protected audioElement: HTMLAudioElement | null = null;
    protected isPlaying: boolean = false;

    @postConstruct()
    protected init(): void {
        this.doInit();
    }

    protected async doInit(): Promise<void> {
        this.id = PassageRecorderMainWidget.ID;
        this.title.label = PassageRecorderMainWidget.LABEL;
        this.title.caption = PassageRecorderMainWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = 'fa fa-microphone';
        this.audioElement = new Audio();
        this.audioElement.onended = () => {
            this.isPlaying = false;
            this.update();
        };
        this.update();
        this.activate();
        this.show();
    }

    protected async startRecording(): Promise<void> {
        try {
            // Clean up any previous preview
            this.cleanupPreview();

            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 44100,
                    sampleSize: 16,
                }
            });

            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            this.chunks = [];
            this.recording = true;
            this.startTime = Date.now();
            
            if (!this.currentRecordingName) {
                this.currentRecordingName = `Recording ${new Date().toLocaleTimeString()}`;
            }

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.chunks.push(e.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.previewBlob = new Blob(this.chunks, { type: 'audio/webm;codecs=opus' });
                this.previewUrl = URL.createObjectURL(this.previewBlob);
                if (this.audioElement) {
                    this.audioElement.src = this.previewUrl;
                }
                this.recording = false;
                this.update();
            };

            this.mediaRecorder.start();
            this.update();
        } catch (error) {
            this.messageService.error(`Error starting recording: ${error}`);
        }
    }

    protected stopRecording = (): void => {
        if (this.mediaRecorder && this.recording) {
            this.mediaRecorder.stop();
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
                this.stream = null;
            }
        }
    };

    protected async saveRecording(): Promise<void> {
        if (!this.previewBlob) {
            this.messageService.error('No recording to save');
            return;
        }

        try {
            const arrayBuffer = await this.previewBlob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const fileName = `${this.currentRecordingName.replace(/[^a-z0-9]/gi, '_')}.webm`;
            
            await this.fileSystem.saveFile(fileName, uint8Array);

            const duration = (Date.now() - this.startTime) / 1000;
            const recording: Recording = {
                id: uuidv4(),
                name: this.currentRecordingName,
                duration,
                createdAt: new Date(),
                fileName: fileName
            };

            // Add the recording to the list widget
            await this.recordingsListWidget.addRecording(recording);
            this.messageService.info(`Recording saved: ${recording.name}`);
            
            // Clean up after saving
            this.cleanupPreview();
            this.currentRecordingName = '';
            this.startTime = 0;
            this.update();
        } catch (error) {
            this.messageService.error(`Error saving recording: ${error}`);
        }
    }

    protected togglePreviewPlayback = (): void => {
        if (!this.audioElement || !this.previewUrl) return;

        if (this.isPlaying) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
            this.isPlaying = false;
        } else {
            this.audioElement.play();
            this.isPlaying = true;
        }
        this.update();
    };

    protected cleanupPreview(): void {
        if (this.previewUrl) {
            URL.revokeObjectURL(this.previewUrl);
            this.previewUrl = null;
        }
        this.previewBlob = null;
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }
        this.isPlaying = false;
    }

    protected discardRecording(): void {
        this.cleanupPreview();
        this.currentRecordingName = '';
        this.startTime = 0;
        this.update();
    }

    render(): React.ReactElement {
        return (
            <div id='passage-recorder-container'>
                <div className='recorder-controls'>
                    <input 
                        type='text'
                        className='recording-name-input'
                        placeholder='Recording name'
                        value={this.currentRecordingName}
                        onChange={(e) => {
                            this.currentRecordingName = e.target.value;
                            this.update();
                        }}
                        disabled={this.recording}
                    />
                    <button 
                        className={`record-button icon-button ${this.recording ? 'recording' : ''}`}
                        onClick={() => this.recording ? this.stopRecording() : this.startRecording()}
                        disabled={!!this.previewBlob}
                        aria-label={this.recording ? 'Stop recording' : 'Start recording'}
                        title={this.recording ? 'Stop recording' : 'Start recording'}
                    >
                        {this.recording ? 
                            <Square className="icon" size={24} /> : 
                            <Mic className="icon" size={24} />
                        }
                    </button>
                </div>
                {this.recording && (
                    <div className='recording-indicator'>
                        <Circle className="icon pulse" size={16} /> Recording in progress...
                    </div>
                )}
                {this.previewBlob && (
                    <div className='preview-controls'>
                        <div className='preview-header'>
                            <Headphones className="icon" size={24} /> Preview Recording
                        </div>
                        <div className='preview-buttons'>
                            <button
                                className={`preview-button icon-button ${this.isPlaying ? 'playing' : ''}`}
                                onClick={this.togglePreviewPlayback}
                                aria-label={this.isPlaying ? 'Stop preview' : 'Play preview'}
                                title={this.isPlaying ? 'Stop preview' : 'Play preview'}
                            >
                                {this.isPlaying ? 
                                    <Square className="icon" size={24} /> : 
                                    <Play className="icon" size={24} />
                                }
                            </button>
                            <button
                                className='save-button icon-button'
                                onClick={() => this.saveRecording()}
                                aria-label='Save recording'
                                title='Save recording'
                            >
                                <Save className="icon" size={24} />
                            </button>
                            <button
                                className='discard-button icon-button'
                                onClick={() => this.discardRecording()}
                                aria-label='Discard recording'
                                title='Discard recording'
                            >
                                <X className="icon" size={24} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    protected onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        const htmlElement = document.getElementById('displayMessageButton');
        if (htmlElement) {
            htmlElement.focus();
        }
    }
}
