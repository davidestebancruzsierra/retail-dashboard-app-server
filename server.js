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
