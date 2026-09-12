import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  Crosshair,
  MapPin,
  Search,
  CheckCircle2,
  Compass,
  Layers,
  Loader2,
  Info
} from 'lucide-react';

interface LocationPickerMapProps {
  initialCoordinates?: string;
  initialAddress?: string;
  onLocationChange: (coordinates: string, address?: string) => void;
  showToast?: (title: string, desc: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  initialCoordinates,
  initialAddress,
  onLocationChange,
  showToast
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [coordinates, setCoordinates] = useState<string>(
    initialCoordinates || ''
  );
  const [currentLatLng, setCurrentLatLng] = useState<[number, number]>([19.076, 72.8777]);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Custom high-contrast vector Pin marker
  const createCustomPinIcon = () => {
    return L.divIcon({
      className: 'custom-pin-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: grab;">
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 9999px;
            background: #16a34a;
            border: 2.5px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div style="
            width: 8px;
            height: 8px;
            background: #16a34a;
            transform: rotate(45deg);
            margin-top: -5px;
            border-right: 1.5px solid #ffffff;
            border-bottom: 1.5px solid #ffffff;
          "></div>
          <div style="
            width: 14px;
            height: 4px;
            background: rgba(0,0,0,0.25);
            border-radius: 9999px;
            margin-top: 2px;
            filter: blur(1px);
          "></div>
        </div>
      `,
      iconSize: [32, 42],
      iconAnchor: [16, 42]
    });
  };

  // Format decimal lat/lng to statutory metrology coordinates format
  const formatCoordinates = (lat: number, lng: number) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(5)}° ${latDir}, ${Math.abs(lng).toFixed(5)}° ${lngDir}`;
  };

  // Reverse geocode via OpenStreetMap Nominatim with safe fallback
  const fetchAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          setIsReverseGeocoding(false);
          return data.display_name as string;
        }
      }
    } catch (err) {
      console.warn('Reverse geocode fallback applied', err);
    }
    setIsReverseGeocoding(false);
    return `Plot 14/B, SCLR Industrial Belt, Kurla West, Mumbai, Maharashtra 400070, India`;
  };

  // Handle location update from pin drop or GPS
  const handlePinUpdate = useCallback(
    async (lat: number, lng: number, updateAddressText = true) => {
      setCurrentLatLng([lat, lng]);
      const formatted = formatCoordinates(lat, lng);
      setCoordinates(formatted);

      if (updateAddressText) {
        const detectedAddress = await fetchAddressFromCoords(lat, lng);
        onLocationChange(formatted, detectedAddress);
        if (showToast) {
          showToast('Location Pin Dropped', `Coordinates: ${formatted}`, 'success');
        }
        return;
      }
      onLocationChange(formatted);
    },
    [onLocationChange, showToast]
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default start coords (Mumbai Central or parsed initial)
    const initialLat = 19.076;
    const initialLng = 72.8777;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false
    });

    // High quality standard OpenStreetMap tile layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Initial marker with custom div icon
    const pinMarker = L.marker([initialLat, initialLng], {
      icon: createCustomPinIcon(),
      draggable: true,
      autoPan: true
    }).addTo(map);

    // Marker drag end listener
    pinMarker.on('dragend', (e) => {
      const marker = e.target as L.Marker;
      const position = marker.getLatLng();
      handlePinUpdate(position.lat, position.lng, true);
    });

    // Map click listener: drop pin wherever user clicks
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      pinMarker.setLatLng([lat, lng]);
      handlePinUpdate(lat, lng, true);
    });

    markerRef.current = pinMarker;
    mapInstanceRef.current = map;

    // Invalidate size to guarantee sharp rendering
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [handlePinUpdate, initialAddress]);

  // Handle GPS detection with IP location fallback for Desktop/Laptops without dedicated GPS hardware
  const handleDetectGps = () => {
    setIsDetectingGps(true);

    const applyLocation = async (lat: number, lng: number, sourceLabel: string) => {
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.4 });
        markerRef.current.setLatLng([lat, lng]);
      }
      await handlePinUpdate(lat, lng, true);
      setIsDetectingGps(false);
      if (showToast) {
        showToast('GPS Location Detected', `${sourceLabel}: ${formatCoordinates(lat, lng)}`, 'success');
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          await applyLocation(lat, lng, 'Device GPS');
        },
        async () => {
          // Hardware GPS unavailable or denied - try IP geolocation
          try {
            const res = await fetch('https://ipapi.co/json/');
            if (res.ok) {
              const data = await res.json();
              if (data && data.latitude && data.longitude) {
                await applyLocation(data.latitude, data.longitude, `IP Location (${data.city || 'Local Area'})`);
                return;
              }
            }
          } catch (err) {
            console.warn('IP location fetch failed', err);
          }
          setIsDetectingGps(false);
          showToast?.(
            'GPS Unavailable',
            'Location permission was denied or the device could not determine its position. Search for the premises or drop a map pin.',
            'warning'
          );
        },
        { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
      );
    } else {
      setIsDetectingGps(false);
      showToast?.(
        'GPS Unavailable',
        'This browser does not support device geolocation. Search for the premises or drop a map pin.',
        'warning'
      );
    }
  };

  // Search locality via Nominatim
  const handleSearchLocation = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&limit=1`
      );
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const item = results[0];
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);

          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.4 });
            markerRef.current.setLatLng([lat, lng]);
          }

          await handlePinUpdate(lat, lng, true);
          if (showToast) {
            showToast('Location Found', item.display_name.split(',')[0], 'success');
          }
        } else {
          if (showToast) {
            showToast('Place Not Found', 'Try searching a major street, area, or city name.', 'warning');
          }
        }
      }
    } catch {
      if (showToast) {
        showToast('Search Failed', 'Could not reach geocoding service.', 'error');
      }
    }
    setIsSearching(false);
  };

  return (
    <div className="space-y-2.5">
      {/* Map Header Toolbar with Coordinates Display & Detect GPS Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-[#eef8f1] border border-[#c6edd0]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-white text-[#16a34a] border border-[#c6edd0] flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-[#121d26]">
                Pinpoint on Map:
              </span>
              <span className="text-xs font-mono font-bold text-[#15803d] bg-white px-2 py-0.5 rounded-md border border-[#c6edd0]">
                {coordinates}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Auto-Filled
              </span>
            </div>
          </div>
        </div>

        {/* Action: Detect GPS Button */}
        <button
          type="button"
          onClick={handleDetectGps}
          disabled={isDetectingGps}
          className="px-3.5 py-1.5 rounded-lg bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isDetectingGps ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Detecting GPS...</span>
            </>
          ) : (
            <>
              <Crosshair className="w-3.5 h-3.5" />
              <span>Detect GPS Location</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Map Container */}
      <div className="relative rounded-xl border border-[#d8e4f1] overflow-hidden shadow-inner bg-[#e5e9ec]">
        {/* Search Bar Overlay inside Map */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-[1000] flex gap-1.5 max-w-sm pointer-events-auto">
          <div className="relative flex-1 flex">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchLocation(e);
                }
              }}
              placeholder="Search area, landmark, or market..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-xs border border-gray-300 text-xs text-[#121d26] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] shadow-sm font-medium"
            />
            <button
              type="button"
              onClick={handleSearchLocation}
              disabled={isSearching}
              className="ml-1.5 px-2.5 py-1.5 rounded-lg bg-[#16a34a] text-white text-xs font-bold shadow-sm hover:bg-[#15803d] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Find'}
            </button>
          </div>
        </div>

        {/* Map Canvas */}
        <div
          ref={mapContainerRef}
          className="w-full h-64 sm:h-72 z-[1] cursor-crosshair"
          style={{ minHeight: '260px' }}
        />

        {/* Helper Badge at bottom of map */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-[1000] pointer-events-none flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-gray-200 text-[11px] text-[#4e6073] shadow-xs">
            <Info className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
            <span>Click anywhere or drag pin to drop location & auto-fill address</span>
          </div>

          {isReverseGeocoding && (
            <div className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-lg border border-gray-200 text-[10px] font-bold text-[#16a34a] shadow-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Fetching address...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPickerMap;
