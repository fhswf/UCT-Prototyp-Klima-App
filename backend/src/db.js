import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error(
        'DATABASE_URL ist nicht gesetzt. .env anlegen (siehe .env.example) — ' +
            'die npm-Scripts starten node mit --env-file=.env.',
    );
}

export const pool = new pg.Pool({ connectionString: DATABASE_URL });

// TODO: zweiter Pool (CLIMATE_DATABASE_URL) für die Klimadaten-DB. Die Rasterzelle
// wird dann über ST_Contains aus location/geom aufgelöst, nicht mehr gespeichert.

/* Query */
export const q   = async (text, params = []) => (await pool.query(text, params)).rows;
export const one = async (text, params = []) => (await pool.query(text, params)).rows[0] ?? null;
