import api from './api';

export const aiService = {
  findBestDonors: async (bloodRequestId, donorIds) => {
    try {
      // Get blood request details
      const requestResponse = await api.get(`/blood-requests/${bloodRequestId}/`);
      const bloodRequest = requestResponse.data;
      
      // Get donors details
      const donors = [];
      for (const donorId of donorIds) {
        const donorResponse = await api.get(`/users/${donorId}/`);
        donors.push(donorResponse.data);
      }
      
      // Prepare data for AI analysis
      const analysisData = {
        blood_request: {
          blood_group: bloodRequest.blood_group,
          urgency: bloodRequest.urgency,
          location: {
            lat: bloodRequest.location_lat,
            lng: bloodRequest.location_long
          },
          units_required: bloodRequest.units_required
        },
        potential_donors: donors.map(donor => ({
          id: donor.id,
          blood_group: donor.blood_group,
          location: {
            lat: donor.location_lat,
            lng: donor.location_long
          },
          last_donation: donor.last_donation_date // You might want to add this field
        }))
      };
      
      // Here you would call your OpenAI API
      // This is a placeholder - you'd need to implement the actual API call
      console.log('AI analysis data:', analysisData);
      
      // For now, return a simple distance-based ranking
      return donors
        .map(donor => ({
          ...donor,
          distance: calculateDistance(
            bloodRequest.location_lat, bloodRequest.location_long,
            donor.location_lat, donor.location_long
          )
        }))
        .sort((a, b) => a.distance - b.distance);
      
    } catch (error) {
      console.error('AI matching error:', error);
      throw error;
    }
  }
};

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}