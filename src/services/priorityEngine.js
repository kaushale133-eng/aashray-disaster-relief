// AASHRAY Transparent Priority Recommendation Engine
// Suggests which request to review first based on transparent, explainable rules.
import { storage } from './storage.js';

export class PriorityEngine {
  /**
   * Evaluates open requests and scores them transparently.
   */
  static getRecommendations() {
    const requests = storage.getRequests();
    const inventory = storage.getInventory();

    const openRequests = requests.filter(r => ['Pending', 'Approved', 'In Progress'].includes(r.status));

    const scored = openRequests.map(req => {
      let score = 0;
      const reasons = [];

      // 1. Priority Weight
      if (req.priority === 'Critical') {
        score += 100;
        reasons.push({ label: 'Critical Priority', type: 'critical' });
      } else if (req.priority === 'High') {
        score += 60;
        reasons.push({ label: 'High Priority', type: 'warning' });
      } else {
        score += 20;
        reasons.push({ label: 'Normal Priority', type: 'info' });
      }

      // 2. Pending Review Weight
      if (req.status === 'Pending') {
        score += 40;
        reasons.push({ label: 'Awaiting Coordinator Review', type: 'warning' });
      } else if (req.status === 'Approved') {
        score += 25;
        reasons.push({ label: 'Approved - Ready for Allocation', type: 'info' });
      }

      // 3. Stock Availability Check
      const stockItem = inventory.find(i => 
        (i.campId === req.campId || i.campName.toLowerCase() === (req.campName || '').toLowerCase()) &&
        i.resource.toLowerCase() === req.requiredSupply.toLowerCase()
      );

      const availableStock = stockItem ? Number(stockItem.quantity) : 0;
      const needed = Number(req.quantity) - Number(req.allocatedQuantity || 0);

      if (availableStock >= needed && needed > 0) {
        score += 30;
        reasons.push({ label: `Immediate Stock Available (${availableStock} ${stockItem ? stockItem.unit : ''})`, type: 'success' });
      } else if (availableStock > 0 && availableStock < needed) {
        score += 15;
        reasons.push({ label: `Partial Stock Available (${availableStock}/${needed})`, type: 'warning' });
      } else {
        score -= 10;
        reasons.push({ label: 'Zero/Insufficient Stock at Camp', type: 'danger' });
      }

      // 4. Time age factor
      const created = new Date(req.createdAt || Date.now()).getTime();
      const ageHours = Math.max(0, (Date.now() - created) / (1000 * 60 * 60));
      if (ageHours > 3) {
        score += 15;
        reasons.push({ label: `Aging Request (${Math.round(ageHours)}h elapsed)`, type: 'neutral' });
      }

      return {
        request: req,
        score,
        reasons,
        availableStock,
        needed,
        canFulfillImmediately: availableStock >= needed
      };
    });

    // Sort descending by score
    return scored.sort((a, b) => b.score - a.score);
  }
}
