// AASHRAY Disaster Relief Platform - Demonstration Data Specification
// Strictly derived from VIBEATHON 2026 / DisplaceOS Requirements Document

export const INITIAL_CAMPS = [
  {
    id: "C-01",
    name: "Bhimtal Community Relief Camp",
    location: "Bhimtal",
    lat: 29.3500,
    lng: 79.5300,
    contact: "Rajesh Verma (Officer-in-Charge: +91 98765-43210)",
    notes: "Food and water distribution",
    capacity: 450,
    currentOccupancy: 380,
    establishedDate: "2026-10-18"
  },
  {
    id: "C-02",
    name: "Haldwani Relief Camp",
    location: "Haldwani",
    lat: 29.2183,
    lng: 79.5130,
    contact: "Dr. Anita Joshi (Medical Lead: +91 98765-43211)",
    notes: "Medicine supply monitoring",
    capacity: 600,
    currentOccupancy: 510,
    establishedDate: "2026-10-19"
  },
  {
    id: "C-03",
    name: "Rishikesh Temporary Shelter",
    location: "Rishikesh",
    lat: 30.0869,
    lng: 78.2676,
    contact: "Vikram Singh (Camp Coordinator: +91 98765-43212)",
    notes: "Temporary shelter and blanket needs",
    capacity: 350,
    currentOccupancy: 320,
    establishedDate: "2026-10-19"
  },
  {
    id: "C-04",
    name: "Haridwar Emergency Camp",
    location: "Haridwar",
    lat: 29.9457,
    lng: 78.1642,
    contact: "Sunita Rawat (Logistics Officer: +91 98765-43213)",
    notes: "Emergency stock distribution",
    capacity: 800,
    currentOccupancy: 740,
    establishedDate: "2026-10-20"
  }
];

export const INITIAL_INVENTORY = [
  {
    id: "INV-001",
    campId: "C-01",
    campName: "Bhimtal",
    resource: "Food packets",
    category: "Food",
    quantity: 180,
    unit: "Packets",
    lowStockLimit: 100,
    criticalStockLimit: 50,
    lastUpdated: "2026-10-23T10:15:00"
  },
  {
    id: "INV-002",
    campId: "C-01",
    campName: "Bhimtal",
    resource: "Drinking water",
    category: "Water",
    quantity: 90,
    unit: "Crates",
    lowStockLimit: 40,
    criticalStockLimit: 20,
    lastUpdated: "2026-10-23T11:00:00"
  },
  {
    id: "INV-003",
    campId: "C-01",
    campName: "Bhimtal",
    resource: "Medicine kits",
    category: "Medicines",
    quantity: 12,
    unit: "Kits",
    lowStockLimit: 8,
    criticalStockLimit: 4,
    lastUpdated: "2026-10-23T09:30:00"
  },
  {
    id: "INV-004",
    campId: "C-01",
    campName: "Bhimtal",
    resource: "Blankets",
    category: "Shelter",
    quantity: 35,
    unit: "Pieces",
    lowStockLimit: 20,
    criticalStockLimit: 10,
    lastUpdated: "2026-10-23T08:45:00"
  },
  {
    id: "INV-005",
    campId: "C-02",
    campName: "Haldwani",
    resource: "Food packets",
    category: "Food",
    quantity: 60,
    unit: "Packets",
    lowStockLimit: 100,
    criticalStockLimit: 50,
    lastUpdated: "2026-10-23T11:20:00"
  },
  {
    id: "INV-006",
    campId: "C-02",
    campName: "Haldwani",
    resource: "Drinking water",
    category: "Water",
    quantity: 120,
    unit: "Crates",
    lowStockLimit: 40,
    criticalStockLimit: 20,
    lastUpdated: "2026-10-23T12:00:00"
  },
  {
    id: "INV-007",
    campId: "C-02",
    campName: "Haldwani",
    resource: "Medicine kits",
    category: "Medicines",
    quantity: 5,
    unit: "Kits",
    lowStockLimit: 8,
    criticalStockLimit: 4,
    lastUpdated: "2026-10-23T07:15:00"
  },
  {
    id: "INV-008",
    campId: "C-02",
    campName: "Haldwani",
    resource: "Blankets",
    category: "Shelter",
    quantity: 50,
    unit: "Pieces",
    lowStockLimit: 20,
    criticalStockLimit: 10,
    lastUpdated: "2026-10-23T09:00:00"
  },
  {
    id: "INV-009",
    campId: "C-03",
    campName: "Rishikesh",
    resource: "Food packets",
    category: "Food",
    quantity: 130,
    unit: "Packets",
    lowStockLimit: 100,
    criticalStockLimit: 50,
    lastUpdated: "2026-10-23T10:00:00"
  },
  {
    id: "INV-010",
    campId: "C-03",
    campName: "Rishikesh",
    resource: "Drinking water",
    category: "Water",
    quantity: 25,
    unit: "Crates",
    lowStockLimit: 40,
    criticalStockLimit: 20,
    lastUpdated: "2026-10-23T13:10:00"
  },
  {
    id: "INV-011",
    campId: "C-03",
    campName: "Rishikesh",
    resource: "Medicine kits",
    category: "Medicines",
    quantity: 14,
    unit: "Kits",
    lowStockLimit: 8,
    criticalStockLimit: 4,
    lastUpdated: "2026-10-23T08:30:00"
  },
  {
    id: "INV-012",
    campId: "C-03",
    campName: "Rishikesh",
    resource: "Blankets",
    category: "Shelter",
    quantity: 18,
    unit: "Pieces",
    lowStockLimit: 20,
    criticalStockLimit: 10,
    lastUpdated: "2026-10-23T10:45:00"
  },
  {
    id: "INV-013",
    campId: "C-04",
    campName: "Haridwar",
    resource: "Food packets",
    category: "Food",
    quantity: 70,
    unit: "Packets",
    lowStockLimit: 100,
    criticalStockLimit: 50,
    lastUpdated: "2026-10-23T12:30:00"
  },
  {
    id: "INV-014",
    campId: "C-04",
    campName: "Haridwar",
    resource: "Drinking water",
    category: "Water",
    quantity: 75,
    unit: "Crates",
    lowStockLimit: 40,
    criticalStockLimit: 20,
    lastUpdated: "2026-10-23T11:15:00"
  },
  {
    id: "INV-015",
    campId: "C-04",
    campName: "Haridwar",
    resource: "Medicine kits",
    category: "Medicines",
    quantity: 10,
    unit: "Kits",
    lowStockLimit: 8,
    criticalStockLimit: 4,
    lastUpdated: "2026-10-23T10:20:00"
  },
  {
    id: "INV-016",
    campId: "C-04",
    campName: "Haridwar",
    resource: "Blankets",
    category: "Shelter",
    quantity: 8,
    unit: "Pieces",
    lowStockLimit: 20,
    criticalStockLimit: 10,
    lastUpdated: "2026-10-23T09:10:00"
  }
];

