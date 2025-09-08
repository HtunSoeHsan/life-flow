import { Request, Response } from 'express';
import { PrismaClient } from '.prisma/tenant-client';
import masterClient from '../database/masterClient';
import SchemaManager from '../database/schemaManager';
import { comparePassword, generateToken } from '../utils/auth';

const schemaManager = SchemaManager.getInstance();

export class AuthController {
  // Hospital login
  public async hospitalLogin(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, hospitalId } = req.body;

      if (!username || !password || !hospitalId) {
        res.status(400).json({ error: 'Username, password, and hospitalId are required' });
        return;
      }

      // Get hospital from master database
      const hospital = await masterClient.hospital.findUnique({
        where: { id: hospitalId }
      });

      if (!hospital || !hospital.isActive) {
        res.status(404).json({ error: 'Hospital not found or inactive' });
        return;
      }

      // Get tenant client for this hospital
      const tenantClient = schemaManager.getTenantClient(hospitalId);
      
      // Find user in tenant database
      const user = await (tenantClient as any).user.findFirst({
        where: { 
          email: username,
          isActive: true
        }
      });

      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        hospitalId: hospitalId
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            hospitalId: hospitalId
          },
          hospital: {
            id: hospital.id,
            name: hospital.name
          },
          token
        }
      });
    } catch (error) {
      console.error('Hospital login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Super admin login
  public async adminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      // Check super admin credentials
      if (username === 'superadmin' && password === 'admin123') {
        const token = generateToken({
          userId: 'admin',
          username: 'superadmin',
          role: 'super_admin'
        });

        res.json({
          success: true,
          data: {
            user: {
              id: 'admin',
              username: 'superadmin',
              role: 'super_admin'
            },
            token
          }
        });
        return;
      }

      res.status(401).json({ error: 'Invalid admin credentials' });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}