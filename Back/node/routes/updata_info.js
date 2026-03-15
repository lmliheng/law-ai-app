const mysql = require('mysql2/promise');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');


const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. 配置存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/avatars/';
        // 确保目录存在
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // 生成唯一文件名
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// 2. 创建上传中间件
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件'));
        }
    }
});



dotenv.config();

// 数据库连接
let db;

async function connectDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('数据库连接成功');
 
    //查询用户表
    const [rows] = await db.execute('SELECT * FROM user WHERE id = 1');
    console.log('查询第一个用户数据:', rows);

  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
}

connectDB();



// 更新用户信息
router.put('/update-info',upload.single('useravatar'), async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: '未授权' });
  }
        if (!req.file) {
            return res.status(400).json({ error: '没有上传文件' });
        }
          // 接收保存上传的用户头像
          // 文件路径（相对路径）
        const filePath = `${req.file.filename}`;
  
  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { username, filePath, password } = req.body;
    
    // 验证数据
    if (!username) {
      return res.status(400).json({ message: '用户名不能为空' });
    }
    
    // 构建更新语句
    let updateQuery = 'UPDATE user SET username = ?';
    let updateParams = [username];
    
    // 如果提供了密码，添加到更新语句
    if (password) {
      // 密码加密
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateQuery += ', password = ?';
      updateParams.push(hashedPassword);
    }
    
    // 如果提供了用户头像，添加到更新语句
    if (filePath) {
      updateQuery += ', useravatar = ?';
      updateParams.push(filePath);
    }
    
    updateQuery += ' WHERE id = ?';
    updateParams.push(decoded.id);
    
    // 执行更新
    await db.execute(updateQuery, updateParams);
    
    // 获取更新后的用户信息
    const [updatedUser] = await db.execute(
      'SELECT id, username, email, useravatar, created_at, updated_at FROM user WHERE id = ?',
      [decoded.id]
    );
    
    res.status(200).json({
      message: '个人信息更新成功',
      user: updatedUser[0]
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
