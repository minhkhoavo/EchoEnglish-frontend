import type { TestSession } from '../types/toeic-test.types';

// Extend TestSession for storage-specific fields
interface StorageTestSession extends TestSession {
  userId: string; // User identifier
  testType: 'listening-reading';
  savedAt?: string; // ISODate string
  startTime: string;
  endTime?: string;
  timeLimit: string;
  timeRemaining: string;
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

        console.log(
          'Created test-sessions store with compound key [userId, testId, testMode, partsKey]'
        );
      };
    });
  }

  // Save test session with compound key including partsKey
  async saveTestSession(
    userId: string,
    testId: string,
    testMode: string,
    session: TestSession
  ): Promise<void> {
    try {
      const db = await this.initDB();
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
        // Keep time fields as ISODate strings (no conversion needed)
        startTime: session.startTime || now,
        timeLimit: session.timeLimit || now,
        timeRemaining: session.timeRemaining || now,
        selectedParts: session.selectedParts || '',
      };
      console.log('💾 Full session object to save:', storageSession);
      const result = await new Promise<void>((resolve, reject) => {
        const request = store.put(storageSession);
        request.onsuccess = () => {
          console.log('✅ Session saved successfully with compound key:', {
            userId,
            testId,
            testMode,
            partsKey,
          });
          resolve();
        };
        request.onerror = () => {
          console.error('❌ IndexedDB put request failed:', request.error);
          reject(request.error);
        };
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

      console.log('🔍 IndexedDB Query:', {
        userId,
        testId,
        testMode,
        partsKey,
        compoundKey: [userId, testId, testMode, partsKey],
      });

      const session = await new Promise<StorageTestSession | null>(
        (resolve, reject) => {
          const request = store.get([userId, testId, testMode, partsKey]);
          request.onsuccess = () => {
            const result = request.result as StorageTestSession | undefined;
            console.log(
              '🔍 Retrieved session for compound key:',
              { userId, testId, testMode, partsKey },
              result ? '✅ Found' : '❌ Not found'
            );
            if (result) {
              console.log('📄 Session details:', {
                testMode: result.testMode,
                userId: result.userId,
                answers: Object.keys(result.answers).length,
                selectedParts: result.selectedParts,
                partsKey: result.partsKey,
              });
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

      console.log('🗑️ Attempting to delete session with compound key:', {
        userId,
        testId,
        testMode,
        partsKey,
        compoundKey,
      });

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(compoundKey);
        request.onsuccess = () => {
          console.log('✅ Session deleted successfully with compound key:', {
            userId,
            testId,
            testMode,
            partsKey,
          });
          resolve();
        };
        request.onerror = () => {
          console.error('❌ Failed to delete session:', request.error);
          reject(request.error);
        };
      });

      // Wait for transaction to complete
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
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
            console.log(
              `📋 Found ${userSessions.length} sessions for user ${userId}`
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
        request.onsuccess = () => {
          console.log('🧹 All sessions cleared');
          resolve();
        };
        request.onerror = () => reject(request.error);
      });

      db.close();
    } catch (error) {
      console.error('❌ Error clearing sessions:', error);
      throw error;
    }
  }

  // Debug: Check raw IndexedDB structure
  async debugRawIndexedDB(): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      console.log('🔧 DEBUG: IndexedDB Structure Info:');
      console.log('Database name:', this.dbName);
      console.log('Store name:', this.storeName);
      console.log('Store keyPath:', store.keyPath);
      console.log('Store autoIncrement:', store.autoIncrement);
      console.log('Store indexNames:', Array.from(store.indexNames));

      // Get count
      const countRequest = store.count();
      countRequest.onsuccess = () => {
        console.log('Total records count:', countRequest.result);
      };

      // Get all keys
      const keysRequest = store.getAllKeys();
      keysRequest.onsuccess = () => {
        console.log('All keys in store:', keysRequest.result);
        keysRequest.result.forEach((key, index) => {
          console.log(`Key ${index}:`, key);
        });
      };

      db.close();
    } catch (error) {
      console.error('❌ Error debugging raw IndexedDB:', error);
    }
  }

  // Debug: List all sessions
  async debugListAllSessions(): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      await new Promise<void>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const sessions = request.result as StorageTestSession[];
          console.log('🐛 DEBUG: All sessions in IndexedDB:', sessions.length);
          sessions.forEach((session, index) => {
            console.log(`Session ${index}:`, {
              userId: session.userId,
              testId: session.testId,
              testMode: session.testMode,
              partsKey: session.partsKey,
              selectedParts: session.selectedParts,
              progress: `Answers: ${Object.keys(session.answers).length}`,
              savedAt: new Date(session.savedAt || 0).toLocaleString(),
            });
          });
          resolve();
        };
        request.onerror = () => reject(request.error);
      });

      db.close();
    } catch (error) {
      console.error('❌ Error debugging sessions:', error);
    }
  }

  // Test method to manually save a session
  async testSaveSession(): Promise<void> {
    try {
      const testSession: TestSession = {
        testId: 'test-123',
        testTitle: 'Test Session',
        startTime: new Date(Date.now()).toISOString(),
        timeLimit: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
        timeRemaining: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
        answers: { 1: 'A', 5: 'B' },
        testMode: 'custom',
        selectedParts: 'part1-part5',
        partsKey: 'part1-part5',
      };

      await this.saveTestSession(
        'test-user',
        'test-123',
        'custom',
        testSession
      );
      console.log('✅ Test session saved successfully');
    } catch (error) {
      console.error('❌ Failed to save test session:', error);
    }
  }
}

export const testStorageService = new TestStorageService();
export type { StorageTestSession, CompoundKey };
