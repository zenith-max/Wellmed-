const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Build a nodemailer transporter if SMTP settings are present
const buildTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('⚠️ SMTP credentials missing. Verification emails will be logged instead.');
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = buildTransporter();

  // If SMTP is not configured, log the email contents for debugging/local dev
  if (!transporter) {
    console.info(`📧 Email (not sent) to ${to}: ${subject}\n${html}`);
    return false;
  }

  const fromAddress = process.env.FROM_EMAIL || 'no-reply@wellmedsurgicals.com';

  try {
    await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html
    });
    return true;
  } catch (err) {
    console.error('✗ Email send failed:', err.message);
    return false;
  }
};

const sendVerificationEmail = async (user, verificationToken) => {
  const appBase = process.env.APP_BASE_URL || 'https://wellmedsurgicals.com';
  const verifyLink = `${appBase}/verify-link.html?token=${verificationToken}`;

  const html = `
    <p>Hi ${user.name || 'there'},</p>
    <p>Tap the button below to verify your Medwell account:</p>
    <p><a href="${verifyLink}" style="display:inline-block;padding:12px 18px;background:#c20000;color:#fff;text-decoration:none;border-radius:6px;">Verify Account</a></p>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p><a href="${verifyLink}">${verifyLink}</a></p>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't create an account, you can ignore this email.</p>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Verify your Medwell account',
    html
  });
};

const sendPasswordResetEmail = async (user, resetCode) => {
  const appBase = process.env.APP_BASE_URL || 'https://wellmedsurgicals.com';
  const resetPage = `${appBase}/forgot.html`;

  const html = `
    <p>Hi ${user.name || 'there'},</p>
    <p>Use the code below to reset your Medwell password:</p>
    <h2 style="letter-spacing:4px;">${resetCode}</h2>
    <p>This code will expire in 1 hour.</p>
    <p>You can enter it on the reset page: <a href="${resetPage}">${resetPage}</a></p>
    <p>If you did not request a reset, you can ignore this email.</p>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Reset your Medwell password',
    html
  });
};

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Register a new user (customer)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create new user (default role is 'customer')
    const user = await User.create({
      name,
      email,
      password,
      role: 'customer'
    });

    // Generate verification link token and send email
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    await sendVerificationEmail(user, verificationToken);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email to continue.',
      requiresVerification: true,
      email: user.email
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password +verificationToken +verificationTokenExpires');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Block login until email is verified
    if (!user.emailVerified) {
      // Refresh verification link if expired or missing
      const now = Date.now();
      if (!user.verificationToken || !user.verificationTokenExpires || user.verificationTokenExpires < now) {
        const freshToken = user.createEmailVerificationToken();
        await user.save({ validateBeforeSave: false });
        await sendVerificationEmail(user, freshToken);
      }

      return res.status(403).json({
        success: false,
        message: 'Please verify your email to continue. A verification link has been sent to your inbox.'
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Verify user email with code
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Prefer email lookup if provided; otherwise find by token hash
    let user;
    if (email) {
      user = await User.findOne({ email }).select('+verificationToken +verificationTokenExpires');
    } else {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      user = await User.findOne({ verificationToken: hashedToken }).select('+verificationToken +verificationTokenExpires');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.emailVerified) {
      // Already verified: issue token
      const token = generateToken(user._id, user.role);
      return res.status(200).json({
        success: true,
        message: 'Email already verified',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: true
        }
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    if (
      !user.verificationToken ||
      !user.verificationTokenExpires ||
      user.verificationTokenExpires < Date.now() ||
      user.verificationToken !== hashedToken
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification link'
      });
    }

    user.emailVerified = true;
    user.verifiedAt = Date.now();
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const authToken = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: true
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: error.message
    });
  }
};

// @desc    Resend verification code
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.emailVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email already verified. You can log in now.'
      });
    }

    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    await sendVerificationEmail(user, verificationToken);

    return res.status(200).json({
      success: true,
      message: 'Verification link resent. Please check your email.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Could not resend verification link',
      error: error.message
    });
  }
};

// @desc    Start forgot-password flow (send reset code)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    // Always return success to avoid email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If this email is registered, a reset code has been sent.'
      });
    }

    const resetCode = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    await sendPasswordResetEmail(user, resetCode);

    return res.status(200).json({
      success: true,
      message: 'If this email is registered, a reset code has been sent.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Could not start password reset',
      error: error.message
    });
  }
};

// @desc    Complete password reset with code
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    if (!email || !code || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, code, and new password are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    if (
      !user.resetPasswordToken ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < Date.now() ||
      user.resetPasswordToken !== hashedCode
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Only issue token if email is verified
    if (user.emailVerified) {
      const token = generateToken(user._id, user.role);

      return res.status(200).json({
        success: true,
        message: 'Password reset successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. Please verify your email to log in.',
      requiresVerification: true
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message
    });
  }
};
