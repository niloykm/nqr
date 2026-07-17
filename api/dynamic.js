import { readDB, writeDB } from './db.js';

export default function handler(req, res) {
  const db = readDB();
  const userId = req.headers['x-user-id'] || 'mock-user-id'; // Fallback for simple user session

  if (req.method === 'GET') {
    const { id } = req.query;
    if (id) {
      const qr = db.dynamicQRs[id];
      if (!qr) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(qr);
    }
    // Return all dynamic codes for user
    const qrs = Object.values(db.dynamicQRs).filter(item => item.userId === userId);
    return res.status(200).json(qrs);
  }

  if (req.method === 'POST') {
    const { name, targetUrl } = req.body;
    if (!name || !targetUrl) {
      return res.status(400).json({ error: 'Missing name or target URL' });
    }

    const id = Math.random().toString(36).substring(2, 9);
    const newQR = {
      id,
      userId,
      name,
      targetUrl,
      createdAt: new Date().toISOString(),
      scans: 0,
      history: [],
    };

    db.dynamicQRs[id] = newQR;
    writeDB(db);
    return res.status(201).json(newQR);
  }

  if (req.method === 'PUT') {
    const { id, name, targetUrl } = req.body;
    if (!id || !db.dynamicQRs[id]) {
      return res.status(404).json({ error: 'QR Code not found' });
    }

    if (name) db.dynamicQRs[id].name = name;
    if (targetUrl) db.dynamicQRs[id].targetUrl = targetUrl;

    writeDB(db);
    return res.status(200).json(db.dynamicQRs[id]);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id || !db.dynamicQRs[id]) {
      return res.status(404).json({ error: 'QR Code not found' });
    }

    delete db.dynamicQRs[id];
    writeDB(db);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
