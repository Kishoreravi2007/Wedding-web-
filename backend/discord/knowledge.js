/**
 * WeddingWeb Knowledge Base
 * ─────────────────────────────────────────────
 * This file contains structured information about WeddingWeb products,
 * pricing, services, and company background. It is used to prime
 * the AI for accuracy in the /ai slash command.
 */

const KNOWLEDGE_BASE = {
  company: {
    name: "WeddingWeb",
    mission: "Empower couples with cutting-edge digital tools that bring memories to life.",
    vision: "Become the world's leading digital wedding experience platform.",
    values: [
      "Passion for Memories",
      "Innovation First",
      "Customer Obsession",
      "Trust & Security"
    ],
    overview: "WeddingWeb delivers a modern wedding-technology platform powering more than 10,000 events across 50+ countries while maintaining 99.9% uptime and managing over five million photos.",
    stats: {
      weddingsSwerved: "10,000+",
      photosManaged: "5,000,000+",
      countries: "50+",
      uptime: "99.9%"
    }
  },
  services: [
    {
      name: "AI Face Detection",
      description: "Automatically organizes guest photos with industry-leading accuracy and privacy controls."
    },
    {
      name: "Smart Gallery",
      description: "Shareable digital albums featuring privacy settings, tagging, and high-resolution downloads."
    },
    {
      name: "Live Streaming",
      description: "Broadcast weddings globally in HD and 4K quality with zero viewer limits via global CDN delivery."
    },
    {
      name: "Photographer Portal",
      description: "Collaborate with professional photographers using bulk uploads, review workflows, and client management tools."
    },
    {
      name: "Digital Wishes",
      description: "Capture heartfelt guest messages with customizable forms, multi-language support, and optional voice notes."
    },
    {
      name: "Event Management Dashboard",
      description: "Monitor every step of the celebration—from RSVPs and schedules to reminders and live updates—in a single command center."
    }
  ],
  pricing: {
    currency: "INR",
    plans: [
      {
        name: "Starter",
        price: "₹8,499",
        billing: "Monthly",
        features: ["Up to 100 guests", "5 GB storage", "Email support"]
      },
      {
        name: "Professional",
        price: "₹16,999",
        billing: "Monthly (Most Popular)",
        features: ["Up to 500 guests", "Live streaming", "Priority care"]
      },
      {
        name: "Enterprise",
        price: "₹41,999",
        billing: "Monthly",
        features: ["Unlimited guests", "4K streaming", "Dedicated team"]
      }
    ],
    addons: [
      "Extended storage",
      "Professional videography",
      "White-label branding",
      "Advanced analytics"
    ]
  },
  contact: {
    email: "help.weddingweb@gmail.com",
    phone: "+91 95441 43072",
    availability: "Monday–Friday after 4:30 PM IST · Saturday–Sunday on demand",
    locations: ["Bangalore", "Mumbai", "Delhi"]
  },
  social_proof: {
    customer_satisfaction: "4.9/5",
    engagement_rate: "94% average",
    processing_time: "2-hour average for photos"
  }
};

/**
 * Generates a formatted string representing the knowledge base
 * to be used in AI system prompts.
 */
function getFormattedKnowledge() {
  let output = "WeddingWeb Knowledge Base Source (Ground Truth):\n\n";

  // Company info
  output += `Company: ${KNOWLEDGE_BASE.company.name}\n`;
  output += `Mission: ${KNOWLEDGE_BASE.company.mission}\n`;
  output += `Overview: ${KNOWLEDGE_BASE.company.overview}\n\n`;

  // Services
  output += "Services Provided:\n";
  KNOWLEDGE_BASE.services.forEach(s => {
    output += `- ${s.name}: ${s.description}\n`;
  });
  output += "\n";

  // Pricing
  output += `Pricing Plans (${KNOWLEDGE_BASE.pricing.currency}):\n`;
  KNOWLEDGE_BASE.pricing.plans.forEach(p => {
    output += `- ${p.name}: ${p.price} (${p.features.join(", ")})\n`;
  });
  output += "\n";

  // Contact
  output += "Contact Information:\n";
  output += `- Email: ${KNOWLEDGE_BASE.contact.email}\n`;
  output += `- Phone: ${KNOWLEDGE_BASE.contact.phone}\n`;
  output += `- Support Hours: ${KNOWLEDGE_BASE.contact.availability}\n`;

  return output;
}

module.exports = {
  KNOWLEDGE_BASE,
  getFormattedKnowledge
};
