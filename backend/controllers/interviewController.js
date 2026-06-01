import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import User from '../models/User.js';
import Interview from '../models/Interview.js';

// @desc    Generate interview questions
// @route   POST /api/interview/generate
// @access  Private
export const generateQuestions = async (req, res) => {
  const { role, difficulty, type } = req.body;

  try {
    const user = await User.findById(req.user._id);
    const resumeContext = user.resumeText ? `Candidate Resume Background: ${user.resumeText.substring(0, 2000)}...` : 'No resume provided.';

    // Check if API Key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.warn("Using smart local questions because OPENAI_API_KEY is not set.");

      const resumeText = user.resumeText || '';

      // --- Extract Skills ---
      const knownSkills = [
        'React', 'Node.js', 'Node', 'Python', 'Java', 'SQL', 'MongoDB', 'AWS',
        'Docker', 'JavaScript', 'TypeScript', 'C++', 'HTML', 'CSS', 'Express',
        'Angular', 'Vue', 'Next.js', 'Machine Learning', 'TensorFlow', 'Keras',
        'Flask', 'Django', 'FastAPI', 'PostgreSQL', 'MySQL', 'Redis', 'Git',
        'REST API', 'GraphQL', 'Kubernetes', 'Linux', 'Firebase', 'Tailwind',
        'Bootstrap', 'Spring Boot', 'Pandas', 'NumPy', 'Scikit-learn', 'LangChain'
      ];
      const textUpper = resumeText.toUpperCase();
      const extractedSkills = knownSkills.filter(s => textUpper.includes(s.toUpperCase()));

      // --- Extract Project Names (lines after "Project" keyword) ---
      const projectMatches = resumeText.match(/(?:Project|PROJECT)[^\n]*[\n:]+([^\n]{5,80})/g) || [];
      const extractedProjects = projectMatches
        .map(m => m.replace(/(?:Project|PROJECT)[^\n]*[\n:]*/i, '').trim())
        .filter(p => p.length > 3)
        .slice(0, 4);

      const skill1 = extractedSkills[0] || 'your main skill';
      const skill2 = extractedSkills[1] || 'another technology';
      const skill3 = extractedSkills[2] || 'tools you know';
      const project1 = extractedProjects[0] || 'one of your projects';
      const project2 = extractedProjects[1] || 'another project you built';

      // --- Large pool of questions split into skills-based and project-based ---
      const skillQuestions = [
        `How comfortable are you with ${skill1}? Can you describe how you have used it in your work?`,
        `What is the most interesting thing you have built using ${skill1}? Walk me through how you did it.`,
        `Have you ever had a bug or error when working with ${skill1}? How did you find and fix it?`,
        `How is ${skill1} different from ${skill2}? When would you choose one over the other?`,
        `If someone who has never heard of ${skill1} asks you to explain it, what would you say?`,
        `What are the limitations of ${skill1} that you have noticed while working with it?`,
        `How do you keep your ${skill1} code clean and easy for others to understand?`,
        `Have you combined ${skill1} and ${skill2} together in a project? How did they work together?`,
        `What is one new feature or update in ${skill1} that you have recently learned about?`,
        `How do you test or debug code when you are using ${skill1}?`,
        `What is your experience level with ${skill2} and how did you learn it?`,
        `Can you explain a real situation where using ${skill3} made your project better or faster?`,
        `If you had to remove ${skill1} from your toolkit, what would you use instead and why?`,
      ];

      const projectQuestions = [
        `Tell me about ${project1}. What was the goal of that project and what was your role in it?`,
        `What was the biggest challenge you faced while building ${project1}, and how did you solve it?`,
        `What technology did you use in ${project1} and why did you choose those specific tools?`,
        `If you were given more time, what feature would you add to ${project1}?`,
        `How did you handle errors or problems that came up when working on ${project1}?`,
        `Did you work alone or with a team on ${project1}? How did you coordinate the work?`,
        `How did you test ${project1} before finishing it? Did you find any bugs?`,
        `Looking back at ${project2}, is there anything you would do differently today?`,
        `What did you learn from building ${project2} that you use in your work now?`,
        `How did ${project1} and ${project2} differ in terms of complexity and the challenges involved?`,
        `What was the most interesting part of building ${project2}? What made it fun or difficult?`,
        `How did you decide on the structure or design of ${project1}?`,
      ];

      // Shuffle both pools and pick a mix: 3 project-based + 2 skill-based (randomized each request)
      const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
      const shuffledProjects = shuffle([...projectQuestions]);
      const shuffledSkills = shuffle([...skillQuestions]);

      // Mix them: pick 3 from projects and 2 from skills (or vice versa, alternate)
      const pickCount = Math.random() > 0.5 ? [3, 2] : [2, 3];
      const selected = [
        ...shuffledProjects.slice(0, pickCount[0]),
        ...shuffledSkills.slice(0, pickCount[1]),
      ];

      // Final shuffle to mix skill and project questions together
      const finalQuestions = shuffle(selected);

      return res.status(200).json({ questions: finalQuestions });
    }

    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7,
      modelName: 'gpt-3.5-turbo',
    });

    const prompt = PromptTemplate.fromTemplate(`
      You are an interviewer.
      Generate exactly 5 distinct interview questions for a candidate.
      
      Instructions:
      - Use simple, normal words. Do not use tricky or overly complex vocabulary.
      - Mainly analyze the "Projects" and "Skills" parts of the resume to generate the questions.
      - Do NOT ask anything about the "Education" part of the resume.
      - Keep the questions practical and meaningful based on what they actually built.
      
      Parameters:
      Role: {role}
      Interview Type: {type}
      
      {resumeContext}
      
      Do not output any introductory or concluding text. 
      Output the 5 questions separated by a newline, numbered 1 to 5.
    `);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    const response = await chain.invoke({
      role,
      type,
      difficulty,
      resumeContext
    });

    const questions = response.split('\n')
      .map(q => q.replace(/^\d+\.\s*/, '').trim())
      .filter(q => q.length > 0);

    res.status(200).json({ questions });

  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ message: 'Server error generating questions', error: error.message });
  }
};

