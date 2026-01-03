import {
  AirLocation,
  OrderEmails,
  OrderOrigin,
  OrderStatus,
  OrderType,
} from "@/interfaces/order.interface";
import {
  PaymentCodes,
  PaymentProviders,
  PaymentStatus,
} from "@/interfaces/payment.interface";

export const orderEmailsInfo: Partial<
  Record<
    OrderEmails,
    {
      icon: string;
      bgColor: string;
      color: string;
      text: string;
    }
  >
> = {
  [OrderEmails.WAREHOUSE_ARRIVAL]: {
    icon: "PencilLine",
    bgColor: "#F59E0B",
    color: "#fff",
    text: "Warehouse Arrival",
  },
};

export const paymentProviders: Record<PaymentProviders, string> = {
  [PaymentProviders.PAYSTACK]: "Paystack",
  [PaymentProviders.WALLET]: "Wallet",
  [PaymentProviders.BANK_TRANSFER]: "Bank Transfer",
  [PaymentProviders.FLUTTERWAVE]: "Flutterwave",
  [PaymentProviders.KORA]: "Korapay",
};

export const statusTags: Record<PaymentCodes, string> = {
  [PaymentCodes.GOODS_FEE]: "Goods Fee",
  [PaymentCodes.ITEM_FEE]: "Fees Fee",
  [PaymentCodes.SHIPPING_FEE]: "Shipping Fee",
  [PaymentCodes.SOURCING_FEE]: "Sourcing Fee",
  [PaymentCodes.DELIVERY_FEE]: "Delivery Fee",
};

export const paymentStatus: Record<PaymentStatus, string> = {
  [PaymentStatus.SUCCESSFUL]: "Successful",
  [PaymentStatus.PENDING]: "Pending",
  [PaymentStatus.CANCELLED]: "Cancelled",
  [PaymentStatus.FAILED]: "Failed",
};

export const orderStatusTitle: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.DRAFT]: "Draft",
  [OrderStatus.PLACED]: "Placed",
  [OrderStatus.SOURCING]: "Sourcing",
  [OrderStatus.PURCHASED]: "Purchased",
  [OrderStatus.PENDING_TRANSIT_TO_WAREHOUSE]: "Warehouse Inbound Pending",
  [OrderStatus.IN_TRANSIT_TO_WAREHOUSE]: "Warehouse Inbound",
  [OrderStatus.AT_WAREHOUSE]: "In Warehouse",
  [OrderStatus.PENDING_TRANSIT]: "Pending Transit",
  [OrderStatus.IN_TRANSIT]: "In Transit",
  [OrderStatus.IN_NIGERIA]: "In Nigeria",
  [OrderStatus.OUT_FOR_DELIVERY]: "Out For Delivery",
  [OrderStatus.PROCESSING]: "Processing",
  [OrderStatus.SHIPPED]: "Shipped",
  [OrderStatus.DELIVERED]: "Delivered",
  [OrderStatus.CANCELLED]: "Cancelled",
};
export const shipmentStatusDesc: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.PENDING_TRANSIT]: "Your order is pending transit to Nigeria",
  [OrderStatus.IN_TRANSIT]: "Your order is in transit to Nigeria",
  [OrderStatus.IN_NIGERIA]: "Your order is in Nigeria",
  [OrderStatus.OUT_FOR_DELIVERY]: "Your order is out for delivery",
  [OrderStatus.PROCESSING]: "Your order is being processed",
  [OrderStatus.DELIVERED]: "Your order have been delivered",
  [OrderStatus.CANCELLED]: "Your order has been Cancelled",
};

export const typeNames: Record<OrderType | string, string> = {
  [OrderType.PURCHASE]: "Purchase",
  [OrderType.SHIPMENT]: "Shipment",
};
export const originNames: Record<OrderOrigin | string, string> = {
  [OrderOrigin.NORMAL]: "Normal",
  [OrderOrigin.SOURCING]: "Sourcing",
};

