import { readFileSync } from 'node:fs';
import { pool } from '../db.js';

const file = process.argv[2];
if (!file) {
    console.error('Aufruf: node src/scripts/apply-sql.js <datei.sql>');
    process.exit(1);
}

try {
    await pool.query(readFileSync(file, 'utf8'));
    console.log(`${file} eingespielt`);
} catch (e) {
    console.error(`${file}: ${e.message}`);
    process.exitCode = 1;
} finally {
    await pool.end();
}
