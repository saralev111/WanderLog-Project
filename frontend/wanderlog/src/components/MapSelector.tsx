import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { TextField, Box, Autocomplete, CircularProgress } from '@mui/material';

// תיקון בעיית האייקונים הנסתרים של Leaflet בריאקט
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void;
  defaultLat?: number;
  defaultLng?: number;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationMarkerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  position: { lat: number; lng: number } | null;
  setPosition: React.Dispatch<React.SetStateAction<{ lat: number; lng: number } | null>>;
}

// קומפוננטת עזר שמטיסה את המפה ליעד ברגע שבוחרים מהרשימה
function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14);
    }
  }, [center, map]);
  return null;
}

// קומפוננטת עזר שתופסת את הלחיצות הידניות על המפה
function LocationMarker({ onLocationSelect, position, setPosition }: LocationMarkerProps) {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

export default function MapSelector({ onLocationSelect, defaultLat, defaultLng }: MapSelectorProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    defaultLat && defaultLng ? { lat: defaultLat, lng: defaultLng } : null
  );
  const [flyCenter, setFlyCenter] = useState<[number, number] | null>(
    defaultLat && defaultLng ? [defaultLat, defaultLng] : null
  );
  
  const [value, setValue] = useState<SearchResult | null>(null);
  const [inputValue, setInputValue] = useState('');
  
  const [options, setOptions] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // מנגנון החיפוש החכם
  useEffect(() => {
    let active = true;

    if (inputValue.trim().length < 2) {
      setOptions(value ? [value] : []);
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}&accept-language=he&limit=10`
        );
        const data = await response.json();
        
        // סינון תוצאות כפולות
        const uniqueResults = data.filter((v: any, i: number, a: any[]) => 
          a.findIndex(t => (t.display_name === v.display_name)) === i
        );

        if (active) {
          setOptions(uniqueResults);
        }
      } catch (error) {
        console.error("שגיאה בחיפוש:", error);
      } finally {
        if (active) setLoading(false);
      }
    }, 600); 

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [inputValue, value]);

  const handleSelectResult = (newValue: SearchResult | null) => {
    setValue(newValue);
    if (newValue) {
      const lat = parseFloat(newValue.lat);
      const lng = parseFloat(newValue.lon);
      
      setPosition({ lat, lng });
      setFlyCenter([lat, lng]);
      onLocationSelect(lat, lng);
    }
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}>
      
      <Autocomplete
        id="location-autocomplete"
        sx={{ width: '100%' }}
        // כאן הגדרנו את הרקע הלבן וההצללה כדי שהחלונית לא תהיה שקופה מעל המפה!
        slotProps={{
          paper: {
            sx: {
              backgroundColor: '#ffffff',
              boxShadow: '0px 8px 24px rgba(0,0,0,0.3)',
              zIndex: 9999
            }
          }
        }}
        options={options}
        getOptionLabel={(option) => option.display_name || ''}
        isOptionEqualToValue={(option, val) => option.place_id === val.place_id}
        filterOptions={(opts) => opts} 
        autoComplete
        includeInputInList
        filterSelectedOptions
        value={value}
        noOptionsText="לא נמצאו תוצאות (נסי להוסיף פסיק או שם עיר)"
        loading={loading}
        loadingText="מחפש מיקומים..."
        onChange={(event, newValue) => {
          handleSelectResult(newValue);
        }}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        renderInput={(params) => {
          // חולצים את ההגדרות הישנות (InputProps) כדי ש-TypeScript ו-MUI V6 יהיו מרוצים
          const { InputProps, ...restParams } = params as any;

          return (
            <TextField
              {...restParams}
              size="small"
              label="חפשי מיקום (לדיוק מירבי הפרידי בפסיק, למשל: נוף כנרת, צפת)..."
              fullWidth
              slotProps={{
                ...restParams.slotProps,
                input: {
                  ...restParams.slotProps?.input,
                  ...InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {restParams.slotProps?.input?.endAdornment || InputProps?.endAdornment}
                    </React.Fragment>
                  ),
                },
              }}
            />
          );
        }}
      />

      {/* אזור המפה */}
      <Box style={{ height: "300px", width: "100%", border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden", zIndex: 1 }}>
        <MapContainer center={[31.7683, 35.2137]} zoom={8} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='© OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onLocationSelect={onLocationSelect} position={position} setPosition={setPosition} />
          <MapController center={flyCenter} />
        </MapContainer>
      </Box>

    </Box>
  );
}