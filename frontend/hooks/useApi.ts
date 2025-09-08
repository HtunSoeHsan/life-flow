import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

export function useCollections(params?: { hospitalId?: string; status?: string; search?: string; page?: number; limit?: number }) {
  const [collections, setCollections] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = async () => {
    if (!params?.hospitalId) return;
    
    try {
      setLoading(true);
      const response = await apiService.getCollections(params);
      setCollections(response.data?.collections || []);
      setPagination(response.data?.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      setError(null);
    } catch (err) {
      setError('Failed to fetch collections');
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [params?.hospitalId, params?.status, params?.search, params?.page, params?.limit]);

  const createCollection = async (data: any) => {
    try {
      const response = await apiService.createCollection(data, params?.hospitalId);
      await fetchCollections();
      return response;
    } catch (err) {
      throw new Error('Failed to create collection');
    }
  };

  const updateCollectionStatus = async (id: string, status: string, notes?: string) => {
    try {
      const response = await apiService.updateCollectionStatus(id, status, notes, params?.hospitalId);
      await fetchCollections();
      return response;
    } catch (err) {
      throw new Error('Failed to update collection status');
    }
  };

  const completeCollection = async (id: string, bloodUnitData: any) => {
    try {
      const response = await apiService.completeCollection(id, bloodUnitData, params?.hospitalId);
      await fetchCollections();
      return response;
    } catch (err) {
      throw new Error('Failed to complete collection');
    }
  };

  return {
    collections,
    pagination,
    loading,
    error,
    refetch: fetchCollections,
    createCollection,
    updateCollectionStatus,
    completeCollection,
  };
}

export function useDistributions(params?: { hospitalId?: string; status?: string; urgency?: string; page?: number; limit?: number }) {
  const [distributions, setDistributions] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDistributions = async () => {
    if (!params?.hospitalId) return;
    
    try {
      setLoading(true);
      const [incomingResponse, myRequestsResponse] = await Promise.all([
        apiService.getDistributions(params),
        apiService.getMyRequests(params.hospitalId)
      ]);
      
      setDistributions(incomingResponse.data?.distributions || []);
      setMyRequests(myRequestsResponse.data?.distributions || []);
      setPagination(incomingResponse.data?.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      setError(null);
    } catch (err) {
      setError('Failed to fetch distributions');
      console.error('Error fetching distributions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributions();
  }, [params?.hospitalId, params?.status, params?.urgency, params?.page, params?.limit]);

  const createDistribution = async (data: any) => {
    try {
      const response = await apiService.createDistribution(data, params?.hospitalId);
      await fetchDistributions(); // Refresh data
      return response;
    } catch (err) {
      throw new Error('Failed to create distribution');
    }
  };

  const issueBloodUnits = async (id: string, data: any) => {
    try {
      const response = await apiService.issueBloodUnits(id, data, params?.hospitalId);
      await fetchDistributions(); // Refresh data
      return response;
    } catch (err) {
      throw new Error('Failed to issue blood units');
    }
  };

  const cancelDistribution = async (id: string, reason?: string) => {
    try {
      await apiService.cancelDistribution(id, reason, params?.hospitalId);
      await fetchDistributions(); // Refresh data
    } catch (err) {
      throw new Error('Failed to cancel distribution');
    }
  };

  return {
    distributions,
    myRequests,
    pagination,
    loading,
    error,
    refetch: fetchDistributions,
    createDistribution,
    issueBloodUnits,
    cancelDistribution,
  };
}

export function useDistributionStats(hospitalId?: string) {
  const [stats, setStats] = useState({ total: 0, pending: 0, emergency: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!hospitalId) return;
      
      try {
        setLoading(true);
        const response = await apiService.getDistributionStats(hospitalId);
        setStats(response.data || { total: 0, pending: 0, emergency: 0, completed: 0 });
        setError(null);
      } catch (err) {
        setError('Failed to fetch distribution stats');
        console.error('Error fetching distribution stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [hospitalId]);

  return { stats, loading, error };
}

export function useDonorRegistration(hospitalId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerDonor = async (donorData: any, hospitalId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.registerDonor(donorData, hospitalId);
      return response;
    } catch (err) {
      setError('Failed to register donor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async (donorData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.checkEligibility(donorData);
      return response;
    } catch (err) {
      setError('Failed to check eligibility');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyBiometric = async (data: { fingerprintData: string; donorId: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.verifyBiometric(data);
      return response;
    } catch (err) {
      setError('Failed to verify biometric');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    registerDonor,
    checkEligibility,
    verifyBiometric,
  };
}

export function useInventory(hospitalId?: string) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    if (!hospitalId) return;
    
    try {
      setLoading(true);
      const response = await apiService.getInventorySummary(hospitalId);
      setInventory(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch inventory');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [hospitalId]);

  const createBloodUnit = async (data: any) => {
    try {
      const response = await apiService.createBloodUnit(data, hospitalId);
      await fetchInventory(); // Refresh data
      return response;
    } catch (err) {
      throw new Error('Failed to create blood unit');
    }
  };

  const updateUnitStatus = async (id: string, status: string, notes?: string) => {
    try {
      await apiService.updateBloodUnitStatus(id, status, notes, hospitalId);
      await fetchInventory(); // Refresh data
    } catch (err) {
      throw new Error('Failed to update unit status');
    }
  };

  return {
    inventory,
    loading,
    error,
    refetch: fetchInventory,
    createBloodUnit,
    updateUnitStatus,
  };
}

export function useBloodUnits(params?: { hospitalId?: string; bloodGroup?: string; status?: string; component?: string; page?: number; limit?: number; search?: string }) {
  const [bloodUnits, setBloodUnits] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBloodUnits = async () => {
    if (!params?.hospitalId) return;
    
    try {
      setLoading(true);
      const response = await apiService.getBloodUnits(params);
      setBloodUnits(response.data?.bloodUnits || []);
      setPagination(response.data?.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      setError(null);
    } catch (err) {
      setError('Failed to fetch blood units');
      console.error('Error fetching blood units:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodUnits();
  }, [params?.hospitalId, params?.bloodGroup, params?.status, params?.component, params?.page, params?.limit, params?.search]);

  return {
    bloodUnits,
    pagination,
    loading,
    error,
    refetch: fetchBloodUnits,
  };
}