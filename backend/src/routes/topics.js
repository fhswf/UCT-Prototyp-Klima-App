import { Router } from 'express';
import { q, one } from '../db.js';
import { serializeTopic } from '../lib/serialize.js';

const router = Router();

/* Themen-Liste */
router.get('/', async (req, res, next) => {
    try {
        const rows = await q('SELECT id, label, name, summary, featured FROM topics ORDER BY id');
        res.json(rows);
    } catch (e) { next(e); }
});

/* Themen-Details */
router.get('/:id', async (req, res, next) => {
    try {
        const t = await one('SELECT * FROM topics WHERE id = $1', [Number(req.params.id)]);
        if (!t) return res.status(404).json({ error: 'topic not found' });
        res.json(serializeTopic(t));
    } catch (e) { next(e); }
});

export default router;
