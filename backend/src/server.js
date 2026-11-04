import express from 'express';
import routesRouter from './routes/routes.js';
import locationsRouter from './routes/locations.js';
import topicsRouter from './routes/topics.js';
import poisRouter from './routes/pois.js';
import warningsRouter from './routes/warnings.js';
import tilesRouter from './routes/tiles.js';
import { pool } from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Hinter dem Ingress laufen Frontend und API same-origin — dort CORS_ORIGIN leer setzen,
// dann entfällt der Header ganz.
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? '*';

app.use((req, res, next) => {
    if (CORS_ORIGIN) {
        res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
        res.setHeader('Access-Control-Expose-Headers', 'ETag');
        res.setHeader('Access-Control-Allow-Headers', 'If-None-Match');
        if (req.method === 'OPTIONS') return res.sendStatus(204);
    }
    next();
});

/* REST-API + Tile-Proxy */
app.get('/', (req, res) => {
    res.json({
        name: 'klima-api',
        version: '1.0.0',
        endpoints: [
            '/api/v1/routes',
            '/api/v1/locations',
            '/api/v1/topics',
            '/api/v1/pois',
            '/api/v1/warnings',
            '/tiles',
        ],
    });
});

app.use('/api/v1/routes', routesRouter);
app.use('/api/v1/locations', locationsRouter);
app.use('/api/v1/topics', topicsRouter);
app.use('/api/v1/pois', poisRouter);
app.use('/api/v1/warnings', warningsRouter);
app.use('/tiles', tilesRouter);

app.use((req, res) => res.status(404).json({ error: 'not found' }));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
});

const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
        server.close(async () => {
            await pool.end();
            process.exit(0);
        });
    });
}