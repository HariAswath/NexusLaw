// src/api/cases.js
import client from './client';

/* ─────────── MOCK DATA (used when backend is unavailable) ─────────── */
const MOCK_CASES = [
  { case_id: 1, case_number: 'CIV-2024-001', title: 'State v. Rajan Kumar', case_type: 'Criminal', court: 'Supreme Court', status: 'Open',    date_filed: '2024-01-15', description: 'Murder charge under IPC 302', keywords: ['murder','intent','witness'] },
  { case_id: 2, case_number: 'CIV-2024-002', title: 'Mehta Corp v. Alpha Ltd', case_type: 'Civil',    court: 'High Court',    status: 'Pending', date_filed: '2024-02-20', description: 'Breach of commercial contract', keywords: ['contract','breach','damages'] },
  { case_id: 3, case_number: 'CIV-2023-087', title: 'Sharma v. Union of India', case_type: 'Constitutional', court: 'Supreme Court', status: 'Closed', date_filed: '2023-11-05', description: 'Fundamental rights violation under Art 21', keywords: ['fundamental rights','article 21','PIL'] },
  { case_id: 4, case_number: 'FAM-2024-011', title: 'Priya Desai v. Anil Desai', case_type: 'Family',  court: 'District Court', status: 'Open',    date_filed: '2024-03-01', description: 'Divorce and child custody dispute', keywords: ['divorce','custody','maintenance'] },
  { case_id: 5, case_number: 'TAX-2023-045', title: 'Gupta Traders v. IT Dept', case_type: 'Tax',     court: 'High Court',    status: 'Appealed', date_filed: '2023-08-14', description: 'Income tax evasion assessment challenge', keywords: ['income tax','assessment','appeal'] },
  { case_id: 6, case_number: 'CRM-2024-033', title: 'State v. Patel Gang', case_type: 'Criminal', court: 'Sessions Court', status: 'Open', date_filed: '2024-01-28', description: 'Organized crime and extortion', keywords: ['extortion','gang','organized crime'] },
  { case_id: 7, case_number: 'IPR-2023-019', title: 'TechSoft v. CodeWave', case_type: 'Intellectual Property', court: 'High Court', status: 'Closed', date_filed: '2023-06-10', description: 'Software copyright infringement', keywords: ['copyright','software','infringement'] },
  { case_id: 8, case_number: 'LAB-2024-007', title: 'Workers Union v. MegaCorp', case_type: 'Labour', court: 'Labour Court', status: 'Pending', date_filed: '2024-02-05', description: 'Unlawful termination and severance', keywords: ['termination','severance','labour law'] },
];

const MOCK_PRECEDENTS = {
  1: [
    { case_id: 3, case_number: 'CIV-2023-087', title: 'Sharma v. Union of India', case_type: 'Criminal', court: 'Supreme Court', status: 'Closed', relevance_score: 87, match_reasons: ['case_type','court','keywords'] },
    { case_id: 6, case_number: 'CRM-2024-033', title: 'State v. Patel Gang', case_type: 'Criminal', court: 'Sessions Court', status: 'Open', relevance_score: 72, match_reasons: ['case_type','keywords'] },
  ],
  2: [
    { case_id: 7, case_number: 'IPR-2023-019', title: 'TechSoft v. CodeWave', case_type: 'Civil', court: 'High Court', status: 'Closed', relevance_score: 91, match_reasons: ['case_type','court'] },
    { case_id: 8, case_number: 'LAB-2024-007', title: 'Workers Union v. MegaCorp', case_type: 'Labour', court: 'Labour Court', status: 'Pending', relevance_score: 58, match_reasons: ['keywords'] },
  ],
};

const MOCK_STATS = {
  total: 8,
  open: 3,
  closed: 2,
  pending: 2,
  appealed: 1,
  byType: [
    { name: 'Criminal', value: 2 },
    { name: 'Civil', value: 2 },
    { name: 'Constitutional', value: 1 },
    { name: 'Family', value: 1 },
    { name: 'Tax', value: 1 },
    { name: 'IP', value: 1 },
  ],
  recentCases: MOCK_CASES.slice(0, 5),
};

const isMockMode = () => !import.meta.env.VITE_API_BASE_URL;

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
/* ─────────────────────────────────────────────────────────── */

export const getCases = async (filters = {}) => {
  if (isMockMode()) {
    await delay();
    let results = [...MOCK_CASES];
    if (filters.case_type)  results = results.filter(c => c.case_type === filters.case_type);
    if (filters.court)      results = results.filter(c => c.court === filters.court);
    if (filters.status)     results = results.filter(c => c.status === filters.status);
    if (filters.keywords)   {
      const kws = filters.keywords.toLowerCase().split(',').map(k => k.trim()).filter(Boolean);
      results = results.filter(c => kws.some(kw => c.keywords.some(k => k.includes(kw)) || c.title.toLowerCase().includes(kw)));
    }
    return results;
  }
  const { data } = await client.get('/cases', { params: filters });
  return data.data;
};

export const getCaseById = async (id) => {
  if (isMockMode()) {
    await delay();
    const c = MOCK_CASES.find(c => c.case_id === Number(id));
    if (!c) throw new Error('Case not found');
    return {
      ...c,
      parties: [
        { party_id: 1, name: 'State of India',  party_type: 'Plaintiff', lawyer: 'Adv. S. Mehta' },
        { party_id: 2, name: c.title.split(' v. ')[1] || 'Defendant', party_type: 'Defendant', lawyer: 'Adv. R. Patel' },
      ],
      judgement: { judgement_id: 1, date: '2024-06-15', summary: 'Under deliberation by the honourable bench.', judge: 'Justice A. Kumar' },
    };
  }
  const { data } = await client.get(`/cases/${id}`);
  return data.data;
};

export const getPrecedents = async (caseId) => {
  if (isMockMode()) {
    await delay(600);
    return MOCK_PRECEDENTS[Number(caseId)] || [];
  }
  const { data } = await client.get(`/cases/${caseId}/precedents`);
  return data.data;
};

export const getCaseStats = async () => {
  if (isMockMode()) {
    await delay();
    return MOCK_STATS;
  }
  const { data } = await client.get('/cases/stats');
  return data.data;
};

export const createCase = async (payload) => {
  if (isMockMode()) {
    await delay();
    const newCase = { ...payload, case_id: Date.now(), date_filed: new Date().toISOString().split('T')[0] };
    MOCK_CASES.push(newCase);
    return newCase;
  }
  const { data } = await client.post('/cases', payload);
  return data.data ?? data;
};

export const updateCase = async (id, payload) => {
  if (isMockMode()) {
    await delay();
    const idx = MOCK_CASES.findIndex(c => c.case_id === Number(id));
    if (idx === -1) throw new Error('Case not found');
    MOCK_CASES[idx] = { ...MOCK_CASES[idx], ...payload };
    return MOCK_CASES[idx];
  }
  const { data } = await client.put(`/cases/${id}`, payload);
  return data.data ?? data;
};

export const deleteCase = async (id) => {
  if (isMockMode()) {
    await delay();
    const idx = MOCK_CASES.findIndex(c => c.case_id === Number(id));
    if (idx !== -1) MOCK_CASES.splice(idx, 1);
    return { success: true };
  }
  const { data } = await client.delete(`/cases/${id}`);
  return data;
};
