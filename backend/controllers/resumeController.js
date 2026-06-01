import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import User from '../models/User.js';
// We'll import AI tools later for generation

// @desc    Upload and parse resume
// @route   POST /api/resume/upload
// @access  Private
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let parsedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      parsedText = pdfData.text;
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const docxData = await mammoth.extractRawText({ buffer: req.file.buffer });
      parsedText = docxData.value;
    }

    if (!parsedText.trim()) {
      return res.status(400).json({ message: 'Could not extract text from the file.' });
    }

    // Updating user model with latest resume context
    const user = await User.findById(req.user._id);
    if (user) {
       user.resumeText = parsedText;
       await user.save();
    }
    
    res.status(200).json({ 
      message: 'Resume uploaded and parsed successfully', 
      textLength: parsedText.length,
    });

  } catch (error) {
    console.error('Error parsing resume:', error);
    res.status(500).json({ message: 'Server error during resume parsing', error: error.message });
  }
};
