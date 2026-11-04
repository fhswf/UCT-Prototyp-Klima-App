// Platzhalter-Daten für das ClimateWidget.
// Form = das, was später pro Standort aus der API/dem Schema kommen soll.
// stats[].highlighted -> grüne Hervorhebung (Daten-Flag, kein Zebra).
//
// UCT-Tab: Icon + Hinweistext hängen davon ab, ob am Standort eine echte
// Messstation steht (hasSensor) oder die Daten KI-simuliert sind.

// icon-Werte = SVG-Namen aus src/assets/icons/ (gerendert über AppIcon).
export const climateCategories = [
  {
    key: 'temp',
    label: 'Temperatur',
    icon: 'temperatur',
    stats: [
      {
        key: 'maxTemp',
        icon: 'maximale-temperatur',
        label: 'Maximale Temperatur',
        value: '39°C',
        highlighted: true,
        help: 'Höchster gemessener Wert im letzten Jahr.',
      },
      {
        key: 'minTemp',
        icon: 'minimale-temperatur',
        label: 'Minimale Temperatur',
        value: '39°C',
        highlighted: false,
        help: 'Niedrigster gemessener Wert im letzten Jahr.',
      },
      {
        key: 'avgTemp',
        icon: 'durchschnittliche-temperatur',
        label: 'Durchschnittliche Temperatur',
        value: '39°C',
        highlighted: true,
        help: 'Jahresmittel der Lufttemperatur.',
      },
      {
        key: 'trendTemp',
        icon: 'temperaturwandel',
        label: 'Temperaturtrend über 10 Jahre',
        value: '39°C',
        highlighted: true,
        help: 'Veränderung des Mittels über zehn Jahre.',
      },
    ],
  },
  {
    key: 'water',
    label: 'Wasser',
    icon: 'wasser',
    stats: [
      {
        key: 'floodRisk',
        icon: 'hochwasser',
        label: 'Überschwemmungsrisiko',
        value: 'niedrig',
        highlighted: true,
        help: 'Geschätztes Risiko bei Starkregen.',
      },
      {
        key: 'sealing',
        icon: 'versiegelung',
        label: 'Versiegelungsgrad',
        value: '100%',
        highlighted: true,
        help: 'Anteil versiegelter Fläche.',
      },
    ],
  },
  {
    key: 'green',
    label: 'Begrünung',
    icon: 'baum',
    stats: [
      {
        key: 'shielding',
        icon: 'baum',
        label: 'Beschirmung',
        value: '38%',
        highlighted: false,
        help: 'Anteil der von Vegetation beschatteten Fläche.',
      },
    ],
  },
  {
    key: 'sun',
    label: 'Sonne',
    icon: 'sonne',
    stats: [
      {
        key: 'albedo',
        icon: 'albedo',
        label: 'Albedo',
        value: '0,8',
        highlighted: false,
        help: 'Rückstrahlvermögen der Oberfläche.',
      },
    ],
  },
  {
    key: 'uct',
    label: 'UCT-Projekt',
    iconSensor: 'messstation',
    iconKi: 'gluehbirne',
    info: {
      title: 'Wusstest du...?',
      text: 'Das Projekt Urban Climate Twin nutzt Messstationen, die in der Stadt Soest verteilt sind und Klimadaten aufzeichnen. Durch Künstliche Intelligenz können diese Daten auch für jeden anderen Standort simuliert werden.',
      noticeSensor: 'Hier befindet sich eine Messstation, die reale Klimadaten erfasst.',
      noticeKi: 'Die Klimadaten dieses Standorts wurden mithilfe von KI generiert.',
      link: '',
    },
  },
]
