const express = require('express');
const { getDB } = require('./db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// 创建订单
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity, contactInfo } = req.body;
    
    if (!productId || !quantity || !contactInfo) {
      return res.status(400).json({ error: '所有字段都是必需的' });
    }
    
    const db = getDB();
    const ordersCollection = db.collection('orders');
    const productsCollection = db.collection('products');
    const usersCollection = db.collection('users');
    
    // 获取商品信息
    const product = await productsCollection.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({ error: '商品不存在' });
    }
    
    // 检查库存
    if (product.stock < quantity) {
      return res.status(400).json({ error: '库存不足' });
    }
    
    // 获取用户信息
    const user = await usersCollection.findOne({ _id: req.user.userId });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 检查钻石是否足够
    const totalPrice = product.price * quantity;
    if (user.diamonds < totalPrice) {
      return res.status(400).json({ error: '钻石不足' });
    }
    
    // 创建订单
    const newOrder = {
      userId: req.user.userId,
      productId,
      productName: product.name,
      quantity: parseInt(quantity),
      totalPrice,
      contactInfo,
      status: 'pending', // pending, processing, completed, cancelled
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await ordersCollection.insertOne(newOrder);
    
    // 减少商品库存
    await productsCollection.updateOne(
      { _id: productId },
      { $inc: { stock: -quantity } }
    );
    
    // 扣除用户钻石
    await usersCollection.updateOne(
      { _id: req.user.userId },
      { $inc: { diamonds: -totalPrice } }
    );
    
    res.status(201).json({ 
      message: '订单创建成功', 
      orderId: result.insertedId 
    });
  } catch (error) {
    console.error('创建订单错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取用户订单
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    const ordersCollection = db.collection('orders');
    
    const orders = await ordersCollection
      .find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(orders);
  } catch (error) {
    console.error('获取订单错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取所有订单（管理员）
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权访问' });
    }
    
    const db = getDB();
    const ordersCollection = db.collection('orders');
    const usersCollection = db.collection('users');
    
    const orders = await ordersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // 获取用户信息
    for (let order of orders) {
      const user = await usersCollection.findOne(
        { _id: order.userId },
        { projection: { username: 1, email: 1 } }
      );
      order.userInfo = user;
    }
    
    res.json(orders);
  } catch (error) {
    console.error('获取订单错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新订单状态（管理员）
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权访问' });
    }
    
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: '状态是必需的' });
    }
    
    const db = getDB();
    const ordersCollection = db.collection('orders');
    
    const updateFields = { 
      status, 
      updatedAt: new Date() 
    };
    
    if (adminNotes) {
      updateFields.adminNotes = adminNotes;
    }
    
    const result = await ordersCollection.updateOne(
      { _id: id },
      { $set: updateFields }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    res.json({ message: '订单状态更新成功' });
  } catch (error) {
    console.error('更新订单错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