export const INITIAL_REQUESTS = [
  {
    id: "R-001",
    campId: "C-01",
    campName: "Bhimtal",
    requiredSupply: "Drinking water",
    category: "Water",
    quantity: 30,
    unit: "crates",
    allocatedQuantity: 0,
    priority: "Critical",
    status: "Pending",
    description: "Urgent hydration needs for newly displaced families in Sector 4.",
    createdAt: "2026-10-23T08:00:00",
    history: [
      { timestamp: "2026-10-23T08:00:00", action: "Request Created", by: "Camp Manager", note: "Submitted request for 30 crates drinking water" }
    ]
  },
  {
    id: "R-002",
    campId: "C-02",
    campName: "Haldwani",
    requiredSupply: "Medicine kits",
    category: "Medicines",
    quantity: 4,
    unit: "kits",
    allocatedQuantity: 0,
    priority: "Critical",
    status: "Pending",
    description: "Immediate requirement for emergency trauma kits and pediatric antibiotic supplies.",
    createdAt: "2026-10-23T08:30:00",
    history: [
      { timestamp: "2026-10-23T08:30:00", action: "Request Created", by: "Medical Lead", note: "Submitted emergency medical kit request" }
    ]
  },
  {
    id: "R-003",
    campId: "C-03",
    campName: "Rishikesh",
    requiredSupply: "Blankets",
    category: "Shelter",
    quantity: 10,
    unit: "pieces",
    allocatedQuantity: 0,
    priority: "High",
    status: "Approved",
    description: "Night chill protection for elderly evacuees in shelter wing B.",
    createdAt: "2026-10-23T09:00:00",
    history: [
      { timestamp: "2026-10-23T09:00:00", action: "Request Created", by: "Camp Coordinator", note: "Submitted request for 10 blankets" },
      { timestamp: "2026-10-23T10:15:00", action: "Status Changed to Approved", by: "Disaster Coordinator", note: "Approved for allocation" }
    ]
  },
  {
    id: "R-004",
    campId: "C-04",
    campName: "Haridwar",
    requiredSupply: "Food packets",
    category: "Food",
    quantity: 30,
    unit: "packets",
    allocatedQuantity: 20,
    priority: "High",
    status: "In Progress",
    description: "Ready-to-eat ration supply for midday distribution. 20 packets dispatched, 10 packets deficit pending.",
    createdAt: "2026-10-23T09:45:00",
    history: [
      { timestamp: "2026-10-23T09:45:00", action: "Request Created", by: "Logistics Officer", note: "Submitted request for 30 food packets" },
      { timestamp: "2026-10-23T10:30:00", action: "Partial Allocation (20 packets)", by: "Disaster Coordinator", note: "Stock decreased by 20. Remaining 10 unfulfilled." },
      { timestamp: "2026-10-23T10:35:00", action: "Status Changed to In Progress", by: "Logistics Team", note: "Dispatched batch 1 via Quick Response Van" }
    ]
  },
  {
    id: "R-005",
    campId: "C-01",
    campName: "Bhimtal",
    requiredSupply: "Food packets",
    category: "Food",
    quantity: 25,
    unit: "packets",
    allocatedQuantity: 25,
    priority: "Normal",
    status: "Delivered",
    description: "Morning supplementary ration supply for kitchen staff.",
    createdAt: "2026-10-23T07:30:00",
    history: [
      { timestamp: "2026-10-23T07:30:00", action: "Request Created", by: "Camp Manager", note: "Submitted request for 25 food packets" },
      { timestamp: "2026-10-23T08:15:00", action: "Allocated (25 packets)", by: "Disaster Coordinator", note: "Full allocation verified" },
      { timestamp: "2026-10-23T09:40:00", action: "Delivered", by: "Rescue Team Alpha", note: "Received and signed by Camp Manager" }
    ]
  },
  {
    id: "R-006",
    campId: "C-02",
    campName: "Haldwani",
    requiredSupply: "Drinking water",
    category: "Water",
    quantity: 30,
    unit: "crates",
    allocatedQuantity: 30,
    priority: "Normal",
    status: "Delivered",
    description: "Daily scheduled drinking water replenishment for Base Ward.",
    createdAt: "2026-10-23T08:10:00",
    history: [
      { timestamp: "2026-10-23T08:10:00", action: "Request Created", by: "Medical Lead", note: "Submitted drinking water replenishment" },
      { timestamp: "2026-10-23T08:50:00", action: "Allocated (30 crates)", by: "Disaster Coordinator", note: "Stock allocated from Haldwani depot" },
      { timestamp: "2026-10-23T10:05:00", action: "Delivered", by: "Delivery Team 2", note: "Stored in clean water facility" }
    ]
  },
  {
    id: "R-007",
    campId: "C-03",
    campName: "Rishikesh",
    requiredSupply: "Food packets",
    category: "Food",
    quantity: 70,
    unit: "packets",
    allocatedQuantity: 0,
    priority: "High",
    status: "Rejected",
    description: "Non-standard bulk request duplicate of previously fulfilled morning delivery batch.",
    createdAt: "2026-10-23T10:00:00",
    history: [
      { timestamp: "2026-10-23T10:00:00", action: "Request Created", by: "Camp Staff", note: "Submitted duplicate request" },
      { timestamp: "2026-10-23T10:25:00", action: "Rejected", by: "Disaster Coordinator", note: "Duplicate request; morning distribution already provided required rations." }
    ]
  },
  {
    id: "R-008",
    campId: "C-04",
    campName: "Haridwar",
    requiredSupply: "Blankets",
    category: "Shelter",
    quantity: 12,
    unit: "pieces",
    allocatedQuantity: 0,
    priority: "Critical",
    status: "Pending",
    description: "Emergency thermal blankets for hypothermia ward. Note: Haridwar currently only has 8 blankets available (Insufficient stock test case).",
    createdAt: "2026-10-23T11:45:00",
    history: [
      { timestamp: "2026-10-23T11:45:00", action: "Request Created", by: "Logistics Officer", note: "Submitted urgent request for 12 blankets" }
    ]
  }
];

export const RESOURCE_UNITS = {
  "Food packets": "Packets",
  "Drinking water": "Crates",
  "Medicine kits": "Kits",
  "Blankets": "Pieces",
  "Tarpaulins": "Sheets",
  "First Aid kits": "Kits",
  "Sanitation packs": "Packs"
};

export const RESOURCE_CATEGORIES = {
  "Food packets": "Food",
  "Drinking water": "Water",
  "Medicine kits": "Medicines",
  "Blankets": "Shelter",
  "Tarpaulins": "Shelter",
  "First Aid kits": "Medicines",
  "Sanitation packs": "Hygiene"
};
