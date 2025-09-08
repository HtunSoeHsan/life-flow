declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenant?: {
        id: string;
        name: string;
      };
      hospitalId?: string;
      distributionController?: any;
    }
  }
}

export {};