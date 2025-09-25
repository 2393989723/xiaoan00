const express = require('express');
const { getDB } = require('./db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// 获取所有商品
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const productsCollection = db.collection('products');
    
    const products = await productsCollection.find({}).toArray();
    res.json(products);
  } catch (error) {
    console.error('获取商品错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取单个商品
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const productsCollection = db.collection('products');
    const { id } = req.params;
    
    const product = await productsCollection.findOne({ _id: id });
    
    if (!product) {
      return res.status(404).json({ error: '商品不存在' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('获取商品错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建商品（管理员）
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权访问' });
    }
    
    const { name, description, price, category, stock } = req.body;
    
    if (!name || !description || !price || !category) {
      return res.status(400).json({ error: '所有字段都是必需的' });
    }
    
    const db = getDB();
    const productsCollection = db.collection('products');
    
    const newProduct = {
      name,
      description,
      price: parseInt(price),
      category,
      stock: stock || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await productsCollection.insertOne(newProduct);
    res.status(201).json({ 
      message: '商品创建成功', 
      productId: result.insertedId 
    });
  } catch (error) {
    console.error('创建商品错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新商品（管理员）
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权访问' });
    }
    
    const { id } = req.params;
    const { name, description, price, category, stock } = req.body;
    
    const db = getDB();
    const productsCollection = db.collection('products');
    
    const updateFields = { updatedAt: new Date() };
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;
    if (price) updateFields.price = parseInt(price);
    if (category) updateFields.category = category;
    if (stock !== undefined) updateFields.stock = parseInt(stock);
    
    const result = await productsCollection.updateOne(
      { _id: id },
      { $set: updateFields }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: '商品不存在' });
    }
    
    res.json({ message: '商品更新成功' });
  } catch (error) {
    console.error('更新商品错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除商品（管理员）
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权访问' });
    }
    
    const { id } = req.params;
    const db = getDB();
    const productsCollection = db.collection('products');
    
    const result = await productsCollection.deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: '商品不存在' });
    }
    
    res.json({ message: '商品删除成功' });
  } catch (error) {
    console.error('删除商品错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
