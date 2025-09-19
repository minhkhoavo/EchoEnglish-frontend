import type { TestSession } from '../types/toeic-test.types';

// Extend TestSession for storage-specific fields
interface StorageTestSession extends TestSession {
  userId: string; // User identifier
  testType: 'listening-reading';
  savedAt?: string; // ISODate string
  startTime: string;
  endTime?: string;
  timeLimit: string;
  timeRemaining: number; // ms còn lại
  selectedParts?: string;
}

interface CompoundKey {
  userId: string;
  testId: string;
  testMode: string;
  partsKey: string; // Combined key of selected parts (e.g., "part1-part2" or "full")
}

class TestStorageService {
  private dbName = 'echo-english-db';
  private storeName = 'test-sessions';
  private version = 2; // Increment version for schema change

  // Generate parts key from selected parts array
  private generatePartsKey(selectedParts: string[] = []): string {
    if (!selectedParts.length) return 'full';
    // Always sort a copy to avoid mutating the original array
    return selectedParts.slice().sort().join('-');
  }

  // Initialize IndexedDB with compound key [userId, testId, testMode, partsKey]
  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Delete existing store if it exists to rebuild with new schema
        if (db.objectStoreNames.contains(this.storeName)) {
          db.deleteObjectStore(this.storeName);
        }

        // Create store with compound key including partsKey
        const store = db.createObjectStore(this.storeName, {
          keyPath: ['userId', 'testId', 'testMode', 'partsKey'],
        });
      };
    });
  }

  // Save test session with compound key including partsKey
  async saveTestSession(userId: string, session: TestSession): Promise<void> {
    try {
      const db = await this.initDB(); // Không thể single instance do versioning,
      // nên mỗi lần gọi đều mở mới và đóng sau khi xong
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // selectedParts is now a string, so split to array for partsKey
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
        // timeRemaining là số ms còn lại, nếu chưa có thì tính từ timeLimit - now
        timeRemaining:
          typeof session.timeRemaining === 'number'
            ? session.timeRemaining
            : new Date(session.timeLimit).getTime() - Date.now(),
        selectedParts: session.selectedParts || '',
      };

      const result = await new Promise<void>((resolve, reject) => {
        const request = store.put(storageSession);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      db.close();
      return result;
    } catch (error) {
      console.error('❌ Error saving test session:', error);
      throw error;
    }
  }

  // Get test session by compound key including partsKey
  async getTestSession(
    userId: string,
    testId: string,
    testMode: string,
    selectedParts?: string[]
  ): Promise<StorageTestSession | null> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const partsKey = this.generatePartsKey(selectedParts);

      const session = await new Promise<StorageTestSession | null>(
        (resolve, reject) => {
          const request = store.get([userId, testId, testMode, partsKey]);
          request.onsuccess = () => {
            const result = request.result as StorageTestSession | undefined;
            // Đảm bảo timeRemaining là number
            if (result && typeof result.timeRemaining === 'string') {
              result.timeRemaining = parseInt(result.timeRemaining, 10) || 0;
            }
            resolve(result || null);
          };
          request.onerror = () => reject(request.error);
        }
      );

      db.close();
      return session;
    } catch (error) {
      console.error('❌ Error getting test session:', error);
      return null;
    }
  }

  // Delete test session by compound key including partsKey
  async deleteTestSession(
    userId: string,
    testId: string,
    testMode: string,
    selectedParts?: string[]
  ): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const partsKey = this.generatePartsKey(selectedParts);
      const compoundKey = [userId, testId, testMode, partsKey];

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(compoundKey);
        request.onsuccess = () => {
          resolve();
        };
        request.onerror = () => {
          console.error('❌ IndexedDB delete request failed:', request.error);
          reject(request.error);
        };
      });

      // Wait for transaction to complete
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => {
          resolve();
        };
        transaction.onerror = () => {
          console.error('❌ IndexedDB transaction failed:', transaction.error);
          reject(transaction.error);
        };
      });

      db.close();
    } catch (error) {
      console.error('❌ Error deleting test session:', error);
      throw error;
    }
  }

  // Get all sessions for a specific user
  async getUserSessions(userId: string): Promise<StorageTestSession[]> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const sessions = await new Promise<StorageTestSession[]>(
        (resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => {
            const allSessions = request.result as StorageTestSession[];
            // Filter by userId since we can't use index on compound key
            const userSessions = allSessions.filter(
              (session) => session.userId === userId
            );
            resolve(userSessions);
          };
          request.onerror = () => reject(request.error);
        }
      );

      db.close();
      return sessions;
    } catch (error) {
      console.error('❌ Error getting user sessions:', error);
      return [];
    }
  }

  // Clear all sessions (for debugging)
  async clearAllSessions(): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      db.close();
    } catch (error) {
      console.error('❌ Error clearing sessions:', error);
      throw error;
    }
  }
}

export const testStorageService = new TestStorageService();
export type { StorageTestSession, CompoundKey };
