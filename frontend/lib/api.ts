const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Donor APIs
  async registerDonor(donorData: any, hospitalId?: string) {
    const headers = hospitalId ? { 'x-hospital-id': hospitalId } : {};
    return this.request('/api/donors/register', {
      method: 'POST',
      headers,
      body: JSON.stringify(donorData),
    });
  }

  async updateDonor(donorId: string, donorData: any, hospitalId?: string) {
    const headers = hospitalId ? { 'x-hospital-id': hospitalId } : {};
    return this.request(`/api/donors/${donorId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(donorData),
    });
  }

  async verifyBiometric(data: { fingerprintData: string; donorId: string }) {
    return this.request('/api/donors/verify-biometric', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async checkEligibility(donorData: any, hospitalId?: string) {
    const headers = hospitalId ? { 'x-hospital-id': hospitalId } : {};
    return this.request('/api/donors/check-eligibility', {
      method: 'POST',
      headers,
      body: JSON.stringify({ donorData }),
    });
  }

  async getDonorEvents(donorId: string) {
    return this.request(`/api/donors/${donorId}/events`);
  }

  // Collection APIs
  async getCollections(params?: { hospitalId?: string; status?: string; search?: string; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    const headers: any = {};
    
    if (params) {
      const { hospitalId, ...queryParamsData } = params;
      if (hospitalId) headers['x-hospital-id'] = hospitalId;
      
      Object.entries(queryParamsData).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/collections${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint, { headers });
  }

  async createCollection(collectionData: any, hospitalId?: string) {
    const headers: Record<string, string> = {};
    if (hospitalId) headers['x-hospital-id'] = hospitalId;
    console.log("Creating collection with data:", JSON.stringify(collectionData, null, 2));
    console.log("Using hospital ID:", hospitalId);
    console.log("Request headers:", headers);
    console.log("Stringified body:", JSON.stringify(collectionData));
    return this.request('/api/collections', {
      method: 'POST',
      headers,
      body: JSON.stringify(collectionData),
    });
  }

  async updateCollectionStatus(id: string, status: string, notes?: string, hospitalId?: string) {
    const headers = hospitalId ? { 'x-hospital-id': hospitalId } : {};
    return this.request(`/api/collections/${id}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status, notes }),
    });
  }

  async completeCollection(id: string, bloodUnitData: any, hospitalId?: string) {
    const headers = hospitalId ? { 'x-hospital-id': hospitalId } : {};
    return this.request(`/api/collections/${id}/complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ bloodUnitData }),
    });
  }

  // Distribution APIs
  async getDistributions(params?: { status?: string; urgency?: string; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/distributions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async createDistribution(distributionData: any) {
    return this.request('/api/distributions', {
      method: 'POST',
      body: JSON.stringify(distributionData),
    });
  }

  async getDistributionById(id: string) {
    return this.request(`/api/distributions/${id}`);
  }

  async updateDistribution(id: string, data: any) {
    return this.request(`/api/distributions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async issueBloodUnits(id: string, data: any) {
    return this.request(`/api/distributions/${id}/issue`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelDistribution(id: string, reason?: string) {
    return this.request(`/api/distributions/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async deleteDistribution(id: string) {
    return this.request(`/api/distributions/${id}`, {
      method: 'DELETE',
    });
  }

  async getDistributionStats() {
    return this.request('/api/distributions/stats');
  }

  // Hospital APIs
  async getHospitals() {
    return this.request('/api/hospitals');
  }

  async createHospital(hospitalData: any) {
    return this.request('/api/hospitals', {
      method: 'POST',
      body: JSON.stringify(hospitalData),
    });
  }

  // Public APIs
  async searchBlood(params: { bloodType?: string; location?: string }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    return this.request(`/api/public/blood-search?${queryParams.toString()}`);
  }

  // Inventory APIs
  async getInventorySummary(hospitalId?: string) {
    const headers = hospitalId ? { 'x-hospital-id': hospitalId } : {};
    return this.request('/api/inventory/summary', { headers });
  }

  async getBloodUnits(params?: { hospitalId?: string; bloodGroup?: string; status?: string; component?: string; page?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    const headers: any = {};
    
    if (params) {
      const { hospitalId, ...queryParamsData } = params;
      if (hospitalId) headers['x-hospital-id'] = hospitalId;
      
      Object.entries(queryParamsData).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/inventory/units${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint, { headers });
  }

  async createBloodUnit(unitData: any, hospitalId?: string) {
    const headers = hospitalId ? { 'x-hospital-id': hospitalId } : {};
    return this.request('/api/inventory/units', {
      method: 'POST',
      headers,
      body: JSON.stringify(unitData),
    });
  }

  async updateBloodUnitStatus(id: string, status: string, notes?: string, hospitalId?: string) {
    const headers = hospitalId ? { 'x-hospital-id': hospitalId } : {};
    return this.request(`/api/inventory/units/${id}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status, notes }),
    });
  }

  async updateTestResults(id: string, testResults: any, hospitalId?: string) {
    const headers = hospitalId ? { 'x-hospital-id': hospitalId } : {};
    return this.request(`/api/inventory/units/${id}/tests`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(testResults),
    });
  }

  async issueBloodUnit(id: string, issueData: any, hospitalId?: string) {
    return this.request(`/api/inventory/units/${id}/issue`, {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
  }

  async getExpiringUnits(days?: number, hospitalId?: string) {
    const endpoint = `/api/inventory/expiring${days ? `?days=${days}` : ''}`;
    const headers = hospitalId ? { 'x-hospital-id': hospitalId } : {};
    return this.request(endpoint, { headers });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;