// @desc    Evaluate an answer
// @route   POST /api/interview/evaluate
// @access  Private
export const evaluateAnswer = async (req, res) => {
  const { question, answer, role } = req.body;

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      // Smart local evaluation based on actual answer length and content
      const words = answer ? answer.trim().split(/\s+/).filter(w => w.length > 0) : [];
      const wordCount = words.length;

      // Score based on answer length & keyword presence
      let score = 4;
      if (wordCount > 10) score = 5;
      if (wordCount > 25) score = 6;
      if (wordCount > 50) score = 7;
      if (wordCount > 80) score = 8;
      if (wordCount > 120) score = 9;

      // Check if answer contains relevant technical keywords
      const techKeywords = ['used', 'built', 'created', 'implemented', 'developed', 'worked', 'designed', 'fixed', 'tested', 'deployed', 'solved', 'managed'];
      const hasKeywords = techKeywords.some(k => answer.toLowerCase().includes(k));
      if (hasKeywords && score < 9) score += 1;

      // Clamp score
      score = Math.min(10, Math.max(1, score));

      const strengths = [];
      const weaknesses = [];

      if (wordCount > 50) strengths.push("Good detail — you explained your answer well");
      else weaknesses.push("Your answer was too short — try to explain more");

      if (hasKeywords) strengths.push("You used practical language that shows real experience");
      else weaknesses.push("Try to include specific examples of what you did in your projects");

      if (wordCount <= 10 || !answer) weaknesses.push("Make sure to speak clearly and give a complete answer");
      if (strengths.length === 0) strengths.push("You attempted the question");
      if (weaknesses.length === 0) weaknesses.push("Try to cover edge cases and add more depth");

      const evaluation = {
        score,
        strengths,
        weaknesses,
        idealAnswer: `A strong answer should explain what you did, why you chose your approach, what challenges you faced, and what the outcome was. Aim for 3-5 sentences with specific details from your projects.`
      };

      // Save to database even in mock mode
      await Interview.create({
        user: req.user._id,
        role: role || 'General',
        score: evaluation.score,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses
      });

      return res.status(200).json(evaluation);
    }

    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.2,
      modelName: 'gpt-3.5-turbo',
    });

    const prompt = PromptTemplate.fromTemplate(`
      You are an expert interviewer evaluating a candidate's answer.
      Question: {question}
      Candidate's Answer: {answer}
      
      Provide your evaluation strictly in the following JSON format:
      {{
        "score": (a number from 1 to 10),
        "strengths": [(array of 2 strings detailing strengths)],
        "weaknesses": [(array of 2 strings detailing weaknesses)],
        "idealAnswer": "(A short ideal answer to the question)"
      }}
    `);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    const response = await chain.invoke({ question, answer });
    
    // Parse JSON
    const parsed = JSON.parse(response);

    // Save to Database
    await Interview.create({
      user: req.user._id,
      role: 'General', // Mock role for now, should be passed from frontend
      score: parsed.score,
      strengths: parsed.strengths,
      weaknesses: parsed.weaknesses
    });

    res.status(200).json(parsed);

  } catch (error) {
    console.error('Error evaluating answer:', error);
    res.status(500).json({ message: 'Server error evaluating answer', error: error.message });
  }
};

// @desc    Get user interview analytics
// @route   GET /api/interview/analytics
// @access  Private
export const getAnalytics = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).sort({ createdAt: 1 });

    if (!interviews || interviews.length === 0) {
      return res.status(200).json({ scores: [], labels: [] });
    }

    const scores = interviews.map(i => i.score);
    const labels = interviews.map((_, idx) => `Int ${idx + 1}`);

    // For radar chart, we'd normally analyze specific skills, but we'll mock radar data based on general score trend
    const avgScore = scores.reduce((a,b) => a+b, 0) / scores.length;
    
    res.status(200).json({
      scores,
      labels,
      avgScore
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};
