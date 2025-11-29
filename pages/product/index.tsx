"use client";

import React, { useState } from "react";
import {
  Save,
  Plus,
  Trash2,
  ImageIcon,
  DollarSign,
  Package,
  TrendingUp,
  X,
} from "lucide-react";

// --------------------------------------------
// TYPES
// --------------------------------------------

interface SKU {
  price: number;
  stock: number;
}

interface VariantProperty {
  name: string;
  values: string[];
}

interface Attribute {
  key: string;
  value: string;
}

interface Product {
  description: string;
  stock: number;
  moq: number;
  location: string;
  deliveryFeeYen: number;
  deliveryFeeNaira: number;
  totalSold: number;
  images: string[];
  variantProperties: VariantProperty[];
  skus: Record<string, SKU>;
  attributes: Attribute[];
}

// --------------------------------------------
// COMPONENT
// --------------------------------------------

const ProductManager: React.FC = () => {
  const [product, setProduct] = useState<Product>({
    description:
      "High-quality iPods, fully tested for performance before delivery. Available in all colors and each order come with a free pouch, screen guard, and Apple-compatible cord. Perfect for daily use or resale.",
    stock: 14000,
    moq: 1,
    location: "Guangzhou",
    deliveryFeeYen: 7,
    deliveryFeeNaira: 1484,
    totalSold: 355,
    images: [
      "https://shipro-public-assets-v2.s3.eu-west-2.amazonaws.com/shipro-products/photo_2025-11-18+17.32.00.jpeg",
      "https://shipro-public-assets-v2.s3.eu-west-2.amazonaws.com/shipro-products/photo_2025-11-18+17.32.07.jpeg",
      "https://shipro-public-assets-v2.s3.eu-west-2.amazonaws.com/shipro-products/photo_2025-11-18+17.32.09.jpeg",
      "https://shipro-public-assets-v2.s3.eu-west-2.amazonaws.com/shipro-products/photo_2025-11-18+17.32.12.jpeg",
    ],
    variantProperties: [
      { name: "generation", values: ["6th", "7th"] },
      { name: "rom", values: ["16gb", "32gb", "64gb", "128gb", "256gb"] },
      { name: "color", values: ["Space gray", "Blue", "Pink", "Beige"] },
    ],
    skus: {
      "6th_16gb_spacegray": { price: 185, stock: 500 },
      "6th_16gb_blue": { price: 185, stock: 500 },
      "6th_16gb_pink": { price: 185, stock: 500 },
      "6th_32gb_spacegray": { price: 201, stock: 500 },
      "6th_32gb_blue": { price: 201, stock: 500 },
      "6th_64gb_spacegray": { price: 239, stock: 500 },
      "6th_128gb_spacegray": { price: 305, stock: 500 },
      "7th_32gb_spacegray": { price: 454, stock: 500 },
      "7th_32gb_blue": { price: 454, stock: 500 },
      "7th_128gb_spacegray": { price: 559, stock: 500 },
      "7th_256gb_spacegray": { price: 659, stock: 500 },
    },
    attributes: [
      { key: "Brand", value: "Apple" },
      { key: "Model", value: "iPod" },
      { key: "Material", value: "Aluminum + Glass" },
      { key: "Battery Life", value: "Up to 40 hours" },
    ],
  });

  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<
    "basic" | "variants" | "images" | "attributes"
  >("basic");

  // --------------------------------------------
  // HELPERS
  // --------------------------------------------

  const generateAllCombinations = () => {
    if (product.variantProperties.length === 0) return [];

    const combinations: string[][] = [];

    const generate = (current: string[], depth: number) => {
      if (depth === product.variantProperties.length) {
        combinations.push([...current]);
        return;
      }

      const prop = product.variantProperties[depth];
      for (const value of prop.values) {
        current.push(value);
        generate(current, depth + 1);
        current.pop();
      }
    };

    generate([], 0);
    return combinations;
  };

  const allCombinations = generateAllCombinations();

  const getSKUKey = (combination: string[]) =>
    combination.map((v) => v.toLowerCase().replace(/\s+/g, "")).join("_");

  const updateField = <K extends keyof Product>(
    field: K,
    value: Product[K]
  ) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const updateSku = (skuKey: string, field: keyof SKU, value: number) => {
    setProduct((prev) => ({
      ...prev,
      skus: {
        ...prev.skus,
        [skuKey]: { ...prev.skus[skuKey], [field]: Number(value) },
      },
    }));
  };

  // --------------------------------------------
  // PROPERTY HELPERS
  // --------------------------------------------

  const addProperty = () => {
    setProduct((prev) => ({
      ...prev,
      variantProperties: [
        ...prev.variantProperties,
        { name: "", values: [""] },
      ],
    }));
  };

  const removeProperty = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      variantProperties: prev.variantProperties.filter((_, i) => i !== index),
    }));
  };

  const updatePropertyName = (index: number, name: string) => {
    setProduct((prev) => ({
      ...prev,
      variantProperties: prev.variantProperties.map((p, i) =>
        i === index ? { ...p, name } : p
      ),
    }));
  };

  const addPropertyValue = (propIndex: number) => {
    setProduct((prev) => ({
      ...prev,
      variantProperties: prev.variantProperties.map((p, i) =>
        i === propIndex ? { ...p, values: [...p.values, ""] } : p
      ),
    }));
  };

  const updatePropertyValue = (
    propIndex: number,
    valueIndex: number,
    value: string
  ) => {
    setProduct((prev) => ({
      ...prev,
      variantProperties: prev.variantProperties.map((p, i) =>
        i === propIndex
          ? {
              ...p,
              values: p.values.map((v, vi) => (vi === valueIndex ? value : v)),
            }
          : p
      ),
    }));
  };

  const removePropertyValue = (propIndex: number, valueIndex: number) => {
    setProduct((prev) => ({
      ...prev,
      variantProperties: prev.variantProperties.map((p, i) =>
        i === propIndex
          ? { ...p, values: p.values.filter((_, vi) => vi !== valueIndex) }
          : p
      ),
    }));
  };

  // --------------------------------------------
  // ATTRIBUTE HELPERS
  // --------------------------------------------

  const addAttribute = () => {
    setProduct((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { key: "", value: "" }],
    }));
  };

  const updateAttribute = (
    index: number,
    field: keyof Attribute,
    value: string
  ) => {
    setProduct((prev) => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      ),
    }));
  };

  const removeAttribute = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  // --------------------------------------------
  // METRICS
  // --------------------------------------------

  const totalVariants = Object.keys(product.skus).length;
  const avgPrice =
    Object.values(product.skus).reduce((sum, sku) => sum + sku.price, 0) /
      totalVariants || 0;

  // --------------------------------------------
  // RENDER
  // --------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Product Management
              </h1>
              <p className="text-gray-500 mt-1">
                Apple iPod - Multiple Variants
              </p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              <Save size={18} />
              Save Changes
            </button>
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Package size={18} />
                <span className="text-sm font-medium">Total Stock</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {product.stock.toLocaleString()}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <TrendingUp size={18} />
                <span className="text-sm font-medium">Total Sold</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {product.totalSold}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <DollarSign size={18} />
                <span className="text-sm font-medium">Avg Price</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ¥{Math.round(avgPrice)}
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <ImageIcon size={18} />
                <span className="text-sm font-medium">Active SKUs</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {totalVariants}
              </p>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              {(["basic", "variants", "images", "attributes"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                      activeTab === tab
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                )
              )}
            </nav>
          </div>

          <div className="p-6">
            {/* BASIC TAB */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                {/* DESCRIPTION */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={product.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* BASIC INPUT GRID */}
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Stock
                    </label>
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) =>
                        updateField("stock", Number(e.target.value))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      MOQ
                    </label>
                    <input
                      type="number"
                      value={product.moq}
                      onChange={(e) =>
                        updateField("moq", Number(e.target.value))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={product.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* DELIVERY FEE */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Fee (¥)
                    </label>
                    <input
                      type="number"
                      value={product.deliveryFeeYen}
                      onChange={(e) =>
                        updateField("deliveryFeeYen", Number(e.target.value))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Fee (₦)
                    </label>
                    <input
                      type="number"
                      value={product.deliveryFeeNaira}
                      onChange={(e) =>
                        updateField("deliveryFeeNaira", Number(e.target.value))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* VARIANTS TAB */}
            {activeTab === "variants" && (
              <div className="space-y-8">
                {/* VARIANT PROPERTIES */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Variant Properties
                    </h3>
                    <button
                      onClick={addProperty}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus size={16} />
                      Add Property
                    </button>
                  </div>

                  <div className="space-y-4">
                    {product.variantProperties.map((prop, propIndex) => (
                      <div
                        key={propIndex}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        {/* PROPERTY NAME */}
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="text"
                            value={prop.name}
                            onChange={(e) =>
                              updatePropertyName(propIndex, e.target.value)
                            }
                            placeholder="Property name (e.g., color, size)"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                          />

                          <button
                            onClick={() => removeProperty(propIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {/* PROPERTY VALUES */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-600 uppercase">
                            Values
                          </label>

                          {prop.values.map((value, valueIndex) => (
                            <div
                              key={valueIndex}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="text"
                                value={value}
                                onChange={(e) =>
                                  updatePropertyValue(
                                    propIndex,
                                    valueIndex,
                                    e.target.value
                                  )
                                }
                                placeholder="Value"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                              />

                              <button
                                onClick={() =>
                                  removePropertyValue(propIndex, valueIndex)
                                }
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}

                          <button
                            onClick={() => addPropertyValue(propIndex)}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Plus size={14} />
                            Add value
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SKU MANAGEMENT */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    SKU Pricing & Stock ({allCombinations.length} possible
                    combinations)
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {product.variantProperties.map((prop, idx) => (
                            <th
                              key={idx}
                              className="text-left py-3 px-4 text-sm font-medium text-gray-700 capitalize"
                            >
                              {prop.name}
                            </th>
                          ))}
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                            Price (¥)
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                            Stock
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {allCombinations.map((combination, idx) => {
                          const skuKey = getSKUKey(combination);
                          const sku = product.skus[skuKey] || {
                            price: 0,
                            stock: 0,
                          };

                          return (
                            <tr
                              key={idx}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              {combination.map((value, vIdx) => (
                                <td key={vIdx} className="py-3 px-4">
                                  <span className="text-sm text-gray-900">
                                    {value}
                                  </span>
                                </td>
                              ))}

                              {/* PRICE */}
                              <td className="py-3 px-4">
                                <input
                                  type="number"
                                  value={sku.price}
                                  onChange={(e) =>
                                    updateSku(
                                      skuKey,
                                      "price",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-24 px-3 py-1 border border-gray-300 rounded text-sm"
                                />
                              </td>

                              {/* STOCK */}
                              <td className="py-3 px-4">
                                <input
                                  type="number"
                                  value={sku.stock}
                                  onChange={(e) =>
                                    updateSku(
                                      skuKey,
                                      "stock",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-24 px-3 py-1 border border-gray-300 rounded text-sm"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* IMAGES TAB */}
            {activeTab === "images" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={product.images[selectedImage]}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      All Images
                    </h3>

                    <div className="grid grid-cols-3 gap-3">
                      {product.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                            selectedImage === idx
                              ? "border-blue-600"
                              : "border-gray-200"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                      <button className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-600 hover:bg-blue-50 transition">
                        <Plus size={24} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "attributes" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-700">
                    Product Attributes
                  </h3>

                  <button
                    onClick={addAttribute}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus size={16} />
                    Add Attribute
                  </button>
                </div>

                <div className="space-y-3">
                  {product.attributes.map((attr, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={attr.key}
                        onChange={(e) =>
                          updateAttribute(idx, "key", e.target.value)
                        }
                        placeholder="Key"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      />

                      <input
                        type="text"
                        value={attr.value}
                        onChange={(e) =>
                          updateAttribute(idx, "value", e.target.value)
                        }
                        placeholder="Value"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      />

                      <button
                        onClick={() => removeAttribute(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
