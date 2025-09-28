import React from "react";

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 hover:scale-105 transition">
      <img src={product.image} alt={product.name} className="rounded-md" />
      <h3 className="mt-2 font-semibold text-lg">{product.name}</h3>
      <p className="text-gray-500">${product.price}</p>
      <button className="mt-2 bg-black text-yellow-400 px-4 py-2 rounded-lg">
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
