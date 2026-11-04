import { Router } from 'express';

/* Martin-URL */
const MARTIN_URL = (process.env.MARTIN_URL || 'http://martin:3000').replace(/\/$/, '');

const router = Router();

// Katalog aller Quellen
router.get('/catalog', async (req, res, next) => {
    try {
        const r = await fetch(`${MARTIN_URL}/catalog`);
        res.status(r.status).type('application/json').send(await r.text());
    } catch (e) { next(e); }
});

// TileJSON
router.get('/:source', async (req, res, next) => {
    try {
        const r = await fetch(`${MARTIN_URL}/${encodeURIComponent(req.params.source)}`);
        res.status(r.status).type('application/json').send(await r.text());
    } catch (e) { next(e); }
});

// Einzelne Vector Tile
router.get('/:source/:z/:x/:y', async (req, res, next) => {
    try {
        const { source, z, x } = req.params;
        const y = String(req.params.y).replace(/\.pbf$/, '');
        const r = await fetch(`${MARTIN_URL}/${encodeURIComponent(source)}/${z}/${x}/${y}`, {
            headers: { 'accept-encoding': 'identity' },
        });
        if (r.status === 204 || r.status === 404) return res.status(r.status).end();
        if (!r.ok) return res.status(r.status).end();
        res.set('Content-Type', r.headers.get('content-type') || 'application/x-protobuf');
        res.send(Buffer.from(await r.arrayBuffer()));
    } catch (e) { next(e); }
});

export default router;
