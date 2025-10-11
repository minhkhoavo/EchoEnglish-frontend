import type { WritingRecoveryData } from '../utils/writingExamRecovery';
import { dbService } from './dbService';

interface StorageWritingSession extends WritingRecoveryData {
  userId: string;
  testId: string;
  testType: 'writing';
  savedAt: string;
}

interface WritingCompoundKey {
  userId: string;
  testId: string;
}

class WritingStorageService {
  private readonly storeName = 'writing-sessions';

  async saveWritingSession(
    userId: string,
    session: WritingRecoveryData
  ): Promise<void> {
    return dbService.executeOperation(async (db) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const storageSession: StorageWritingSession = {
        ...session,
        userId,
        testType: 'writing',
        testId: session.recoveryInfo.testId,
        savedAt: new Date().toISOString(),
      };

      await new Promise<void>((resolve, reject) => {
        const request = store.put(storageSession);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getWritingSession(
    userId: string,
    testId: string
  ): Promise<WritingRecoveryData | null> {
    return dbService.executeOperation(async (db) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const session = await new Promise<StorageWritingSession | null>(
        (resolve, reject) => {
          const request = store.get([userId, testId]);
          request.onsuccess = () => {
            const result = request.result as StorageWritingSession | undefined;
            resolve(result || null);
          };
          request.onerror = () => reject(request.error);
        }
      );

      if (!session) return null;

      const {
        userId: _userId,
        testType: _testType,
        testId: _testId,
        savedAt: _savedAt,
        ...recoveryData
      } = session;
      return recoveryData;
    });
  }

  async deleteWritingSession(userId: string, testId: string): Promise<void> {
    return dbService.executeOperation(async (db) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      await new Promise<void>((resolve, reject) => {
        const request = store.delete([userId, testId]);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    });
  }

  async getUserSessions(userId: string): Promise<StorageWritingSession[]> {
    return dbService.executeOperation(async (db) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      return new Promise<StorageWritingSession[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const allSessions = request.result as StorageWritingSession[];
          const userSessions = allSessions.filter(
            (session) => session.userId === userId
          );
          resolve(userSessions);
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

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

export const writingStorageService = new WritingStorageService();
export type { StorageWritingSession, WritingCompoundKey };
