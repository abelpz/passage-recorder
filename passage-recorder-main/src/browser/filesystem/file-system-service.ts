import { injectable, postConstruct } from '@theia/core/shared/inversify';
import { create, remove, readFile, BaseDirectory, mkdir } from '@tauri-apps/plugin-fs';

export { BaseDirectory };

export interface FileStats {
    createdAt: number;
    modifiedAt: number;
    size: number;
}

export const FileSystemService = Symbol('FileSystemService');

export interface IFileSystemService {
    saveFile(fileName: string, data: Uint8Array): Promise<void>;
    readFile(fileName: string): Promise<Uint8Array>;
    deleteFile(fileName: string): Promise<void>;
    getBaseDirectory(): string;
    getFullPath(fileName: string): Promise<string>;
    getFileStats(fileName: string): Promise<FileStats>;
}

@injectable()
export class TauriFileSystemService implements IFileSystemService {
    protected readonly baseDir = 'passage-recorder';

    @postConstruct()
    protected async init(): Promise<void> {
        try {
            // Create the passage-recorder directory if it doesn't exist
            await mkdir(this.baseDir, {
                baseDir: BaseDirectory.Document,
                recursive: true
            });
        } catch (error) {
            console.error('Failed to create passage-recorder directory:', error);
        }
    }

    async saveFile(fileName: string, data: Uint8Array): Promise<void> {
        const file = await create(`${this.baseDir}/${fileName}`, {
            baseDir: BaseDirectory.Document,
        });
        await file.write(data);
        await file.close();
    }

    async readFile(fileName: string): Promise<Uint8Array> {
        return await readFile(`${this.baseDir}/${fileName}`, {
            baseDir: BaseDirectory.Document,
        });
    }

    async deleteFile(fileName: string): Promise<void> {
        await remove(`${this.baseDir}/${fileName}`, {
            baseDir: BaseDirectory.Document,
        });
    }

    getBaseDirectory(): string {
        return this.baseDir;
    }

    async getFullPath(fileName: string): Promise<string> {
        const { join, documentDir } = await import('@tauri-apps/api/path');
        const baseDir = await documentDir();
        return await join(baseDir, this.baseDir, fileName);
    }

    async getFileStats(fileName: string): Promise<FileStats> {
        // For now, we'll return a basic stats object with current time
        // In a production environment, you would want to get actual file stats
        return {
            createdAt: Date.now(),
            modifiedAt: Date.now(),
            size: 0
        };
    }
}

// Example of another implementation (e.g., for browser/electron)
@injectable()
export class BrowserFileSystemService implements IFileSystemService {
    private readonly storageKey = 'recordings-storage';
    
    async saveFile(fileName: string, data: Uint8Array): Promise<void> {
        // Implementation for browser storage
        const storage = this.getStorage();
        storage[fileName] = Array.from(data);
        localStorage.setItem(this.storageKey, JSON.stringify(storage));
    }

    async readFile(fileName: string): Promise<Uint8Array> {
        // Implementation for browser storage
        const storage = this.getStorage();
        if (fileName in storage) {
            return new Uint8Array(storage[fileName]);
        }
        throw new Error('File not found');
    }

    async deleteFile(fileName: string): Promise<void> {
        // Implementation for browser storage
        const storage = this.getStorage();
        delete storage[fileName];
        localStorage.setItem(this.storageKey, JSON.stringify(storage));
    }

    getBaseDirectory(): string {
        return 'browser-storage';
    }

    private getStorage(): { [key: string]: number[] } {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : {};
    }

    async getFullPath(fileName: string): Promise<string> {
        // Implementation for browser storage
        throw new Error('getFullPath method not implemented in BrowserFileSystemService');
    }

    async getFileStats(fileName: string): Promise<FileStats> {
        const storage = this.getStorage();
        if (fileName in storage) {
            return {
                createdAt: Date.now(),
                modifiedAt: Date.now(),
                size: storage[fileName].length
            };
        }
        throw new Error('File not found');
    }
} 