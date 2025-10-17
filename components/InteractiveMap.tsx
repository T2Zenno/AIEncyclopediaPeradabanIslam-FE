import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, LayersControl, useMap, Tooltip, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { MapData } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../lib/translations';

// A custom component to add map controls like the re-center button
const MapControls: React.FC<{ initialCenter: [number, number]; initialZoom: number }> = ({ initialCenter, initialZoom }) => {
  const map = useMap();
  const { t } = useTranslation();

  const handleRecenter = () => {
    map.flyTo(initialCenter, initialZoom);
  };

  return (
    <div className="leaflet-top leaflet-left">
      <div className="leaflet-control leaflet-bar mt-[58px]">
        <button
          onClick={handleRecenter}
          className="w-[30px] h-[30px] flex items-center justify-center bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          title={t('mapRecenter')}
          aria-label={t('mapRecenter')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5 5" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// New component for the legend
const MapLegend: React.FC<{
  showGeoJson: boolean;
  setShowGeoJson: (show: boolean) => void;
  hasGeoJson: boolean;
  showMarkers: boolean;
  setShowMarkers: (show: boolean) => void;
  hasMarkers: boolean;
  showPolyline: boolean;
  setShowPolyline: (show: boolean) => void;
  hasPolyline: boolean;
}> = ({
  showGeoJson,
  setShowGeoJson,
  hasGeoJson,
  showMarkers,
  setShowMarkers,
  hasMarkers,
  showPolyline,
  setShowPolyline,
  hasPolyline,
}) => {
  const { t } = useTranslation();
  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control leaflet-bar p-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-md border border-gray-300 dark:border-gray-600 w-48">
        <h4 className="font-bold mb-2 text-sm text-gray-800 dark:text-gray-100 border-b border-gray-300 dark:border-gray-600 pb-1">{t('mapLegendTitle')}</h4>
        <div className="space-y-2">
          {hasGeoJson && (
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={showGeoJson}
                onChange={() => setShowGeoJson(!showGeoJson)}
                className="h-4 w-4 rounded accent-amber-500 dark:accent-amber-400"
              />
              <span>{t('mapLayerGeoJSON')}</span>
            </label>
          )}
          {hasMarkers && (
             <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={showMarkers}
                onChange={() => setShowMarkers(!showMarkers)}
                className="h-4 w-4 rounded accent-amber-500 dark:accent-amber-400"
              />
              <span>{t('mapLayerMarkers')}</span>
            </label>
          )}
           {hasPolyline && (
             <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={showPolyline}
                onChange={() => setShowPolyline(!showPolyline)}
                className="h-4 w-4 rounded accent-amber-500 dark:accent-amber-400"
              />
              <span>{t('mapLayerPolyline')}</span>
            </label>
          )}
          {(!hasGeoJson && !hasMarkers && !hasPolyline) && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('mapLayerEmpty')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface InteractiveMapProps {
  mapData: MapData;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ mapData }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  // State for layer visibility
  const [showGeoJson, setShowGeoJson] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showPolyline, setShowPolyline] = useState(true);

  // URLs for different tile layers
  const lightTileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const darkTileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const satelliteUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const terrainUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";

  const defaultAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
  const satelliteAttribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
  const terrainAttribution = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';

  const onEachFeature = (feature: any, layer: any) => {
    // Keep existing popup functionality for clicks
    if (feature.properties && feature.properties.popupContent) {
      layer.bindPopup(feature.properties.popupContent);
    }
    
    // Add tooltip on hover
    layer.on({
      mouseover: (e: any) => {
        const targetLayer = e.target;
        // Use a 'name' property for a shorter tooltip, or fallback to the full popup content
        const tooltipContent = feature.properties?.name || feature.properties?.popupContent;
        if (tooltipContent) {
          targetLayer.bindTooltip(tooltipContent, {
            sticky: true,
          }).openTooltip();
        }
      },
      mouseout: (e: any) => {
        e.target.closeTooltip();
        e.target.unbindTooltip(); // Clean up listener
      },
    });
  };

  const geoJsonStyle = {
    color: theme === 'dark' ? "#FBBF24" : "#D97706",
    weight: 2,
    opacity: 1,
    fillColor: theme === 'dark' ? "#FBBF24" : "#D97706",
    fillOpacity: 0.3
  };
  
  const parseYear = (year: number | string | undefined): number => {
    if (typeof year === 'number') return year;
    if (typeof year === 'string') {
      const parsed = parseInt(year.replace(/[^0-9]/g, ''), 10);
      return isNaN(parsed) ? Infinity : parsed;
    }
    return Infinity;
  };

  const processedMarkers = useMemo(() => {
    if (!mapData.markers) {
        return [];
    }

    const markersWithYear = mapData.markers
      .filter(m => m.year !== undefined)
      .sort((a, b) => parseYear(a.year) - parseYear(b.year));
      
    const markersWithoutYear = mapData.markers
      .filter(m => m.year === undefined)
      .map(marker => ({ ...marker, number: null }));

    const numberedMarkers = markersWithYear.map((marker, index) => ({
      ...marker,
      number: index + 1,
    }));

    return [...numberedMarkers, ...markersWithoutYear];
  }, [mapData.markers]);


  const polylinePositions = useMemo(() => {
    const sortedMarkers = processedMarkers.filter(m => m.number != null);
    if (sortedMarkers.length < 2) {
      return null;
    }
    return sortedMarkers.map(marker => marker.position);
  }, [processedMarkers]);

  return (
    <div className="h-96 w-full" aria-label={t('mapAriaLabel')}>
      {/* @ts-ignore */}
      <MapContainer center={mapData.center} zoom={mapData.zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        {/* @ts-ignore */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name={t('mapLayerDefault')}>
            {/* @ts-ignore */}
            <TileLayer
              attribution={defaultAttribution}
              url={theme === 'dark' ? darkTileUrl : lightTileUrl}
              key={theme} // Force re-render on theme change
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name={t('mapLayerSatellite')}>
            {/* @ts-ignore */}
            <TileLayer
              attribution={satelliteAttribution}
              url={satelliteUrl}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name={t('mapLayerTerrain')}>
            {/* @ts-ignore */}
            <TileLayer
              attribution={terrainAttribution}
              url={terrainUrl}
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        {showGeoJson && mapData.geojson && <GeoJSON data={mapData.geojson} style={geoJsonStyle} onEachFeature={onEachFeature} />}
        
        {showMarkers && processedMarkers.map((marker, index) => {
          let icon;
          if (marker.number) {
              icon = L.divIcon({
                  html: `<span>${marker.number}</span>`,
                  className: 'numbered-marker-icon',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12],
                  popupAnchor: [0, -12]
              });
          }

          return (
              <Marker 
                  position={marker.position} 
                  key={`${marker.popupContent}-${index}`}
                  {...(icon && { icon })}
              >
                  <Popup>{marker.popupContent}</Popup>
                  <Tooltip>
                    {marker.number && <strong className="mr-2 rtl:ml-2">{marker.number}.</strong>}
                    {marker.popupContent}
                  </Tooltip>
              </Marker>
          );
        })}
        
        {showPolyline && polylinePositions && (
          <Polyline
            pathOptions={{
              color: theme === 'dark' ? '#F59E0B' : '#92400E',
              weight: 3,
              opacity: 0.8,
              dashArray: '8, 8',
            }}
            positions={polylinePositions as [number, number][]}
          />
        )}

        <MapControls initialCenter={mapData.center} initialZoom={mapData.zoom} />
        <MapLegend 
          showGeoJson={showGeoJson}
          setShowGeoJson={setShowGeoJson}
          hasGeoJson={!!mapData.geojson}
          showMarkers={showMarkers}
          setShowMarkers={setShowMarkers}
          hasMarkers={!!mapData.markers && mapData.markers.length > 0}
          showPolyline={showPolyline}
          setShowPolyline={setShowPolyline}
          hasPolyline={!!polylinePositions}
        />
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;