export const airLocationInfo: Partial<
  Record<
    AirLocation | string,
    {
      icon: string;
      bgColor: string;
      color: string;
      text: string;
    }
  >
> = {
  [AirLocation.EXPRESS]: {
    icon: "PencilLine",
    bgColor: "#F59E0B",
    color: "#fff",
    text: "Express",
  },
  [AirLocation.GZ]: {
    icon: "PackagePlus",
    bgColor: "#10B981",
    color: "#fff",
    text: "GZ",
  },
  [AirLocation.HK]: {
    icon: "PackagePlus",
    bgColor: "#06B6D4",
    color: "#fff",
    text: "HK",
  },
};

export const orderStatusInfo: Partial<
  Record<
    OrderStatus | string,
    {
      icon: string;
      bgColor: string;
      color: string;
      text: string;
    }
  >
> = {
  [OrderStatus.DRAFT]: {
    icon: "PencilLine",
    bgColor: "#F59E0B",
    color: "#fff",
    text: "Draft",
  },
  [OrderStatus.IN_TRANSIT_TO_WAREHOUSE]: {
    icon: "PackagePlus",
    bgColor: "#F59E0B",
    color: "#fff",
    text: "In Transit to Warehouse",
  },
  [OrderStatus.PLACED]: {
    icon: "PackagePlus",
    bgColor: "#F59E0B",
    color: "#fff",
    text: "Placed",
  },
  [OrderStatus.PENDING_PAYMENT]: {
    icon: "ClockArrowUp",
    bgColor: "#F59E0B",
    color: "#fff",
    text: "Pending Payment",
  },
  [OrderStatus.PROCESSING]: {
    icon: "ClockArrowUp",
    bgColor: "#F59E0B",
    color: "#fff",
    text: "Processing",
  },
  [OrderStatus.SOURCING]: {
    color: "#fff",
    text: "Sourcing",
    bgColor: "#F59E0B",
    icon: "ClockArrowUp",
  },
  [OrderStatus.PENDING_TRANSIT]: {
    icon: "PackagePlus",
    bgColor: "#F59E0B",
    color: "#fff",
    text: "Pending Transit",
  },
  [OrderStatus.IN_TRANSIT]: {
    icon: "ClockArrowUp",
    bgColor: "#F59E0B",
    color: "#fff",
    text: "In Transit",
  },
  [OrderStatus.IN_NIGERIA]: {
    icon: "Wallet",
    bgColor: "#10B981",
    color: "#fff",
    text: "In Nigeria",
  },
  [OrderStatus.SHIPPED]: {
    icon: "Truck",
    bgColor: "#06B6D4",
    color: "#fff",
    text: "Shipped",
  },
  [OrderStatus.PENDING_TRANSIT_TO_WAREHOUSE]: {
    icon: "Truck",
    bgColor: "#06B6D4",
    color: "#fff",
    text: "Pending Transit to Warehouse",
  },
  [OrderStatus.PURCHASED]: {
    icon: "Truck",
    bgColor: "#06B6D4",
    color: "#fff",
    text: "Purchased",
  },
  [OrderStatus.AT_WAREHOUSE]: {
    icon: "Truck",
    bgColor: "#06B6D4",
    color: "#fff",
    text: "In Warehouse",
  },
  [OrderStatus.OUT_FOR_DELIVERY]: {
    icon: "CircleDot",
    bgColor: "#10B981",
    color: "#fff",
    text: "Out for Delivery",
  },
  [OrderStatus.DELIVERED]: {
    icon: "Package",
    bgColor: "#10B981",
    color: "#fff",
    text: "Delivered",
  },
  [OrderStatus.CANCELLED]: {
    icon: "CircleX",
    bgColor: "#EF4444",
    color: "#fff",
    text: "Cancelled",
  },
};

// type Step = {
//   id: ISteps;
//   label: string;
// };

// export const steps: Step[] = [
//   { id: ISteps.SENDER, label: "Item details" },
//   { id: ISteps.RECEIVER, label: "Receiver Details" },
//   { id: ISteps.ITEMS, label: "Item Description" },
//   { id: ISteps.SUMMARY, label: "Order Summary" },
// ];

