import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function readCapacitorConfig() {
    try {
        const configPath = join(__dirname, 'capacitor.config.json');
        const configContent = await fs.readFile(configPath, 'utf-8');
        return JSON.parse(configContent);
    } catch (error) {
        console.error('Error reading capacitor config:', error);
        process.exit(1);
    }
}

async function cleanDirectory(directory) {
    try {
        // Check if directory exists
        await fs.access(directory);
        
        // Read all files in the directory
        const files = await fs.readdir(directory);
        
        // Process each file
        for (const file of files) {
            const filePath = join(directory, file);
            const stats = await fs.stat(filePath);
            
            if (stats.isFile() && file.endsWith('.gz')) {
                try {
                    await fs.unlink(filePath);
                    console.log(`Removed .gz file: ${filePath}`);
                } catch (err) {
                    console.error(`Error removing ${filePath}:`, err);
                }
            } else if (stats.isDirectory()) {
                // Recursively clean subdirectories
                await cleanDirectory(filePath);
            }
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log(`Directory ${directory} does not exist yet`);
        } else {
            console.error(`Error cleaning directory ${directory}:`, err);
        }
    }
}

async function main() {
    // Read the capacitor config
    const config = await readCapacitorConfig();
    
    // Get the web directory path
    const webDir = join(__dirname, config.webDir);
    
    // Get the Android assets directory path
    const assetsDir = join(__dirname, 'android', 'app', 'src', 'main', 'assets', 'public');
    
    console.log('Cleaning web directory:', webDir);
    await cleanDirectory(webDir);
    
    console.log('Cleaning assets directory:', assetsDir);
    await cleanDirectory(assetsDir);
    
    console.log('Asset cleanup completed successfully');
}

// Run the cleanup
main().catch(error => {
    console.error('Error during cleanup:', error);
    process.exit(1);
}); 