const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');

// POST /api/fix
router.post('/', async (req, res) => {
  const { html, issue } = req.body;
  if (!html || !issue) return res.status(400).json({ error: 'Missing html or issue' });
  
  try {
    // Use Gemini API if GEMINI_API_KEY is set
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are an accessibility expert. Given the following HTML and accessibility issue, suggest a fixed version of the HTML and explain your reasoning.\n\nHTML:\n${html}\n\nIssue:\n${JSON.stringify(issue)}\n\nReturn only the fixed HTML and a short explanation.`;
        
        // Updated Gemini API endpoint (using v1 instead of v1beta)
        const response = await axios.post(
          'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent',
          {
            contents: [{ parts: [{ text: prompt }] }]
          },
          {
            params: { key: process.env.GEMINI_API_KEY },
            headers: { 'Content-Type': 'application/json' }
          }
        );
        
        const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
        return res.json({ fix: text });
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError?.response?.data || geminiError.message);
        
        // If rate limited, provide a helpful message and continue to OpenAI fallback
        if (geminiError?.response?.data?.error?.code === 429) {
          console.log('Gemini API rate limit reached, falling back to rule-based fixes...');
          
          // Generate basic fix suggestion based on issue type
          const basicFix = generateBasicFixSuggestion(html, issue);
          if (basicFix) {
            return res.json({ fix: basicFix });
          }
          
          // If OpenAI key is available, try that as fallback
          if (process.env.OPENAI_API_KEY) {
            console.log('Trying OpenAI as fallback...');
            // Continue to OpenAI fallback below
          } else {
            return res.json({ 
              fix: `Unable to generate fix suggestion due to API rate limits.\n\nGeneral recommendation: ${getGeneralRecommendation(issue)}`
            });
          }
        }
      }
    }

    // OpenAI integration as fallback
    if (process.env.OPENAI_API_KEY) {
      try {
        const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
        const openai = new OpenAIApi(configuration);
        const prompt = `You are an accessibility expert. Given the following HTML and accessibility issue, suggest a fixed version of the HTML and explain your reasoning.\n\nHTML:\n${html}\n\nIssue:\n${JSON.stringify(issue)}\n\nReturn only the fixed HTML and a short explanation.`;
        
        const completion = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are an accessibility expert.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 800,
          temperature: 0.2
        });
        
        const text = completion.data.choices?.[0]?.message?.content || 'No response from OpenAI.';
        return res.json({ fix: text });
      } catch (openaiError) {
        console.error('OpenAI error:', openaiError?.response?.data || openaiError.message);
        // Provide basic fix suggestions if even OpenAI fails
        const basicFix = generateBasicFixSuggestion(html, issue);
        return res.json({ 
          fix: basicFix || `Could not generate AI-powered fix due to API errors.\n\nGeneral recommendation: ${getGeneralRecommendation(issue)}`
        });
      }
    } else {
      // No API keys available - provide basic fixes
      const basicFix = generateBasicFixSuggestion(html, issue);
      return res.json({ 
        fix: basicFix || `No AI provider keys available.\n\nGeneral recommendation: ${getGeneralRecommendation(issue)}`
      });
    }
  } catch (err) {
    console.error('Fix suggestion error:', err?.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to generate fix suggestion.' });
  }
});

// Helper function for basic fixes based on common issues
function generateBasicFixSuggestion(html, issue) {
  const issueLower = issue.message ? issue.message.toLowerCase() : '';
  
  // Missing alt text
  if (issueLower.includes('alt') || issueLower.includes('image') && issueLower.includes('text')) {
    return `It appears there's an image missing alt text. Add descriptive alt attributes to your images:

\`\`\`html
<!-- Before -->
<img src="image.jpg">

<!-- After -->
<img src="image.jpg" alt="Descriptive text about the image content">
\`\`\`

For decorative images that don't convey information, use an empty alt attribute:
\`\`\`html
<img src="decorative.jpg" alt="">
\`\`\``;
  }
  
  // Missing form labels
  if (issueLower.includes('label') || issueLower.includes('form')) {
    return `Form inputs should be associated with labels:

\`\`\`html
<!-- Before -->
<input type="text" name="username">

<!-- After -->
<label for="username">Username:</label>
<input type="text" name="username" id="username">
\`\`\`

Or you can wrap the input with the label:
\`\`\`html
<label>
  Username:
  <input type="text" name="username">
</label>
\`\`\``;
  }
  
  // Color contrast
  if (issueLower.includes('contrast') || issueLower.includes('color')) {
    return `This appears to be a color contrast issue. Ensure text has sufficient contrast with its background:

1. For normal text (under 18pt), the contrast ratio should be at least 4.5:1
2. For large text (18pt+), the contrast ratio should be at least 3:1

Consider using a color contrast checker to verify your colors meet accessibility standards.`;
  }
  
  // Return null if we don't have a specific template for this issue
  return null;
}

// Provide general recommendations based on issue type
function getGeneralRecommendation(issue) {
  const issueType = issue.type || 'error';
  
  switch(issueType) {
    case 'error':
      return 'This is a critical accessibility issue that should be fixed immediately. Consider consulting the WCAG guidelines.';
    case 'warning':
      return 'This is a potential accessibility issue that may affect some users. Review the element against WCAG guidelines.';
    case 'notice':
      return 'This is a minor accessibility concern that could be improved for better user experience.';
    default:
      return 'Review the affected element against WCAG 2.1 accessibility guidelines.';
  }
}

module.exports = router;