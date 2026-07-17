import { readDB, writeDB } from './db.js';

export default function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send('Missing QR Code ID');
  }

  const db = readDB();
  const qr = db.dynamicQRs[id];

  if (!qr) {
    return res.status(404).send('QR Code Not Found');
  }

  // Parse headers for analytics
  const userAgent = req.headers['user-agent'] || '';
  let device = 'Desktop';
  if (/mobile/i.test(userAgent)) device = 'Mobile';
  else if (/ipad|tablet/i.test(userAgent)) device = 'Tablet';

  const country = req.headers['x-vercel-ip-country'] || 'US';

  // Update scans and history
  qr.scans = (qr.scans || 0) + 1;
  if (!qr.history) qr.history = [];
  qr.history.push({
    timestamp: new Date().toISOString(),
    device,
    country,
  });

  db.dynamicQRs[id] = qr;
  writeDB(db);

  // Perform redirect
  res.writeHead(302, { Location: qr.targetUrl });
  res.end();
}
