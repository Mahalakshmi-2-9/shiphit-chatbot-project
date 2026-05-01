/**
 * Shiphit.com — Static Data File
 * ------------------------------------
 * This file contains all the static data the chatbot uses to answer queries.
 * Update values here without touching the bot logic.
 *
 * Structure:
 *   COURIER_DATA.company         → company info
 *   COURIER_DATA.supportedCountries → list of allowed origin/destination codes
 *   COURIER_DATA.weightSlabs     → weight brackets (kg)
 *   COURIER_DATA.rates           → rate matrix [origin][destination][slab] = price (INR)
 *   COURIER_DATA.deliveryEstimates → ETA in days per route
 *   COURIER_DATA.serviceTiers    → express vs standard multipliers
 *   COURIER_DATA.terms           → T&C sections keyed by topic
 *   COURIER_DATA.faqs            → common Q&A
 *   COURIER_DATA.contact         → human handoff details
 */

const COURIER_DATA = {

  company: {
    name: "Shiphit",
    tagline: "International couriers, delivered with care.",
    website: "https://www.shiphit.com",
    currency: "INR",
    currencySymbol: "₹"
  },

  supportedCountries: [
    { code: "IN", name: "India" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "AE", name: "United Arab Emirates" },
    { code: "SG", name: "Singapore" },
    { code: "AU", name: "Australia" },
    { code: "CA", name: "Canada" },
    { code: "DE", name: "Germany" },
    { code: "SA", name: "Saudi Arabia" },
    { code: "MY", name: "Malaysia" }
  ],

  weightSlabs: [
    { id: "slab1", label: "0 – 0.5 kg", maxKg: 0.5 },
    { id: "slab2", label: "0.5 – 1 kg", maxKg: 1 },
    { id: "slab3", label: "1 – 2 kg",   maxKg: 2 },
    { id: "slab4", label: "2 – 5 kg",   maxKg: 5 },
    { id: "slab5", label: "5 – 10 kg",  maxKg: 10 },
    { id: "slab6", label: "10 – 20 kg", maxKg: 20 },
    { id: "slab7", label: "20 – 30 kg", maxKg: 30 }
  ],

  rates: {
    IN: {
      US: { slab1: 1850, slab2: 2900, slab3: 4600, slab4: 9200,  slab5: 16500, slab6: 28500, slab7: 41000 },
      GB: { slab1: 1700, slab2: 2700, slab3: 4200, slab4: 8400,  slab5: 15200, slab6: 26000, slab7: 37500 },
      AE: { slab1: 990,  slab2: 1500, slab3: 2400, slab4: 4700,  slab5: 8200,  slab6: 14500, slab7: 21000 },
      SG: { slab1: 1180, slab2: 1850, slab3: 2950, slab4: 5900,  slab5: 10500, slab6: 18500, slab7: 27000 },
      AU: { slab1: 2050, slab2: 3200, slab3: 5050, slab4: 10100, slab5: 17800, slab6: 31000, slab7: 45000 },
      CA: { slab1: 1950, slab2: 3050, slab3: 4800, slab4: 9700,  slab5: 17000, slab6: 29500, slab7: 43000 },
      DE: { slab1: 1780, slab2: 2780, slab3: 4400, slab4: 8800,  slab5: 15600, slab6: 27000, slab7: 39000 },
      SA: { slab1: 1050, slab2: 1620, slab3: 2550, slab4: 5100,  slab5: 8800,  slab6: 15500, slab7: 22500 },
      MY: { slab1: 1220, slab2: 1900, slab3: 3000, slab4: 6000,  slab5: 10800, slab6: 19000, slab7: 27500 }
    }
    // NOTE: Shiphit currently ships only from India. The bot must respond
    // gracefully if a user asks to ship from any other origin.
  },

  deliveryEstimates: {
    IN: {
      US: { min: 5, max: 7 },
      GB: { min: 4, max: 6 },
      AE: { min: 2, max: 3 },
      SG: { min: 3, max: 5 },
      AU: { min: 5, max: 8 },
      CA: { min: 6, max: 8 },
      DE: { min: 4, max: 6 },
      SA: { min: 3, max: 4 },
      MY: { min: 4, max: 6 }
    }
  },

  serviceTiers: {
    standard: {
      label: "Standard",
      multiplier: 1.0,
      etaModifier: 0,
      description: "Cost-effective shipping with standard delivery times."
    },
    express: {
      label: "Express",
      multiplier: 1.6,
      etaModifier: -2,
      description: "Faster delivery, ~2 days quicker than standard."
    },
    priority: {
      label: "Priority",
      multiplier: 2.2,
      etaModifier: -3,
      description: "Premium service with priority handling and tracking."
    }
  },

  terms: {
    refund: {
      title: "Refund Policy",
      keywords: ["refund", "money back", "cancellation", "cancel"],
      body: "Refunds are issued only if a parcel is lost in transit or if the shipment has not yet been picked up. Once a parcel is dispatched, the booking fee is non-refundable. Approved refunds are processed within 7 to 10 business days to the original payment method."
    },
    prohibited: {
      title: "Prohibited Items",
      keywords: ["prohibited", "banned", "not allowed", "restricted", "forbidden"],
      body: "Shiphit does not ship: hazardous materials, flammable liquids, loose lithium batteries, perishable food, live animals, currency, firearms, narcotics, or counterfeit goods. A full list is available on our website. Shipments containing prohibited items will be returned at the sender's cost."
    },
    insurance: {
      title: "Shipping Insurance",
      keywords: ["insurance", "insured", "coverage", "protect"],
      body: "All parcels are insured up to ₹8,000 by default at no extra cost. Additional coverage can be purchased at 2% of the declared value, up to a maximum of ₹4,00,000 per shipment. Claims must be filed within 14 days of the expected delivery date."
    },
    claims: {
      title: "Filing a Claim",
      keywords: ["claim", "lost", "damaged", "missing"],
      body: "To file a claim for a lost or damaged parcel, contact our support team with your tracking number, proof of value (invoice or receipt), and photos of the damage where applicable. Claims are typically resolved within 15 business days."
    },
    liability: {
      title: "Limitation of Liability",
      keywords: ["liability", "responsible", "responsibility"],
      body: "Shiphit's liability is limited to the declared value of the shipment or the insured amount, whichever is lower. We are not liable for indirect or consequential damages, customs delays, or losses caused by inaccurate addresses provided by the sender."
    },
    customs: {
      title: "Customs and Duties",
      keywords: ["customs", "duty", "duties", "tax", "import"],
      body: "Customs duties and import taxes are the responsibility of the recipient unless agreed otherwise at booking. Delays caused by customs clearance are outside our control and do not qualify for refunds."
    },
    packaging: {
      title: "Packaging Requirements",
      keywords: ["packaging", "package", "box", "wrap"],
      body: "Parcels must be securely packaged in rigid boxes with adequate cushioning. Fragile items must be clearly marked. Improperly packaged parcels may be refused at pickup or excluded from damage claims."
    }
  },
  faqs: [
     {
      keywords: ["track", "tracking","where is my", "status"],
       question: "How do I track my shipment?",
      answer:"Enter your Shiphit tracking number on our website's tracking page. You will also receive email and SMS updates at key milestones."

    },
    {
      keywords: ["pickup", "collection", "pick up"],
      question: "Do you offer pickup?",
      answer: "Yes, free doorstep pickup is available across all major Indian cities for shipments over 1 kg. Schedule your pickup during booking."
    },
    {
      keywords: ["payment", "pay", "card", "upi"],
      question: "What payment methods are accepted?",
      answer: "We accept all major credit and debit cards, UPI, net banking, and digital wallets. Corporate accounts can be invoiced monthly."
    },
    {
      keywords: ["weight limit", "maximum weight", "max weight", "heaviest","parcel weight"],
      question: "What is the maximum parcel weight?",
      answer: "The maximum weight per parcel is 30 kg for standard international shipping. For heavier shipments, please contact our freight team."

    },
    {
      keywords: ["dimension", "size", "biggest", "max size"],
      question: "Are there size limits?",
      answer: "Yes. Maximum dimensions are 120 cm (length) and 300 cm combined length plus girth. Oversized parcels may incur a surcharge."
    }
  
  ],
  
  contact: {
    email: "support@shiphit.com",
    phone: "+91-XXXX-XXXXXX",
    hours: "Monday – Saturday, 9 AM to 9 PM IST",
    chatHandoff: "Type 'talk to human' at any time to be connected to our support team."
  },

  fallback: {
    unknown: "Sorry, I didn't quite catch that. I can help you with: shipping rates, delivery time estimates, terms & conditions, prohibited items, refunds, and tracking. What would you like to know?",
    unsupportedOrigin: "Shiphit currently ships only from India. For other origins, please contact our support team at support@shiphit.com.",
    unsupportedRoute: "We don't currently ship to that destination. Please contact our support team at support@shiphit.com for special arrangements.",
    invalidWeight: "Please enter a valid weight in kilograms (between 0.1 and 30 kg).",
    overweight: "Parcels over 30 kg are not supported through our standard service. Please contact our freight team for heavier shipments."
  },

  greeting: {
    welcome: "Hi! I'm Shiphit's assistant. How can I help you today?",
    quickReplies: [
      "Get a shipping rate",
      "Estimate delivery time",
      "Prohibited items",
      "Refund policy",
      "Talk to a human"
    ]
  }
};