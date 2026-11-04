import { Router } from 'express';
import { q } from '../db.js';

const router = Router();

/* Warnungen in Frontend-Form */
const toWarning = (r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    severity: r.severity,
    action: r.action_icon || r.action_text ? { icon: r.action_icon, text: r.action_text } : null,
    help: r.help ?? null,
    text: r.tips ?? [],
});

/* Alle aktiven Warnungen in Frontend-Form */
router.get('/', async (req, res, next) => {
    try {
        const rows = await q(`
            SELECT w.id, w.title, w.description, w.severity,
                   w.action_icon, w.action_text, w.help,
                   COALESCE((
                       SELECT json_agg(json_build_object(
                           'id', t.id, 'heading', t.heading, 'text', t.text, 'icon', t.icon
                       ) ORDER BY t.sort, t.id)
                       FROM warning_tips t WHERE t.warning_id = w.id
                   ), '[]') AS tips
            FROM warnings w
            WHERE w.active = true
              AND (w.valid_from IS NULL OR w.valid_from <= now())
              AND (w.valid_to   IS NULL OR w.valid_to   >  now())
            ORDER BY
                CASE w.severity WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
                w.id
        `);
        res.json(rows.map(toWarning));
    } catch (e) { next(e); }
});

export default router;
