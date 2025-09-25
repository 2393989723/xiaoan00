const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('account_store');
    const usersCollection = db.collection('users');
    
    // 获取所有用户（管理员功能）
    if (req.method === 'GET') {
      const users = await usersCollection.find({}, { projection: { password: 0 } }).toArray();
      res.json(users);
    }
    // 更新用户钻石（管理员功能）
    else if (req.method === 'PUT' && req.url.includes('/diamonds')) {
      const userId = req.url.split('/')[1]; // 从URL提取用户ID
      const { diamonds, action } = req.body;
      
      if (!diamonds || !action) {
        return res.status(400).json({ error: '钻石数量和操作类型是必需的' });
      }
      
      let updateQuery = {};
      
      if (action === 'add') {
        updateQuery = { $inc: { diamonds: parseInt(diamonds) } };
      } else if (action === 'set') {
        updateQuery = { $set: { diamonds: parseInt(diamonds) } };
      } else {
        return res.status(400).json({ error: '操作类型无效' });
      }
      
      updateQuery.$set = { updatedAt: new Date() };
      
      const result = await usersCollection.updateOne(
        { _id: userId },
        updateQuery
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: '用户不存在' });
      }
      
      res.json({ message: '用户钻石更新成功' });
    }
    else {
      res.status(405).json({ error: '方法不允许' });
    }
  } catch (error) {
    console.error('用户API错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  } finally {
    await client.close();
  }
};
