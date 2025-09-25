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
    const usersCollection = db.collection('users');
    
    // 用户注册
    if (req.method === 'POST' && req.url === '/register') {
      const { username, password, email } = req.body;
      
      if (!username || !password || !email) {
        return res.status(400).json({ error: '所有字段都是必需的' });
      }
      
      // 检查用户是否已存在
      const existingUser = await usersCollection.findOne({ 
        $or: [{ username }, { email }] 
      });
      
      if (existingUser) {
        return res.status(400).json({ error: '用户名或邮箱已存在' });
      }
      
      // 简单密码加密
      const hashedPassword = Buffer.from(password).toString('base64');
      
      const newUser = {
        username,
        email,
        password: hashedPassword,
        diamonds: 100, // 新用户赠送100钻石
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await usersCollection.insertOne(newUser);
      
      res.status(201).json({
        message: '用户注册成功',
        user: {
          id: result.insertedId,
          username,
          email,
          diamonds: 100,
          role: 'user'
        }
      });
    }
    // 用户登录
    else if (req.method === 'POST' && req.url === '/login') {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码是必需的' });
      }
      
      const user = await usersCollection.findOne({ username });
      
      if (!user) {
        return res.status(400).json({ error: '用户名或密码错误' });
      }
      
      // 验证密码
      const hashedPassword = Buffer.from(password).toString('base64');
      
      if (user.password !== hashedPassword) {
        return res.status(400).json({ error: '用户名或密码错误' });
      }
      
      res.json({
        message: '登录成功',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          diamonds: user.diamonds,
          role: user.role
        }
      });
    }
    // 获取用户信息
    else if (req.method === 'GET' && req.url === '/me') {
      // 这里简化处理，实际应该验证token
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: '用户ID是必需的' });
      }
      
      const user = await usersCollection.findOne({ _id: userId });
      
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }
      
      // 不返回密码
      delete user.password;
      res.json({ user });
    }
    else {
      res.status(404).json({ error: 'API端点不存在' });
    }
  } catch (error) {
    console.error('认证API错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  } finally {
    await client.close();
  }
};
