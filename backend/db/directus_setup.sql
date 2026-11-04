-- Directus-Konfiguration der Klima-App: Collections, Feld-Interfaces, Relationen.

BEGIN;

DELETE FROM directus_relations   WHERE many_collection = ANY(ARRAY['walk_categories','target_audiences','poi_types','topics','walk_locations','routes','route_stops','route_target_audiences','pois','warnings','warning_tips']);
DELETE FROM directus_fields      WHERE collection      = ANY(ARRAY['walk_categories','target_audiences','poi_types','topics','walk_locations','routes','route_stops','route_target_audiences','pois','warnings','warning_tips']);
DELETE FROM directus_collections WHERE collection      = ANY(ARRAY['walk_categories','target_audiences','poi_types','topics','walk_locations','routes','route_stops','route_target_audiences','pois','warnings','warning_tips']);

-- Collections
INSERT INTO directus_collections ("collection", "icon", "note", "display_template", "hidden", "singleton", "archive_app_filter", "accountability", "color", "sort", "group", "collapse") VALUES
    ('poi_types', 'category', NULL, NULL, false, false, true, 'all', NULL, 1, 'pois', 'open'),
    ('route_stops', 'airline_stops', NULL, NULL, true, false, true, 'all', NULL, 1, 'routes', 'open'),
    ('walk_locations', 'local_see', NULL, 'Standort {{station_number}} – {{name}}', false, false, true, 'all', NULL, 1, NULL, 'open'),
    ('warning_tips', 'info', NULL, NULL, false, false, true, 'all', NULL, 1, 'warnings', 'open'),
    ('routes', 'route', NULL, '{{name}}', false, false, true, 'all', NULL, 2, NULL, 'open'),
    ('target_audiences', 'groups', NULL, NULL, false, false, true, 'all', NULL, 2, 'routes', 'open'),
    ('route_target_audiences', 'groups', NULL, NULL, false, false, true, 'all', NULL, 3, 'routes', 'open'),
    ('topics', 'article', NULL, NULL, false, false, true, 'all', NULL, 3, NULL, 'open'),
    ('walk_categories', 'category', NULL, NULL, false, false, true, 'all', NULL, 3, 'routes', 'open'),
    ('pois', 'place', NULL, NULL, false, false, true, 'all', NULL, 4, NULL, 'open'),
    ('warnings', 'warning', NULL, '{{title}} {{valid_from}} - {{valid_to}}', false, false, true, 'all', NULL, 5, NULL, 'open');

