import { useEffect, useRef, useState } from 'react';
import { Crosshair, Loader2, MapPin, Search, Layers, Check } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google?: any;
    L?: any;
    __gmapsLoaderPromise?: Promise<any>;
    __leafletLoaderPromise?: Promise<any>;
  }
}

export interface MapLocation {
  lat: number;
  lng: number;
  municipio: string;
  departamento: string;
  direccion: string;
}

interface SearchSuggestion {
  label: string;
  lat: number;
  lng: number;
  municipio?: string;
  departamento?: string;
}

interface ColombiaMapPickerProps {
  value?: { lat: number; lng: number } | null;
  onSelect: (loc: MapLocation) => void;
}

/** Límites geográficos de Colombia */
const COLOMBIA_BOUNDS = { north: 13.6, south: -4.3, west: -82.0, east: -66.8 };
const COLOMBIA_CENTER = { lat: 4.5709, lng: -74.2973 };

/** Normaliza direcciones típicas de Colombia para maximizar la exactitud de búsqueda */
function normalizeColombianQuery(query: string): string {
  let s = query.trim();
  // Normalizar nomenclatura colombiana abreviada
  s = s.replace(/\b(cll|cl)\.?\b/gi, 'Calle');
  s = s.replace(/\b(cra|cr|kr)\.?\b/gi, 'Carrera');
  s = s.replace(/\b(tv|tr|transv)\.?\b/gi, 'Transversal');
  s = s.replace(/\b(dg|diag)\.?\b/gi, 'Diagonal');
  s = s.replace(/\b(av|avda)\.?\b/gi, 'Avenida');
  s = s.replace(/\bautonorte\b/gi, 'Autopista Norte');
  s = s.replace(/\bautosur\b/gi, 'Autopista Sur');

  // Si no especifica Colombia, añadirlo para acotar búsqueda geográfica
  if (!/colombia/i.test(s)) {
    s = `${s}, Colombia`;
  }
  return s;
}

/** Detecta si el texto ingresado son coordenadas directas (ej: 6.208, -75.567) */
function parseDirectCoordinates(query: string): { lat: number; lng: number } | null {
  const match = query.trim().match(/^(-?\d{1,2}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)$/);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  if (isInsideColombia(lat, lng)) {
    return { lat, lng };
  }
  return null;
}

function isInsideColombia(lat: number, lng: number) {
  return (
    lat <= COLOMBIA_BOUNDS.north &&
    lat >= COLOMBIA_BOUNDS.south &&
    lng >= COLOMBIA_BOUNDS.west &&
    lng <= COLOMBIA_BOUNDS.east
  );
}

/** Carga dinámica de Leaflet sin requerir dependencias npm adicionales */
function loadLeaflet(): Promise<any> {
  if (window.L) return Promise.resolve(window.L);
  if (window.__leafletLoaderPromise) return window.__leafletLoaderPromise;

  window.__leafletLoaderPromise = new Promise((resolve, reject) => {
    // Inyectar CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Inyectar JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => (window.L ? resolve(window.L) : reject(new Error('Leaflet no disponible')));
    script.onerror = () => reject(new Error('No se pudo cargar Leaflet'));
    document.head.appendChild(script);
  });

  return window.__leafletLoaderPromise;
}

/** Carga dinámica de Google Maps con librería Places para máxima exactitud */
function loadGoogleMaps(apiKey: string): Promise<any> {
  if (window.google?.maps?.places) return Promise.resolve(window.google);
  if (window.__gmapsLoaderPromise) return window.__gmapsLoaderPromise;

  window.__gmapsLoaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&language=es&region=CO&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => (window.google?.maps ? resolve(window.google) : reject(new Error('Google Maps no disponible')));
    script.onerror = () => {
      window.__gmapsLoaderPromise = undefined;
      reject(new Error('No se pudo cargar Google Maps con la clave proporcionada'));
    };
    document.head.appendChild(script);
  });
  return window.__gmapsLoaderPromise;
}

