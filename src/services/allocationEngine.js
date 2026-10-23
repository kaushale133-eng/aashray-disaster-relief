// AASHRAY Allocation & Stock Validation Engine
// Enforces strict rules: no over-allocation, inventory decrementing, and transparent warnings.
import { storage } from './storage.js';

export class AllocationEngine {
  /**
   * Validates whether an allocation can proceed.
   * Returns validation status, available stock, deficit, and diagnostic messaging.
   */
  static validate(requestId, quantityToAllocate, sourceCampId = null) {
    const qty = Number(quantityToAllocate);
    if (isNaN(qty) || qty <= 0) {
      return {
        valid: false,
        code: 'INVALID_QUANTITY',
        message: 'Allocation quantity must be a positive number greater than 0.'
      };
    }

    const requests = storage.getRequests();
    const req = requests.find(r => r.id === requestId);
    if (!req) {
      return {
        valid: false,
        code: 'REQUEST_NOT_FOUND',
        message: `Request with ID "${requestId}" does not exist.`
      };
    }

    // Determine target camp
    const campId = sourceCampId || req.campId;
    const inventory = storage.getInventory();
    
    // Find matching inventory item for camp + requiredSupply
    const item = inventory.find(i => 
      (i.campId === campId || i.campName.toLowerCase() === (req.campName || '').toLowerCase()) &&
      i.resource.toLowerCase() === req.requiredSupply.toLowerCase()
    );

    if (!item) {
      return {
        valid: false,
        code: 'RESOURCE_NOT_STOCKED',
        message: `Camp does not hold stock records for "${req.requiredSupply}". Please add stock to inventory first.`
      };
    }

    const availableStock = Number(item.quantity);
    const totalNeeded = Number(req.quantity);
    const alreadyAllocated = Number(req.allocatedQuantity || 0);
    const remainingNeeded = Math.max(0, totalNeeded - alreadyAllocated);

    // Rule 1: Cannot allocate more than available in stock
    if (qty > availableStock) {
      return {
        valid: false,
        code: 'INSUFFICIENT_STOCK',
        item,
        availableStock,
        requestedQty: qty,
        remainingNeeded,
        shortage: qty - availableStock,
        message: `Insufficient stock! ${item.campName} only has ${availableStock} ${item.unit} of ${item.resource} available. You cannot allocate ${qty} ${item.unit}. (Shortage: ${qty - availableStock} ${item.unit})`
      };
    }

    // Rule 2: Cannot allocate more than remaining needed for this request
    if (qty > remainingNeeded) {
      return {
        valid: false,
        code: 'EXCEEDS_REQUIREMENT',
        item,
        availableStock,
        remainingNeeded,
        message: `Cannot allocate ${qty} ${item.unit}. The remaining unfulfilled requirement for Request ${req.id} is only ${remainingNeeded} ${item.unit}.`
      };
    }

    const isFullFulfillment = (alreadyAllocated + qty) >= totalNeeded;
    const remainingAfterAllocation = totalNeeded - (alreadyAllocated + qty);

    return {
      valid: true,
      item,
      availableStock,
      remainingStockAfter: availableStock - qty,
      isFullFulfillment,
      remainingAfterAllocation,
      message: isFullFulfillment 
        ? `Sufficient stock available. Will fully satisfy Request ${req.id} (${totalNeeded} ${item.unit}).` 
        : `Partial allocation permitted. ${qty} ${item.unit} will be allocated. ${remainingAfterAllocation} ${item.unit} will remain unfulfilled.`
    };
  }

  /**
   * Executes allocation, updating inventory and request records atomically in storage.
   */
  static execute(requestId, quantityToAllocate, sourceCampId = null, user = "Disaster Coordinator", notes = "") {
    const validation = this.validate(requestId, quantityToAllocate, sourceCampId);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const qty = Number(quantityToAllocate);
    const { item } = validation;

    // 1. Decrement inventory
    const newStock = Number(item.quantity) - qty;
    storage.updateInventoryItem(item.id, { quantity: newStock });

    // 2. Update request
    const requests = storage.getRequests();
    const reqIndex = requests.findIndex(r => r.id === requestId);
    const req = requests[reqIndex];

    const prevAllocated = Number(req.allocatedQuantity || 0);
    const newAllocated = prevAllocated + qty;
    const totalRequired = Number(req.quantity);
    const isFullySatisfied = newAllocated >= totalRequired;

    // Transition status to In Progress (or Approved if previously pending)
    let newStatus = req.status;
    if (req.status === 'Pending') {
      newStatus = 'In Progress';
    } else if (req.status === 'Approved') {
      newStatus = 'In Progress';
    }

    const historyEntry = {
      timestamp: new Date().toISOString(),
      action: isFullySatisfied ? `Full Allocation (${qty} ${item.unit})` : `Partial Allocation (${qty} ${item.unit})`,
      by: user,
      note: notes || `Allocated ${qty} ${item.unit} from ${item.campName}. Total allocated: ${newAllocated}/${totalRequired} ${item.unit}. Remaining camp stock: ${newStock}.`
    };

    req.allocatedQuantity = newAllocated;
    req.status = newStatus;
    if (!req.history) req.history = [];
    req.history.push(historyEntry);

    storage.saveRequests(requests);

    return {
      success: true,
      request: req,
      inventoryItem: item,
      allocatedQuantity: qty,
      totalAllocated: newAllocated,
      remainingNeeded: Math.max(0, totalRequired - newAllocated),
      remainingStock: newStock,
      isFullySatisfied
    };
  }
}
