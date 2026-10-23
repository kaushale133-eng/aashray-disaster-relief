// AASHRAY Interactive Camp Map View
// Displays camps on Leaflet map with dark theme, shortage badges, and quick inspection popups.
// Uses free, high-performance public tiles without API keys (Esri Dark Gray & OpenStreetMap).
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { storage } from '../services/storage.js';

let mapInstance = null;
let markersLayer = null;
let currentTileLayer = null;
let currentTileType = 'esri_dark';

const TILE_PROVIDERS = {
  esri_dark: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    options: {
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, &copy; OpenStreetMap contributors',
      maxZoom: 16,
      subdomains: ['server', 'services']
    }
  },
  osm_dark: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      className: 'osm-dark-tiles'
    }
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics',
      maxZoom: 18
    }
  },
  osm_street: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }
  }
};

export function setMapTileType(type) {
  if (!mapInstance || !TILE_PROVIDERS[type]) return;
  currentTileType = type;

  if (currentTileLayer) {
    mapInstance.removeLayer(currentTileLayer);
  }

  const provider = TILE_PROVIDERS[type];
  currentTileLayer = L.tileLayer(provider.url, provider.options).addTo(mapInstance);
  
  // Bring markers to front
  if (markersLayer) {
    markersLayer.bringToFront();
  }
}

// Global theme change listener for interactive map tiles
if (typeof window !== 'undefined') {
  window.addEventListener('aashray:theme-change', (e) => {
    const theme = e.detail?.theme;
    if (!mapInstance) return;
    if (theme === 'light' && currentTileType === 'esri_dark') {
      setMapTileType('osm_street');
    } else if (theme === 'dark' && currentTileType === 'osm_street') {
      setMapTileType('esri_dark');
    }
  });
}

export function initOrUpdateMap(containerId, onSelectCamp) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const camps = storage.getCamps();
  const inventory = storage.getInventory();

  // Uttarakhand center coordinates
  const defaultCenter = [29.65, 79.0];
  const defaultZoom = 9;

  if (!mapInstance) {
    mapInstance = L.map(containerId, {
      zoomControl: true,
      attributionControl: true
    }).setView(defaultCenter, defaultZoom);

    // Initial tile layer: Esri Dark Gray (Free, zero API key, no watermark)
    const provider = TILE_PROVIDERS[currentTileType] || TILE_PROVIDERS.esri_dark;
    currentTileLayer = L.tileLayer(provider.url, provider.options).addTo(mapInstance);

    markersLayer = L.layerGroup().addTo(mapInstance);
  }

  // Clear existing markers
  markersLayer.clearLayers();

  const bounds = [];

  camps.forEach(camp => {
    const lat = camp.lat || 29.35;
    const lng = camp.lng || 79.53;
    bounds.push([lat, lng]);

    // Check inventory shortages for this camp
    const campInventory = inventory.filter(i => 
      i.campId === camp.id || i.campName.toLowerCase() === camp.location.toLowerCase() || i.campName.toLowerCase() === camp.name.toLowerCase()
    );

    const lowStockItems = campInventory.filter(i => Number(i.quantity) < Number(i.lowStockLimit));
    const hasCriticalShortage = lowStockItems.some(i => Number(i.quantity) <= (i.criticalStockLimit || Math.floor(i.lowStockLimit / 2)));
    const hasLowStock = lowStockItems.length > 0;

    let markerClass = 'camp-marker-icon';
    if (hasCriticalShortage) {
      markerClass += ' danger';
    } else if (hasLowStock) {
      markerClass += ' warning';
    }

    const icon = L.divIcon({
      className: 'custom-leaflet-div-icon',
      html: `
        <div class="${markerClass}" title="${camp.name}">
          <span>${camp.id}</span>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -20]
    });

    // Build resource summary HTML
    const resourceSummaryHtml = campInventory.length > 0 
      ? campInventory.map(item => {
          const isLow = Number(item.quantity) < Number(item.lowStockLimit);
          return `
            <div style="display: flex; justify-content: space-between; padding: 2px 0; border-bottom: 1px dashed rgba(255,255,255,0.08);">
              <span style="color: #cbd5e1;">${item.resource}:</span>
              <span style="font-weight: 600; color: ${isLow ? '#f87171' : '#34d399'}; font-family: monospace;">
                ${item.quantity} ${item.unit} ${isLow ? '⚠️' : '✓'}
              </span>
            </div>
          `;
        }).join('')
      : '<div style="color: #64748b; font-style: italic;">No inventory items registered.</div>';

    const popupHtml = `
      <div style="min-width: 250px; max-width: 290px; padding: 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <strong style="color: #38bdf8; font-size: 13.5px;">${camp.name}</strong>
          <span style="font-size: 10px; background: rgba(56,189,248,0.2); color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${camp.id}</span>
        </div>
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
          📍 <strong>Location:</strong> ${camp.location}<br/>
          📞 <strong>Contact:</strong> ${camp.contact || 'Not designated'}
        </div>
        
        <div style="font-size: 11px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em;">
          Current Camp Stock:
        </div>
        <div style="margin-bottom: 10px; max-height: 120px; overflow-y: auto;">
          ${resourceSummaryHtml}
        </div>

        ${hasLowStock ? `
          <div style="background: rgba(244,63,94,0.15); border: 1px solid rgba(244,63,94,0.4); padding: 5px 8px; border-radius: 4px; font-size: 10.5px; color: #fda4af; margin-bottom: 8px;">
            ⚠️ <strong>Alert:</strong> ${lowStockItems.length} resources below safety threshold!
          </div>
        ` : ''}

        <div style="display: flex; gap: 6px; margin-top: 6px;">
          <button id="popup-btn-inspect-${camp.id}" class="btn btn-primary btn-sm" style="flex: 1; padding: 5px 10px; font-size: 11.5px;">
            Inspect Camp &amp; Stock
          </button>
        </div>
      </div>
    `;

    const marker = L.marker([lat, lng], { icon }).bindPopup(popupHtml);
    markersLayer.addLayer(marker);

    marker.on('popupopen', () => {
      const inspectBtn = document.getElementById(`popup-btn-inspect-${camp.id}`);
      if (inspectBtn) {
        inspectBtn.onclick = () => {
          if (onSelectCamp) onSelectCamp(camp);
        };
      }
    });
  });

  if (bounds.length > 0) {
    try {
      mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
    } catch (e) {
      // fallback
    }
  }

  // Force Leaflet re-calculation of container size
  setTimeout(() => {
    if (mapInstance) mapInstance.invalidateSize();
  }, 200);
}

export function destroyMap() {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
    markersLayer = null;
    currentTileLayer = null;
  }
}
