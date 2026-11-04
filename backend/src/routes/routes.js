import { Router } from 'express';
import { q, one } from '../db.js';
import { serializeRoute, serializeLocation } from '../lib/serialize.js';

const router = Router();

// walk_locations-Spalten inkl. Geometrie -> GeoJSON
const LOC_COLS = `
    l.id, l.label, l.name, l.short_text, l.body, l.thumbnail_url, l.aerial_url,
    ST_AsGeoJSON(l.location)::json AS location
`;

/* Zielgruppen einer Route */
const AUDIENCES_SUBQUERY = `
    COALESCE((
        SELECT json_agg(json_build_object('key', a.key, 'name', a.name) ORDER BY a.sort)
        FROM route_target_audiences rta
        JOIN target_audiences a ON a.id = rta.audience_id
        WHERE rta.route_id = r.id
    ), '[]') AS audiences
`;

/* Stops einer Route */
const LIST_STOPS_SUBQUERY = `
    COALESCE((
        SELECT json_agg(json_build_object(
            'id',             l.id,
            'station_number', l.station_number,
            'location',       ST_AsGeoJSON(l.location)::json
        ) ORDER BY rs.stop_index)
        FROM route_stops rs
        JOIN walk_locations l ON l.id = rs.location_id
        WHERE rs.route_id = r.id
    ), '[]') AS stops
`;

// Alle Routen als GeoJSON FeatureCollection
router.get('/', async (req, res, next) => {
    try {
        const rows = await q(`
            SELECT r.id, r.label, r.name, r.short_text, r.thumbnail_url,
                   r.distance_km, r.duration_min, r.difficulty,
                   c.key AS category_key, c.name AS category_name,
                   ST_AsGeoJSON(r.route_points)::json AS route_points,
                   ${AUDIENCES_SUBQUERY},
                   ${LIST_STOPS_SUBQUERY}
            FROM routes r
            LEFT JOIN walk_categories c ON c.id = r.category_id
            ORDER BY r.id
        `);
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
                        difficulty: r.difficulty,
                        audiences: r.audiences,
                        stops: r.stops,
                        category: r.category_key
                            ? { key: r.category_key, name: r.category_name }
                            : null,
                    },
                })),
        });
    } catch (e) { next(e); }
});

// Eine Route inkl. Stops
router.get('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const r = await one(`
            SELECT r.id, r.label, r.name, r.short_text, r.body, r.thumbnail_url,
                   r.distance_km, r.duration_min, r.difficulty,
                   c.key AS category_key, c.name AS category_name,
                   ST_AsGeoJSON(r.route_points)::json AS route_points,
                   ${AUDIENCES_SUBQUERY},
                   COALESCE((
                       SELECT json_agg(json_build_object(
                           'stop_index',    rs.stop_index,
                           'id',            l.id,
                           'label',         l.label,
                           'name',          l.name,
                           'short_text',    l.short_text,
                           'body',          l.body,
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
            WHERE r.id = $1
        `, [id]);
        if (!r) return res.status(404).json({ error: 'route not found' });

        res.json({
            ...serializeRoute(r),
            route_points: r.route_points,
            stops: r.stops.map(s => ({ stop_index: s.stop_index, ...serializeLocation(s) })),
        });
    } catch (e) { next(e); }
});

// Bestimmter Stop einer Route
router.get('/:id/stop/:stopId', async (req, res, next) => {
    try {
        const row = await one(`
            SELECT rs.stop_index, ${LOC_COLS}
            FROM route_stops rs
            JOIN walk_locations l ON l.id = rs.location_id
            WHERE rs.route_id = $1 AND rs.location_id = $2
        `, [Number(req.params.id), Number(req.params.stopId)]);

        if (!row) return res.status(404).json({ error: 'stop not found' });
        res.json({ stop_index: row.stop_index, ...serializeLocation(row) });
    } catch (e) { next(e); }
});

export default router;
