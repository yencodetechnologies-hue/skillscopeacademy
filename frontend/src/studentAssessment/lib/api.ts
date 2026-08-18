import { API_URL as BASE_API_URL } from '../../data/service';

// Same pattern the rest of the site uses for its backend calls
// (${API_URL}/api/... in LoginForm.jsx) — https://skillscopeacademy.yencodetechnologies.in
// in production, http://localhost:7001 in dev.
const API_URL = `${BASE_API_URL}/api/student-assessment`;

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const getStudentHeaders = () => {
  const token = localStorage.getItem('student_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Assessor Auth
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) localStorage.setItem('auth_token', data.token);
    return data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  // Student Auth
  studentLogin: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/student/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) localStorage.setItem('student_auth_token', data.token);
    return data;
  },

  studentLogout: () => {
    localStorage.removeItem('student_auth_token');
  },

  studentMe: async () => {
    const res = await fetch(`${API_URL}/auth/student/me`, { headers: getStudentHeaders() });
    return res.json();
  },

  // Assessments
  getAssessments: async () => {
    const res = await fetch(`${API_URL}/assessments`, { headers: getHeaders() });
    return res.json();
  },

  createAssessment: async (name: string) => {
    const res = await fetch(`${API_URL}/assessments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name })
    });
    return res.json();
  },

  validateToken: async (token: string) => {
    const res = await fetch(`${API_URL}/assessments/validate/${token}`);
    return res.json();
  },

  // Common Assessments (Multi-link)
  getCommonAssessments: async () => {
    const res = await fetch(`${API_URL}/common-assessments`, { headers: getHeaders() });
    return res.json();
  },

  createCommonAssessment: async (questionIds: string[]) => {
    const res = await fetch(`${API_URL}/common-assessments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question_ids: questionIds })
    });
    return res.json();
  },

  validateCommonToken: async (token: string) => {
    const res = await fetch(`${API_URL}/common-assessments/validate/${token}`);
    return res.json();
  },


  // Submissions
  getSubmissions: async () => {
    const res = await fetch(`${API_URL}/submissions`, { headers: getHeaders() });
    return res.json();
  },

  getSubmission: async (id: string) => {
    const res = await fetch(`${API_URL}/submissions/${id}`, { headers: getHeaders() });
    return res.json();
  },

  submitAssessment: async (payload: any) => {
    const res = await fetch(`${API_URL}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  updateSubmission: async (id: string, payload: any) => {
    const res = await fetch(`${API_URL}/submissions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  getSubmissionStatus: async (studentId: string) => {
    const res = await fetch(`${API_URL}/submissions/status/${studentId}`);
    return res.json();
  },

  deleteCommonAssessment: async (id: string) => {
    const res = await fetch(`${API_URL}/common-assessments/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  deleteSubmission: async (id: string) => {
    const res = await fetch(`${API_URL}/submissions/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  deleteStudentSubmissions: async (studentKey: string) => {
    const res = await fetch(`${API_URL}/submissions/student/${encodeURIComponent(studentKey)}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  }
};

