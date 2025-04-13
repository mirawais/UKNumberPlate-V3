import { 
  InsertPlateSize, 
  InsertTextStyle, 
  InsertBadge,
  InsertColor,
  InsertCarBrand,
  InsertPaymentMethod,
  InsertSiteConfig
} from "@shared/schema";

export const mockData = {
  siteConfigs: [
    {
      configKey: "site.name",
      configValue: "Number Plate Store",
      configType: "text",
      description: "Site name displayed in the header and title"
    },
    {
      configKey: "site.tagline",
      configValue: "UK Number Plates",
      configType: "text",
      description: "Site tagline shown under the site name"
    },
    {
      configKey: "site.contactEmail",
      configValue: "contact@example.com",
      configType: "text",
      description: "Contact email shown in the footer"
    },
    {
      configKey: "site.contactPhone",
      configValue: "+44 123 456 7890",
      configType: "text",
      description: "Contact phone shown in the footer"
    },
    {
      configKey: "site.primaryColor",
      configValue: "#0070f3",
      configType: "color",
      description: "Primary color for buttons and accents"
    },
    {
      configKey: "feature.showBadges",
      configValue: "true",
      configType: "feature",
      description: "Toggle to show or hide badges on plates"
    },
    {
      configKey: "feature.showBorders",
      configValue: "true",
      configType: "feature",
      description: "Toggle to show or hide borders on plates"
    },
    {
      configKey: "feature.showCarBrands",
      configValue: "true",
      configType: "feature",
      description: "Toggle to show or hide car brand options"
    },
    {
      configKey: "feature.roadLegalPlates",
      configValue: "true",
      configType: "feature",
      description: "Toggle to show or hide road legal plates tab"
    },
    {
      configKey: "feature.showPlates",
      configValue: "true",
      configType: "feature",
      description: "Toggle to show or hide show plates tab"
    },
    {
      configKey: "feature.useStripeCheckout",
      configValue: "false",
      configType: "feature",
      description: "Toggle to use Stripe checkout instead of built-in checkout"
    },
    {
      configKey: "feature.allowDocumentUpload",
      configValue: "true",
      configType: "feature",
      description: "Toggle to allow document upload for road legal plates"
    }
  ] as InsertSiteConfig[],
  plateSizes: [
    {
      name: "Standard",
      dimensions: "520mm x 111mm",
      additionalPrice: "0",
      isActive: true
    },
    {
      name: "Small",
      dimensions: "330mm x 111mm",
      additionalPrice: "2.50",
      isActive: true
    },
    {
      name: "Large",
      dimensions: "530mm x 152mm",
      additionalPrice: "3.00",
      isActive: true
    },
    {
      name: "Oversize",
      dimensions: "610mm x 152mm",
      additionalPrice: "5.00",
      isActive: true
    }
  ] as InsertPlateSize[],
  
  textStyles: [
    {
      name: "3D Gel (Standard)",
      description: "Standard raised 3D letters with a gel coating for durability and a premium look.",
      imagePath: "https://cdn.pixabay.com/photo/2016/08/16/17/32/license-plate-1598216_960_720.jpg",
      additionalPrice: "0",
      isActive: true
    },
    {
      name: "4D Premium",
      description: "Premium raised acrylic letters with enhanced depth and a luxurious appearance.",
      imagePath: "https://cdn.pixabay.com/photo/2013/07/13/12/15/license-plate-159720_960_720.png",
      additionalPrice: "10.00",
      isActive: true
    },
    {
      name: "Printed",
      description: "Flat printed letters that are durable and cost-effective.",
      imagePath: "https://cdn.pixabay.com/photo/2017/08/05/12/33/license-plate-2583594_960_720.png",
      additionalPrice: "0",
      isActive: true
    },
    {
      name: "Carbon Fiber",
      description: "Premium carbon fiber effect with raised letters for a sporty, high-end finish.",
      imagePath: "https://cdn.pixabay.com/photo/2016/11/19/20/25/abstract-1840985_960_720.jpg",
      additionalPrice: "15.00",
      isActive: true
    }
  ] as InsertTextStyle[],
  
  badges: [
    {
      name: "GB",
      imagePath: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/flags/4x3/gb.svg",
      isActive: true
    },
    {
      name: "UK",
      imagePath: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/flags/4x3/gb.svg",
      isActive: true
    },
    {
      name: "England",
      imagePath: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/flags/4x3/gb-eng.svg",
      isActive: true
    },
    {
      name: "Scotland",
      imagePath: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/flags/4x3/gb-sct.svg",
      isActive: true
    },
    {
      name: "Wales",
      imagePath: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/flags/4x3/gb-wls.svg",
      isActive: true
    },
    {
      name: "Ireland",
      imagePath: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/flags/4x3/ie.svg",
      isActive: true
    }
  ] as InsertBadge[],
  
  colors: [
    {
      name: "Black",
      hexCode: "#000000",
      isActive: true
    },
    {
      name: "Red",
      hexCode: "#dc2626",
      isActive: true
    },
    {
      name: "Blue",
      hexCode: "#2563eb",
      isActive: true
    },
    {
      name: "Green",
      hexCode: "#16a34a",
      isActive: true
    },
    {
      name: "Yellow",
      hexCode: "#eab308",
      isActive: true
    },
    {
      name: "Pink",
      hexCode: "#ec4899",
      isActive: true
    },
    {
      name: "Purple",
      hexCode: "#9333ea",
      isActive: true
    },
    {
      name: "Orange",
      hexCode: "#f97316",
      isActive: true
    }
  ] as InsertColor[],
  
  carBrands: [
    {
      name: "Ford",
      isActive: true
    },
    {
      name: "BMW",
      isActive: true
    },
    {
      name: "Mercedes",
      isActive: true
    },
    {
      name: "Audi",
      isActive: true
    },
    {
      name: "Volkswagen",
      isActive: true
    },
    {
      name: "Toyota",
      isActive: true
    },
    {
      name: "Honda",
      isActive: true
    },
    {
      name: "Nissan",
      isActive: true
    }
  ] as InsertCarBrand[],
  
  paymentMethods: [
    {
      name: "Bank Transfer",
      isActive: true
    },
    {
      name: "PayPal",
      isActive: true
    },
    {
      name: "Stripe",
      isActive: true
    },
    {
      name: "Cash on Delivery",
      isActive: true
    }
  ] as InsertPaymentMethod[]
};
