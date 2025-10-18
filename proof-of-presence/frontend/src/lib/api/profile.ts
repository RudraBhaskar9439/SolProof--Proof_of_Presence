// frontend/src/lib/api/profile.ts
import axios from 'axios';
import type { UserProfile } from '../../types';

const API_URL = import.meta.env.VITE_API_URL;


export const profileApi = {
  /**
   * Get user profile by wallet address
   */
  async get(wallet: string): Promise<UserProfile> {
    try {
      const response = await axios.get(`${API_URL}/profile/${wallet}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async update(data: {
    walletAddress: string;
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
  }) {
    try {
      const response = await axios.put(`${API_URL}/profile/update`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Get leaderboard rankings
   */
  async getLeaderboard(limit: number = 100) {
    try {
      const response = await axios.get(`${API_URL}/leaderboard?limit=${limit}`);
      return response.data.leaderboard || [];
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  },

  /**
   * Get user rank
   */
  async getUserRank(wallet: string): Promise<number> {
    try {
      const response = await axios.get(`${API_URL}/profile/${wallet}/rank`);
      return response.data.rank || 0;
    } catch (error: any) {
      console.error('Error fetching user rank:', error);
      return 0;
    }
  },
};