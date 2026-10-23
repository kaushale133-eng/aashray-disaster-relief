// AASHRAY Storage & State Service
// Persists application state in localStorage with validation and reactive event broadcasting.
import { INITIAL_CAMPS, INITIAL_INVENTORY, INITIAL_REQUESTS } from '../data/initialData.js';

const STORAGE_KEYS = {
  CAMPS: 'aashray_camps_v1',
  INVENTORY: 'aashray_inventory_v1',
  REQUESTS: 'aashray_requests_v1',
  ACTIVE_ROLE: 'aashray_active_role_v1',
  LAST_RESET: 'aashray_last_reset_v1'
};

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// In-memory fallback if localStorage is unavailable (e.g. Node tests)
const memoryStore = {};

const getStorageItem = (key) => {
  if (isBrowser) return localStorage.getItem(key);
  return memoryStore[key] || null;
};

const setStorageItem = (key, val) => {
  if (isBrowser) localStorage.setItem(key, val);
  else memoryStore[key] = String(val);
};

export function generateNextId(items, prefix, padLength = 2) {
  let maxNum = 0;
  items.forEach(item => {
    if (item && item.id && typeof item.id === 'string' && item.id.startsWith(prefix)) {
      const numPart = parseInt(item.id.slice(prefix.length), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  });
  return `${prefix}${String(maxNum + 1).padStart(padLength, '0')}`;
}

class StorageService {
  constructor() {
    this.init();
  }

  init() {
    if (!getStorageItem(STORAGE_KEYS.CAMPS)) {
      this.resetToDefaults(false);
    }
  }

  notifyChange(eventType = 'general', details = {}) {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      const event = new CustomEvent('aashray:state-changed', {
        detail: { type: eventType, timestamp: new Date().toISOString(), ...details }
      });
      window.dispatchEvent(event);
    }
  }

  // --- Camps ---
  getCamps() {
    try {
      const data = getStorageItem(STORAGE_KEYS.CAMPS);
      return data ? JSON.parse(data) : INITIAL_CAMPS;
    } catch (e) {
      console.error('Error reading camps from storage', e);
      return INITIAL_CAMPS;
    }
  }

  saveCamps(camps) {
    setStorageItem(STORAGE_KEYS.CAMPS, JSON.stringify(camps));
    this.notifyChange('camps');
  }

  getNextCampId() {
    return generateNextId(this.getCamps(), 'C-', 2);
  }

  addCamp(campData) {
    const camps = this.getCamps();
    const newCamp = {
      ...campData,
      id: (campData.id && campData.id.trim()) ? campData.id.trim() : generateNextId(camps, 'C-', 2),
      createdAt: new Date().toISOString()
    };
    camps.push(newCamp);
    this.saveCamps(camps);
    return newCamp;
  }

  updateCamp(id, updatedFields) {
    const camps = this.getCamps();
    const idx = camps.findIndex(c => c.id === id);
    if (idx === -1) throw new Error(`Camp with ID ${id} not found.`);
    camps[idx] = { ...camps[idx], ...updatedFields, updatedAt: new Date().toISOString() };
    this.saveCamps(camps);

    // If camp name changed, update inventory & requests campName
    if (updatedFields.name) {
      const inv = this.getInventory().map(item => item.campId === id ? { ...item, campName: updatedFields.location || updatedFields.name } : item);
      this.saveInventory(inv);
      const reqs = this.getRequests().map(req => req.campId === id ? { ...req, campName: updatedFields.location || updatedFields.name } : req);
      this.saveRequests(reqs);
    }
    return camps[idx];
  }

  deleteCamp(id) {
    const camps = this.getCamps().filter(c => c.id !== id);
    this.saveCamps(camps);
    // Remove associated inventory items
    const inventory = this.getInventory().filter(i => i.campId !== id);
    this.saveInventory(inventory);
    return true;
  }

  // --- Inventory ---
  getInventory() {
    try {
      const data = getStorageItem(STORAGE_KEYS.INVENTORY);
      return data ? JSON.parse(data) : INITIAL_INVENTORY;
    } catch (e) {
      console.error('Error reading inventory', e);
      return INITIAL_INVENTORY;
    }
  }

  saveInventory(inventory) {
    setStorageItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
    this.notifyChange('inventory');
  }

  updateInventoryItem(id, updates) {
    const inv = this.getInventory();
    const idx = inv.findIndex(i => i.id === id);
    if (idx === -1) throw new Error(`Inventory item ${id} not found.`);
    inv[idx] = {
      ...inv[idx],
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    this.saveInventory(inv);
    return inv[idx];
  }

  getNextInventoryId() {
    return generateNextId(this.getInventory(), 'INV-', 3);
  }

  addInventoryItem(item) {
    const inv = this.getInventory();
    const newItem = {
      ...item,
      id: (item.id && item.id.trim()) ? item.id.trim() : generateNextId(inv, 'INV-', 3),
      lastUpdated: new Date().toISOString()
    };
    inv.push(newItem);
    this.saveInventory(inv);
    return newItem;
  }

  findInventoryItem(campId, resourceName) {
    const inv = this.getInventory();
    return inv.find(i => (i.campId === campId || i.campName.toLowerCase() === campId.toLowerCase()) && 
                         i.resource.toLowerCase() === resourceName.toLowerCase());
  }

  // --- Requests ---
  getRequests() {
    try {
      const data = getStorageItem(STORAGE_KEYS.REQUESTS);
      return data ? JSON.parse(data) : INITIAL_REQUESTS;
    } catch (e) {
      console.error('Error reading requests', e);
      return INITIAL_REQUESTS;
    }
  }

  saveRequests(requests) {
    setStorageItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    this.notifyChange('requests');
  }

  getNextRequestId() {
    return generateNextId(this.getRequests(), 'R-', 3);
  }

  addRequest(reqData) {
    const reqs = this.getRequests();
    const newReq = {
      ...reqData,
      id: (reqData.id && reqData.id.trim()) ? reqData.id.trim() : generateNextId(reqs, 'R-', 3),
      allocatedQuantity: 0,
      createdAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: "Request Submitted",
          by: reqData.createdBy || "Relief Camp Manager",
          note: `Requested ${reqData.quantity} ${reqData.unit} of ${reqData.requiredSupply}`
        }
      ]
    };
    reqs.unshift(newReq);
    this.saveRequests(reqs);
    return newReq;
  }

  updateRequestStatus(id, newStatus, user = "Disaster Coordinator", reason = "") {
    const reqs = this.getRequests();
    const idx = reqs.findIndex(r => r.id === id);
    if (idx === -1) throw new Error(`Request ${id} not found.`);
    
    const oldStatus = reqs[idx].status;
    reqs[idx].status = newStatus;
    reqs[idx].updatedAt = new Date().toISOString();
    if (!reqs[idx].history) reqs[idx].history = [];
    
    reqs[idx].history.push({
      timestamp: new Date().toISOString(),
      action: `Status changed from ${oldStatus} to ${newStatus}`,
      by: user,
      note: reason || `Coordinator updated request status to ${newStatus}.`
    });

    this.saveRequests(reqs);
    return reqs[idx];
  }

  // --- Role Management ---
  getActiveRole() {
    return getStorageItem(STORAGE_KEYS.ACTIVE_ROLE) || 'coordinator';
  }

  setActiveRole(role) {
    setStorageItem(STORAGE_KEYS.ACTIVE_ROLE, role);
    this.notifyChange('role', { role });
  }

  // --- Calculations & Metrics ---
  getDashboardMetrics() {
    const camps = this.getCamps();
    const requests = this.getRequests();
    const inventory = this.getInventory();

    // Open requests: Pending, Approved, In Progress
    const openRequests = requests.filter(r => ['Pending', 'Approved', 'In Progress'].includes(r.status));

    // Low stock: quantity < lowStockLimit
    const lowStockItems = inventory.filter(i => Number(i.quantity) < Number(i.lowStockLimit));
    // Critical stock: quantity < criticalStockLimit (or lowStockLimit / 2)
    const criticalStockItems = inventory.filter(i => {
      const critLimit = i.criticalStockLimit || Math.floor(i.lowStockLimit / 2);
      return Number(i.quantity) <= critLimit;
    });

    // Breakdown
    const statusCounts = {
      Pending: 0,
      Approved: 0,
      'In Progress': 0,
      Delivered: 0,
      Rejected: 0
    };
    requests.forEach(r => {
      if (statusCounts[r.status] !== undefined) {
        statusCounts[r.status]++;
      } else {
        statusCounts[r.status] = 1;
      }
    });

    return {
      totalCamps: camps.length,
      totalRequests: requests.length,
      openRequests: openRequests.length,
      lowStockCount: lowStockItems.length,
      criticalStockCount: criticalStockItems.length,
      lowStockItems,
      criticalStockItems,
      statusCounts,
      recentRequests: requests.slice(0, 6)
    };
  }

  // --- Reset & Export ---
  resetToDefaults(triggerEvent = true) {
    setStorageItem(STORAGE_KEYS.CAMPS, JSON.stringify(INITIAL_CAMPS));
    setStorageItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
    setStorageItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
    setStorageItem(STORAGE_KEYS.LAST_RESET, new Date().toISOString());
    if (triggerEvent) {
      this.notifyChange('reset');
    }
  }

  exportDataJson() {
    return JSON.stringify({
      version: "1.0",
      app: "AASHRAY Disaster Relief Coordination Platform",
      exportTime: new Date().toISOString(),
      camps: this.getCamps(),
      inventory: this.getInventory(),
      requests: this.getRequests()
    }, null, 2);
  }

  importDataJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.camps && Array.isArray(parsed.camps)) {
        this.saveCamps(parsed.camps);
      }
      if (parsed.inventory && Array.isArray(parsed.inventory)) {
        this.saveInventory(parsed.inventory);
      }
      if (parsed.requests && Array.isArray(parsed.requests)) {
        this.saveRequests(parsed.requests);
      }
      return true;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  }
}

export const storage = new StorageService();
