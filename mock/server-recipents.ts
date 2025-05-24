import * as express from 'express';
import { MOCK_RECIPIENTS } from './data/recipients.mock';

function simulateDelay(minMs = 100, maxMs = 500): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((res) => setTimeout(res, delay));
}
const app = express();
const PORT = process.env.RECIPIENT_API_PORT || 8000;

// GET /notifications
app.get('/api/notifications', async (_req, res) => {
  console.log('GET /api/notifications');
  await simulateDelay();
  res.json(MOCK_RECIPIENTS);
});

// GET /notifications/:id
app.get('/api/notifications/:id', async (req, res) => {
  console.log(`GET /api/notifications/${req.params.id}`);
  await simulateDelay();
  const user = MOCK_RECIPIENTS.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'Recipient not found' });
  res.json(user);
});

// GET /notifications/by-domain?domainId=...
app.get('/api/notifications/by-domain', async (req, res) => {
  const { domainId } = req.query as { domainId?: string };
  console.log(`GET /notifications/by-domain?domainId=${domainId}`);
  if (!domainId)
    return res.status(400).json({ message: 'domainId query is required' });
  await simulateDelay();
  const filtered = MOCK_RECIPIENTS.filter((u) =>
    u.associatedDomains.includes(domainId),
  );
  res.json(filtered);
});

// Start server
app.listen(PORT, () =>
  console.log(`Mock recipients API server running on http://localhost:${PORT}`),
);
