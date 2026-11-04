import { readFileSync } from 'node:fs';
import { pool } from '../db.js';

const files = ['db/schema.sql', 'db/seed.sql'];

try {
    const { rows } = await pool.query("SELECT to_regclass('public.walk_categories') AS t");

    if (rows[0].t) {
        console.log('Schema bereits vorhanden - nichts zu tun');
    } else {
        for (const file of files) {
            await pool.query(readFileSync(file, 'utf8'));
            console.log(`${file} eingespielt`);
        }
    }
} catch (e) {
    console.error(`Initialisierung fehlgeschlagen: ${e.message}`);
    process.exitCode = 1;
} finally {
    await pool.end();
}
