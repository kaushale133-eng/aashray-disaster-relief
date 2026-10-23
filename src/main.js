// AASHRAY - Disaster Relief Coordination Platform
// Main Router and Application Lifecycle Manager
import { storage } from './services/storage.js';
import { renderDashboard } from './components/dashboard.js';
import { renderCamps } from './components/camps.js';
import { renderInventory } from './components/inventory.js';
import { renderRequests } from './components/requests.js';
import { renderAllocation } from './components/allocation.js';
import { renderAnalytics } from './components/analytics.js';
import { renderSettings } from './components/settings.js';

let currentView = 'dashboard';
let currentParams = {};

const viewContainer = document.getElementById('router-view-container');
const navButtons = document.querySelectorAll('.nav-tab-btn');
const toastContainer = document.getElementById('toast-container');

// Role definitions (Station Access Roles)
const ROLE_CONFIGS = {
  coordinator: { name: 'Administrator / Chief Coordinator', badgeText: 'State Command Access', class: 'status-approved' },
  manager: { name: 'Relief Camp Operations Officer', badgeText: 'Camp Operations Mode', class: 'status-in-progress' },
  delivery: { name: 'Field Logistics & Transport Unit', badgeText: 'Field Fleet Active', class: 'status-pending' },
  public: { name: 'Citizen Public Transparency Portal', badgeText: 'Public Citizen Access', class: 'status-delivered' }
};

/**
 * Toast Notification System
 */
export function showToast(message, type = 'info', duration = 3500) {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✓';
  if (type === 'error') icon = '⚠️';
  if (type === 'warning') icon = '⚡';

  toast.innerHTML = `
    <span style="font-weight: 700; font-size: 14px;">${icon}</span>
    <span style="flex: 1; line-height: 1.3;">${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, duration);
}

// Global Toast Listener
window.addEventListener('aashray:toast', (e) => {
  if (e.detail && e.detail.message) {
    showToast(e.detail.message, e.detail.type || 'info', e.detail.duration || 3500);
  }
});

/**
 * Navigation Badges Updater
 */
function updateHeaderBadges() {
  const metrics = storage.getDashboardMetrics();

  const campsBadge = document.getElementById('nav-camps-count');
  if (campsBadge) campsBadge.textContent = metrics.totalCamps;

  const lowStockBadge = document.getElementById('nav-lowstock-count');
  if (lowStockBadge) {
    lowStockBadge.textContent = `${metrics.lowStockCount}⚠️`;
    const invTab = document.getElementById('nav-btn-inventory');
    if (invTab) {
      if (metrics.lowStockCount > 0) {
        invTab.classList.add('has-alert');
      } else {
        invTab.classList.remove('has-alert');
      }
    }
  }

  const requestsBadge = document.getElementById('nav-requests-count');
  if (requestsBadge) {
    requestsBadge.textContent = `${metrics.openRequests} Open`;
  }
}

/**
 * Main Router Navigator
 */
export function navigateTo(viewName, params = {}) {
  currentView = viewName;
  currentParams = params;

  // Update navigation button active state
  navButtons.forEach(btn => {
    if (btn.getAttribute('data-view') === viewName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Render view
  viewContainer.innerHTML = '';

  switch (viewName) {
    case 'dashboard':
      renderDashboard(viewContainer, navigateTo);
      break;
    case 'camps':
      renderCamps(viewContainer, navigateTo, params);
      break;
    case 'inventory':
      renderInventory(viewContainer, navigateTo, params);
      break;
    case 'requests':
      renderRequests(viewContainer, navigateTo, params);
      break;
    case 'allocation':
      renderAllocation(viewContainer, navigateTo, params);
      break;
    case 'analytics':
      renderAnalytics(viewContainer, navigateTo);
      break;
    case 'settings':
      renderSettings(viewContainer, navigateTo);
      break;
    default:
      renderDashboard(viewContainer, navigateTo);
  }

  updateHeaderBadges();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Bind navigation tabs
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.getAttribute('data-view');
    navigateTo(view);
  });
});

// Role Switcher Setup
const roleSelect = document.getElementById('active-role-select');
const rolePill = document.getElementById('role-pill-badge');

function applyRole(roleKey) {
  const cfg = ROLE_CONFIGS[roleKey] || ROLE_CONFIGS.coordinator;
  if (rolePill) {
    rolePill.className = `status-pill ${cfg.class}`;
    rolePill.innerHTML = `<span class="status-dot"></span> ${cfg.badgeText}`;
  }
}

if (roleSelect) {
  roleSelect.value = storage.getActiveRole();
  applyRole(roleSelect.value);

  roleSelect.addEventListener('change', (e) => {
    const newRole = e.target.value;
    storage.setActiveRole(newRole);
    applyRole(newRole);
    const cfg = ROLE_CONFIGS[newRole];
    showToast(`Switched active perspective to: ${cfg.name}`, 'info');
    navigateTo(currentView, currentParams);
  });
}

// Live Clock updater
function updateLiveClock() {
  const clockEl = document.getElementById('system-live-clock');
  if (clockEl) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    clockEl.textContent = `${timeStr} IST`;
  }
}
setInterval(updateLiveClock, 1000);
updateLiveClock();

// Quick Banner Reset button
const quickResetBtn = document.getElementById('quick-banner-reset-btn');
if (quickResetBtn) {
  quickResetBtn.addEventListener('click', () => {
    if (confirm('Restore operational database to initial baseline snapshot (4 camps, 16 inventory items, 8 requests)?')) {
      storage.resetToDefaults(true);
      showToast('Operational records restored to baseline snapshot.', 'success');
      navigateTo('dashboard');
    }
  });
}

// Global State Change Listener (Updates badges and view if needed)
window.addEventListener('aashray:state-changed', () => {
  updateHeaderBadges();
});

// Initial boot
storage.init();
updateHeaderBadges();
navigateTo('dashboard');
console.log('AASHRAY Disaster Relief Coordination Platform Initialized.');
