import { Router } from 'express';
import { q, one } from '../db.js';
import { serializeLocation } from '../lib/serialize.js';

const router = Router();

// vollständige Spaltenliste inkl. Geometrie -> GeoJSON (ST_AsGeoJSON)
const COLS = `
    id, label, name, short_text, body, thumbnail_url, aerial_url,
    station_number, in_klima_quartett, featured,
    ST_AsGeoJSON(location)::json AS location
`;

/* Standort-Liste */
const LIST_COLS = `
    l.id, l.name, l.station_number, l.in_klima_quartett, l.featured,
    ST_AsGeoJSON(l.location)::json AS location
`;

/* Zielgruppen eines Standorts, aggregiert aus allen vorbeiführenden Walks */
const LOCATION_AUDIENCES = `
    COALESCE((
        SELECT json_agg(DISTINCT jsonb_build_object('key', a.key, 'name', a.name))
        FROM route_stops rs
        JOIN route_target_audiences rta ON rta.route_id = rs.route_id
        JOIN target_audiences a         ON a.id = rta.audience_id
        WHERE rs.location_id = l.id
    ), '[]') AS audiences
`;

/* Standort-Liste */
router.get('/', async (req, res, next) => {
    try {
        const rows = await q(`
            SELECT ${LIST_COLS}, ${LOCATION_AUDIENCES}
            FROM walk_locations l
            ORDER BY l.station_number NULLS LAST, l.id
        `);
        res.json(rows.map(r => ({
            id: r.id,
            name: r.name,
            station_number: r.station_number,
            in_klima_quartett: r.in_klima_quartett,
            featured: r.featured,
            audiences: r.audiences,     // [{ key, name }]
            location: r.location,
        })));
    } catch (e) { next(e); }
});

/* Standort-Details */
router.get('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const l = await one(`SELECT ${COLS} FROM walk_locations WHERE id = $1`, [id]);
        if (!l) return res.status(404).json({ error: 'location not found' });

        const routeRow = await one(`
            SELECT r.id FROM routes r
            JOIN route_stops rs ON rs.route_id = r.id
            WHERE rs.location_id = $1
            LIMIT 1
        `, [id]);

        res.json({
            ...serializeLocation(l),
            route_id: routeRow ? routeRow.id : null,
            route_url: routeRow ? `/api/v1/routes/${routeRow.id}` : null,
        });
    } catch (e) { next(e); }
});

/* Alle Walks die an dieser Standort-ID halten */
router.get('/:id/routes', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const rows = await q(`
            SELECT r.id, r.label, r.name, r.short_text, r.thumbnail_url,
                   r.distance_km, r.duration_min,
                   c.key AS category_key, c.name AS category_name,
                   ST_AsGeoJSON(r.route_points)::json AS route_points,
                   COALESCE((
                       SELECT json_agg(json_build_object(
                           'stop_index',    rs.stop_index,
                           'id',            l.id,
                           'label',         l.label,
                           'name',          l.name,
                           'short_text',    l.short_text,
                           'thumbnail_url', l.thumbnail_url,
                           'aerial_url',    l.aerial_url,
                           'location',      ST_AsGeoJSON(l.location)::json
                       ) ORDER BY rs.stop_index)
                       FROM route_stops rs
                       JOIN walk_locations l ON l.id = rs.location_id
                       WHERE rs.route_id = r.id
                   ), '[]') AS stops
            FROM routes r
            LEFT JOIN walk_categories c ON c.id = r.category_id
            WHERE EXISTS (
                SELECT 1 FROM route_stops rs
                WHERE rs.route_id = r.id AND rs.location_id = $1
            )
            ORDER BY r.id
        `, [id]);

        res.json({
            type: 'FeatureCollection',
            features: rows
                .filter(r => r.route_points)
                .map(r => ({
                    type: 'Feature',
                    geometry: r.route_points,
                    properties: {
                        id: r.id,
                        label: r.label,
                        name: r.name,
                        short_text: r.short_text,
                        thumbnail_url: r.thumbnail_url,
                        distance_km: r.distance_km,
                        duration_min: r.duration_min,
                        category: r.category_key
                            ? { key: r.category_key, name: r.category_name }
                            : null,
                        stops: r.stops,
                    },
                })),
        });
    } catch (e) { next(e); }
});

export default router;
