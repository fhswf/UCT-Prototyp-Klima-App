# Klima-Walk-App - Urban Climate Twin Soest

Die Urban-Climate-Twin-Soest-App begleitet die Nutzerinnen und Nutzer sowohl während der Klima-Walks als auch bei der eigenständigen Erkundung der Stadt. Eine interaktive Karte zeigt die eigene Position, die Routen und die verschiedenen Klima-Standorte. Dort lassen sich aktuelle Klimadaten abrufen und Informationen zu einzelnen Orten entdecken. 

## Urban Climate Twin Soest

 [Urban Climate Twin (UCT) Soest](https://www.fh-swf.de/de/forschung___transfer_4/forschungsprojekte_1/forschungsprojekt_uct.php) ist ein digitaler Zwilling des Soester Stadtklimas. Er führt Messdaten, Geodaten und weitere Klimadaten zusammen und macht das Stadklima räumlich nachvollziehbar. Bürger und die Stadtverwaltung können so die Auswirkungen von Klimaveränderungen auf das Stadtgebiet besser verstehen und Maßnahmen zur Anpassung an den Klimawandel entwickeln.

## Funktionen
 
- **Legende = Layer-Schalter:** Jede Zeile blendet den zugehörigen Layer ein oder aus
- **Interaktion:** Ein Klick auf einen Standort öffnet die Standortseite, ein Klick auf einen POI eine Info-Karte
- **Klima-Widget** mit den Kategorien Temperatur, Wasser, Begrünung und Sonne sowie Informationen zum UCT-Projekt (Messstation oder KI-extrapolierte Werte)
- **Warnungen:** Aktive Hitzewarnungen aus der Datenbank erscheinen als Overlay mit seitenweisen Verhaltenstipps.
- **Eigener Standort** wird als Punkt mit Blickrichtung dargestellt
- **Kartenführung:** Die Karte folgt dem Nutzer, geneigt und in Blickrichtung ausgerichtet
- **Ankunft:** Innerhalb von 12 m um einen Stopp wird dieser automatisch abgehakt. Stopps lassen sich zusätzlich manuell abhaken
- **Abschluss:** Sind alle Stopps besucht, wird der Walk abgeschlossen und das Badge freigeschaltet

## CMS (Directus)
 
- Feste Komponente, Teil der Docker Compose.
- Dient nur der Datenpflege und wird nicht als API-Middleware genutzt. Die App liest direkt aus der Datenbank.


## Lizenz

Copyright 2026 Marius Kroel, Fachhochschule Südwestfalen

Lizenziert unter der [EUPL-1.2](LICENSE) (European Union Public Licence).