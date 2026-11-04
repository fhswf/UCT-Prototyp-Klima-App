import { Router } from 'express';
import { q, one } from '../db.js';

const router = Router();

/* POI-Liste */
const LIST_COLS = `
    p.id, t.key AS type, t.icon,
    ST_AsGeoJSON(p.geom)::json AS geom
`;

// vollständige Info-Card-Daten für einen POI.
const DETAIL_COLS = `
    p.id, p.name, p.description, p.image_url, p.address,
    t.key AS type, t.name AS type_name, t.icon,
    ST_AsGeoJSON(p.geom)::json AS geom
`;

/* POI-Details */
const toMarker = (row) => ({
    type: 'Feature',
    geometry: row.geom,
    properties: {
        id: row.id,
        type: row.type,
        icon: row.icon,
    },
});

const toFeature = (row) => ({
    type: 'Feature',
    geometry: row.geom,
    properties: {
        id: row.id,
        name: row.name,
        description: row.description,
        image_url: row.image_url,
        address: row.address,
        type: row.type,
        type_name: row.type_name,
        icon: row.icon,
    },
});

/* Alle POIs als GeoJSON-FeatureCollection */
router.get('/', async (req, res, next) => {
    try {
        const rows = await q(`
            SELECT ${LIST_COLS}
            FROM pois p
            JOIN poi_types t ON t.id = p.type_id
            ORDER BY t.sort, p.id
        `);
        res.json({
            type: 'FeatureCollection',
            features: rows.map(toMarker),
        });
    } catch (err) {
        next(err);
    }
});

/* Einzelner POI Info-Card-Daten */
router.get('/:id', async (req, res, next) => {
    try {
        const row = await one(`
            SELECT ${DETAIL_COLS}
            FROM pois p
            JOIN poi_types t ON t.id = p.type_id
            WHERE p.id = $1
        `, [Number(req.params.id)]);
        if (!row) return res.status(404).json({ error: 'POI not found' });
        res.json(toFeature(row));
    } catch (err) {
        next(err);
    }
});

export default router;
