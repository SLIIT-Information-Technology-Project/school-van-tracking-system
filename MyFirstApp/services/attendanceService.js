import api from './api';

// Mark a student as picked up
export const markStudentPickup = async (studentId, systemId, period, attendantId = null) => {
  try {
    const response = await api.post('/attendance/pickup', {
      studentId,
      systemId,
      period: period.toLowerCase(),
      attendantId
    });
    return response.data;
  } catch (error) {
    console.error('Error marking student pickup:', error);
    throw error.response?.data || error;
  }
};

// Mark a student as dropped off
export const markStudentDropoff = async (studentId, systemId, period, attendantId = null) => {
  try {
    const response = await api.post('/attendance/dropoff', {
      studentId,
      systemId,
      period: period.toLowerCase(),
      attendantId
    });
    return response.data;
  } catch (error) {
    console.error('Error marking student dropoff:', error);
    throw error.response?.data || error;
  }
};

// Mark a student as not coming
export const markStudentNotComing = async (studentId, systemId, period, attendantId = null) => {
  try {
    const response = await api.post('/attendance/not-coming', {
      studentId,
      systemId,
      period: period.toLowerCase(),
      attendantId
    });
    return response.data;
  } catch (error) {
    console.error('Error marking student as not coming:', error);
    throw error.response?.data || error;
  }
};

// Get attendance record for a specific date
export const getAttendanceByDate = async (studentId, date) => {
  try {
    const response = await api.get(`/attendance/student/${studentId}/date/${date}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance by date:', error);
    throw error.response?.data || error;
  }
};

// Get all attendance records for a student
export const getStudentAttendance = async (studentId, startDate = null, endDate = null) => {
  try {
    let url = `/attendance/student/${studentId}`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    throw error.response?.data || error;
  }
};

// Get attendance records for a system on a specific date
export const getSystemAttendanceByDate = async (systemId, date) => {
  try {
    const response = await api.get(`/attendance/system/${systemId}/date/${date}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching system attendance by date:', error);
    throw error.response?.data || error;
  }
};

// Get today's attendance records for a system
export const getSystemAttendanceToday = async (systemId) => {
  try {
    const response = await api.get(`/attendance/system/${systemId}/today`);
    return response.data;
  } catch (error) {
    console.error('Error fetching today attendance:', error);
    throw error.response?.data || error;
  }
};

// Get today's summary for a student
export const getTodaysSummary = async (studentId) => {
  try {
    const response = await api.get(`/attendance/summary/${studentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw error.response?.data || error;
  }
};

// Update attendance notes
export const updateAttendanceNotes = async (attendanceId, notes) => {
  try {
    const response = await api.put(`/attendance/${attendanceId}/notes`, { notes });
    return response.data;
  } catch (error) {
    console.error('Error updating attendance notes:', error);
    throw error.response?.data || error;
  }
};

// Delete an attendance record
export const deleteAttendanceRecord = async (attendanceId) => {
  try {
    const response = await api.delete(`/attendance/${attendanceId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    throw error.response?.data || error;
  }
};
