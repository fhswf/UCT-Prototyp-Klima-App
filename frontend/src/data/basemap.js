// Amtliche Basiskarte der Vermessungsverwaltungen (basemap.de / BKG), dl-de/by-2-0.
// Varianten: bm_web_col (farbig), bm_web_gry (grau), bm_web_top (topographisch).
export const basemap = {
  styleUrl:
    import.meta.env.VITE_BASEMAP_STYLE ??
    'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_col.json',

  show3dBuildings: true,
  buildings3dLayers: ['Gebaeude3D_nicht_oeffentlich', 'Gebaeude3D_oeffentlich', 'Gebaeude3D_Treibhaus'],
  hiddenLayers: ['Hauskoordinate'],
}
