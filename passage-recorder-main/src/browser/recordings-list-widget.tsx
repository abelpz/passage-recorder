import * as React from '@theia/core/shared/react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { Message } from '@theia/core/shared/@phosphor/messaging';
import { Emitter } from '@theia/core';
import { CommandRegistry } from '@theia/core/lib/common/command';
import { FileSystemService, IFileSystemService, BaseDirectory } from './filesystem/file-system-service';
import { MessageService } from '@theia/core';
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import { Play, Square, FolderOpen, Trash2 } from 'lucide-react';
import { readDir, watch, type WatchEvent } from '@tauri-apps/plugin-fs';

export interface Recording {
    id: string;
    name: string;
    duration: number;
    createdAt: Date;
    fileName: string;
}

@injectable()
export class RecordingsListWidget extends ReactWidget {
    static readonly ID = 'recordings-list-widget';
    static readonly LABEL = 'Recordings';

    @inject(CommandRegistry)
    protected readonly commandRegistry: CommandRegistry;

    @inject(FileSystemService)
    protected readonly fileSystem: IFileSystemService;

    @inject(MessageService)
    protected readonly messageService: MessageService;

    protected recordings: Recording[] = [];
    protected readonly onRecordingsChangedEmitter = new Emitter<Recording[]>();
    readonly onRecordingsChanged = this.onRecordingsChangedEmitter.event;
    protected currentlyPlaying: string | null = null;
    protected audioElement: HTMLAudioElement | null = null;
    protected watchUnsubscribe: (() => void) | null = null;

    @postConstruct()
    protected async init(): Promise<void> {
        this.id = RecordingsListWidget.ID;
        this.title.label = RecordingsListWidget.LABEL;
        this.title.caption = RecordingsListWidget.LABEL;
        this.title.closable = false;
        this.title.iconClass = 'fa fa-list-ul';
        this.addClass('recordings-list');
        this.audioElement = new Audio();
        this.audioElement.onended = () => {
            this.currentlyPlaying = null;
            this.update();
        };

        // Load existing recordings
        await this.loadExistingRecordings();
        
        // Set up directory watching
        await this.setupDirectoryWatcher();
        
        this.update();
    }

    protected async setupDirectoryWatcher(): Promise<void> {
        try {
            const baseDir = this.fileSystem.getBaseDirectory();
            const { join, documentDir } = await import('@tauri-apps/api/path');
            const docDir = await documentDir();
            const fullPath = await join(docDir, baseDir);

            this.watchUnsubscribe = await watch(
                fullPath,
                async (event: WatchEvent) => {
                    console.log('Watch event:', event);
                    // Reload recordings for any file system event in our directory
                    await this.loadExistingRecordings();
                    this.update();
                },
                {
                    recursive: true,
                    delayMs: 500 // Debounce for 500ms
                }
            );
            console.log('Directory watcher set up for:', fullPath);
        } catch (error) {
            console.error('Error setting up directory watcher:', error);
            this.messageService.error(`Error setting up directory watcher: ${error}`);
        }
    }

