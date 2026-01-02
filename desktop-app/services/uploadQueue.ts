/**
 * Upload Queue Service
 * 
 * Manages a persistent queue of uploads with retry logic and offline support
 */

import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { uploadPhoto } from './uploader';

interface QueueItem {
    id: string;
    filePath: string;
    fileName: string;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    retries: number;
    error?: string;
    addedAt: string;
    completedAt?: string;
}

interface UploadConfig {
    apiKey: string;
    apiBaseUrl: string;
    eventId?: string;
    sister?: 'sister-a' | 'sister-b';
    maxRetries?: number;
}

const QUEUE_FILE = path.join(app.getPath('userData'), 'upload-queue.json');
const MAX_CONCURRENT = 3;

let queue: QueueItem[] = [];
let isProcessing = false;
let activeUploads = 0;
let onProgressCallback: ((item: QueueItem) => void) | null = null;

/**
 * Initialize queue from disk
 */
export function initQueue(): void {
    try {
        if (fs.existsSync(QUEUE_FILE)) {
            const data = fs.readFileSync(QUEUE_FILE, 'utf-8');
            queue = JSON.parse(data);
            // Reset uploading items to pending (in case app crashed)
            queue = queue.map(item =>
                item.status === 'uploading' ? { ...item, status: 'pending' as const } : item
            );
            saveQueue();
        }
    } catch (error) {
        console.error('Error loading queue:', error);
        queue = [];
    }
}

/**
 * Save queue to disk
 */
function saveQueue(): void {
    try {
        fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
    } catch (error) {
        console.error('Error saving queue:', error);
    }
}

/**
 * Add item to queue
 */
export function addToQueue(filePath: string): QueueItem {
    const item: QueueItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        filePath,
        fileName: path.basename(filePath),
        status: 'pending',
        retries: 0,
        addedAt: new Date().toISOString(),
    };

    queue.push(item);
    saveQueue();

    return item;
}

/**
 * Get queue items
 */
export function getQueue(): QueueItem[] {
    return [...queue];
}

/**
 * Get queue statistics
 */
export function getQueueStats() {
    return {
        total: queue.length,
        pending: queue.filter(i => i.status === 'pending').length,
        uploading: queue.filter(i => i.status === 'uploading').length,
        completed: queue.filter(i => i.status === 'completed').length,
        failed: queue.filter(i => i.status === 'failed').length,
    };
}

/**
 * Set progress callback
 */
export function setProgressCallback(callback: (item: QueueItem) => void): void {
    onProgressCallback = callback;
}

/**
 * Process the queue
 */
export async function processQueue(config: UploadConfig): Promise<void> {
    if (isProcessing) return;
    isProcessing = true;

    console.log('📤 Starting queue processing...');

    while (true) {
        const pendingItems = queue.filter(i => i.status === 'pending');
        if (pendingItems.length === 0 || activeUploads >= MAX_CONCURRENT) {
            if (activeUploads === 0) break;
            await new Promise(r => setTimeout(r, 100));
            continue;
        }

        const item = pendingItems[0];
        activeUploads++;

        // Process in background
        processItem(item, config).finally(() => {
            activeUploads--;
        });

        await new Promise(r => setTimeout(r, 100));
    }

    isProcessing = false;
    console.log('✅ Queue processing complete');
}

/**
 * Process a single item
 */
async function processItem(item: QueueItem, config: UploadConfig): Promise<void> {
    const maxRetries = config.maxRetries || 3;

    // Update status
    item.status = 'uploading';
    saveQueue();
    onProgressCallback?.(item);

    try {
        const result = await uploadPhoto(item.filePath, config);

        if (result.success) {
            item.status = 'completed';
            item.completedAt = new Date().toISOString();
            console.log(`✅ Uploaded: ${item.fileName}`);
        } else {
            throw new Error(result.error || 'Upload failed');
        }
    } catch (error: any) {
        item.retries++;
        item.error = error.message;

        if (item.retries >= maxRetries) {
            item.status = 'failed';
            console.error(`❌ Failed after ${maxRetries} retries: ${item.fileName}`);
        } else {
            item.status = 'pending';
            console.warn(`⚠️ Retry ${item.retries}/${maxRetries}: ${item.fileName}`);
        }
    }

    saveQueue();
    onProgressCallback?.(item);
}

/**
 * Retry failed items
 */
export function retryFailed(): void {
    queue = queue.map(item =>
        item.status === 'failed' ? { ...item, status: 'pending' as const, retries: 0 } : item
    );
    saveQueue();
}

/**
 * Clear completed items
 */
export function clearCompleted(): void {
    queue = queue.filter(item => item.status !== 'completed');
    saveQueue();
}

/**
 * Clear all items
 */
export function clearQueue(): void {
    queue = [];
    saveQueue();
}
