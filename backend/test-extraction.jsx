// Constants
const API_BASE = 'https://api.example.com';
const MAX_RETRIES = 3;

// Utility function
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

// Regular function
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// React component
function ProductCard({ product }) {
  return (
    <div className="product">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button>Add to Cart</button>
    </div>
  );
}

// Arrow function
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
