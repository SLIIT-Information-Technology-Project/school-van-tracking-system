import api from './api';

// Create or update payment
export const createOrUpdatePayment = async (studentId, systemId, parentId, month, fullPayment = 8000, attendancePercentage) => {
  try {
    const response = await api.post('/payments', {
      studentId,
      systemId,
      parentId,
      month,
      fullPayment,
      attendancePercentage
    });
    return response.data;
  } catch (error) {
    console.error('Error creating/updating payment:', error);
    throw error.response?.data || error;
  }
};

// Get payment by student and month
export const getPaymentByStudentMonth = async (studentId, month) => {
  try {
    const response = await api.get(`/payments/student/${studentId}/month/${month}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error.response?.data || error;
  }
};

// Get all payments for a student
export const getStudentPayments = async (studentId, startMonth = null, endMonth = null) => {
  try {
    let url = `/payments/student/${studentId}`;
    const params = new URLSearchParams();
    
    if (startMonth) params.append('startMonth', startMonth);
    if (endMonth) params.append('endMonth', endMonth);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching student payments:', error);
    throw error.response?.data || error;
  }
};

// Get all payments for a system
export const getSystemPayments = async (systemId, month = null) => {
  try {
    let url = `/payments/system/${systemId}`;
    if (month) {
      url += `?month=${month}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching system payments:', error);
    throw error.response?.data || error;
  }
};

// Get payments for a parent
export const getParentPayments = async (parentId, status = null, month = null) => {
  try {
    let url = `/payments/parent/${parentId}`;
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    if (month) params.append('month', month);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching parent payments:', error);
    throw error.response?.data || error;
  }
};

// Update payment status
export const updatePaymentStatus = async (paymentId, paymentStatus, notes = null) => {
  try {
    const response = await api.put(`/payments/${paymentId}/status`, {
      paymentStatus,
      notes
    });
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error.response?.data || error;
  }
};

// Delete a payment
export const deletePayment = async (paymentId) => {
  try {
    const response = await api.delete(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error.response?.data || error;
  }
};

// Get payment summary for a system
export const getSystemPaymentSummary = async (systemId, month = null) => {
  try {
    let url = `/payments/system/${systemId}/summary`;
    if (month) {
      url += `?month=${month}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    throw error.response?.data || error;
  }
};
