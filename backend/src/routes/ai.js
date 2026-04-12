// src/routes/ai.js
const router = require('express').Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/ai/draft
// Generate a legal draft based on prompt and context
router.post('/draft', protect, async (req, res, next) => {
  try {
    const { prompt, caseContext } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is missing in environmental variables.');
      return res.status(500).json({ success: false, message: 'AI configuration error on server' });
    }

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are a legal drafting assistant for NexusLaw. 
    Draft a professional legal document (e.g., notice, petition, summary) based on the user's request.
    ${caseContext ? `Context: ${caseContext}` : ''}
    Maintain a formal, professional tone appropriate for a law firm.
    Output only the draft content in plain text format with proper structure.`;

    const result = await model.generateContent([systemPrompt, prompt]);
    const response = await result.response;
    const text = response.text();

    res.json({ success: true, data: text });
  } catch (err) {
    console.error('Gemini AI Error:', err);
    next(err);
  }
});

module.exports = router;
