import * as api from './services/api';

// Test the work requests API
const testWorkRequests = async () => {
  try {
    console.log('Testing work requests API...');
    const response = await api.getAllWorkRequests();
    console.log('Work requests response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching work requests:', error);
    return null;
  }
};

export default testWorkRequests;