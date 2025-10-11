import type { TestSession } from '../types/toeic-test.types';
import { dbService } from './dbService';

// Extend TestSession for storage-specific fields
interface StorageTestSession extends TestSession {
  userId: string;
  testType: 'listening-reading';
  savedAt?: string;
  startTime: string;
  endTime?: string;
  timeLimit: string;
  timeRemaining: number;
  selectedParts?: string;
}

interface CompoundKey {
  userId: string;
  testId: string;
  testMode: string;
  partsKey: string;
}

class TestStorageService {
  private readonly storeName = 'test-sessions';

  // Generate parts key from selected parts array
  private generatePartsKey(selectedParts: string[] = []): string {
    if (!selectedParts.length) return 'full';
    return selectedParts.slice().sort().join('-');
  }

  // Save test session with compound key including partsKey
  async saveTestSession(userId: string, session: TestSession): Promise<void> {
    return dbService.executeOperation(async (db) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const partsKey = this.generatePartsKey(
        session.selectedParts ? session.selectedParts.split('-') : []
      );

      const now = new Date().toISOString();
      const storageSession: StorageTestSession = {
        ...session,
        userId,
        testType: 'listening-reading',
        partsKey,
        savedAt: now,
        startTime: session.startTime || now,
        timeLimit: session.timeLimit || now,
        timeRemaining:
          typeof session.timeRemaining === 'number'
            ? session.timeRemaining
            : new Date(session.timeLimit).getTime() - Date.now(),
        selectedParts: session.selectedParts || '',
      };

      await new Promise<void>((resolve, reject) => {
        const request = store.put(storageSession);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  // Get test session by compound key including partsKey
  async getTestSession(
    userId: string,
    testId: string,
    testMode: string,
    selectedParts?: string[]
  ): Promise<StorageTestSession | null> {
    return dbService.executeOperation(async (db) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const partsKey = this.generatePartsKey(selectedParts);

      const session = await new Promise<StorageTestSession | null>(
        (resolve, reject) => {
          const request = store.get([userId, testId, testMode, partsKey]);
          request.onsuccess = () => {
            const result = request.result as StorageTestSession | undefined;
            if (result && typeof result.timeRemaining === 'string') {
              result.timeRemaining = parseInt(result.timeRemaining, 10) || 0;
            }
            resolve(result || null);
          };
          request.onerror = () => reject(request.error);
        }
      );

      return session;
    });
  }

  // Delete test session by compound key including partsKey
  async deleteTestSession(
    userId: string,
    testId: string,
    testMode: string,
    selectedParts?: string[]
  ): Promise<void> {
    return dbService.executeOperation(async (db) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const partsKey = this.generatePartsKey(selectedParts);
      const compoundKey = [userId, testId, testMode, partsKey];

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(compoundKey);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    });
  }

  // Get all sessions for a specific user
  async getUserSessions(userId: string): Promise<StorageTestSession[]> {
    return dbService.executeOperation(async (db) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      return new Promise<StorageTestSession[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const allSessions = request.result as StorageTestSession[];
          const userSessions = allSessions.filter(
            (session) => session.userId === userId
          );
          resolve(userSessions);
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  // Clear all sessions (for debugging)
  async clearAllSessions(): Promise<void> {
    return dbService.executeOperation(async (db) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }
}

export const testStorageService = new TestStorageService();
export type { StorageTestSession, CompoundKey };
