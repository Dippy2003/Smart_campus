const API_BASE = 'http://localhost:8080/api/dashboard';

export const dashboardService = {
  async getDashboardStats() {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  async getDetailedStats() {
    try {
      const response = await fetch(`${API_BASE}/stats/detailed`);
      if (!response.ok) {
        throw new Error('Failed to fetch detailed stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching detailed stats:', error);
      throw error;
    }
  }
};
