export const parseJSON = (s, fallback = null) => {
    if (s == null) return fallback;
    if (typeof s === 'object') return s; // pg liefert jsonb/json bereits als Objekt
    try { return JSON.parse(s); } catch { return fallback; }
};

export const serializeRoute = (r) => ({
    id: r.id,
    label: r.label,
    name: r.name,
    short_text: r.short_text,
    body: parseJSON(r.body),
    thumbnail_url: r.thumbnail_url,
    distance_km: r.distance_km,
    duration_min: r.duration_min,
    difficulty: r.difficulty ?? null,          // 'leicht' | 'mittel' | 'schwer' | null
    audiences: parseJSON(r.audiences, []),     // [{ key, name }]
    category: r.category_key                    // { key, name } | null
        ? { key: r.category_key, name: r.category_name }
        : null,
});

export const serializeLocation = (l) => ({
    id: l.id,
    label: l.label,
    name: l.name,
    short_text: l.short_text,
    body: parseJSON(l.body),
    thumbnail_url: l.thumbnail_url,
    aerial_url: l.aerial_url,
    station_number: l.station_number,
    in_klima_quartett: l.in_klima_quartett,
    featured: l.featured,
    location: parseJSON(l.location),
});

export const serializeTopic = (t) => ({
    id: t.id,
    label: t.label,
    name: t.name,
    summary: t.summary,
    body: parseJSON(t.body),
    thumbnail_url: t.thumbnail_url,
    action_title: t.action_title,
    action_body: parseJSON(t.action_body),
    action_image_url: t.action_image_url,
});
