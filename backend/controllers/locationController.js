// Simulating a native database array since MongoDB is temporarily bypassed
const locationDB = [];

export const updateLocation = async (req, res) => {
  try {
    const { driverId, latitude, longitude } = req.body;

    if (!driverId || !latitude || !longitude) {
      return res.status(400).json({ message: "Missing required location data." });
    }

    // Save to native memory DB
    const newLocation = { driverId, latitude, longitude, timestamp: new Date() };
    locationDB.push(newLocation);

    console.log(`[Live Location] Updated for driver ${driverId} -> [${latitude}, ${longitude}]`);
    
    // We explicitly respond with success so the Axios Promise resolves natively!
    res.status(200).json({ message: "Location updated successfully", location: newLocation });
  } catch (error) {
    res.status(500).json({ message: "Error updating location", error: error.message });
  }
};
