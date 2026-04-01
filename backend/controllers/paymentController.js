import { supabase } from "../utils/supabase.js";

// Calculate payment based on attendance
const calculatePayment = (attendancePercentage, fullPayment = 8000) => {
  if (attendancePercentage <= 50) {
    return fullPayment / 2; // Half payment for attendance <= 50%
  }
  return fullPayment; // Full payment for attendance > 50%
};

// Create or update payment for a student
export const createOrUpdatePayment = async (req, res) => {
  try {
    const { studentId, systemId, parentId, month, fullPayment = 8000, attendancePercentage } = req.body;

    if (!studentId || !systemId || !parentId || !month) {
      return res.status(400).json({
        message: "Student ID, System ID, Parent ID, and month are required.",
      });
    }

    const calculatedPayment = calculatePayment(attendancePercentage, fullPayment);
    const paymentDate = new Date().toISOString().split('T')[0];

    // Check if payment exists
    const { data: existing } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', studentId)
      .eq('month', month)
      .single();

    let data, error;

    if (existing) {
      // Update existing
      const { data: updated, error: updateError } = await supabase
        .from('payments')
        .update({
          full_payment: fullPayment,
          attendance_percentage: attendancePercentage,
          calculated_payment: calculatedPayment,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      data = updated;
      error = updateError;
    } else {
      // Create new
      const { data: created, error: createError } = await supabase
        .from('payments')
        .insert([{
          student_id: studentId,
          system_id: systemId,
          parent_id: parentId,
          month,
          full_payment: fullPayment,
          attendance_percentage: attendancePercentage,
          calculated_payment: calculatedPayment
        }])
        .select()
        .single();
      
      data = created;
      error = createError;
    }

    if (error) throw error;

    res.status(200).json({
      message: "Payment calculated successfully",
      payment: data
    });

  } catch (error) {
    res.status(500).json({
      message: "Error calculating payment",
      error: error.message
    });
  }
};

// Get payment by student and month
export const getPaymentByStudentMonth = async (req, res) => {
  try {
    const { studentId, month } = req.params;

    if (!studentId || !month) {
      return res.status(400).json({
        message: "Student ID and month are required."
      });
    }

    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        student:student_id (id, name, school),
        parent:parent_id (id, name, email)
      `)
      .eq('student_id', studentId)
      .eq('month', month)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.status(200).json({
      payment: data || null
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching payment",
      error: error.message
    });
  }
};

// Get all payments for a student
export const getStudentPayments = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startMonth, endMonth } = req.query;

    if (!studentId) {
      return res.status(400).json({
        message: "Student ID is required."
      });
    }

    let query = supabase
      .from('payments')
      .select(`
        *,
        student:student_id (id, name, school),
        parent:parent_id (id, name, email)
      `)
      .eq('student_id', studentId)
      .order('month', { ascending: false });

    if (startMonth) {
      query = query.gte('month', startMonth);
    }
    if (endMonth) {
      query = query.lte('month', endMonth);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json({
      payments: data || []
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching student payments",
      error: error.message
    });
  }
};

// Get all payments for a system
export const getSystemPayments = async (req, res) => {
  try {
    const { systemId } = req.params;
    const { month } = req.query;

    if (!systemId) {
      return res.status(400).json({
        message: "System ID is required."
      });
    }

    let query = supabase
      .from('payments')
      .select(`
        *,
        student:student_id (id, name, school),
        parent:parent_id (id, name, email)
      `)
      .eq('system_id', systemId);

    if (month) {
      query = query.eq('month', month);
    }

    const { data, error } = await query.order('month', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      payments: data || []
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching system payments",
      error: error.message
    });
  }
};

// Get payments for a parent
export const getParentPayments = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { status, month } = req.query;

    if (!parentId) {
      return res.status(400).json({
        message: "Parent ID is required."
      });
    }

    let query = supabase
      .from('payments')
      .select(`
        *,
        student:student_id (id, name, school),
        system:system_id (id, name, plate_number)
      `)
      .eq('parent_id', parentId);

    if (status) {
      query = query.eq('payment_status', status);
    }
    if (month) {
      query = query.eq('month', month);
    }

    const { data, error } = await query.order('month', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      payments: data || []
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching parent payments",
      error: error.message
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentStatus, notes } = req.body;

    if (!paymentId || !paymentStatus) {
      return res.status(400).json({
        message: "Payment ID and payment status are required."
      });
    }

    const updateData = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    };

    if (paymentStatus === 'paid') {
      updateData.payment_date = new Date().toISOString();
    }

    if (notes) {
      updateData.notes = notes;
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      message: "Payment status updated",
      payment: data
    });

  } catch (error) {
    res.status(500).json({
      message: "Error updating payment status",
      error: error.message
    });
  }
};

// Delete a payment
export const deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        message: "Payment ID is required."
      });
    }

    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId);

    if (error) throw error;

    res.status(200).json({
      message: "Payment deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Error deleting payment",
      error: error.message
    });
  }
};

// Get payment summary for a system (total revenue, pending, paid)
export const getSystemPaymentSummary = async (req, res) => {
  try {
    const { systemId } = req.params;
    const { month } = req.query;

    if (!systemId) {
      return res.status(400).json({
        message: "System ID is required."
      });
    }

    let query = supabase
      .from('payments')
      .select('calculated_payment, payment_status')
      .eq('system_id', systemId);

    if (month) {
      query = query.eq('month', month);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate summary
    const summary = {
      total_revenue: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
      cancelled: 0,
      total_records: data?.length || 0
    };

    data?.forEach(payment => {
      summary.total_revenue += payment.calculated_payment || 0;
      if (payment.payment_status === 'paid') summary.paid += payment.calculated_payment || 0;
      if (payment.payment_status === 'pending') summary.pending += payment.calculated_payment || 0;
      if (payment.payment_status === 'overdue') summary.overdue += payment.calculated_payment || 0;
      if (payment.payment_status === 'cancelled') summary.cancelled += payment.calculated_payment || 0;
    });

    res.status(200).json({
      summary
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching payment summary",
      error: error.message
    });
  }
};
