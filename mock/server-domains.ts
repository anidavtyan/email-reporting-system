import * as express from 'express';
import { MOCK_DOMAINS } from './data/domains.mock';

function simulateDelay(minMs = 100, maxMs = 500): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((res) => setTimeout(res, delay));
}
const app = express();
const PORT = process.env.DOMAIN_API_PORT || 8001;

// --- Domain Endpoints ---

// GET all domains
app.get('/api/domains', async (_req, res) => {
  console.log('GET /api/domains');
  await simulateDelay();
  res.json(MOCK_DOMAINS);
});

// GET domain by id
app.get('/api/domains/:id', async (req, res) => {
  console.log(`GET /api/domains/${req.params.id}`);
  await simulateDelay();
  const domain = MOCK_DOMAINS.find((d) => d.id === req.params.id);
  if (!domain) return res.status(404).json({ message: 'Domain not found' });
  res.json(domain);
});

// Start server
app.listen(PORT, () =>
  console.log(`Mock Domains API server running on http://localhost:${PORT}`),
);