export const categories = [
  {
    label: "Agricultural Products",
    value: "Agricultural Products",
    items: [
      { label: "Farm Tools & Equipment", value: "Farm Tools & Equipment" },
      { label: "Fertilizers & Pesticides", value: "Fertilizers & Pesticides" },
      { label: "Fish Farming Equipment", value: "Fish Farming Equipment" },
      { label: "Irrigation Systems", value: "Irrigation Systems" },
      { label: "Poultry Equipment", value: "Poultry Equipment" },
      { label: "Seeds", value: "Seeds" },
    ],
  },
  {
    label: "Bags & Luggage",
    value: "Bags & Luggage",
    items: [
      { label: "Backpacks", value: "Backpacks" },
      { label: "Handbags", value: "Handbags" },
      { label: "Laptop Bags", value: "Laptop Bags" },
      { label: "School Bags", value: "School Bags" },
      { label: "Travel Bags & Suitcases", value: "Travel Bags & Suitcases" },
      { label: "Wallets & Purses", value: "Wallets & Purses" },
    ],
  },
  {
    label: "Beauty & Personal Care",
    value: "Beauty & Personal Care",
    items: [
      { label: "Beauty Tools & Equipment", value: "Beauty Tools & Equipment" },
      { label: "Hair Care Products", value: "Hair Care Products" },
      { label: "Makeup & Cosmetics", value: "Makeup & Cosmetics" },
      { label: "Nail Products", value: "Nail Products" },
      { label: "Perfumes & Body Sprays", value: "Perfumes & Body Sprays" },
      { label: "Skincare Products", value: "Skincare Products" },
      { label: "Wigs & Hair Extensions", value: "Wigs & Hair Extensions" },
    ],
  },
  {
    label: "Building Materials & Hardware",
    value: "Building Materials & Hardware",
    items: [
      {
        label: "Aluminum Sheets & Profiles",
        value: "Aluminum Sheets & Profiles",
      },
      {
        label: "Cement & Construction Materials",
        value: "Cement & Construction Materials",
      },
      { label: "Doors & Windows", value: "Doors & Windows" },
      { label: "Glass & Mirrors", value: "Glass & Mirrors" },
      { label: "Hardware & Tools", value: "Hardware & Tools" },
      { label: "Iron & Steel Products", value: "Iron & Steel Products" },
      { label: "Paints & Coatings", value: "Paints & Coatings" },
      { label: "Plumbing Fixtures", value: "Plumbing Fixtures" },
      { label: "Roofing Materials", value: "Roofing Materials" },
      { label: "Tiles & Ceramics", value: "Tiles & Ceramics" },
    ],
  },
  {
    label: "Clothing & Fashion",
    value: "Clothing & Fashion",
    items: [
      { label: "Children's Clothing", value: "Children's Clothing" },
      { label: "Dresses & Skirts", value: "Dresses & Skirts" },
      { label: "Jeans & Denim", value: "Jeans & Denim" },
      { label: "Men's Clothing", value: "Men's Clothing" },
      { label: "Sportswear", value: "Sportswear" },
      { label: "Suits & Corporate Wear", value: "Suits & Corporate Wear" },
      { label: "T-Shirts & Polo Shirts", value: "T-Shirts & Polo Shirts" },
      { label: "Traditional Wear", value: "Traditional Wear" },
      { label: "Underwear & Socks", value: "Underwear & Socks" },
      { label: "Women's Clothing", value: "Women's Clothing" },
    ],
  },
  {
    label: "Electronics & Electrical",
    value: "Electronics & Electrical",
    items: [
      {
        label: "Air Conditioners & Cooling Systems",
        value: "Air Conditioners & Cooling Systems",
      },
      {
        label: "Audio Equipment & Headphones",
        value: "Audio Equipment & Headphones",
      },
      { label: "Batteries & Power Banks", value: "Batteries & Power Banks" },
      {
        label: "Cameras & Photography Equipment",
        value: "Cameras & Photography Equipment",
      },
      { label: "Electric Motors & Parts", value: "Electric Motors & Parts" },
      {
        label: "Generators & Power Equipment",
        value: "Generators & Power Equipment",
      },
      { label: "Laptops & Tablets", value: "Laptops & Tablets" },
      {
        label: "LED Lights & Lighting Fixtures",
        value: "LED Lights & Lighting Fixtures",
      },
      {
        label: "Smartphones & Mobile Devices",
        value: "Smartphones & Mobile Devices",
      },
      { label: "Solar Panels & Inverters", value: "Solar Panels & Inverters" },
      {
        label: "Transformers & Electrical Components",
        value: "Transformers & Electrical Components",
      },
      {
        label: "TVs & Home Theater Systems",
        value: "TVs & Home Theater Systems",
      },
      {
        label: "Wiring & Electrical Accessories",
        value: "Wiring & Electrical Accessories",
      },
    ],
  },
  {
    label: "Furniture & Home Decor",
    value: "Furniture & Home Decor",
    items: [
      { label: "Artificial Flowers", value: "Artificial Flowers" },
      { label: "Beds & Mattresses", value: "Beds & Mattresses" },
      {
        label: "Curtain Rods & Accessories",
        value: "Curtain Rods & Accessories",
      },
      { label: "Office Furniture", value: "Office Furniture" },
      { label: "Sofas & Chairs", value: "Sofas & Chairs" },
      { label: "Tables & Desks", value: "Tables & Desks" },
      { label: "Wall Decorations", value: "Wall Decorations" },
      { label: "Wardrobes & Cabinets", value: "Wardrobes & Cabinets" },
    ],
  },
  {
    label: "Home Appliances",
    value: "Home Appliances",
    items: [
      {
        label: "Blenders & Food Processors",
        value: "Blenders & Food Processors",
      },
      { label: "Electric Kettles", value: "Electric Kettles" },
      { label: "Fans", value: "Fans" },
      { label: "Irons & Ironing Boards", value: "Irons & Ironing Boards" },
      { label: "Microwaves & Ovens", value: "Microwaves & Ovens" },
      { label: "Refrigerators & Freezers", value: "Refrigerators & Freezers" },
      {
        label: "Rice Cookers & Pressure Cookers",
        value: "Rice Cookers & Pressure Cookers",
      },
      { label: "Vacuum Cleaners", value: "Vacuum Cleaners" },
      { label: "Washing Machines", value: "Washing Machines" },
    ],
  },
  {
    label: "Jewelry & Watches",
    value: "Jewelry & Watches",
    items: [
      { label: "Beads & Accessories", value: "Beads & Accessories" },
      { label: "Fashion Jewelry", value: "Fashion Jewelry" },
      { label: "Gold & Silver Jewelry", value: "Gold & Silver Jewelry" },
      { label: "Watches", value: "Watches" },
    ],
  },
  {
    label: "Kitchen & Dining",
    value: "Kitchen & Dining",
    items: [
      { label: "Cookware & Pots", value: "Cookware & Pots" },
      { label: "Cutlery & Utensils", value: "Cutlery & Utensils" },
      { label: "Dinnerware & Plates", value: "Dinnerware & Plates" },
      { label: "Food Storage Containers", value: "Food Storage Containers" },
      { label: "Glassware & Cups", value: "Glassware & Cups" },
      { label: "Kitchen Gadgets", value: "Kitchen Gadgets" },
      {
        label: "Water Dispensers & Coolers",
        value: "Water Dispensers & Coolers",
      },
    ],
  },
  {
    label: "Machinery & Industrial Equipment",
    value: "Machinery & Industrial Equipment",
    items: [
      { label: "Construction Equipment", value: "Construction Equipment" },
      { label: "Manufacturing Machinery", value: "Manufacturing Machinery" },
      { label: "Agricultural Machinery", value: "Agricultural Machinery" },
      { label: "Industrial Boilers", value: "Industrial Boilers" },
      { label: "Printing Machines", value: "Printing Machines" },
      {
        label: "Food Processing Equipment",
        value: "Food Processing Equipment",
      },
      { label: "Textile Machinery", value: "Textile Machinery" },
      { label: "Mining Equipment", value: "Mining Equipment" },
      { label: "Pumps & Water Systems", value: "Pumps & Water Systems" },
      { label: "Industrial Tools", value: "Industrial Tools" },
    ],
  },
  {
    label: "Vehicles & Auto Parts",
    value: "Vehicles & Auto Parts",
    items: [
      { label: "Motorcycles", value: "Motorcycles" },
      {
        label: "Commercial Vehicles & Buses",
        value: "Commercial Vehicles & Buses",
      },
      { label: "Cars & SUVs", value: "Cars & SUVs" },
      { label: "Tricycles (Keke NAPEP)", value: "Tricycles (Keke NAPEP)" },
      { label: "Auto Spare Parts", value: "Auto Spare Parts" },
      { label: "Tires & Wheels", value: "Tires & Wheels" },
      { label: "Car Batteries", value: "Car Batteries" },
      { label: "Car Accessories", value: "Car Accessories" },
      { label: "Engine Parts", value: "Engine Parts" },
    ],
  },
  {
    label: "Building Materials & Hardware",
    value: "Building Materials & Hardware",
    items: [
      { label: "Iron & Steel Products", value: "Iron & Steel Products" },
      {
        label: "Aluminum Sheets & Profiles",
        value: "Aluminum Sheets & Profiles",
      },
      { label: "Roofing Materials", value: "Roofing Materials" },
      { label: "Tiles & Ceramics", value: "Tiles & Ceramics" },
      { label: "Doors & Windows", value: "Doors & Windows" },
      { label: "Plumbing Fixtures", value: "Plumbing Fixtures" },
      { label: "Paints & Coatings", value: "Paints & Coatings" },
      { label: "Hardware & Tools", value: "Hardware & Tools" },
      {
        label: "Cement & Construction Materials",
        value: "Cement & Construction Materials",
      },
      { label: "Glass & Mirrors", value: "Glass & Mirrors" },
    ],
  },
  {
    label: "Plastics & Packaging",
    value: "Plastics & Packaging",
    items: [
      { label: "Plastic Raw Materials", value: "Plastic Raw Materials" },
      {
        label: "Plastic Containers & Bottles",
        value: "Plastic Containers & Bottles",
      },
      { label: "Plastic Pipes & Fittings", value: "Plastic Pipes & Fittings" },
      { label: "Plastic Furniture", value: "Plastic Furniture" },
      { label: "Packaging Materials", value: "Packaging Materials" },
      { label: "Nylon & Polythene Bags", value: "Nylon & Polythene Bags" },
      { label: "Cartons & Cardboard", value: "Cartons & Cardboard" },
      { label: "Foam & Cushioning", value: "Foam & Cushioning" },
    ],
  },
  {
    label: "Textiles & Fabrics",
    value: "Textiles & Fabrics",
    items: [
      { label: "Cotton Fabrics", value: "Cotton Fabrics" },
      { label: "Synthetic Fabrics", value: "Synthetic Fabrics" },
      { label: "Lace Materials", value: "Lace Materials" },
      { label: "African Print Fabrics", value: "African Print Fabrics" },
      { label: "Bedding & Linens", value: "Bedding & Linens" },
      { label: "Curtains & Drapes", value: "Curtains & Drapes" },
      { label: "Towels", value: "Towels" },
      { label: "Textile Raw Materials", value: "Textile Raw Materials" },
    ],
  },
  {
    label: "Clothing & Fashion",
    value: "Clothing & Fashion",
    items: [
      { label: "Men's Clothing", value: "Men's Clothing" },
      { label: "Women's Clothing", value: "Women's Clothing" },
      { label: "Children's Clothing", value: "Children's Clothing" },
      { label: "Jeans & Denim", value: "Jeans & Denim" },
      { label: "T-Shirts & Polo Shirts", value: "T-Shirts & Polo Shirts" },
      { label: "Dresses & Skirts", value: "Dresses & Skirts" },
      { label: "Suits & Corporate Wear", value: "Suits & Corporate Wear" },
      { label: "Underwear & Socks", value: "Underwear & Socks" },
      { label: "Sportswear", value: "Sportswear" },
      { label: "Traditional Wear", value: "Traditional Wear" },
    ],
  },
  {
    label: "Shoes & Footwear",
    value: "Shoes & Footwear",
    items: [
      { label: "Sneakers & Sports Shoes", value: "Sneakers & Sports Shoes" },
      { label: "Formal Shoes", value: "Formal Shoes" },
      { label: "Sandals & Slippers", value: "Sandals & Slippers" },
      { label: "Boots", value: "Boots" },
      { label: "Children's Shoes", value: "Children's Shoes" },
      { label: "Safety Boots", value: "Safety Boots" },
    ],
  },
  {
    label: "Bags & Luggage",
    value: "Bags & Luggage",
    items: [
      { label: "Backpacks", value: "Backpacks" },
      { label: "Handbags", value: "Handbags" },
      { label: "Travel Bags & Suitcases", value: "Travel Bags & Suitcases" },
      { label: "School Bags", value: "School Bags" },
      { label: "Laptop Bags", value: "Laptop Bags" },
      { label: "Wallets & Purses", value: "Wallets & Purses" },
    ],
  },
  {
    label: "Medical Equipment & Supplies",
    value: "Medical Equipment & Supplies",
    items: [
      { label: "X-Ray Machines", value: "X-Ray Machines" },
      { label: "Ultrasound Equipment", value: "Ultrasound Equipment" },
      { label: "Surgical Instruments", value: "Surgical Instruments" },
      {
        label: "Hospital Beds & Furniture",
        value: "Hospital Beds & Furniture",
      },
      { label: "Medical Consumables", value: "Medical Consumables" },
      { label: "Laboratory Equipment", value: "Laboratory Equipment" },
      { label: "Diagnostic Tools", value: "Diagnostic Tools" },
      { label: "Medical Gloves & PPE", value: "Medical Gloves & PPE" },
      {
        label: "Thermometers & BP Monitors",
        value: "Thermometers & BP Monitors",
      },
    ],
  },
  {
    label: "Pharmaceuticals & Chemicals",
    value: "Pharmaceuticals & Chemicals",
    items: [
      {
        label: "Active Pharmaceutical Ingredients",
        value: "Active Pharmaceutical Ingredients",
      },
      { label: "Vitamins & Supplements", value: "Vitamins & Supplements" },
      { label: "Organic Chemicals", value: "Organic Chemicals" },
      { label: "Industrial Chemicals", value: "Industrial Chemicals" },
      {
        label: "Agricultural Chemicals & Fertilizers",
        value: "Agricultural Chemicals & Fertilizers",
      },
      { label: "Cleaning Chemicals", value: "Cleaning Chemicals" },
      { label: "Adhesives & Sealants", value: "Adhesives & Sealants" },
    ],
  },
  {
    label: "Home Appliances",
    value: "Home Appliances",
    items: [
      { label: "Refrigerators & Freezers", value: "Refrigerators & Freezers" },
      { label: "Washing Machines", value: "Washing Machines" },
      { label: "Microwaves & Ovens", value: "Microwaves & Ovens" },
      {
        label: "Blenders & Food Processors",
        value: "Blenders & Food Processors",
      },
      {
        label: "Rice Cookers & Pressure Cookers",
        value: "Rice Cookers & Pressure Cookers",
      },
      { label: "Electric Kettles", value: "Electric Kettles" },
      { label: "Irons & Ironing Boards", value: "Irons & Ironing Boards" },
      { label: "Vacuum Cleaners", value: "Vacuum Cleaners" },
      { label: "Fans", value: "Fans" },
    ],
  },
  {
    label: "Furniture & Home Decor",
    value: "Furniture & Home Decor",
    items: [
      { label: "Sofas & Chairs", value: "Sofas & Chairs" },
      { label: "Beds & Mattresses", value: "Beds & Mattresses" },
      { label: "Tables & Desks", value: "Tables & Desks" },
      { label: "Wardrobes & Cabinets", value: "Wardrobes & Cabinets" },
      { label: "Office Furniture", value: "Office Furniture" },
      { label: "Wall Decorations", value: "Wall Decorations" },
      { label: "Artificial Flowers", value: "Artificial Flowers" },
      {
        label: "Curtain Rods & Accessories",
        value: "Curtain Rods & Accessories",
      },
    ],
  },
  {
    label: "Kitchen & Dining",
    value: "Kitchen & Dining",
    items: [
      { label: "Cookware & Pots", value: "Cookware & Pots" },
      { label: "Dinnerware & Plates", value: "Dinnerware & Plates" },
      { label: "Glassware & Cups", value: "Glassware & Cups" },
      { label: "Cutlery & Utensils", value: "Cutlery & Utensils" },
      { label: "Food Storage Containers", value: "Food Storage Containers" },
      { label: "Kitchen Gadgets", value: "Kitchen Gadgets" },
      {
        label: "Water Dispensers & Coolers",
        value: "Water Dispensers & Coolers",
      },
    ],
  },
  {
    label: "Mobile & Computer Accessories",
    value: "Mobile & Computer Accessories",
    items: [
      {
        label: "Phone Cases & Screen Protectors",
        value: "Phone Cases & Screen Protectors",
      },
      { label: "Chargers & USB Cables", value: "Chargers & USB Cables" },
      {
        label: "Memory Cards & Flash Drives",
        value: "Memory Cards & Flash Drives",
      },
      { label: "Keyboards & Mice", value: "Keyboards & Mice" },
      { label: "Monitors", value: "Monitors" },
      { label: "Printers & Scanners", value: "Printers & Scanners" },
      { label: "Computer Components", value: "Computer Components" },
      { label: "Networking Equipment", value: "Networking Equipment" },
    ],
  },
  {
    label: "Toys & Children's Products",
    value: "Toys & Children's Products",
    items: [
      { label: "Educational Toys", value: "Educational Toys" },
      { label: "Remote Control Toys", value: "Remote Control Toys" },
      { label: "Dolls & Action Figures", value: "Dolls & Action Figures" },
      { label: "Bicycles & Tricycles", value: "Bicycles & Tricycles" },
      { label: "Baby Strollers & Walkers", value: "Baby Strollers & Walkers" },
      { label: "Baby Diapers", value: "Baby Diapers" },
      {
        label: "Feeding Bottles & Accessories",
        value: "Feeding Bottles & Accessories",
      },
      { label: "Children's Clothing", value: "Children's Clothing" },
    ],
  },
  {
    label: "Sports & Fitness",
    value: "Sports & Fitness",
    items: [
      { label: "Gym Equipment", value: "Gym Equipment" },
      {
        label: "Treadmills & Exercise Bikes",
        value: "Treadmills & Exercise Bikes",
      },
      { label: "Dumbbells & Weights", value: "Dumbbells & Weights" },
      { label: "Yoga Mats", value: "Yoga Mats" },
      { label: "Sports Wear", value: "Sports Wear" },
      { label: "Footballs & Sports Balls", value: "Footballs & Sports Balls" },
      { label: "Bicycles", value: "Bicycles" },
    ],
  },
  {
    label: "Beauty & Personal Care",
    value: "Beauty & Personal Care",
    items: [
      { label: "Wigs & Hair Extensions", value: "Wigs & Hair Extensions" },
      { label: "Hair Care Products", value: "Hair Care Products" },
      { label: "Makeup & Cosmetics", value: "Makeup & Cosmetics" },
      { label: "Skincare Products", value: "Skincare Products" },
      { label: "Perfumes & Body Sprays", value: "Perfumes & Body Sprays" },
      { label: "Nail Products", value: "Nail Products" },
      { label: "Beauty Tools & Equipment", value: "Beauty Tools & Equipment" },
    ],
  },
  {
    label: "Jewelry & Watches",
    value: "Jewelry & Watches",
    items: [
      { label: "Fashion Jewelry", value: "Fashion Jewelry" },
      { label: "Watches", value: "Watches" },
      { label: "Gold & Silver Jewelry", value: "Gold & Silver Jewelry" },
      { label: "Beads & Accessories", value: "Beads & Accessories" },
    ],
  },
  {
    label: "Stationery & Office Supplies",
    value: "Stationery & Office Supplies",
    items: [
      {
        label: "Notebooks & Exercise Books",
        value: "Notebooks & Exercise Books",
      },
      { label: "Pens & Pencils", value: "Pens & Pencils" },
      { label: "Paper Products", value: "Paper Products" },
      { label: "Printers & Copiers", value: "Printers & Copiers" },
      { label: "Filing & Storage", value: "Filing & Storage" },
      { label: "Office Furniture", value: "Office Furniture" },
    ],
  },
  {
    label: "Security & Surveillance",
    value: "Security & Surveillance",
    items: [
      { label: "CCTV Cameras", value: "CCTV Cameras" },
      { label: "Alarm Systems", value: "Alarm Systems" },
      { label: "Access Control Systems", value: "Access Control Systems" },
      { label: "Security Lights", value: "Security Lights" },
      { label: "Padlocks & Locks", value: "Padlocks & Locks" },
    ],
  },
  {
    label: "Solar & Renewable Energy",
    value: "Solar & Renewable Energy",
    items: [
      { label: "Solar Panels", value: "Solar Panels" },
      { label: "Solar Inverters", value: "Solar Inverters" },
      { label: "Solar Batteries", value: "Solar Batteries" },
      { label: "Solar Charge Controllers", value: "Solar Charge Controllers" },
      { label: "Solar Water Heaters", value: "Solar Water Heaters" },
      { label: "Solar Street Lights", value: "Solar Street Lights" },
    ],
  },
  {
    label: "Agricultural Products",
    value: "Agricultural Products",
    items: [
      { label: "Farm Tools & Equipment", value: "Farm Tools & Equipment" },
      { label: "Irrigation Systems", value: "Irrigation Systems" },
      { label: "Fertilizers & Pesticides", value: "Fertilizers & Pesticides" },
      { label: "Seeds", value: "Seeds" },
      { label: "Poultry Equipment", value: "Poultry Equipment" },
      { label: "Fish Farming Equipment", value: "Fish Farming Equipment" },
    ],
  },
  {
    label: "Pet Supplies",
    value: "Pet Supplies",
    items: [
      { label: "Pet Food", value: "Pet Food" },
      { label: "Pet Clothing", value: "Pet Clothing" },
      { label: "Pet Toys", value: "Pet Toys" },
      { label: "Pet Cages & Carriers", value: "Pet Cages & Carriers" },
    ],
  },
  {
    label: "Religious Items",
    value: "Religious Items",
    items: [
      { label: "Prayer Mats", value: "Prayer Mats" },
      { label: "Religious Books", value: "Religious Books" },
      { label: "Rosaries & Prayer Beads", value: "Rosaries & Prayer Beads" },
      { label: "Religious Decorations", value: "Religious Decorations" },
    ],
  },
  {
    label: "Party & Event Supplies",
    value: "Party & Event Supplies",
    items: [
      { label: "Balloons & Decorations", value: "Balloons & Decorations" },
      { label: "Party Costumes", value: "Party Costumes" },
      { label: "Event Tents & Canopies", value: "Event Tents & Canopies" },
      { label: "Disposable Plates & Cups", value: "Disposable Plates & Cups" },
    ],
  },
];
