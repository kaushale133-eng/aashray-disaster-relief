// AASHRAY Resource Inventory Component
import { storage } from '../services/storage.js';
import { RESOURCE_UNITS, RESOURCE_CATEGORIES } from '../data/initialData.js';

export function renderInventory(container, navigateTo, filterParams = {}) {
  const camps = storage.getCamps();
  const inventory = storage.getInventory();
  const activeRole = storage.getActiveRole();

  let activeCampFilter = filterParams.campFilter || 'ALL';
  let activeCategoryFilter = 'ALL';
  let activeStatusFilter = filterParams.filter === 'low' ? 'LOW_ONLY' : 'ALL';

  // Role perspective banner
  let roleBannerHtml = '';
  if (activeRole === 'public') {
    roleBannerHtml = `
      <div class="role-perspective-banner public">
        <div>🌐 <strong>Public Information Portal:</strong> Auditing active supply levels across regional relief depots under Uttarakhand SDMA public transparency protocols.</div>
        <span class="status-pill status-delivered" style="font-size: 10px;">Citizen Access</span>
      </div>
    `;
  } else if (activeRole === 'manager') {
    roleBannerHtml = `
      <div class="role-perspective-banner manager">
        <div>🏕️ <strong>Relief Camp Commander View:</strong> Active supply monitoring. Register inbound supplies and manage threshold safety levels for your designated station.</div>
        <span class="status-pill status-in-progress" style="font-size: 10px;">Camp Commander</span>
      </div>
    `;
  } else if (activeRole === 'delivery') {
    roleBannerHtml = `
      <div class="role-perspective-banner delivery">
        <div>🚚 <strong>Rescue &amp; Delivery Logistics:</strong> Inventory reference view. Check available depot stockpiles before staging dispatch runs.</div>
        <span class="status-pill status-pending" style="font-size: 10px;">Field Logistics</span>
      </div>
    `;
  }

  container.innerHTML = `
    ${roleBannerHtml}

    <div class="view-header">
      <div>
        <div class="view-header-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          Resource Inventory Management
        </div>
        <div class="view-header-subtitle">
          Track essential supplies (food, water, medicine, shelter), manage safety stock thresholds, and execute replenishment.
        </div>
      </div>
      <div class="view-actions">
        ${activeRole === 'coordinator' ? `
          <button id="add-inventory-btn" class="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add New Supply Record
          </button>
        ` : activeRole === 'public' ? `
          <span class="status-pill status-delivered" style="padding: 6px 12px; font-size: 11.5px;">
            🔒 Supply Updates Disabled (Public Mode)
          </span>
        ` : `
          <span class="status-pill status-approved" style="padding: 6px 12px; font-size: 11.5px;">
            ✓ Stock Updates Allowed
          </span>
        `}
      </div>
    </div>

    <!-- Inventory Filter Toolbar -->
    <div class="card-panel" style="padding: 16px; margin-bottom: 20px;">
      <div class="toolbar-wrap" style="margin-bottom: 0;">
        <div class="search-input-wrap">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="inventory-search-input" class="search-input" placeholder="Search by ID, resource, camp..." />
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <!-- Camp Filter -->
          <select id="inv-camp-filter" class="filter-select" style="min-width: 200px;">
            <option value="ALL" ${activeCampFilter === 'ALL' ? 'selected' : ''}>All Relief Camps (${camps.length})</option>
            ${camps.map(c => `
              <option value="${c.id}" ${activeCampFilter === c.id || activeCampFilter.toLowerCase() === c.location.toLowerCase() ? 'selected' : ''}>
                [${c.id}] ${c.location} (${c.name})
              </option>
            `).join('')}
          </select>

          <!-- Category Filter -->
          <select id="inv-cat-filter" class="filter-select">
            <option value="ALL">All Categories</option>
            <option value="Food">Food Packets</option>
            <option value="Water">Drinking Water</option>
            <option value="Medicines">Medicines &amp; First Aid</option>
            <option value="Shelter">Shelter &amp; Blankets</option>
          </select>

          <!-- Status Filter -->
          <select id="inv-status-filter" class="filter-select">
            <option value="ALL" ${activeStatusFilter === 'ALL' ? 'selected' : ''}>All Stock Levels</option>
            <option value="LOW_ONLY" ${activeStatusFilter === 'LOW_ONLY' ? 'selected' : ''}>⚠️ Low Stock Warnings Only</option>
            <option value="CRITICAL_ONLY">🚨 Critical Stock (&le; 50% limit)</option>
            <option value="HEALTHY_ONLY">✓ Healthy Stock Levels</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Inventory Table Panel -->
    <div class="card-panel">
      <div class="card-panel-header">
        <div class="card-title">
          <span>Active Resource Stock Ledger</span>
          <span class="badge-tag" id="inv-count-badge" style="font-size: 11px; background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 4px;">
            ${inventory.length} records
          </span>
        </div>
        <div style="font-size: 11px; color: var(--text-muted);">
          Threshold Rule: Warning triggers when available &lt; low-stock limit.
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table" id="inventory-table">
          <thead>
            <tr>
              <th>Inventory ID</th>
              <th>Camp / Location</th>
              <th>Resource Name</th>
              <th>Category</th>
              <th>Available Qty</th>
              <th>Warning Limit</th>
              <th>Stock Status</th>
              <th>Last Updated</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody id="inventory-table-body">
            <!-- Dynamic rows -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Restock / Update Quantity Modal -->
    <div id="restock-modal" class="modal-overlay">
      <div class="modal-dialog">
        <div class="modal-header">
          <div class="modal-title" id="restock-modal-title">Update Resource Stock</div>
          <button class="modal-close-btn" id="restock-modal-close-btn">&times;</button>
        </div>
        <form id="restock-form">
          <div class="modal-body">
            <input type="hidden" id="restock-item-id" />
            
            <div id="restock-summary-box" class="alert-box alert-info" style="margin-bottom: 16px;">
              <!-- Dynamic item context -->
            </div>

            <div class="form-group">
              <label class="form-label">Update Mode</label>
              <div style="display: flex; gap: 12px;">
                <label style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; cursor: pointer;">
                  <input type="radio" name="restock-mode" value="add" checked /> Add Inbound Supplies (+)
                </label>
                <label style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; cursor: pointer;">
                  <input type="radio" name="restock-mode" value="set" /> Set Exact Total Quantity
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label required" id="restock-qty-label" for="restock-qty-input">Quantity to Add</label>
              <input type="number" min="1" id="restock-qty-input" class="form-control" placeholder="e.g. 50" required />
              <div class="invalid-feedback" id="restock-qty-error">Please enter a valid positive number.</div>
            </div>

            <div class="form-group">
              <label class="form-label" for="restock-threshold-input">Low-Stock Warning Threshold</label>
              <input type="number" min="1" id="restock-threshold-input" class="form-control" />
              <div class="form-hint">Warning triggers when available stock falls below this number.</div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="restock-modal-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="restock-submit-btn">Update Inventory</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add New Resource Item Modal -->
    <div id="add-item-modal" class="modal-overlay">
      <div class="modal-dialog">
        <div class="modal-header">
          <div class="modal-title">Register New Resource in Camp</div>
          <button class="modal-close-btn" id="add-item-close-btn">&times;</button>
        </div>
        <form id="add-item-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label" for="new-res-id">Record ID</label>
              <input type="text" id="new-res-id" class="form-control" value="${storage.getNextInventoryId()}" readonly style="opacity: 0.8; font-family: var(--font-mono); color: var(--teal-400); font-weight: 700;" />
              <div class="form-hint">Auto-generated inventory sequence identifier.</div>
            </div>

            <div class="form-group">
              <label class="form-label required" for="new-camp-select">Relief Camp</label>
              <select id="new-camp-select" class="form-control" required>
                ${camps.map(c => `<option value="${c.id}" data-location="${c.location}">[${c.id}] ${c.name} (${c.location})</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label required" for="new-res-name">Resource Name</label>
              <input type="text" id="new-res-name" class="form-control" list="common-res-list" placeholder="e.g. Food packets, Blankets, ORS sachets..." required />
              <datalist id="common-res-list">
                <option value="Food packets">
                <option value="Drinking water">
                <option value="Medicine kits">
                <option value="Blankets">
                <option value="Tarpaulins">
                <option value="First Aid kits">
              </datalist>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label required" for="new-res-qty">Initial Quantity</label>
                <input type="number" min="0" id="new-res-qty" class="form-control" placeholder="100" required />
              </div>
              <div class="form-group">
                <label class="form-label required" for="new-res-unit">Unit of Measure</label>
                <input type="text" id="new-res-unit" class="form-control" placeholder="e.g. Packets, Crates, Kits" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label required" for="new-res-limit">Low-Stock Warning Threshold</label>
              <input type="number" min="1" id="new-res-limit" class="form-control" placeholder="e.g. 20" required />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="add-item-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Inventory Record</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Render Table
  function renderInventoryTable() {
    const tbody = container.querySelector('#inventory-table-body');
    const searchVal = container.querySelector('#inventory-search-input').value.trim().toLowerCase();

    const filtered = storage.getInventory().filter(item => {
      // Search
      const matchSearch = !searchVal || 
        item.resource.toLowerCase().includes(searchVal) ||
        item.campName.toLowerCase().includes(searchVal) ||
        (item.campId && item.campId.toLowerCase().includes(searchVal)) ||
        item.id.toLowerCase().includes(searchVal);

      // Camp filter: match either camp ID or camp location name
      const matchCamp = activeCampFilter === 'ALL' || 
                        item.campId === activeCampFilter || 
                        item.campName.toLowerCase() === activeCampFilter.toLowerCase();

      // Category filter
      const matchCat = activeCategoryFilter === 'ALL' || (item.category && item.category.toLowerCase() === activeCategoryFilter.toLowerCase());

      // Status filter
      const isLow = Number(item.quantity) < Number(item.lowStockLimit);
      const isCrit = Number(item.quantity) <= (item.criticalStockLimit || Math.floor(item.lowStockLimit / 2));
      let matchStatus = true;
      if (activeStatusFilter === 'LOW_ONLY') matchStatus = isLow;
      if (activeStatusFilter === 'CRITICAL_ONLY') matchStatus = isCrit;
      if (activeStatusFilter === 'HEALTHY_ONLY') matchStatus = !isLow;

      return matchSearch && matchCamp && matchCat && matchStatus;
    });

    container.querySelector('#inv-count-badge').textContent = `${filtered.length} of ${inventory.length} records`;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9">
            <div class="empty-state">
              <div class="empty-state-icon">📦</div>
              <div class="empty-state-title">No inventory records match filter</div>
              <div class="empty-state-desc">Try resetting your filters or registering new stock records.</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(item => {
      const qty = Number(item.quantity);
      const limit = Number(item.lowStockLimit);
      const critLimit = item.criticalStockLimit || Math.floor(limit / 2);

      let statusPill = '';
      let rowClass = '';

      if (qty <= critLimit) {
        statusPill = `<span class="status-pill status-rejected"><span class="status-dot"></span> 🚨 Critical (${qty}/${limit})</span>`;
        rowClass = 'row-alert-danger';
      } else if (qty < limit) {
        statusPill = `<span class="status-pill status-pending"><span class="status-dot"></span> ⚠️ Low Stock (${qty}/${limit})</span>`;
        rowClass = 'row-alert-warning';
      } else {
        statusPill = `<span class="status-pill status-delivered"><span class="status-dot"></span> ✓ Normal (${qty})</span>`;
      }

      const updatedStr = item.lastUpdated ? new Date(item.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today';

      const canUpdate = activeRole !== 'public';

      return `
        <tr class="${rowClass}" id="inv-row-${item.id}">
          <td>
            <strong style="color: var(--teal-400); font-family: var(--font-mono); font-size: 13px;">${item.id}</strong>
          </td>
          <td>
            <strong>${item.campName}</strong>
            <span style="font-size: 10px; color: var(--teal-400); font-family: var(--font-mono); margin-left: 4px;">(${item.campId || 'C-??'})</span>
          </td>
          <td><span style="font-weight: 600; color: #fff;">${item.resource}</span></td>
          <td><span style="font-size: 11px; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">${item.category || 'General'}</span></td>
          <td>
            <strong style="font-size: 14px; font-family: var(--font-mono); color: ${qty < limit ? 'var(--rose-400)' : '#fff'};">
              ${qty}
            </strong>
            <span style="color: var(--text-muted); font-size: 11px;"> ${item.unit}</span>
          </td>
          <td style="font-family: var(--font-mono); color: var(--text-secondary);">${limit} ${item.unit}</td>
          <td>${statusPill}</td>
          <td style="font-size: 11px; color: var(--text-muted);">${updatedStr}</td>
          <td style="text-align: right;">
            ${canUpdate ? `
              <button class="btn btn-secondary btn-sm action-restock-btn" data-id="${item.id}" id="btn-restock-${item.id}">
                Update Stock
              </button>
            ` : `
              <span style="font-size: 11px; color: var(--text-muted);">Read-Only</span>
            `}
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.action-restock-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openRestockModal(id);
      });
    });
  }

  renderInventoryTable();

  // Filters event binding
  container.querySelector('#inventory-search-input').addEventListener('input', renderInventoryTable);
  container.querySelector('#inv-camp-filter').addEventListener('change', (e) => {
    activeCampFilter = e.target.value;
    renderInventoryTable();
  });
  container.querySelector('#inv-cat-filter').addEventListener('change', (e) => {
    activeCategoryFilter = e.target.value;
    renderInventoryTable();
  });
  container.querySelector('#inv-status-filter').addEventListener('change', (e) => {
    activeStatusFilter = e.target.value;
    renderInventoryTable();
  });

  // Restock Modal Logic
  const restockModal = container.querySelector('#restock-modal');
  const restockForm = container.querySelector('#restock-form');

  function openRestockModal(itemId) {
    const item = storage.getInventory().find(i => i.id === itemId);
    if (!item) return;

    container.querySelector('#restock-item-id').value = item.id;
    container.querySelector('#restock-modal-title').textContent = `Update Stock: [${item.id}] ${item.resource} (${item.campName})`;
    container.querySelector('#restock-summary-box').innerHTML = `
      <div>
        <strong>${item.campName} (${item.campId || ''})</strong> • ${item.resource} <span style="font-family: var(--font-mono); color: #7dd3fc;">[${item.id}]</span><br/>
        Current Available Quantity: <strong style="color: #fff; font-size: 13px;">${item.quantity} ${item.unit}</strong><br/>
        Safety Threshold: ${item.lowStockLimit} ${item.unit}
      </div>
    `;
    container.querySelector('#restock-qty-input').value = "";
    container.querySelector('#restock-threshold-input').value = item.lowStockLimit;
    container.querySelector('#restock-qty-input').classList.remove('is-invalid');
    restockModal.classList.add('open');
  }

  container.querySelector('#restock-modal-close-btn').addEventListener('click', () => restockModal.classList.remove('open'));
  container.querySelector('#restock-modal-cancel-btn').addEventListener('click', () => restockModal.classList.remove('open'));

  // Toggle mode label
  restockForm.querySelectorAll('input[name="restock-mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const mode = e.target.value;
      container.querySelector('#restock-qty-label').textContent = mode === 'add' ? 'Quantity to Add' : 'New Total Quantity';
    });
  });

  restockForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = container.querySelector('#restock-item-id').value;
    const mode = restockForm.querySelector('input[name="restock-mode"]:checked').value;
    const qtyVal = Number(container.querySelector('#restock-qty-input').value);
    const thresholdVal = Number(container.querySelector('#restock-threshold-input').value);

    if (isNaN(qtyVal) || qtyVal <= 0) {
      container.querySelector('#restock-qty-input').classList.add('is-invalid');
      return;
    }

    const item = storage.getInventory().find(i => i.id === id);
    if (!item) return;

    const newQuantity = mode === 'add' ? Number(item.quantity) + qtyVal : qtyVal;
    storage.updateInventoryItem(id, {
      quantity: newQuantity,
      lowStockLimit: thresholdVal > 0 ? thresholdVal : item.lowStockLimit
    });

    window.dispatchEvent(new CustomEvent('aashray:toast', {
      detail: { type: 'success', message: `Stock for [${item.id}] ${item.resource} at ${item.campName} updated to ${newQuantity} ${item.unit}.` }
    }));

    restockModal.classList.remove('open');
    renderInventoryTable();
  });

  // Add Item Modal
  const addItemModal = container.querySelector('#add-item-modal');
  const addItemForm = container.querySelector('#add-item-form');

  container.querySelector('#add-inventory-btn')?.addEventListener('click', () => {
    container.querySelector('#new-res-id').value = storage.getNextInventoryId();
    addItemModal.classList.add('open');
  });
  container.querySelector('#add-item-close-btn')?.addEventListener('click', () => addItemModal.classList.remove('open'));
  container.querySelector('#add-item-cancel-btn')?.addEventListener('click', () => addItemModal.classList.remove('open'));

  addItemForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = container.querySelector('#new-res-id').value.trim();
    const campSelect = container.querySelector('#new-camp-select');
    const campId = campSelect.value;
    const campName = campSelect.options[campSelect.selectedIndex].getAttribute('data-location') || 'Camp';
    const resource = container.querySelector('#new-res-name').value.trim();
    const quantity = Number(container.querySelector('#new-res-qty').value);
    const unit = container.querySelector('#new-res-unit').value.trim() || 'Units';
    const lowStockLimit = Number(container.querySelector('#new-res-limit').value);
    const category = RESOURCE_CATEGORIES[resource] || 'General';

    if (!resource || isNaN(quantity) || quantity < 0 || isNaN(lowStockLimit)) {
      alert('Please fill out all required fields with valid positive numbers.');
      return;
    }

    storage.addInventoryItem({
      id,
      campId,
      campName,
      resource,
      category,
      quantity,
      unit,
      lowStockLimit,
      criticalStockLimit: Math.floor(lowStockLimit / 2)
    });

    window.dispatchEvent(new CustomEvent('aashray:toast', {
      detail: { type: 'success', message: `Registered [${id}] ${quantity} ${unit} of ${resource} at ${campName}.` }
    }));

    addItemModal.classList.remove('open');
    renderInventoryTable();
  });

  // Listen for external open-restock-modal
  window.addEventListener('aashray:open-restock-modal', (e) => {
    if (e.detail && e.detail.id) {
      openRestockModal(e.detail.id);
    }
  });
}