-- Feld-Interfaces
INSERT INTO directus_fields ("collection", "field", "special", "interface", "options", "display", "display_options", "readonly", "hidden", "sort", "width", "required", "conditions", "note") VALUES
    ('pois', 'created_at', NULL, 'datetime', NULL, NULL, NULL, false, true, NULL, 'full', false, NULL, NULL),
    ('pois', 'type_id', NULL, 'select-dropdown-m2o', '{"template":"{{name}}"}'::json, NULL, NULL, false, false, NULL, 'full', false, NULL, NULL),
    ('routes', 'stops', 'm2m', 'list-m2m', NULL, 'related-values', '{"template":"{{location_id.name}}"}'::json, false, false, 1, 'full', false, NULL, NULL),
    ('routes', 'audiences', 'm2m', 'list-m2m', NULL, 'related-values', '{"template":"{{audience_id.name}}"}'::json, false, false, 2, 'full', false, NULL, NULL),
    ('routes', 'body', 'cast-json', 'list', '{"addLabel":"Block hinzufügen","template":"{{type}}: {{value}}","fields":[{"field":"type","name":"Block-Typ","type":"string","meta":{"field":"type","type":"string","interface":"select-dropdown","width":"half","options":{"choices":[{"text":"Überschrift","value":"heading"},{"text":"Text","value":"text"},{"text":"Bild","value":"image"}]}}},{"field":"value","name":"Text / Überschrift","type":"text","meta":{"field":"value","type":"text","interface":"input-multiline","width":"full","conditions":[{"name":"nur Text/Überschrift","rule":{"type":{"_in":["heading","text"]}},"hidden":false},{"name":"bei Bild aus","rule":{"type":{"_eq":"image"}},"hidden":true}]}},{"field":"url","name":"Bild-URL (lokaler Pfad, z. B. /media/…)","type":"string","meta":{"field":"url","type":"string","interface":"input","width":"full","options":{"placeholder":"/media/route-1/bild.jpg"},"conditions":[{"name":"nur Bild","rule":{"type":{"_eq":"image"}},"hidden":false},{"name":"sonst aus","rule":{"type":{"_in":["heading","text"]}},"hidden":true}]}},{"field":"alt","name":"Alt-Text (Barrierefreiheit)","type":"string","meta":{"field":"alt","type":"string","interface":"input","width":"full","conditions":[{"name":"nur Bild","rule":{"type":{"_eq":"image"}},"hidden":false},{"name":"sonst aus","rule":{"type":{"_in":["heading","text"]}},"hidden":true}]}}]}'::json, NULL, NULL, false, false, NULL, 'full', false, NULL, NULL),
    ('routes', 'category_id', NULL, 'select-dropdown-m2o', '{"template":"{{name}}"}'::json, NULL, NULL, false, false, NULL, 'full', false, NULL, NULL),
    ('routes', 'created_at', NULL, 'datetime', NULL, NULL, NULL, false, true, NULL, 'full', false, NULL, NULL),
    ('routes', 'id', NULL, NULL, NULL, NULL, NULL, true, false, NULL, 'full', false, NULL, NULL),
    ('route_stops', 'location_id', NULL, 'select-dropdown-m2o', '{"template":"{{name}}"}'::json, NULL, NULL, false, false, NULL, 'full', false, NULL, NULL),
    ('route_stops', 'route_id', NULL, 'select-dropdown-m2o', '{"template":"{{label}}-{{name}}"}'::json, NULL, NULL, false, false, NULL, 'full', false, NULL, NULL),
    ('route_target_audiences', 'audience_id', NULL, 'select-dropdown-m2o', '{"template":"{{name}}"}'::json, NULL, NULL, false, false, NULL, 'full', false, NULL, NULL),
    ('route_target_audiences', 'route_id', NULL, 'select-dropdown-m2o', '{"template":"{{label}}-{{name}}"}'::json, NULL, NULL, false, false, NULL, 'full', false, NULL, NULL),
    ('topics', 'body', 'cast-json', 'list', '{"addLabel":"Block hinzufügen","template":"{{type}}: {{value}}","fields":[{"field":"type","name":"Block-Typ","type":"string","meta":{"field":"type","type":"string","interface":"select-dropdown","width":"half","options":{"choices":[{"text":"Überschrift","value":"heading"},{"text":"Text","value":"text"},{"text":"Bild","value":"image"}]}}},{"field":"value","name":"Text / Überschrift","type":"text","meta":{"field":"value","type":"text","interface":"input-multiline","width":"full","conditions":[{"name":"nur Text/Überschrift","rule":{"type":{"_in":["heading","text"]}},"hidden":false},{"name":"bei Bild aus","rule":{"type":{"_eq":"image"}},"hidden":true}]}},{"field":"url","name":"Bild-URL (lokaler Pfad, z. B. /media/…)","type":"string","meta":{"field":"url","type":"string","interface":"input","width":"full","options":{"placeholder":"/media/route-1/bild.jpg"},"conditions":[{"name":"nur Bild","rule":{"type":{"_eq":"image"}},"hidden":false},{"name":"sonst aus","rule":{"type":{"_in":["heading","text"]}},"hidden":true}]}},{"field":"alt","name":"Alt-Text (Barrierefreiheit)","type":"string","meta":{"field":"alt","type":"string","interface":"input","width":"full","conditions":[{"name":"nur Bild","rule":{"type":{"_eq":"image"}},"hidden":false},{"name":"sonst aus","rule":{"type":{"_in":["heading","text"]}},"hidden":true}]}}]}'::json, NULL, NULL, false, false, 5, 'full', false, NULL, NULL),
    ('topics', 'action_body', 'cast-json', 'list', '{"addLabel":"Block hinzufügen","template":"{{type}}: {{value}}","fields":[{"field":"type","name":"Block-Typ","type":"string","meta":{"field":"type","type":"string","interface":"select-dropdown","width":"half","options":{"choices":[{"text":"Überschrift","value":"heading"},{"text":"Text","value":"text"},{"text":"Bild","value":"image"}]}}},{"field":"value","name":"Text / Überschrift","type":"text","meta":{"field":"value","type":"text","interface":"input-multiline","width":"full","conditions":[{"name":"nur Text/Überschrift","rule":{"type":{"_in":["heading","text"]}},"hidden":false},{"name":"bei Bild aus","rule":{"type":{"_eq":"image"}},"hidden":true}]}},{"field":"url","name":"Bild-URL (lokaler Pfad, z. B. /media/…)","type":"string","meta":{"field":"url","type":"string","interface":"input","width":"full","options":{"placeholder":"/media/route-1/bild.jpg"},"conditions":[{"name":"nur Bild","rule":{"type":{"_eq":"image"}},"hidden":false},{"name":"sonst aus","rule":{"type":{"_in":["heading","text"]}},"hidden":true}]}},{"field":"alt","name":"Alt-Text (Barrierefreiheit)","type":"string","meta":{"field":"alt","type":"string","interface":"input","width":"full","conditions":[{"name":"nur Bild","rule":{"type":{"_eq":"image"}},"hidden":false},{"name":"sonst aus","rule":{"type":{"_in":["heading","text"]}},"hidden":true}]}}]}'::json, NULL, NULL, false, false, 8, 'full', false, NULL, NULL),
    ('topics', 'created_at', NULL, 'datetime', NULL, NULL, NULL, false, true, NULL, 'full', false, NULL, NULL),
    ('walk_locations', 'id', NULL, NULL, NULL, NULL, NULL, false, false, 1, 'full', false, NULL, NULL),
    ('walk_locations', 'label', NULL, NULL, NULL, NULL, NULL, false, false, 2, 'full', false, NULL, NULL),
    ('walk_locations', 'name', NULL, NULL, NULL, NULL, NULL, false, false, 3, 'full', false, NULL, NULL),
    ('walk_locations', 'short_text', NULL, 'input-multiline', NULL, NULL, NULL, false, false, 4, 'full', false, NULL, NULL),
    ('walk_locations', 'body', 'cast-json', 'list', '{"addLabel":"Block hinzufügen","template":"{{type}}: {{value}}","fields":[{"field":"type","name":"Block-Typ","type":"string","meta":{"field":"type","type":"string","interface":"select-dropdown","width":"half","options":{"choices":[{"text":"Überschrift","value":"heading"},{"text":"Text","value":"text"},{"text":"Bild","value":"image"}]}}},{"field":"value","name":"Text / Überschrift","type":"text","meta":{"field":"value","type":"text","interface":"input-multiline","width":"full","conditions":[{"name":"nur Text/Überschrift","rule":{"type":{"_in":["heading","text"]}},"hidden":false},{"name":"bei Bild aus","rule":{"type":{"_eq":"image"}},"hidden":true}]}},{"field":"url","name":"Bild-URL (lokaler Pfad, z. B. /media/…)","type":"string","meta":{"field":"url","type":"string","interface":"input","width":"full","options":{"placeholder":"/media/route-1/bild.jpg"},"conditions":[{"name":"nur Bild","rule":{"type":{"_eq":"image"}},"hidden":false},{"name":"sonst aus","rule":{"type":{"_in":["heading","text"]}},"hidden":true}]}},{"field":"alt","name":"Alt-Text (Barrierefreiheit)","type":"string","meta":{"field":"alt","type":"string","interface":"input","width":"full","conditions":[{"name":"nur Bild","rule":{"type":{"_eq":"image"}},"hidden":false},{"name":"sonst aus","rule":{"type":{"_in":["heading","text"]}},"hidden":true}]}}]}'::json, NULL, NULL, false, false, 5, 'full', false, NULL, NULL),
    ('walk_locations', 'thumbnail_url', NULL, NULL, NULL, NULL, NULL, false, false, 6, 'full', false, NULL, NULL),
    ('walk_locations', 'aerial_url', NULL, NULL, NULL, NULL, NULL, false, false, 7, 'full', false, NULL, NULL),
    ('walk_locations', 'station_number', NULL, NULL, NULL, NULL, NULL, false, false, 9, 'full', false, NULL, NULL),
    ('walk_locations', 'address', NULL, 'input', '{"placeholder":"Theodor-Heuss-Park, Walburgerstraße 8"}'::json, NULL, NULL, false, false, 10, 'full', false, NULL, NULL),
    ('walk_locations', 'in_klima_quartett', NULL, 'boolean', NULL, NULL, NULL, false, false, 14, 'full', false, NULL, NULL),
    ('walk_locations', 'created_at', NULL, NULL, NULL, NULL, NULL, false, true, 17, 'full', false, NULL, NULL),
    ('walk_locations', 'location', NULL, 'map', '{"defaultView":{"center":{"lng":8.110770349521545,"lat":51.568224468453224},"zoom":11.743778283767046,"bearing":0,"pitch":0},"geometryType":"Point"}'::json, NULL, NULL, false, false, NULL, 'full', false, NULL, NULL),
    ('walk_locations', 'featured', NULL, 'boolean', NULL, NULL, NULL, false, false, 15, 'full', false, NULL, 'Steuert die Sortierung "Interessanteste zuerst"'),
    ('topics', 'featured', NULL, 'boolean', NULL, NULL, NULL, false, false, 9, 'full', false, NULL, 'Steuert die Sortierung "Interessanteste zuerst"'),
    ('routes', 'difficulty', NULL, 'select-dropdown', '{"choices":[{"text":"Leicht","value":"leicht"},{"text":"Mittel","value":"mittel"},{"text":"Schwer","value":"schwer"}]}'::json, 'labels', NULL, false, false, NULL, 'full', false, NULL, NULL),
    ('warnings', 'severity', NULL, 'select-dropdown', '{"choices":[{"text":"Niedrig","value":"low"},{"text":"Mittel","value":"medium"},{"text":"Hoch","value":"high"}]}'::json, 'labels', NULL, false, false, NULL, 'full', false, NULL, NULL),
    ('routes', 'route_points', NULL, 'map', NULL, NULL, NULL, false, false, NULL, 'full', false, NULL, NULL),
    ('pois', 'geom', NULL, 'map', NULL, NULL, NULL, false, false, NULL, 'full', false, NULL, NULL),
    ('warnings', 'active', NULL, 'boolean', NULL, NULL, NULL, false, false, NULL, 'full', false, NULL, NULL),
    ('warnings', 'help', NULL, 'input-code', '{"language":"json"}'::json, NULL, NULL, false, false, NULL, 'full', false, NULL, '{ heading, tel, text }');

-- Relationen (m2o / m2m)
INSERT INTO directus_relations (many_collection, many_field, one_collection, one_field, junction_field, one_deselect_action) VALUES
    ('route_stops', 'location_id', 'walk_locations', NULL, 'route_id', 'nullify'),
    ('route_stops', 'route_id', 'routes', 'stops', 'location_id', 'delete'),
    ('route_target_audiences', 'audience_id', 'target_audiences', NULL, 'route_id', 'nullify'),
    ('route_target_audiences', 'route_id', 'routes', 'audiences', 'audience_id', 'delete');

COMMIT;
