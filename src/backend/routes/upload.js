const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();

// 配置multer用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    // 允许的文件类型
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3',
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/html', 'text/css', 'text/javascript',
      'application/json', 'application/xml'
    ];
    
    // 检查文件类型
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.log('不支持的文件类型:', file.mimetype);
      cb(null, true); // 暂时允许所有文件类型用于测试
    }
  }
});

/**
 * 上传文件到IPFS
 * POST /api/upload/ipfs
 */
router.post('/ipfs', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '没有上传文件'
      });
    }

    const { buffer, originalname, mimetype, size } = req.file;

    // 检查环境变量
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_API_SECRET) {
      console.warn('Pinata API 密钥未配置，使用模拟上传');
      
      // 模拟上传延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockHash = `QmMock${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      return res.json({
        success: true,
        data: {
          hash: mockHash,
          url: `https://gateway.pinata.cloud/ipfs/${mockHash}`,
          filename: originalname,
          size: size,
          mimetype: mimetype
        }
      });
    }

    // 使用Pinata上传到IPFS
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: originalname,
      contentType: mimetype
    });

    // 添加元数据
    const metadata = JSON.stringify({
      name: originalname,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        size: size.toString(),
        mimetype: mimetype
      }
    });
    formData.append('pinataMetadata', metadata);

    // 上传到Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_API_SECRET
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    const ipfsHash = response.data.IpfsHash;

    res.json({
      success: true,
      data: {
        hash: ipfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
        filename: originalname,
        size: size,
        mimetype: mimetype
      }
    });

  } catch (error) {
    console.error('IPFS上传失败:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: '文件大小超过限制(100MB)'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'IPFS上传失败'
    });
  }
});

/**
 * 上传JSON元数据到IPFS
 * POST /api/upload/metadata
 */
router.post('/metadata', async (req, res) => {
  try {
    const { metadata } = req.body;

    if (!metadata) {
      return res.status(400).json({
        success: false,
        error: '缺少元数据'
      });
    }

    // 检查环境变量
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_API_SECRET) {
      console.warn('Pinata API 密钥未配置，使用模拟上传');
      
      const mockHash = `QmMetadata${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      return res.json({
        success: true,
        data: {
          hash: mockHash,
          url: `https://gateway.pinata.cloud/ipfs/${mockHash}`
        }
      });
    }

    // 上传JSON到Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_API_SECRET
        }
      }
    );

    const ipfsHash = response.data.IpfsHash;

    res.json({
      success: true,
      data: {
        hash: ipfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
      }
    });

  } catch (error) {
    console.error('元数据上传失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '元数据上传失败'
    });
  }
});

/**
 * 获取上传状态
 * GET /api/upload/status/:hash
 */
router.get('/status/:hash', async (req, res) => {
  try {
    const { hash } = req.params;

    // 检查IPFS文件是否可访问
    const response = await axios.head(`https://gateway.pinata.cloud/ipfs/${hash}`, {
      timeout: 5000
    });

    res.json({
      success: true,
      data: {
        hash: hash,
        accessible: response.status === 200,
        url: `https://gateway.pinata.cloud/ipfs/${hash}`
      }
    });

  } catch (error) {
    res.json({
      success: true,
      data: {
        hash: req.params.hash,
        accessible: false,
        error: error.message
      }
    });
  }
});

module.exports = router;