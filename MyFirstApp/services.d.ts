declare module '*/services/api' {
  const api: any;
  export default api;
}

declare module '*/services/attendanceService' {
  export const markStudentPickup: (studentId: string, systemId: string, period?: string, attendantId?: string) => Promise<any>;
  export const markStudentDropoff: (studentId: string, systemId: string, period?: string, attendantId?: string) => Promise<any>;
  export const getAttendanceByDate: (systemId: string, date: string) => Promise<any>;
  export const getStudentAttendance: (studentId: string) => Promise<any>;
  export const getSystemAttendanceByDate: (systemId: string, date: string) => Promise<any>;
  export const getSystemAttendanceToday: (systemId: string) => Promise<any>;
  export const getTodaysSummary: (systemId: string) => Promise<any>;
  export const updateAttendanceNotes: (attendanceId: string, notes: string) => Promise<any>;
  export const deleteAttendanceRecord: (attendanceId: string) => Promise<any>;
}

declare module '*/services/loginService' {
  export const loginUser: (email: string, password: string, role: string) => Promise<any>;
}

declare module '*/services/registrationService' {
  export const registerUser: (data: any) => Promise<any>;
}

declare module '*/services/supabase' {
  export const supabase: any;
}
