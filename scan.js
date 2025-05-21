const express = require('express');
const router = express.Router();
const pa11y = require('pa11y');
const puppeteer = require('puppeteer');
const ScanResult = require('./models/ScanResult');
const authMiddleware = require('./middleware/authMiddleware'); // Import the auth middleware

// Improved form element detection
function hasFormElements(html) {
  if (!html) return false;
  
  // Check for common form elements
  const formElements = [
    /<form[^>]*>/i,
    /<input[^>]*>/i,
    /<select[^>]*>/i,
    /<textarea[^>]*>/i,
    /<button[^>]*>/i,
    /<label[^>]*>/i
  ];
  
  return formElements.some(regex => regex.test(html));
}

// Calculate a more reasonable score
function calculateScore(issues) {
  if (!issues || !Array.isArray(issues)) return 100;
  
  const errorCount = issues.filter(i => i.type === "error").length;
  const warningCount = issues.filter(i => i.type === "warning").length;
  const noticeCount = issues.filter(i => i.type === "notice").length;
  
  // Scale the impact based on total issues to avoid extreme negative scores
  const totalIssues = errorCount + warningCount + noticeCount;
  const scaleFactor = totalIssues > 50 ? 50 / totalIssues : 1;
  
  // Base score of 100, with scaled deductions
  const baseScore = 100;
  const errorDeduction = errorCount * 3 * scaleFactor;
  const warningDeduction = warningCount * 1 * scaleFactor;
  const noticeDeduction = noticeCount * 0.5 * scaleFactor;
  
  const score = Math.max(0, Math.round(baseScore - errorDeduction - warningDeduction - noticeDeduction));
  return score;
}

// POST /api/scan
router.post('/', authMiddleware, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing URL' });
  
  try {
    // Use Puppeteer with more options for better analysis
    const browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // First get the page content to check for forms
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    const pageContent = await page.content();
    const hasForm = hasFormElements(pageContent);
    
    // Extended options for better scanning
    const results = await pa11y(url, {
      browser,
      includeNotices: true,
      includeWarnings: true,
      wait: 1000,
      timeout: 60000,
      actions: [
        // Add common actions to test interaction points
        'click element html',
        'wait for element body to be visible'
      ],
      // Include form-specific rules
      runners: hasForm ? ['htmlcs', 'axe'] : ['htmlcs']
    });
    
    await browser.close();
    
    // Enhance results with detected form info
    if (hasForm) {
      // Add form detection note if no form issues were found but forms exist
      const hasFormIssues = results.issues.some(issue => 
        (issue.selector?.includes('form') || 
         issue.selector?.includes('input') ||
         issue.selector?.includes('select') ||
         issue.message?.toLowerCase().includes('form') ||
         issue.message?.toLowerCase().includes('label'))
      );
      
      if (!hasFormIssues) {
        results.issues.push({
          type: 'notice',
          code: 'WCAG2AA.info.form-detected',
          message: 'Form elements detected on page. Ensure all forms are fully accessible.',
          selector: 'form',
          context: '<form>...</form>'
        });
      }
    }
    
    // Calculate a more accurate score
    const score = calculateScore(results.issues);
    
    // Save to MongoDB
    const scan = new ScanResult({
      url,
      issues: results.issues,
      documentTitle: results.documentTitle,
      pageUrl: results.pageUrl,
      score: score,
      hasForm: hasForm,
      // Add the user reference if authenticated
      user: req.user ? req.user._id : null
    });
    
    await scan.save();
    res.json(scan);
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET a specific scan by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const scan = await ScanResult.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }
    
    // Check if the scan belongs to the authenticated user
    if (req.user && scan.user && scan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(scan);
  } catch (err) {
    console.error('Error getting scan:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
