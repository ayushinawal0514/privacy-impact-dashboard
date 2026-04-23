import { Router, Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../config/database';
import logger from '../config/logger';
import { authMiddleware, AuthRequest } from '../middleware/middlewares';

const router = Router();

type UserRole = 'admin' | 'user';

router.post('/register', async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      name,
      organizationId,
      role,
      adminKey
    } = req.body;

    const db = getDB();

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    let assignedRole: UserRole = 'user';
    if (role === 'admin') {
      if (adminKey && adminKey === process.env.ADMIN_REGISTRATION_KEY) {
        assignedRole = 'admin';
      } else {
        return res.status(403).json({
          success: false,
          message: 'Invalid admin registration key'
        });
      }
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = {
      email,
      password: hashedPassword,
      name,
      organizationId: organizationId || 'default',
      role: assignedRole,
      createdAt: new Date(),
      active: true
    };

    const result = await db.collection('users').insertOne(user);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: result.insertedId,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId
      }
    });
  } catch (error) {
    logger.error('Error registering user:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const db = getDB();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const validPassword = await bcryptjs.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        organizationId: user.organizationId
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId
      }
    });
  } catch (error) {
    logger.error('Error logging in:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();

    const user = await db.collection('users').findOne(
      { email: req.user?.email },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        active: user.active
      }
    });
  } catch (error) {
    logger.error('Error fetching current user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

export default router;