export function ColombiaMapPicker({ value, onSelect }: ColombiaMapPickerProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const searchTimeoutRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Clave de API de entorno o guardada localmente
  const envKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const [googleKey] = useState<string>(() => localStorage.getItem('user_google_maps_key') || envKey || '');

  // Motor de mapa: 'google' o 'satellite' (Leaflet con Esri Satelital)
  const [engine, setEngine] = useState<'google' | 'satellite'>(() => (googleKey ? 'google' : 'satellite'));
  const [layerType, setLayerType] = useState<'satellite' | 'streets'>('satellite');

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [warning, setWarning] = useState('');

  // Sugerencias de autocompletado predictivo para búsqueda exacta
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  /** Geocodificación inversa gratuita con fallback robusto */
  const reverseGeocode = async (lat: number, lng: number): Promise<{ municipio: string; departamento: string; direccion: string }> => {
    // Si estamos con Google Maps y su geocoder está disponible
    if (engine === 'google' && window.google?.maps?.Geocoder) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const { results } = await geocoder.geocode({ location: { lat, lng } });
        if (results?.length) {
          const direccion = results[0].formatted_address;
          const comps = results.flatMap((r: any) => r.address_components);
          const find = (type: string) => comps.find((c: any) => c.types.includes(type));
          const municipio =
            find('locality')?.long_name ||
            find('administrative_area_level_2')?.long_name ||
            find('sublocality')?.long_name ||
            'Colombia';
          const departamento = find('administrative_area_level_1')?.long_name || 'Colombia';
          return { municipio, departamento, direccion };
        }
      } catch (err) {
        console.warn('Google reverse geocode fallback a OpenStreetMap:', err);
      }
    }

    // Fallback: OpenStreetMap Nominatim
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      if (resp.ok) {
        const data = await resp.json();
        const addr = data.address || {};
        const municipio =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.municipality ||
          addr.county ||
          addr.suburb ||
          'Municipio en Colombia';
        const departamento = addr.state || 'Colombia';
        const direccion = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        return { municipio, departamento, direccion };
      }
    } catch (err) {
      console.warn('Error en Nominatim reverse geocoding:', err);
    }

    return {
      municipio: `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`,
      departamento: 'Colombia',
      direccion: `Coordenadas: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    };
  };

  /** Resuelve y enfoca una coordenada seleccionada con zoom a nivel de techo */
  const handleCoordinateSelected = async (lat: number, lng: number, knownAddress?: string) => {
    setWarning('');
    if (!isInsideColombia(lat, lng)) {
      setWarning('La ubicación seleccionada está fuera del territorio colombiano.');
      return;
    }

    // Actualizar posición de marcador según motor
    if (engine === 'google' && markerRef.current?.setPosition) {
      markerRef.current.setPosition({ lat, lng });
      markerRef.current.setVisible(true);
    } else if (engine === 'satellite' && markerRef.current?.setLatLng) {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setOpacity(1);
    }

    setBusy(true);
    let resolved = { municipio: 'Colombia', departamento: 'Colombia', direccion: knownAddress || '' };
    if (!knownAddress) {
      resolved = await reverseGeocode(lat, lng);
    } else {
      const r = await reverseGeocode(lat, lng);
      resolved = { ...r, direccion: knownAddress };
    }
    setBusy(false);

    onSelectRef.current({ lat, lng, municipio: resolved.municipio, departamento: resolved.departamento, direccion: resolved.direccion });
  };

  // Mover mapa con máxima exactitud y zoom a nivel predial / tejado
  const zoomToRoof = (lat: number, lng: number, addressText?: string) => {
    if (engine === 'satellite' && mapInstanceRef.current?.flyTo) {
      mapInstanceRef.current.flyTo([lat, lng], 18, { duration: 1.2 });
    } else if (mapInstanceRef.current?.panTo) {
      mapInstanceRef.current.panTo({ lat, lng });
      mapInstanceRef.current.setZoom(18);
    }
    handleCoordinateSelected(lat, lng, addressText);
    setShowSuggestions(false);
  };

  // Obtener sugerencias en tiempo real mediante ArcGIS Esri World Geocoder + Nominatim
  const fetchAddressSuggestions = async (rawText: string) => {
    if (!rawText || rawText.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const clean = normalizeColombianQuery(rawText);
    const results: SearchSuggestion[] = [];

    // 1. Esri ArcGIS World Geocoding Service (Excelente para Colombia)
    try {
      const arcgisUrl =
        'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates' +
        `?f=json&countryCode=COL&maxLocations=5&singleLine=${encodeURIComponent(clean)}`;
      const res = await fetch(arcgisUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.candidates && Array.isArray(data.candidates)) {
          for (const cand of data.candidates) {
            if (cand.location && isInsideColombia(cand.location.y, cand.location.x)) {
              results.push({
                label: cand.address,
                lat: cand.location.y,
                lng: cand.location.x,
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('Fallo en búsqueda ArcGIS:', e);
    }

    // 2. Fallback Nominatim OSM si hay pocos resultados
    if (results.length < 3) {
      try {
        const osmUrl =
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=co&q=${encodeURIComponent(clean)}&limit=4&addressdetails=1`;
        const res = await fetch(osmUrl, { headers: { 'Accept-Language': 'es' } });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            for (const item of data) {
              const lat = parseFloat(item.lat);
              const lng = parseFloat(item.lon);
              if (isInsideColombia(lat, lng) && !results.some((r) => Math.abs(r.lat - lat) < 0.0001 && Math.abs(r.lng - lng) < 0.0001)) {
                results.push({
                  label: item.display_name,
                  lat,
                  lng,
                  municipio: item.address?.city || item.address?.town || item.address?.municipality,
                  departamento: item.address?.state,
                });
              }
            }
          }
        }
      } catch (e) {
        console.warn('Fallo en búsqueda Nominatim:', e);
      }
    }

    setSuggestions(results);
    if (results.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Manejador de cambio en el input con debounce
  const handleInputChange = (val: string) => {
    setQuery(val);
    setWarning('');
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    // Si está en Google Maps con Places Autocomplete, el widget de Google maneja las sugerencias
    if (engine === 'google') return;

    searchTimeoutRef.current = setTimeout(() => {
      fetchAddressSuggestions(val);
    }, 380);
  };

  // Inicializar o reiniciar mapa cuando cambie el motor o clave
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setErrorMsg('');

    // Limpiar mapa anterior si existe
    if (mapInstanceRef.current) {
      if (typeof mapInstanceRef.current.remove === 'function') {
        mapInstanceRef.current.remove();
      }
      mapInstanceRef.current = null;
      markerRef.current = null;
    }

    if (mapDivRef.current) {
      mapDivRef.current.innerHTML = '';
    }

    const startPos = value ?? COLOMBIA_CENTER;

    if (engine === 'google' && googleKey) {
      // 1. Motor Google Maps
      loadGoogleMaps(googleKey)
        .then((google) => {
          if (cancelled || !mapDivRef.current) return;
          const map = new google.maps.Map(mapDivRef.current, {
            center: startPos,
            zoom: value ? 18 : 6,
            mapTypeId: 'hybrid',
            streetViewControl: false,
            fullscreenControl: true,
            mapTypeControl: true,
            restriction: { latLngBounds: COLOMBIA_BOUNDS, strictBounds: false },
          });

          const marker = new google.maps.Marker({
            map,
            position: startPos,
            draggable: true,
            visible: !!value,
            title: 'Arrastra al techo exacto de la propiedad',
          });

          map.addListener('click', (e: any) => handleCoordinateSelected(e.latLng.lat(), e.latLng.lng()));
          marker.addListener('dragend', (e: any) => handleCoordinateSelected(e.latLng.lat(), e.latLng.lng()));

          // Vincular Google Places Autocomplete sobre el input si está disponible
          if (google.maps.places?.Autocomplete && inputRef.current) {
            const ac = new google.maps.places.Autocomplete(inputRef.current, {
              componentRestrictions: { country: 'co' },
              fields: ['geometry', 'formatted_address', 'name'],
            });
            ac.addListener('place_changed', () => {
              const place = ac.getPlace();
              if (place.geometry?.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                if (isInsideColombia(lat, lng)) {
                  zoomToRoof(lat, lng, place.formatted_address || place.name);
                }
              }
            });
            autocompleteRef.current = ac;
          }

          mapInstanceRef.current = map;
          markerRef.current = marker;
          setStatus('ready');
        })
        .catch((err) => {
          if (cancelled) return;
          console.warn('Fallo Google Maps, cambiando a Satelital Libre:', err);
          setEngine('satellite');
        });
    } else {
      // 2. Motor Satelital Libre (Leaflet + Esri World Imagery Satélite de alta resolución)
      loadLeaflet()
        .then((L) => {
          if (cancelled || !mapDivRef.current) return;

          const map = L.map(mapDivRef.current, {
            center: [startPos.lat, startPos.lng],
            zoom: value ? 18 : 6,
            minZoom: 5,
            maxZoom: 19,
            maxBounds: [
              [COLOMBIA_BOUNDS.south - 1, COLOMBIA_BOUNDS.west - 1],
              [COLOMBIA_BOUNDS.north + 1, COLOMBIA_BOUNDS.east + 1],
            ],
          });

          // Capa satelital de Esri
          const esriSat = L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            { attribution: 'Tiles &copy; Esri &mdash; High Resolution Satellite Imagery', maxZoom: 19 }
          );

          // Capa de calles OpenStreetMap
          const osmStreets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          });

          const activeLayer = layerType === 'satellite' ? esriSat : osmStreets;
          activeLayer.addTo(map);
          tileLayerRef.current = { esriSat, osmStreets, current: activeLayer };

          // Marcador arrastrable de alta precisión
          const marker = L.marker([startPos.lat, startPos.lng], {
            draggable: true,
            title: 'Arrastra directamente sobre el techo',
          }).addTo(map);

          if (!value) {
            marker.setOpacity(0.5);
          }

          map.on('click', (e: any) => handleCoordinateSelected(e.latlng.lat, e.latlng.lng));
          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            handleCoordinateSelected(pos.lat, pos.lng);
          });

          mapInstanceRef.current = map;
          markerRef.current = marker;
          setStatus('ready');
        })
        .catch((err) => {
          if (cancelled) return;
          setErrorMsg(err?.message || 'Error cargando mapa satelital.');
          setStatus('error');
        });
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, googleKey]);

  // Cambiar capa satélite / calles en modo libre
  const toggleLayerType = () => {
    if (engine !== 'satellite' || !tileLayerRef.current || !mapInstanceRef.current) return;
    const { esriSat, osmStreets, current } = tileLayerRef.current;
    mapInstanceRef.current.removeLayer(current);
    const nextType = layerType === 'satellite' ? 'streets' : 'satellite';
    const nextLayer = nextType === 'satellite' ? esriSat : osmStreets;
    nextLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current.current = nextLayer;
    setLayerType(nextType);
  };

  // Ejecución de búsqueda exacta
  const handleSearch = async () => {
    if (!query.trim()) return;
    setBusy(true);
    setWarning('');
    setShowSuggestions(false);

    // 1. Detectar si son coordenadas directas (ej: 6.2088, -75.567)
    const directCoords = parseDirectCoordinates(query);
    if (directCoords) {
      zoomToRoof(directCoords.lat, directCoords.lng);
      setBusy(false);
      return;
    }

    try {
      // 2. Si usa Google Maps con geocoder
      if (engine === 'google' && window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        const { results } = await geocoder.geocode({
          address: normalizeColombianQuery(query),
          componentRestrictions: { country: 'CO' },
        });
        if (results?.length) {
          const loc = results[0].geometry.location;
          zoomToRoof(loc.lat(), loc.lng(), results[0].formatted_address);
          setBusy(false);
          return;
        }
      }

      // 3. Búsqueda exacta con Esri ArcGIS (máxima precisión en Colombia)
      const clean = normalizeColombianQuery(query);
      const arcgisUrl =
        'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates' +
        `?f=json&countryCode=COL&maxLocations=1&singleLine=${encodeURIComponent(clean)}`;
      const arcgisRes = await fetch(arcgisUrl);
      if (arcgisRes.ok) {
        const arcgisData = await arcgisRes.json();
        const best = arcgisData.candidates?.[0];
        if (best?.location && isInsideColombia(best.location.y, best.location.x)) {
          zoomToRoof(best.location.y, best.location.x, best.address);
          setBusy(false);
          return;
        }
      }

      // 4. Fallback con OpenStreetMap Nominatim
      const osmRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=co&q=${encodeURIComponent(clean)}&limit=1`
      );
      if (osmRes.ok) {
        const osmData = await osmRes.json();
        if (osmData && osmData.length > 0) {
          const lat = parseFloat(osmData[0].lat);
          const lng = parseFloat(osmData[0].lon);
          if (isInsideColombia(lat, lng)) {
            zoomToRoof(lat, lng, osmData[0].display_name);
            setBusy(false);
            return;
          }
        }
      }

      setWarning('No se encontró la dirección exacta. Prueba agregando la ciudad (ej: Calle 10 # 43E-20, Medellín) o busca en la lista de sugerencias.');
    } catch (err) {
      console.error(err);
      setWarning('Error al buscar la ubicación.');
    } finally {
      setBusy(false);
    }
  };

  // Botón "Mi ubicación actual" con GPS
  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      setWarning('Tu navegador no soporta geolocalización.');
      return;
    }
    setBusy(true);
    setWarning('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!isInsideColombia(latitude, longitude)) {
          setWarning('Tu ubicación GPS está fuera de Colombia.');
          setBusy(false);
          return;
        }

        zoomToRoof(latitude, longitude);
        setBusy(false);
      },
      (err) => {
        setWarning(`No se pudo obtener tu ubicación: ${err.message}`);
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Barra de herramientas: Búsqueda y Botones de Acción */}
      <div className="flex flex-col sm:flex-row gap-2 relative">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
            placeholder="Escribe dirección exacta (ej: Calle 10 # 43E-20 Medellín) o coordenadas..."
            disabled={status !== 'ready' || busy}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-8 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1"
            >
              ✕
            </button>
          )}

          {/* Menú flotante de sugerencias predictivas exactas */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-fadeIn">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950/60">
                Coincidencias exactas en Colombia:
              </div>
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(sug.label);
                    zoomToRoof(sug.lat, sug.lng, sug.label);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-start gap-2.5 transition-colors cursor-pointer group"
                >
                  <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="leading-snug">{sug.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSearch}
          disabled={status !== 'ready' || busy}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar dirección'}
        </button>

        <button
          type="button"
          onClick={handleMyLocation}
          disabled={status !== 'ready' || busy}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 transition-all hover:scale-102"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
          <span>Mi ubicación en vivo</span>
        </button>
      </div>

      {/* Controles de Capa */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {engine === 'satellite' ? (
            <button
              type="button"
              onClick={toggleLayerType}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-500 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>Capa: {layerType === 'satellite' ? 'Satélite Esri HD' : 'Calles'}</span>
            </button>
          ) : (
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Motor Google Maps Híbrido Activo
            </span>
          )}

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {engine === 'satellite' ? '🛰️ Vista Satelital de Alta Resolución' : '🗺️ Google Maps Activo'}
          </span>
        </div>
      </div>

      {/* Contenedor del Mapa Interactivo */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
        <div ref={mapDivRef} className="w-full h-[360px] bg-slate-100 dark:bg-slate-950 z-0" />

        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 bg-slate-900/40 backdrop-blur-xs gap-2 z-10">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            <span className="font-bold text-white">Cargando mapa en tiempo real...</span>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-red-500 p-4 text-center z-10 bg-slate-900/80">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Ayuda y Alertas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 pt-0.5 gap-1">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          Busca por dirección exacta o haz clic en cualquier predio de Colombia.
        </span>
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
          💡 Puedes arrastrar el pin con precisión milimétrica sobre el tejado.
        </span>
      </div>

      {warning && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          {warning}
        </div>
      )}
    </div>
  );
}

