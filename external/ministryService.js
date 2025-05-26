

const axios = require('axios');
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

const MINISTRY_BASE_URL = 'https://railway-ministry-production.up.railway.app/api/company'; // عنوان سستم الوزارة
const MINISTRY_API_KEY = process.env.MINISTRY_API_KEY;
class MinistryService {
  static async verifyCompany(nationalId) {
    try {
     
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
      
      logger.error(`Error verifying company with ID: ${nationalId}, ${error.message}`);
   
    console.error("Error details:", error); 
    throw new ApiError(500, 'Error connecting to the Ministry service');
    }
  }
}

module.exports = MinistryService;