    dispose(): void {
        if (this.watchUnsubscribe) {
            this.watchUnsubscribe();
        }
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement = null;
        }
        super.dispose();
    }

    protected async loadExistingRecordings(): Promise<void> {
        try {
            const baseDir = this.fileSystem.getBaseDirectory();
            const entries = await readDir(baseDir, {
                baseDir: BaseDirectory.Document
            });
            
            const recordings: Recording[] = [];
            for (const entry of entries) {
                if (entry.name && entry.name.endsWith('.webm')) {
                    const name = entry.name.replace('.webm', '').replace(/_/g, ' ');
                    const stats = await this.fileSystem.getFileStats(entry.name);
                    
                    recordings.push({
                        id: entry.name, // Using filename as ID for existing recordings
                        name: name,
                        fileName: entry.name,
                        duration: 0, // We'll need to load the audio to get the actual duration
                        createdAt: new Date(stats.createdAt)
                    });
                }
            }

            // Sort recordings by creation date, newest first
            recordings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            
            this.recordings = recordings;
            this.onRecordingsChangedEmitter.fire(this.recordings);
        } catch (error) {
            this.messageService.error(`Error loading recordings: ${error}`);
        }
    }

    protected onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        this.update();
    }

    addRecording(recording: Recording): void {
        try {
            this.recordings = [...this.recordings, recording];
            this.onRecordingsChangedEmitter.fire(this.recordings);
            this.messageService.info(`Added recording to list: ${recording.name}`);
            this.update();
        } catch (error) {
            this.messageService.error(`Error adding recording to list: ${error}`);
        }
    }

    protected async playRecording(recording: Recording): Promise<void> {
        try {
            if (this.currentlyPlaying === recording.id) {
                // Stop playing if it's already playing
                if (this.audioElement) {
                    this.audioElement.pause();
                    this.audioElement.currentTime = 0;
                }
                this.currentlyPlaying = null;
                this.update();
                return;
            }

            // Stop any currently playing audio
            if (this.audioElement) {
                this.audioElement.pause();
                this.audioElement.currentTime = 0;
            }

            // Read the file using the injected file system service
            const audioData = await this.fileSystem.readFile(recording.fileName);

            // Create blob with proper MIME type
            const blob = new Blob([audioData], {
                type: 'audio/webm;codecs=opus'
            });
            const url = URL.createObjectURL(blob);

            if (this.audioElement) {
                this.audioElement.src = url;
                await this.audioElement.play();
                this.currentlyPlaying = recording.id;
                this.update();

                // Clean up the URL when done
                this.audioElement.onended = () => {
                    URL.revokeObjectURL(url);
                    this.currentlyPlaying = null;
                    this.update();
                };
            }
        } catch (error) {
            this.messageService.error(`Error playing recording: ${error}`);
        }
    }

    protected async deleteRecording(recording: Recording): Promise<void> {
        try {
            await this.fileSystem.deleteFile(recording.fileName);
            this.recordings = this.recordings.filter(r => r.id !== recording.id);
            this.onRecordingsChangedEmitter.fire(this.recordings);
            this.messageService.info(`Deleted recording: ${recording.name}`);
            this.update();
        } catch (error) {
            this.messageService.error(`Error deleting recording: ${error}`);
        }
    }

    protected async revealRecordingInExplorer(recording: Recording): Promise<void> {
        try {
            const fullPath = await this.fileSystem.getFullPath(recording.fileName);
            await revealItemInDir(fullPath);
            this.messageService.info(`Opened file location for: ${recording.name}`);
        } catch (error) {
            this.messageService.error(`Error revealing file location: ${error}`);
        }
    }

    protected render(): React.ReactNode {
        return (
            <div className='recordings-list-container'>
                <div className='recordings-list-header'>
                    <h3>Recordings ({this.recordings.length})</h3>
                </div>
                <div className='recordings-list-content'>
                    {this.recordings.length === 0 ? (
                        <div className='no-recordings'>No recordings yet</div>
                    ) : (
                        <ul className='recordings-items'>
                            {this.recordings.map(recording => (
                                <li key={recording.id} className='recording-item'>
                                    <div className='recording-info'>
                                        <span className='recording-name'>{recording.name}</span>
                                        <span className='recording-duration'>
                                            {Math.round(recording.duration)}s
                                        </span>
                                    </div>
                                    <div className='recording-controls'>
                                        <button
                                            className={`preview-button icon-button ${this.currentlyPlaying === recording.id ? 'playing' : ''}`}
                                            onClick={() => this.playRecording(recording)}
                                            aria-label={this.currentlyPlaying === recording.id ? 'Stop playback' : 'Play recording'}
                                            title={this.currentlyPlaying === recording.id ? 'Stop playback' : 'Play recording'}
                                        >
                                            {this.currentlyPlaying === recording.id ? 
                                                <Square className="icon" size={24} /> : 
                                                <Play className="icon" size={24} />
                                            }
                                        </button>
                                        <button
                                            className='reveal-button icon-button'
                                            onClick={() => this.revealRecordingInExplorer(recording)}
                                            aria-label='Show in file explorer'
                                            title='Show in file explorer'
                                        >
                                            <FolderOpen className="icon" size={24} />
                                        </button>
                                        <button
                                            className='delete-button icon-button'
                                            onClick={() => this.deleteRecording(recording)}
                                            aria-label='Delete recording'
                                            title='Delete recording'
                                        >
                                            <Trash2 className="icon" size={24} />
                                        </button>
                                    </div>
                                    <div className='recording-date'>
                                        {recording.createdAt.toLocaleDateString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        );
    }
} 