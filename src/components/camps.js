// AASHRAY Relief Camp Management Component
import { storage } from '../services/storage.js';
import { initOrUpdateMap, setMapTileType } from './mapView.js';

export function renderCamps(container, navigateTo, activeCampId = null) {
  const camps = storage.getCamps();
  const inventory = storage.getInventory();
  const requests = storage.getRequests();
  const activeRole = storage.getActiveRole();

  // Role perspective banner
  let roleBannerHtml = '';
  if (activeRole === 'public') {
    roleBannerHtml = `
      <div class="role-perspective-banner public">
        <div>🌐 <strong>Public Information Portal:</strong> You are viewing live relief camp distributions and inventory metrics under Uttarakhand SDMA public transparency protocols.</div>
        <span class="status-pill status-delivered" style="font-size: 10px;">Citizen Access</span>
      </div>
    `;
  } else if (activeRole === 'manager') {
    roleBannerHtml = `
      <div class="role-perspective-banner manager">
        <div>🏕️ <strong>Relief Camp Commander Perspective:</strong> Active on-site shelter view. Review camp capacity, monitor on-hand stocks, and submit emergency replenishment requests.</div>
        <span class="status-pill status-in-progress" style="font-size: 10px;">Camp Commander</span>
      </div>
    `;
  } else if (activeRole === 'delivery') {
    roleBannerHtml = `
      <div class="role-perspective-banner delivery">
        <div>🚚 <strong>Rescue &amp; Delivery Logistics:</strong> Designate drop-off waypoints and staging depots. Switch to Allocation &amp; Deliveries to track active transports.</div>
        <span class="status-pill status-pending" style="font-size: 10px;">Field Logistics</span>
      </div>
    `;
  }

  container.innerHTML = `
    ${roleBannerHtml}

    <div class="view-header">
      <div>
        <div class="view-header-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          Relief Camp Directory &amp; Map
        </div>
        <div class="view-header-subtitle">
          Manage operational relief shelters, supply distribution hubs, and personnel assignments.
        </div>
      </div>
      <div class="view-actions">
        ${activeRole !== 'public' ? `
          <button id="add-camp-btn" class="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Register New Camp
          </button>
        ` : `
          <span class="status-pill status-delivered" style="padding: 6px 12px; font-size: 11.5px;">
            🔒 Registering Restricted (Citizen Portal)
          </span>
        `}
      </div>
    </div>

    <!-- Map View Card Panel (PDF Page 3 & 4 Specification) -->
    <div class="card-panel" style="padding: 12px; margin-bottom: 24px; position: relative;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px 12px 8px; flex-wrap: wrap; gap: 8px;">
        <div style="font-weight: 600; font-size: 13.5px; color: #fff; display: flex; align-items: center; gap: 8px;">
          <span>🗺️ Regional Distribution Map (Uttarakhand Command Zone)</span>
          <span class="status-pill status-approved" style="font-size: 10px;">${camps.length} Active Hubs</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <label for="map-style-select" style="font-size: 11px; color: var(--text-muted); font-weight: 600;">Map Layer:</label>
          <select id="map-style-select" class="filter-select" style="padding: 3px 8px; font-size: 11.5px; height: 28px;">
            <option value="esri_dark" selected>Tactical Dark (ArcGIS Dark Gray)</option>
            <option value="satellite">Satellite Imagery (ArcGIS)</option>
            <option value="osm_dark">OpenStreetMap (Dark Mode)</option>
            <option value="osm_street">OpenStreetMap (Standard)</option>
          </select>
        </div>
      </div>

      <div id="camp-map-container"></div>
      <div class="map-badge-disclaimer">
        <span style="display: inline-block; width: 7px; height: 7px; background: #38bdf8; border-radius: 50%; box-shadow: 0 0 8px #38bdf8;"></span>
        <span>LIVE TELEMETRY: Active Grid Tracking • Uttarakhand Regional Sector 4</span>
      </div>
    </div>

    <!-- Camps Table & Search Toolbar -->
    <div class="card-panel">
      <div class="toolbar-wrap">
        <div class="search-input-wrap">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="camp-search-input" class="search-input" placeholder="Search by ID, camp name, location, or notes..." />
        </div>
        <div style="font-size: 12px; color: var(--text-muted);">
          Showing <span id="camp-count-display">${camps.length}</span> camps
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table" id="camps-table">
          <thead>
            <tr>
              <th>Camp ID</th>
              <th>Camp Name</th>
              <th>Location</th>
              <th>Officer / Contact</th>
              <th>Primary Activities / Notes</th>
              <th>Stock Health</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="camps-table-body">
            <!-- Dynamic rows -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Camp Add/Edit Modal Container -->
    <div id="camp-modal" class="modal-overlay">
      <div class="modal-dialog">
        <div class="modal-header">
          <div class="modal-title" id="camp-modal-title">Register Relief Camp</div>
          <button class="modal-close-btn" id="camp-modal-close-btn">&times;</button>
        </div>
        <form id="camp-form" novalidate>
          <div class="modal-body">
            <input type="hidden" id="camp-is-edit" value="0" />
            
            <div class="form-group">
              <label class="form-label required" for="camp-id-input">Camp ID</label>
              <input type="text" id="camp-id-input" class="form-control" placeholder="e.g. C-05" style="font-family: var(--font-mono); font-weight: 700; color: var(--teal-400);" required />
              <div class="form-hint" id="camp-id-hint">Standardized identifier code (e.g. C-01, C-05). Auto-suggested based on sequence.</div>
              <div class="invalid-feedback" id="camp-id-error">Camp ID is required and must be unique.</div>
            </div>

            <div class="form-group">
              <label class="form-label required" for="camp-name-input">Camp Name</label>
              <input type="text" id="camp-name-input" class="form-control" placeholder="e.g. Dehradun Transit Shelter" required />
              <div class="invalid-feedback" id="camp-name-error">Please enter a valid camp name.</div>
            </div>

            <div class="form-group">
              <label class="form-label required" for="camp-location-input">Location / District</label>
              <input type="text" id="camp-location-input" class="form-control" placeholder="e.g. Dehradun" required />
              <div class="invalid-feedback" id="camp-location-error">Camp location or district is required.</div>
            </div>

            <div class="form-group">
              <label class="form-label" for="camp-contact-input">Contact / Person in Charge (Optional)</label>
              <input type="text" id="camp-contact-input" class="form-control" placeholder="e.g. Rajesh Verma (+91 98765-43210)" />
              <div class="form-hint">Name, designation, and phone number of the on-site relief coordinator.</div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label" for="camp-lat-input">Latitude (°N)</label>
                <input type="number" step="0.0001" id="camp-lat-input" class="form-control" placeholder="e.g. 29.3500" value="29.3500" />
              </div>
              <div class="form-group">
                <label class="form-label" for="camp-lng-input">Longitude (°E)</label>
                <input type="number" step="0.0001" id="camp-lng-input" class="form-control" placeholder="e.g. 79.5300" value="79.5300" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="camp-notes-input">Camp Notes / Main Relief Activities</label>
              <textarea id="camp-notes-input" class="form-control" rows="3" placeholder="e.g. Food and water distribution, trauma triage..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="camp-modal-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="camp-save-submit-btn">Save Camp Record</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Render Table Rows
  function renderTableRows(filterText = '') {
    const tbody = container.querySelector('#camps-table-body');
    const filtered = camps.filter(c => {
      const q = filterText.toLowerCase();
      return c.name.toLowerCase().includes(q) ||
             c.location.toLowerCase().includes(q) ||
             (c.notes && c.notes.toLowerCase().includes(q)) ||
             c.id.toLowerCase().includes(q);
    });

    container.querySelector('#camp-count-display').textContent = filtered.length;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <div class="empty-state-icon">🏕️</div>
              <div class="empty-state-title">No relief camps match search</div>
              <div class="empty-state-desc">Try clearing the search query or register a new camp.</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(c => {
      const campInv = inventory.filter(i => i.campId === c.id || i.campName.toLowerCase() === c.location.toLowerCase());
      const lowStockItems = campInv.filter(i => Number(i.quantity) < Number(i.lowStockLimit));
      const hasCritical = lowStockItems.some(i => Number(i.quantity) <= (i.criticalStockLimit || Math.floor(i.lowStockLimit / 2)));
      
      let stockBadge = `<span class="status-pill status-delivered"><span class="status-dot"></span> Stock Healthy</span>`;
      if (hasCritical) {
        stockBadge = `<span class="status-pill status-rejected"><span class="status-dot"></span> Critical Shortage (${lowStockItems.length})</span>`;
      } else if (lowStockItems.length > 0) {
        stockBadge = `<span class="status-pill status-pending"><span class="status-dot"></span> Low Stock (${lowStockItems.length})</span>`;
      }

      // Role-based actions
      let actionButtons = `
        <button class="btn btn-secondary btn-sm view-inv-btn" data-camp="${c.id}" title="View Camp Stock">
          Stock
        </button>
      `;

      if (activeRole === 'coordinator') {
        actionButtons = `
          <button class="btn btn-secondary btn-sm edit-camp-btn" data-id="${c.id}" title="Edit Camp Record">
            Edit
          </button>
          <button class="btn btn-secondary btn-sm view-inv-btn" data-camp="${c.id}" title="View Camp Stock">
            Stock
          </button>
          <button class="btn btn-danger btn-sm delete-camp-btn" data-id="${c.id}" data-name="${c.name}" title="Delete Camp">
            Delete
          </button>
        `;
      } else if (activeRole === 'manager') {
        actionButtons = `
          <button class="btn btn-secondary btn-sm edit-camp-btn" data-id="${c.id}" title="Edit Camp Record">
            Edit
          </button>
          <button class="btn btn-secondary btn-sm view-inv-btn" data-camp="${c.id}" title="View Camp Stock">
            Stock
          </button>
        `;
      }

      return `
        <tr data-camp-id="${c.id}" id="camp-row-${c.id}">
          <td>
            <span style="display: inline-flex; align-items: center; gap: 4px;">
              <strong style="color: var(--teal-400); font-family: var(--font-mono); font-size: 13px;">${c.id}</strong>
            </span>
          </td>
          <td>
            <div style="font-weight: 600; color: #fff;">${c.name}</div>
          </td>
          <td>📍 ${c.location}</td>
          <td>${c.contact || '<span style="color: var(--text-muted); font-style: italic;">Unassigned</span>'}</td>
          <td><div style="max-width: 260px; font-size: 11.5px; color: var(--text-secondary);">${c.notes || '—'}</div></td>
          <td>${stockBadge}</td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 6px; justify-content: flex-end;">
              ${actionButtons}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row events
    tbody.querySelectorAll('.edit-camp-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openEditCampModal(id);
      });
    });

    tbody.querySelectorAll('.view-inv-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const campId = e.currentTarget.getAttribute('data-camp');
        navigateTo('inventory', { campFilter: campId });
      });
    });

    tbody.querySelectorAll('.delete-camp-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const name = e.currentTarget.getAttribute('data-name');
        if (confirm(`Are you sure you want to remove camp "${name}" (${id})? All corresponding local inventory will also be purged.`)) {
          storage.deleteCamp(id);
          window.dispatchEvent(new CustomEvent('aashray:toast', { detail: { type: 'info', message: `Camp ${name} removed.` } }));
          renderCamps(container, navigateTo);
        }
      });
    });
  }

  renderTableRows();

  // Search filter
  container.querySelector('#camp-search-input').addEventListener('input', (e) => {
    renderTableRows(e.target.value);
  });

  // Init Map
  initOrUpdateMap('camp-map-container', (selectedCamp) => {
    const row = container.querySelector(`tr[data-camp-id="${selectedCamp.id}"]`);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.style.background = 'rgba(6, 182, 212, 0.15)';
      setTimeout(() => { row.style.background = ''; }, 2000);
    }
  });

  // Map layer switcher
  container.querySelector('#map-style-select')?.addEventListener('change', (e) => {
    setMapTileType(e.target.value);
  });

  // Modal Handling
  const modal = container.querySelector('#camp-modal');
  const campForm = container.querySelector('#camp-form');

  function openAddCampModal() {
    container.querySelector('#camp-modal-title').textContent = "Register Relief Camp";
    container.querySelector('#camp-is-edit').value = "0";
    
    // Auto-generate next non-colliding camp ID
    const nextId = storage.getNextCampId();
    const idInput = container.querySelector('#camp-id-input');
    idInput.value = nextId;
    idInput.readOnly = false;
    idInput.style.opacity = '1';
    container.querySelector('#camp-id-hint').textContent = `Suggested code: ${nextId}. You can customize this unique ID.`;

    container.querySelector('#camp-name-input').value = "";
    container.querySelector('#camp-location-input').value = "";
    container.querySelector('#camp-contact-input').value = "";
    container.querySelector('#camp-notes-input').value = "";
    container.querySelector('#camp-lat-input').value = "29.3500";
    container.querySelector('#camp-lng-input').value = "79.5300";
    clearValidation();
    modal.classList.add('open');
  }

  function openEditCampModal(id) {
    const camp = storage.getCamps().find(c => c.id === id);
    if (!camp) return;

    container.querySelector('#camp-modal-title').textContent = `Edit Camp Record (${camp.id})`;
    container.querySelector('#camp-is-edit').value = "1";
    
    const idInput = container.querySelector('#camp-id-input');
    idInput.value = camp.id;
    idInput.readOnly = true;
    idInput.style.opacity = '0.7';
    container.querySelector('#camp-id-hint').textContent = `Camp ID is locked during editing.`;

    container.querySelector('#camp-name-input').value = camp.name;
    container.querySelector('#camp-location-input').value = camp.location;
    container.querySelector('#camp-contact-input').value = camp.contact || "";
    container.querySelector('#camp-notes-input').value = camp.notes || "";
    container.querySelector('#camp-lat-input').value = camp.lat || 29.3500;
    container.querySelector('#camp-lng-input').value = camp.lng || 79.5300;
    clearValidation();
    modal.classList.add('open');
  }

  function clearValidation() {
    container.querySelector('#camp-id-input').classList.remove('is-invalid');
    container.querySelector('#camp-name-input').classList.remove('is-invalid');
    container.querySelector('#camp-location-input').classList.remove('is-invalid');
  }

  container.querySelector('#add-camp-btn')?.addEventListener('click', openAddCampModal);
  container.querySelector('#camp-modal-close-btn')?.addEventListener('click', () => modal.classList.remove('open'));
  container.querySelector('#camp-modal-cancel-btn')?.addEventListener('click', () => modal.classList.remove('open'));

  // Form submit
  campForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearValidation();

    const isEdit = container.querySelector('#camp-is-edit').value === "1";
    const id = container.querySelector('#camp-id-input').value.trim().toUpperCase();
    const name = container.querySelector('#camp-name-input').value.trim();
    const location = container.querySelector('#camp-location-input').value.trim();
    const contact = container.querySelector('#camp-contact-input').value.trim();
    const notes = container.querySelector('#camp-notes-input').value.trim();
    const lat = parseFloat(container.querySelector('#camp-lat-input').value) || 29.3500;
    const lng = parseFloat(container.querySelector('#camp-lng-input').value) || 79.5300;

    let hasError = false;
    if (!id) {
      container.querySelector('#camp-id-input').classList.add('is-invalid');
      hasError = true;
    } else if (!isEdit) {
      const existing = storage.getCamps().find(c => c.id.toUpperCase() === id);
      if (existing) {
        container.querySelector('#camp-id-input').classList.add('is-invalid');
        container.querySelector('#camp-id-error').textContent = `Camp ID "${id}" is already in use by ${existing.name}.`;
        hasError = true;
      }
    }

    if (!name) {
      container.querySelector('#camp-name-input').classList.add('is-invalid');
      hasError = true;
    }
    if (!location) {
      container.querySelector('#camp-location-input').classList.add('is-invalid');
      hasError = true;
    }

    if (hasError) return;

    if (isEdit) {
      storage.updateCamp(id, { name, location, contact, notes, lat, lng });
      window.dispatchEvent(new CustomEvent('aashray:toast', { detail: { type: 'success', message: `Camp "${name}" (${id}) updated successfully.` } }));
    } else {
      const newCamp = storage.addCamp({ id, name, location, contact, notes, lat, lng });
      window.dispatchEvent(new CustomEvent('aashray:toast', { detail: { type: 'success', message: `New camp "${name}" registered with ID ${newCamp.id}.` } }));
    }

    modal.classList.remove('open');
    renderCamps(container, navigateTo);
  });
}
