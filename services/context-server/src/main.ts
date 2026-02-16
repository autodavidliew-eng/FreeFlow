import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';

const app = express();

const port = Number(process.env.PORT || 8090);
const host = process.env.HOST || '0.0.0.0';
const contextDir = process.env.CONTEXT_DIR || path.resolve(process.cwd(), 'context');

async function readJson(filePath: string) {
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

app.get('/healthz', (_req, res) => {
  res.json({ ok: true });
});

app.get('/context/freeflow-energy.jsonld', async (_req, res) => {
  try {
    const filePath = path.join(contextDir, 'freeflow-energy.jsonld');
    const json = await readJson(filePath);
    res.setHeader('Content-Type', 'application/ld+json');
    res.json(json);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load context' });
  }
});

app.get('/context/ngsi-ld-core-context.jsonld', async (_req, res) => {
  try {
    const filePath = path.join(contextDir, 'ngsi-ld-core-context.jsonld');
    const json = await readJson(filePath);
    res.setHeader('Content-Type', 'application/ld+json');
    res.json(json);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load core context' });
  }
});

app.get('/context/index.json', async (_req, res) => {
  try {
    const filePath = path.join(contextDir, 'index.json');
    const json = await readJson(filePath);
    res.json(json);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load context index' });
  }
});

app.listen(port, host, () => {
  console.log(`🧭 Context server listening on http://${host}:${port}`);
});
