const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('account_store');
    const productsCollection = db.collection('products');
    
    // 获取所有商品
    if (req.method === 'GET') {
      const products = await productsCollection.find({}).toArray();
      res.json(products);
    }
    // 创建商品
    else if (req.method === 'POST') {
      const { name, description, price, category, stock } = req.body;
      
      if (!name || !description || !price) {
        return res.status(400).json({ error: '名称、描述和价格是必需的' });
      }
      
      const newProduct = {
        name,
        description,
        price: parseInt(price),
        category: category || '默认分类',
        stock: parseInt(stock) || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await productsCollection.insertOne(newProduct);
      res.status(201).json({ 
        message: '商品创建成功', 
        productId: result.insertedId 
      });
    }
    else {
      res.status(405).json({ error: '方法不允许' });
    }
  } catch (error) {
    console.error('商品API错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  } finally {
    await client.close();
  }
};
