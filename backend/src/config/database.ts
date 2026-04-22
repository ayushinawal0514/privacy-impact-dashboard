import { MongoClient, Db } from 'mongodb';

let db: Db | null = null;
let client: MongoClient | null = null;

export const connectDB = async (): Promise<Db> => {
  if (db) return db;

  try {
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://mongodb:27017/healthcare-compliance';

    client = new MongoClient(mongoUri);
    await client.connect();

    db = client.db('healthcare-compliance');

    await initializeDatabase(db);

    console.log('Connected DB name:', db.databaseName);

    return db;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

export const getDB = (): Db => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return db;
};

export const closeDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    db = null;
    client = null;
  }
};

const initializeDatabase = async (database: Db): Promise<void> => {
  const collections = [
    'users',
    'privacy_risks',
    'access_logs',
    'compliance_reports',
    'audit_logs',
    'alerts',
    'anomalies',
    'policies',
    'data_flows',
    'risk_assessments',
    'ml_models',
    'audit_reports',
    'uploaded_data',
    'dataset_analysis',
    'analysis_results'
  ];

  for (const collectionName of collections) {
    try {
      await database.createCollection(collectionName);
    } catch (error: any) {
      if (error.codeName !== 'NamespaceExists') {
        throw error;
      }
    }
  }

  const usersCollection = database.collection('users');
  await usersCollection.createIndex({ email: 1 }, { unique: true });
  await usersCollection.createIndex({ role: 1 });

  const accessLogsCollection = database.collection('access_logs');
  await accessLogsCollection.createIndex({ userId: 1, timestamp: -1 });
  await accessLogsCollection.createIndex({ timestamp: -1 });
  await accessLogsCollection.createIndex({ dataType: 1 });

  const complianceReportsCollection = database.collection('compliance_reports');
  await complianceReportsCollection.createIndex({ createdAt: -1 });
  await complianceReportsCollection.createIndex({ status: 1 });

  const alertsCollection = database.collection('alerts');
  await alertsCollection.createIndex({ createdAt: -1 });
  await alertsCollection.createIndex({ severity: 1 });
  await alertsCollection.createIndex({ resolved: 1 });
};