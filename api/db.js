import fs from 'fs';
import path from 'path';

// Use /tmp for writable storage in Vercel environment
const DB_FILE = path.join('/tmp', 'nqr_db.json');

// Helper to read database
export function readDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read database file', err);
  }

  // Return default mock database structure
  return {
    users: {},
    dynamicQRs: {
      'sample-id': {
        id: 'sample-id',
        userId: 'mock-user-id',
        name: 'My Portfolio',
        targetUrl: 'https://niloykm.vercel.app/',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        scans: 124,
        history: [
          { timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), device: 'Mobile', country: 'BD' },
          { timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), device: 'Desktop', country: 'US' },
          { timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), device: 'Mobile', country: 'GB' },
          { timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), device: 'Tablet', country: 'JP' },
        ],
      }
    },
  };
}

// Helper to write database
export function writeDB(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write database file', err);
  }
}
