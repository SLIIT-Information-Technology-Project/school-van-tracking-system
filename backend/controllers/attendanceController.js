import { supabase } from "../utils/supabase.js";

// Mark a student as picked up (Morning or Afternoon)
export const markPickup = async (req, res) => {
  try {
    const { studentId, systemId, period } = req.body;
    const attendantId = req.body.attendantId || req.user?.id;

    // Validate input
    if (!studentId || !systemId || !period) {
      return res.status(400).json({ 
        message: "Student ID, System ID, and period (morning/afternoon) are required." 
      });
    }

    if (!['morning', 'afternoon'].includes(period.toLowerCase())) {
      return res.status(400).json({ 
        message: "Period must be either 'morning' or 'afternoon'." 
      });
    }

    const currentDate = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const pickupColumn = `${period.toLowerCase()}_pickup`;
    const timeColumn = `${period.toLowerCase()}_pickup_time`;

    // Check if attendance record exists for this student today
    const { data: existing, error: fetchError } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .eq('date', currentDate)
      .single();

    let data, error;

    if (existing) {
      // Update existing record
      const { data: updated, error: updateError } = await supabase
        .from('attendance')
        .update({
          [pickupColumn]: true,
          [timeColumn]: now,
          marked_by: attendantId,
          updated_at: now
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      data = updated;
      error = updateError;
    } else {
      // Create new record
      const payload = {
        student_id: studentId,
        system_id: systemId,
        date: currentDate,
        [pickupColumn]: true,
        [timeColumn]: now,
        marked_by: attendantId
      };

      const { data: created, error: createError } = await supabase
        .from('attendance')
        .insert([payload])
        .select()
        .single();
      
      data = created;
      error = createError;
    }

    if (error) throw error;

    res.status(200).json({ 
      message: `Student marked as picked up (${period})`, 
      attendance: data 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error marking student pickup", 
      error: error.message 
    });
  }
};

// Mark a student as dropped off (Morning or Afternoon)
export const markDropoff = async (req, res) => {
  try {
    const { studentId, systemId, period } = req.body;
    const attendantId = req.body.attendantId || req.user?.id;

    // Validate input
    if (!studentId || !systemId || !period) {
      return res.status(400).json({ 
        message: "Student ID, System ID, and period (morning/afternoon) are required." 
      });
    }

    if (!['morning', 'afternoon'].includes(period.toLowerCase())) {
      return res.status(400).json({ 
        message: "Period must be either 'morning' or 'afternoon'." 
      });
    }

    const currentDate = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const dropoffColumn = `${period.toLowerCase()}_dropoff`;
    const timeColumn = `${period.toLowerCase()}_dropoff_time`;

    // Check if attendance record exists for this student today
    const { data: existing, error: fetchError } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .eq('date', currentDate)
      .single();

    let data, error;

    if (existing) {
      // Update existing record
      const { data: updated, error: updateError } = await supabase
        .from('attendance')
        .update({
          [dropoffColumn]: true,
          [timeColumn]: now,
          marked_by: attendantId,
          updated_at: now
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      data = updated;
      error = updateError;
    } else {
      // Create new record
      const payload = {
        student_id: studentId,
        system_id: systemId,
        date: currentDate,
        [dropoffColumn]: true,
        [timeColumn]: now,
        marked_by: attendantId
      };

      const { data: created, error: createError } = await supabase
        .from('attendance')
        .insert([payload])
        .select()
        .single();
      
      data = created;
      error = createError;
    }

    if (error) throw error;

    res.status(200).json({ 
      message: `Student marked as dropped off (${period})`, 
      attendance: data 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error marking student dropoff", 
      error: error.message 
    });
  }
};

// Mark a student as not coming (Morning or Afternoon)
export const markNotComing = async (req, res) => {
  try {
    const { studentId, systemId, period } = req.body;
    const attendantId = req.body.attendantId || req.user?.id;

    // Validate input
    if (!studentId || !systemId || !period) {
      return res.status(400).json({ 
        message: "Student ID, System ID, and period (morning/afternoon) are required." 
      });
    }

    if (!['morning', 'afternoon'].includes(period.toLowerCase())) {
      return res.status(400).json({ 
        message: "Period must be either 'morning' or 'afternoon'." 
      });
    }

    const currentDate = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const notComingColumn = `${period.toLowerCase()}_not_coming`;

    // Check if attendance record exists for this student today
    const { data: existing, error: fetchError } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .eq('date', currentDate)
      .single();

    let data, error;

    if (existing) {
      // Update existing record
      const { data: updated, error: updateError } = await supabase
        .from('attendance')
        .update({
          [notComingColumn]: true,
          marked_by: attendantId,
          updated_at: now
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      data = updated;
      error = updateError;
    } else {
      // Create new record
      const payload = {
        student_id: studentId,
        system_id: systemId,
        date: currentDate,
        [notComingColumn]: true,
        marked_by: attendantId
      };

      const { data: created, error: createError } = await supabase
        .from('attendance')
        .insert([payload])
        .select()
        .single();
      
      data = created;
      error = createError;
    }

    if (error) throw error;

    res.status(200).json({ 
      message: `Student marked as not coming (${period})`, 
      attendance: data 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error marking student as not coming", 
      error: error.message 
    });
  }
};

// Get attendance record for a specific student on a specific date
export const getAttendanceByDate = async (req, res) => {
  try {
    const { studentId, date } = req.params;

    if (!studentId || !date) {
      return res.status(400).json({ 
        message: "Student ID and date are required." 
      });
    }

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.status(200).json({ 
      attendance: data || null 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching attendance record", 
      error: error.message 
    });
  }
};

// Get all attendance records for a student
export const getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    if (!studentId) {
      return res.status(400).json({ 
        message: "Student ID is required." 
      });
    }

    let query = supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json({ 
      attendance: data || [] 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching attendance records", 
      error: error.message 
    });
  }
};

// Get all attendance records for a system on a specific date
export const getSystemAttendanceByDate = async (req, res) => {
  try {
    const { systemId, date } = req.params;

    if (!systemId || !date) {
      return res.status(400).json({ 
        message: "System ID and date are required." 
      });
    }

    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        students (id, name, pickup_location, dropoff_location)
      `)
      .eq('system_id', systemId)
      .eq('date', date)
      .order('students(name)', { ascending: true });

    if (error) throw error;

    res.status(200).json({ 
      attendance: data || [] 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching system attendance", 
      error: error.message 
    });
  }
};

// Get all attendance records for today across a system
export const getSystemAttendanceToday = async (req, res) => {
  try {
    const { systemId } = req.params;

    if (!systemId) {
      return res.status(400).json({ 
        message: "System ID is required." 
      });
    }

    const currentDate = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        students (id, name, pickup_location, dropoff_location)
      `)
      .eq('system_id', systemId)
      .eq('date', currentDate)
      .order('students(name)', { ascending: true });

    if (error) throw error;

    res.status(200).json({ 
      attendance: data || [] 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching today's attendance", 
      error: error.message 
    });
  }
};

// Update attendance notes
export const updateAttendanceNotes = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { notes } = req.body;

    if (!attendanceId) {
      return res.status(400).json({ 
        message: "Attendance ID is required." 
      });
    }

    const { data, error } = await supabase
      .from('attendance')
      .update({
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', attendanceId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ 
      message: "Attendance notes updated", 
      attendance: data 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error updating attendance notes", 
      error: error.message 
    });
  }
};

// Delete an attendance record
export const deleteAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    if (!attendanceId) {
      return res.status(400).json({ 
        message: "Attendance ID is required." 
      });
    }

    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', attendanceId);

    if (error) throw error;

    res.status(200).json({ 
      message: "Attendance record deleted" 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting attendance record", 
      error: error.message 
    });
  }
};

// Get attendance summary for a student (pickup/dropoff status for today)
export const getTodaysSummary = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ 
        message: "Student ID is required." 
      });
    }

    const currentDate = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .eq('date', currentDate)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.status(200).json({ 
      summary: data ? {
        morning_pickup: data.morning_pickup,
        morning_dropoff: data.morning_dropoff,
        afternoon_pickup: data.afternoon_pickup,
        afternoon_dropoff: data.afternoon_dropoff,
        morning_pickup_time: data.morning_pickup_time,
        morning_dropoff_time: data.morning_dropoff_time,
        afternoon_pickup_time: data.afternoon_pickup_time,
        afternoon_dropoff_time: data.afternoon_dropoff_time
      } : null 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching summary", 
      error: error.message 
    });
  }
};
