// Shared IndexedDB service for all test-related storage
class DBService {
  private static instance: DBService;
  private readonly dbName = 'echo-english-db';
  private readonly version = 5; // Single version for all stores

  private constructor() {}

  static getInstance(): DBService {
    if (!DBService.instance) {
      DBService.instance = new DBService();
    }
    return DBService.instance;
  }

  // Open a new DB connection (caller must close after use)
  async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create test-sessions store for listening/reading tests
        if (!db.objectStoreNames.contains('test-sessions')) {
          db.createObjectStore('test-sessions', {
            keyPath: ['userId', 'testId', 'testMode', 'partsKey'],
          });
          console.log('✅ Created test-sessions store');
        }

        // Create writing-sessions store for writing tests
        if (!db.objectStoreNames.contains('writing-sessions')) {
          db.createObjectStore('writing-sessions', {
            keyPath: ['userId', 'testId'],
          });
          console.log('✅ Created writing-sessions store');
        }
      };
    });
  }

  // Helper to execute DB operation and auto-close
  async executeOperation<T>(
    operation: (db: IDBDatabase) => Promise<T>
  ): Promise<T> {
    const db = await this.openDB();
    try {
      return await operation(db);
    } finally {
      db.close();
    }
  }
}

export const dbService = DBService.getInstance();
