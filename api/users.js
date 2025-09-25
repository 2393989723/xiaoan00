const express = require('express');
const { getDB } = require('./db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// 获取所有用户（管理员）
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权访问' });
    }
    
    const db = getDB();
    const usersCollection = db.collection('users');
    
    const users = await usersCollection
      .find({}, { projection: { password: 0 } })
      .toArray();
    
    res.json(users);
  } catch (error) {
    console.error('获取用户错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新用户钻石（管理员）
router.put('/:id/diamonds', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权访问' });
    }
    
    const { id } = req.params;
    const { diamonds, action } = req.body; // action: add或set
    
    if (!diamonds || !action) {
      return res.status(400).json({ error: '钻石数量和操作类型是必需的' });
    }
    
    const db = getDB();
    const usersCollection = db.collection('users');
    
    let updateFields = { updatedAt: new Date() };
    
    if (action === 'add') {
      updateFields = { 
        $inc: { diamonds: parseInt(diamonds) },
        updatedAt: new Date()
      };
    } else if (action === 'set') {
      updateFields = { 
        $set: { diamonds: parseInt(diamonds) },
        updatedAt: new Date()
      };
    } else {
      return res.status(400).json({ error: '操作类型无效' });
    }
    
    const result = await usersCollection.updateOne(
      { _id: id },
      updateFields
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json({ message: '用户钻石更新成功' });
  } catch (error) {
    console.error('更新用户钻石错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
