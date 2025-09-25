const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('account_store');
    
    // 测试数据库连接和集合
    const products = db.collection('products');
    const count = await products.countDocuments();
    
    await client.close();
    
    res.json({
      status: 'OK',
      message: '后端服务运行正常',
      database: '连接成功',
      products_count: count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: '后端服务异常',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
