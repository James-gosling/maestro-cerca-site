/**
 * RadiusFilter — Location-based radius search component.
 * Uses browser geolocation + Google Maps geocoding for location autocomplete.
 * Provides a km radius slider with preset buttons and a visual distance indicator.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { MapPin, Navigation, Search, X, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const RADIUS_PRESETS = [5, 10, 25, 50];
const CDMX_CENTER = { lat: 19.4326, lng: -99.1332 };

interface RadiusFilterProps {
  userLocation: { lat: number; lng: number } | null;
  onLocationChange: (location: { lat: number; lng: number } | null, label: string) => void;
  onRadiusChange: (radius: number) => void;
  radiusKm: number;
  resultCount: number;
  isSearching: boolean;
}

export default function RadiusFilter({
  userLocation,
  onLocationChange,
  onRadiusChange,
  radiusKm,
  resultCount,
  isSearching,
}: RadiusFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Geocode endpoint for autocomplete
  const geocodeQuery = trpc.maestros.geocode.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length >= 3, staleTime: 5 * 60 * 1000 }
  );

  // Listen for debug/test location events (allows programmatic testing)
  useEffect(() => {
    const handleTestLocation = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.lat && detail?.lng) {
        onLocationChange({ lat: detail.lat, lng: detail.lng }, "Ubicación simulada");
        setLocationLabel("Ubicación simulada (Coyoacán)");
      }
    };
    window.addEventListener("set-test-location", handleTestLocation);
    return () => window.removeEventListener("set-test-location", handleTestLocation);
  }, [onLocationChange]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(e.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Detect user's location via browser Geolocation API
  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización");
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onLocationChange(location, "Mi ubicación");
        setLocationLabel("Mi ubicación");
        setIsGeolocating(false);
        toast.success("Ubicación detectada correctamente");
      },
      (error) => {
        setIsGeolocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Permiso de ubicación denegado. Escribe una zona manualmente.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Ubicación no disponible");
            break;
          case error.TIMEOUT:
            toast.error("Tiempo de espera agotado");
            break;
          default:
            toast.error("No se pudo obtener tu ubicación");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, [onLocationChange]);

  // Select a suggestion from geocode results
  const handleSelectSuggestion = useCallback(() => {
    if (geocodeQuery.data) {
      onLocationChange(geocodeQuery.data, searchQuery);
      setLocationLabel(searchQuery);
      setShowSuggestions(false);
      setSearchQuery("");
    }
  }, [geocodeQuery.data, searchQuery, onLocationChange]);

  const handleClearLocation = useCallback(() => {
    onLocationChange(null, "");
    setLocationLabel(null);
    setSearchQuery("");
  }, [onLocationChange]);

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-5 warm-shadow">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-terracotta/10 rounded-lg flex items-center justify-center text-terracotta">
          <MapPin size={16} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-foreground">Buscar por cercanía</h3>
          <p className="text-xs text-muted-foreground">Encuentra maestros cerca de ti</p>
        </div>
        {isSearching && (
          <span className="text-xs text-terracotta font-medium flex items-center gap-1">
            <Loader2 size={12} className="animate-spin" />
            Buscando...
          </span>
        )}
        {!isSearching && resultCount !== null && (
          <span className="text-xs font-medium text-muted-foreground">
            {resultCount} resultado{resultCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Location Input Row */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Escribe tu zona o colonia..."
            className="w-full h-10 pl-9 pr-3 text-sm bg-background/50 border border-border/50 rounded-xl 
                       focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/20
                       placeholder:text-muted-foreground/60 transition-colors"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />

          {/* Suggestions Dropdown */}
          {showSuggestions && geocodeQuery.data && searchQuery.length >= 3 && (
            <div
              ref={suggestionRef}
              className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden"
            >
              <button
                onClick={handleSelectSuggestion}
                className="w-full px-4 py-3 text-sm text-left hover:bg-background/50 transition-colors flex items-center gap-2"
              >
                <MapPin size={14} className="text-terracotta flex-shrink-0" />
                <span className="text-foreground">
                  {searchQuery}, Ciudad de México
                </span>
              </button>
            </div>
          )}
        </div>

        {locationLabel && (
          <button
            onClick={handleClearLocation}
            className="h-10 px-2.5 text-muted-foreground hover:text-terracotta transition-colors"
            title="Quitar ubicación"
          >
            <X size={16} />
          </button>
        )}

        <button
          onClick={handleUseMyLocation}
          disabled={isGeolocating}
          className="h-10 px-3 bg-terracotta/10 hover:bg-terracotta/15 text-terracotta rounded-xl
                     transition-colors flex items-center gap-1.5 text-sm font-medium disabled:opacity-50"
        >
          {isGeolocating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Navigation size={14} />
          )}
          <span className="hidden sm:inline">Usar GPS</span>
        </button>
      </div>

      {/* Current Location Indicator */}
      {(userLocation || locationLabel) && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-emerald-brand/5 border border-emerald-brand/15 rounded-lg">
          <div className="w-2 h-2 bg-emerald-brand rounded-full animate-pulse" />
          <span className="text-xs text-foreground font-medium">{locationLabel || "Ubicación activa"}</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {userLocation ? `${userLocation.lat.toFixed(4)}°, ${userLocation.lng.toFixed(4)}°` : ""}
          </span>
        </div>
      )}

      {/* Radius Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Radio de búsqueda</span>
          <span className="text-sm font-bold text-terracotta">{radiusKm} km</span>
        </div>

        {/* Preset Buttons */}
        <div className="flex gap-2">
          {RADIUS_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => onRadiusChange(preset)}
              className={`flex-1 h-9 rounded-lg text-xs font-semibold transition-all
                ${radiusKm === preset
                  ? "bg-terracotta text-white shadow-sm"
                  : "bg-background/50 text-muted-foreground hover:bg-background hover:text-foreground border border-border/30"
                }`}
            >
              {preset} km
            </button>
          ))}
        </div>

        {/* Visual Distance Ring Indicator */}
        <div className="flex items-center justify-center py-2">
          <div className="relative w-28 h-28">
            {/* Outer ring — max radius */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-border/40" />
            {/* Active ring — current radius */}
            <div
              className="absolute inset-0 rounded-full border-2 border-terracotta/40 transition-all duration-300"
              style={{
                transform: `scale(${(radiusKm / 50) * 0.8 + 0.2})`,
              }}
            />
            {/* Center dot — user */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-terracotta rounded-full shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { CDMX_CENTER, RADIUS_PRESETS };
