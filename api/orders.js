const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('account_store');
    const ordersCollection = db.collection('orders');
    const productsCollection = db.collection('products');
    const usersCollection = db.collection('users');
    
    // 创建订单
    if (req.method === 'POST') {
      const { productId, quantity, contactInfo, userId } = req.body;
      
      if (!productId || !quantity || !contactInfo || !userId) {
        return res.status(400).json({ error: '所有字段都是必需的' });
      }
      
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
      const user = await usersCollection.findOne({ _id: userId });
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
        userId,
        productId,
        productName: product.name,
        quantity: parseInt(quantity),
        totalPrice,
        contactInfo,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await ordersCollection.insertOne(newOrder);
      
      // 更新商品库存
      await productsCollection.updateOne(
        { _id: productId },
        { $inc: { stock: -quantity } }
      );
      
      // 更新用户钻石
      await usersCollection.updateOne(
        { _id: userId },
        { $inc: { diamonds: -totalPrice } }
      );
      
      res.status(201).json({ 
        message: '订单创建成功', 
        orderId: result.insertedId 
      });
    }
    // 获取订单
    else if (req.method === 'GET') {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: '用户ID是必需的' });
      }
      
      const orders = await ordersCollection.find({ userId }).toArray();
      res.json(orders);
    }
    else {
      res.status(405).json({ error: '方法不允许' });
    }
  } catch (error) {
    console.error('订单API错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  } finally {
    await client.close();
  }
};
