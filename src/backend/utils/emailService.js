import nodemailer from 'nodemailer';

// 配置邮件发送器
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * 发送邮箱验证邮件
 */
export async function sendVerificationEmail(email, token, aiAdvice = null) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'whichWitch - 验证您的邮箱',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">whichWitch</h1>
          <p style="color: #666; font-size: 16px;">创作平台</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">欢迎加入 whichWitch！</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            感谢您注册 whichWitch 创作平台。我们已经为您自动生成了一个专属的以太坊钱包。
          </p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            请点击下面的按钮验证您的邮箱地址：
          </p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" 
               style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              验证邮箱
            </a>
          </div>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 5px; border-left: 4px solid #ffc107; margin-bottom: 30px;">
          <h3 style="color: #856404; margin-bottom: 10px;">🔐 重要提醒</h3>
          <p style="color: #856404; line-height: 1.6; margin: 0;">
            我们已为您生成了一个安全的以太坊钱包。您的私钥经过加密存储，只有您可以访问。
            请妥善保管您的登录信息。
          </p>
        </div>
        
        ${aiAdvice ? `
        <div style="background: #e7f3ff; padding: 20px; border-radius: 5px; border-left: 4px solid #007bff; margin-bottom: 30px;">
          <h3 style="color: #004085; margin-bottom: 10px;">🤖 AI助手建议</h3>
          <div style="color: #004085; line-height: 1.6; white-space: pre-line;">
            ${aiAdvice}
          </div>
        </div>
        ` : ''}
        
        <div style="text-align: center; color: #666; font-size: 14px;">
          <p>如果您没有注册 whichWitch 账户，请忽略此邮件。</p>
          <p>此链接将在24小时后过期。</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
}

/**
 * 发送魔法链接登录邮件
 */
export async function sendMagicLinkEmail(email, token) {
  const magicLinkUrl = `${process.env.FRONTEND_URL}/magic-login?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'whichWitch - 登录链接',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">whichWitch</h1>
          <p style="color: #666; font-size: 16px;">创作平台</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">登录到您的账户</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            点击下面的按钮即可安全登录到您的 whichWitch 账户：
          </p>
          <div style="text-align: center;">
            <a href="${magicLinkUrl}" 
               style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              立即登录
            </a>
          </div>
        </div>
        
        <div style="background: #d1ecf1; padding: 20px; border-radius: 5px; border-left: 4px solid #17a2b8; margin-bottom: 30px;">
          <h3 style="color: #0c5460; margin-bottom: 10px;">🔒 安全提醒</h3>
          <p style="color: #0c5460; line-height: 1.6; margin: 0;">
            此登录链接仅限您本人使用，请勿分享给他人。链接将在15分钟后自动过期。
          </p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 14px;">
          <p>如果您没有请求登录，请忽略此邮件。</p>
          <p>此链接将在15分钟后过期。</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Magic link email sent to:', email);
  } catch (error) {
    console.error('Failed to send magic link email:', error);
    throw error;
  }
}

/**
 * 发送带AI建议的欢迎邮件
 */
export async function sendWelcomeEmailWithAI(email, walletAddress, aiWelcomeMessage) {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'whichWitch - 欢迎加入创作者社区！',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">🎉 欢迎来到 whichWitch！</h1>
          <p style="color: #666; font-size: 16px;">您的创作之旅从这里开始</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">🎊 恭喜！邮箱验证成功</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            您的账户已经激活，现在可以开始使用whichWitch平台的所有功能了！
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; border: 1px solid #dee2e6; margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 15px;">🔐 您的专属钱包</h3>
            <p style="font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 3px; word-break: break-all; margin: 0; font-size: 14px;">
              ${walletAddress}
            </p>
          </div>
        </div>
        
        <div style="background: #e7f3ff; padding: 25px; border-radius: 10px; border-left: 4px solid #007bff; margin-bottom: 30px;">
          <h3 style="color: #004085; margin-bottom: 15px;">🤖 AI助手为您定制的建议</h3>
          <div style="color: #004085; line-height: 1.8; white-space: pre-line; font-size: 15px;">
            ${aiWelcomeMessage}
          </div>
        </div>
        
        <div style="background: #d4edda; padding: 20px; border-radius: 5px; border-left: 4px solid #28a745; margin-bottom: 30px;">
          <h3 style="color: #155724; margin-bottom: 10px;">🚀 立即开始</h3>
          <p style="color: #155724; line-height: 1.6; margin: 0;">
            现在您可以登录平台，开始创作您的第一个作品，或者浏览其他创作者的精彩内容！
          </p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
            进入创作平台
          </a>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 14px;">
          <p>如有任何问题，请随时联系我们的AI助手或客服团队。</p>
          <p>祝您创作愉快！ 🎨✨</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email with AI advice sent to:', email);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}

/**
 * 发送钱包信息邮件（可选）
 */
export async function sendWalletInfoEmail(email, walletAddress) {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'whichWitch - 您的钱包信息',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">whichWitch</h1>
          <p style="color: #666; font-size: 16px;">创作平台</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">您的钱包信息</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            恭喜！您的邮箱已验证成功。以下是您的钱包信息：
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; border: 1px solid #dee2e6;">
            <h3 style="color: #333; margin-bottom: 15px;">钱包地址</h3>
            <p style="font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 3px; word-break: break-all; margin: 0;">
              ${walletAddress}
            </p>
          </div>
        </div>
        
        <div style="background: #d4edda; padding: 20px; border-radius: 5px; border-left: 4px solid #28a745; margin-bottom: 30px;">
          <h3 style="color: #155724; margin-bottom: 10px;">✅ 设置完成</h3>
          <p style="color: #155724; line-height: 1.6; margin: 0;">
            您现在可以使用邮箱登录，我们会自动为您处理所有区块链交易。
            您也可以将此钱包地址导入到 MetaMask 等钱包应用中。
          </p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 14px;">
          <p>开始您的创作之旅吧！</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Wallet info email sent to:', email);
  } catch (error) {
    console.error('Failed to send wallet info email:', error);
    throw error;
  }
}