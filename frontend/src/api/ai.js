// src/api/ai.js
import client from './client';

export const generateDraft = async (prompt, caseContext = '') => {
  const { data } = await client.post('/ai/draft', { prompt, caseContext });
  return data.data;
};
