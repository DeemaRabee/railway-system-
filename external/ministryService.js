/*const axios = require('axios');
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

// This is a simulation of the external Ministry of Industry and Trade API
class MinistryService {
  static async verifyCompany(nationalId) {
    try {
      // In a real-world scenario, this would make an API call to the ministry's system
      // For this simulation, we'll create a mock function
      
      // Mock data - in a real implementation, this would come from an external API
      const mockVerifiedCompanies = [
        '1234567890',
        '9876543210',
        '5555555555',
        '1111111111',
        '9999999999'
      ];
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isVerified = mockVerifiedCompanies.includes(nationalId);
      
      logger.info(`Company verification check: ${nationalId} - ${isVerified ? 'Verified' : 'Not verified'}`);
      
      return {
        verified: isVerified,
        message: isVerified 
          ? 'Company is verified by the Ministry of Industry and Trade' 
          : 'Company is not registered or verified by the Ministry of Industry and Trade'
      };
    } catch (error) {
      logger.error(`Error verifying company with ID: ${nationalId}`, error);
      throw new ApiError(500, 'Error connecting to the Ministry of Industry and Trade service');
    }
  }
}

module.exports = MinistryService;*/
// external/ministryService.js
const axios = require('axios');
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');
//https://ministry-system.onrender.com
const MINISTRY_BASE_URL = 'http://localhost:8000/api/company'; // عنوان سستم الوزارة
const MINISTRY_API_KEY = process.env.MINISTRY_API_KEY;
class MinistryService {
  static async verifyCompany(nationalId) {
    try {
      //const response = await axios.get(`${MINISTRY_BASE_URL}/verify/${nationalId}`);
      const response = await axios.get(`${MINISTRY_BASE_URL}/verify/${nationalId}`, {
        headers: {
          'Authorization': `Bearer ${MINISTRY_API_KEY}`
        }
      });
      const { exists, isVerified } = response.data;

      logger.info(`Company verification check: ${nationalId} - ${exists && isVerified ? 'Verified' : 'Not verified'}`);

      return {
        verified: exists && isVerified,
        message: exists && isVerified
          ? 'Company is verified by the Ministry'
          : 'Company is not registered or not verified by the Ministry'
      };
    } catch (error) {
      /*logger.error(`Error verifying company with ID: ${nationalId}, ${error.message}`);
      throw new ApiError(500, 'Error connecting to the Ministry service');*/
      logger.error(`Error verifying company with ID: ${nationalId}, ${error.message}`);
    // يمكن إظهار تفاصيل أكثر عن الخطأ هنا باستخدام:
    console.error("Error details:", error); // ستساعد في تحديد السبب.
    throw new ApiError(500, 'Error connecting to the Ministry service');
    }
  }
}

module.exports = MinistryService;
