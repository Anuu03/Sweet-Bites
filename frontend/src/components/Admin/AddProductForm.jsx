import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAdminProduct } from "../../redux/slices/adminProductSlice";
import axios from "axios";

const AddProductForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Use state to manage form data, initializing with empty or default values
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: 0,
    countInStock: 0,
    sku: "",
    category: "",
    collections: "",
    weights: [], // Changed from 'weight' to 'weights' to match backend
    flavours: [],
    images: [],
  });

  const [uploading, setUploading] = useState(false);
  const { loading, error } = useSelector((state) => state.adminProducts);

  // Handle normal text/number inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle image upload and preview
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setProductData((prevData) => ({
        ...prevData,
        images: [...prevData.images, { url: data.imageUrl, altText: "" }],
      }));
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  // Remove image
  const handleRemoveImage = (index) => {
    setProductData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createAdminProduct(productData))
      .unwrap()
      .then(() => {
        navigate("/admin/products");
      })
      .catch((err) => {
        console.error("Failed to add product:", err);
      });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 shadow-md rounded-md bg-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">Add New Product</h2>
      {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>}
      <form onSubmit={handleSubmit}>
        {/* Product Name */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Product Name</label>
          <input
            type="text"
            name="name"
            value={productData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Description</label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            rows={4}
            required
          />
        </div>

        {/* Price */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Price</label>
          <input
            type="number"
            name="price"
            value={productData.price}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            min="0"
            required
          />
        </div>

        {/* Count In Stock */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Count In Stock</label>
          <input
            type="number"
            name="countInStock"
            value={productData.countInStock}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            min="0"
            required
          />
        </div>

        {/* SKU */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">SKU</label>
          <input
            type="text"
            name="sku"
            value={productData.sku}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Weight */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">
            Weight (comma-separated)
          </label>
          <input
            type="text"
            name="weights" // Changed from 'weight' to 'weights'
            value={productData.weights.join(", ")}
            onChange={(e) =>
              setProductData({
                ...productData,
                weights: e.target.value.split(",").map((w) => w.trim()), // Changed from 'weight' to 'weights'
              })
            }
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Flavours */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">
            Flavours (comma-separated)
          </label>
          <input
            type="text"
            name="flavours"
            value={productData.flavours.join(", ")}
            onChange={(e) =>
              setProductData({
                ...productData,
                flavours: e.target.value.split(",").map((f) => f.trim()),
              })
            }
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Category</label>
          <input
            type="text"
            name="category"
            value={productData.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Upload Images</label>
          <input type="file" onChange={handleImageUpload} />
          {uploading && <p>Uploading...</p>}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
            {productData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={image.altText || "Product"}
                  className="w-full h-24 sm:h-28 md:h-32 object-cover shadow-md rounded-md"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;