const express = require("express");
const bodyParcer = require("body-parcer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;
const PRODUCTS_FILE = path.join(__dirname, "data", "products.json");
const SALES_FILE = path.join(__dirname, "data", "sales.json");
app.use(cors());
app.use(bodyParcer.json());
// assist functions//
//function to read products//
const readProducts = () => {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error, reading products:", error);
    return [];
  }
};
//function write products//
const writeProducts = (data) => {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error, writing products:", error);
  }
};

//function to read sales//

const readSales = () => {
  try {
    if (!fs.existsSync(SALES_FILE)) {
      fs.writeFileSync(SALES_FILE, JSON.stringify([], null, 2));
    }
    const data = fs.readFileSync(SALES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error, reading sales:", error);
    return [];
  }
};
//function write sales//
const writeSales = (data) => {
  try {
    fs.writeFileSync(SALES_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error, writing products:", error);
  }
};

//paths//
//obtain the products//
app.get("/api/products", (req, res) => {
  const products = readProducts();
  //reviews count//
  const productsWithStats = products.map((p) => {
    const totalRating = p.reviews.reduce((acc, r) => acc + Number(r.Rating), 0);
    const avgRating =
      p.reviews > 0 ? (totalRating / p.reviews.lenght).toFixed(1) : 0;
    return { ...p, avgRating };
  });
  res.json(productsWithStats);
});
//get products by id//
app.get("/api/products/:id", (req, res) => {
  const products = readProducts();
  const product = products.find((p) => p.id == req.params.id);
  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }
  const totalRating = p.reviews.reduce((acc, r) => acc + Number(r.Rating), 0);
  const avgRating =
    p.reviews > 0 ? (totalRating / p.reviews.lenght).toFixed(1) : 0;
  res.json({
    ...product,
    avgRating,
  });
});
//Create Products//
app.post("/api/products", (req, res) => {
  const { name, price, description, images, stock, type, group } = req.body;
  if (!name || !price || !stock) {
    return res.status(400).json({
      message: "Name, price and stock required",
    });
  }
  let products = readProducts();
  const newProduct = {
    id: Math.max(...products.map((p) => p.id), 0) + 1,
    name,
    price: Number(price),
    description: description || "",
    images: images || [],
    stock: Number(stock),
    type: type || "General",
    group: group || "other",
    review: [],
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  writeProducts(products);
  res.status(201).json({
    message: "Product created succesfully",
    product: newProduct,
  });
});
//Update products//
app.post("/api/products/:id", (req, res) => {
  const { name, price, description, images, stock, type, group } = req.body;

  let products = readProducts();
  const productIndex = products.findIndex((p) => p.id == req.params.id);
  if (productIndex == -1) {
    return res.status(404).json({
      message: "Product not found",
    });
  }
  const updatedProduct = {
    ...products[productIndex],
    ...(name && { name }),
    ...(price && { price: Number(price) }),
    ...(description && { description }),
    ...(images && { images }),
    ...(stock !== undefined && { stock: Number(stock) }),
    ...(type && { type }),
    ...(group && { group }),
  };
  products[productIndex] = updatedProduct;
  writeProducts(products);
  res.json({
    message: "Product update successfully!",
    product: updatedProduct,
  });
});

//Delete path//
app.delete("/api/products/:id", (req, res) => {
  let products = readProducts();
  const productIndex = products.findIndex((p) => p.id == req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({
      message: "Product not found",
    });
  }
  const deleteProduct = products[productIndex];
  products.splice(productIndex, 1);
  writeProducts(products);

  res.json({
    message: "Product deleted successfully!",
    product: deleteProduct,
  });
});

//path to add product review//
app.post("/api/products/:id/reviews", (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || !comment) {
    return res.status(404).json({ message: "Rating and comment required" });
  }
  let products = readProducts();
  const product = products.find((p) => p.id == req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  product.reviews.push({
    rating: Number(rating),
    comment,
    createdAt: new Date().toISOString(),
  });
});

writeProducts(products);

res.status(201).json({
  message: "Review added successfully!",
  review: { rating, comment },
});

//path to proccess purchase//
app.post("/api/cart/checkout", (req, res) => {
  const { cart, total } = req.body;
  if (!cart || cart.length === 0) {
    return res.status(400).json({ message: "Empty cart" });
  }

  let products = readProducts();
  let allInStock = true;
  let updatedProducts = [...products];

  //Verify Stock//
  cart.forEach((cartItem) => {
    const product = updatedProducts.find((p) => p.id === cartItem.id);
    if (!product || product.stock < cartItem.quantify) {
      allInStock = false;
    }
  });

  if (!allInStock) {
    return res.status(400).json({
      message: "One or more products do not have enough stock",
      success: false,
    });
  }

  // take away stock//
  cart.forEach((cartItem) => {
    const product = updatedProducts.find((p) => p.id === cartItem.id);
    if (product) {
      product.stock -= cartItem.quantify;
    }
  });

  writeProducts(updatedProducts);

  // register sales//
  const sale = {
    id: "sale_" + Date.now(),
    cart,
    total,
    status: "completed",
    createdAt: new Date().toISOString(),
  };

  let sales = readSales();
  sales.push(sale);
  writeSales(sales);

  res.json({
    message: "Purchase made successfully!",
    success: true,
    saleId: sale.id,
  });
});
