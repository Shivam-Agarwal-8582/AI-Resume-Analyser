import { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Key, 
  Eye, 
  EyeOff, 
  Check, 
  Copy, 
  AlertCircle, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  RefreshCw, 
  FileDown,
  User,
  Mail,
  Phone,
  CheckSquare,
  Award,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DEMO_RESUME = `Shivam Agarwal
Email: shivam.agarwal@email.com | Phone: +91-9876543210 | Portfolio: github.com/shivam
Summary: Detail-oriented Software Engineer with 2+ years of experience designing and maintaining responsive web applications. Expert in frontend technologies and REST integrations.

Skills: JavaScript, React, Redux, Node.js, Express, HTML5, CSS3, SQL, Git, RESTful APIs

Experience:
Frontend Developer | Web Tech Solutions | June 2024 - Present
- Created responsive user interfaces using React and Redux, improving user engagement by 25%.
- Built REST API endpoints using Node.js/Express to handle user profile data.
- Optimized app loading time by 30% through code splitting and asset compression.
- Collaborated with design teams to translate Figma mockups into pixel-perfect React pages.

Software Engineer Intern | Innovate Soft | Jan 2024 - May 2024
- Assisted in building a client-facing dashboard using React.
- Fixed UI bugs and wrote unit tests using Jest, achieving 80% test coverage.
- Participated in Agile sprint planning and daily standups.`;

const DEMO_JD = `Position: Senior Software Engineer - AI Integrations
Company: TechGenius Solutions

We are looking for a Software Engineer with a passion for Java, Spring Boot, and AI technologies. You will design backend microservices, build REST APIs, and integrate Google Gemini LLM workflows.

Requirements:
- Bachelor's degree in Computer Science or equivalent.
- 3+ years of experience in Java software development.
- Strong expertise with Spring Boot, Spring MVC, and REST APIs.
- Experience with React or modern frontend frameworks.
- Exposure to Large Language Models (LLMs) like Google Gemini, OpenAI, or LangChain is a plus.
- Proven experience optimizing application performance and database queries.
- Strong team player and Agile developer.`;

export default function App() {
  // Inputs
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [useRawText, setUseRawText] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [mode, setMode] = useState('analyze'); // analyze, parse, optimize
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showKey, setShowKey] = useState(false);

  // App UI State
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  // Notification states
  const [copiedText, setCopiedText] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const fileName = selectedFile.name.toLowerCase();
    
    const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    const isValidMime = validTypes.includes(selectedFile.type);

    if (isValidExtension || isValidMime) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }
      setFile(selectedFile);
      setResumeText('');
      setUseRawText(false);
      setError('');
    } else {
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT resume.');
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApiKeyChange = (e) => {
    const val = e.target.value;
    setApiKey(val);
    if (val) {
      localStorage.setItem('gemini_api_key', val);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  const loadDemoData = () => {
    setFile(null);
    setResumeText(DEMO_RESUME);
    setUseRawText(true);
    setJobDescription(DEMO_JD);
    setError('');
  };

  const copyToClipboard = (text, typeLabel) => {
    navigator.clipboard.writeText(text);
    setCopiedText(typeLabel);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const triggerConfetti = (score) => {
    if (score >= 80) {
      // Big confetti for high scores
      confetti({
        particleCount: 150,
        spread: 80,
        colors: ['#6366f1', '#06b6d4', '#10b981', '#d946ef']
      });
    } else if (score >= 60) {
      // Normal confetti
      confetti({
        particleCount: 80,
        spread: 60,
        colors: ['#06b6d4', '#10b981']
      });
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    // Dynamic loading status messages
    const statusMessages = {
      analyze: [
        'Reading resume content...',
        'Extracting key technologies...',
        'Mapping semantic similarities with job description...',
        'Calculating ATS scoring thresholds...',
        'Google Gemini building feedback pipeline...'
      ],
      parse: [
        'Parsing document structure...',
        'Isolating candidate contact parameters...',
        'Reconstructing employment experience timeline...',
        'Verifying academic credentials...',
        'Formulating profile overview summary...'
      ],
      optimize: [
        'Scanning resume accomplishments...',
        'Comparing job requirements keyword gaps...',
        'Drafting tailored achievement statements...',
        'Writing compelling customized cover letter...'
      ]
    };

    const steps = statusMessages[mode];
    let stepIdx = 0;
    setProgressStep(steps[0]);

    const progressInterval = setInterval(() => {
      if (stepIdx < steps.length - 1) {
        stepIdx++;
        setProgressStep(steps[stepIdx]);
      }
    }, 1200);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else if (resumeText.trim()) {
        formData.append('resumeText', resumeText);
      } else {
        throw new Error('Please select a resume file or paste your resume text.');
      }

      if (mode !== 'parse') {
        if (!jobDescription.trim()) {
          throw new Error('Job description is required for this analysis mode.');
        }
        formData.append('jobDescription', jobDescription);
      }

      const headers = {};
      if (apiKey.trim()) {
        headers['X-Gemini-API-Key'] = apiKey.trim();
      }

      const response = await fetch(`http://localhost:8080/api/ats/${mode}`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Server returned error ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      
      // Trigger animations on success
      if (mode === 'analyze') {
        triggerConfetti(data.atsScore);
      } else if (mode === 'optimize') {
        triggerConfetti(70);
      }

    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || 'An unexpected error occurred. Please ensure the backend is running on port 8080 and try again.');
    } finally {
      setLoading(false);
      setProgressStep('');
    }
  };

  // SVG Gauge helper
  const renderGauge = (value, label, isPrimary) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;
    
    return (
      <div className="metric-card glass-card">
        <div className="score-gauge-container">
          <svg className="score-gauge-svg">
            <defs>
              <linearGradient id="cyan-indigo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="cyan-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <circle className="score-gauge-bg" cx="45" cy="45" r={radius} />
            <circle 
              className={`score-gauge-fill ${isPrimary ? 'gauge-primary' : 'gauge-secondary'}`} 
              cx="45" 
              cy="45" 
              r={radius} 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <span className="score-gauge-text">{value}%</span>
        </div>
        <div className="metric-info">
          <span className="metric-label">{label}</span>
          <span className="metric-value-text">{value}/100</span>
          <span className="metric-desc">
            {value >= 80 ? 'Exceptional Fit' : value >= 60 ? 'Strong Potential' : 'Needs Optimization'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Dynamic Background SVGs for glowing gradients */}
      <svg className="hidden-gradient-definitions" style={{ display: 'none' }}>
        <defs>
          <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-container">
            <div className="logo-icon">
              <Sparkles size={22} />
            </div>
            <div>
              <h1 className="logo-text">Antigravity ATS</h1>
              <span className="logo-badge">Gemini AI</span>
            </div>
          </div>

          <div className="api-key-wrapper">
            <span className="api-key-indicator">
              <Key size={14} />
              Gemini API Key:
            </span>
            <div className="api-key-input-container">
              <input 
                type={showKey ? "text" : "password"} 
                className="api-key-input"
                placeholder="Paste your Gemini Key..."
                value={apiKey}
                onChange={handleApiKeyChange}
              />
              <span className="api-key-icon" onClick={() => setShowKey(!showKey)}>
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Workspace */}
      <main className="main-workspace">
        {/* Left Side: Inputs Panel */}
        <section className="glass-card" style={{ padding: '1.5rem', alignSelf: 'start' }}>
          <h2 className="panel-title">
            <Upload size={18} />
            AI Parser & Settings
          </h2>

          <form onSubmit={handleAnalyze}>
            {/* File Upload / Paste Toggle */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="form-label">Resume Document</span>
                <button 
                  type="button" 
                  style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => setUseRawText(!useRawText)}
                >
                  {useRawText ? "Upload File instead" : "Paste raw text instead"}
                </button>
              </div>

              {!useRawText ? (
                <div>
                  <div 
                    className={`upload-dropzone ${isDragActive ? 'drag-active' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="upload-icon-container">
                      <Upload size={36} />
                    </div>
                    <span className="upload-text-main">Drag and drop file here</span>
                    <span className="upload-text-sub">Supports PDF, DOCX, TXT up to 10MB</span>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileSelect} 
                      accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" 
                      style={{ display: 'none' }} 
                    />
                  </div>

                  {file && (
                    <div className="uploaded-file-card">
                      <div className="file-info">
                        <FileText className="file-icon" size={20} />
                        <div className="file-details">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                      <button type="button" className="remove-file-btn" onClick={removeFile}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <textarea 
                  className="jd-textarea" 
                  placeholder="Paste candidate resume text here..." 
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    setFile(null);
                  }}
                  style={{ minHeight: '150px' }}
                />
              )}
            </div>

            {/* Job Description (Only needed for analyze and optimize) */}
            {mode !== 'parse' && (
              <div className="form-group">
                <span className="form-label">Job Description</span>
                <textarea 
                  className="jd-textarea" 
                  placeholder="Paste the target job description details here..." 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
            )}

            {/* Pipeline Mode Selector */}
            <div className="form-group">
              <span className="form-label">Analysis Pipeline</span>
              <div className="mode-selector-grid">
                <div 
                  className={`mode-card ${mode === 'analyze' ? 'active' : ''}`}
                  onClick={() => setMode('analyze')}
                >
                  <div className="mode-checkbox">
                    <div className="mode-checkbox-inner"></div>
                  </div>
                  <div className="mode-info">
                    <span className="mode-title">ATS Fit Analysis</span>
                    <span className="mode-desc">Evaluate score, matching skills, gaps, and format issues.</span>
                  </div>
                </div>

                <div 
                  className={`mode-card ${mode === 'parse' ? 'active' : ''}`}
                  onClick={() => setMode('parse')}
                >
                  <div className="mode-checkbox">
                    <div className="mode-checkbox-inner"></div>
                  </div>
                  <div className="mode-info">
                    <span className="mode-title">Structured Profile Parser</span>
                    <span className="mode-desc">Extract contact details, timeline, experiences, and academic data.</span>
                  </div>
                </div>

                <div 
                  className={`mode-card ${mode === 'optimize' ? 'active' : ''}`}
                  onClick={() => setMode('optimize')}
                >
                  <div className="mode-checkbox">
                    <div className="mode-checkbox-inner"></div>
                  </div>
                  <div className="mode-info">
                    <span className="mode-title">Resume Customizer</span>
                    <span className="mode-desc">Generate optimized bullet achievements and custom cover letter.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                type="submit" 
                className="analyze-btn" 
                disabled={loading || (!file && !resumeText.trim())}
              >
                {loading ? <RefreshCw className="spin-animation" size={18} style={{ animation: 'spin 1.5s linear infinite' }} /> : <Sparkles size={18} />}
                {loading ? 'Processing Pipeline...' : 'Run AI Analysis'}
              </button>

              <button 
                type="button" 
                style={{ 
                  background: 'none', 
                  border: '1px solid var(--border)', 
                  color: 'var(--text-sub)', 
                  padding: '0.5rem', 
                  fontSize: '0.8rem', 
                  cursor: 'pointer', 
                  borderRadius: 'var(--radius-sm)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.35rem'
                }}
                onClick={loadDemoData}
              >
                <HelpCircle size={14} />
                Load Demo Profile Data
              </button>
            </div>
          </form>
        </section>

        {/* Right Side: Results Dashboards */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Loading View */}
          {loading && (
            <div className="glass-card loader-container">
              <div className="spinner-glow"></div>
              <span className="loader-status">{progressStep}</span>
              <span className="loader-status-sub">Large language models can take up to 15 seconds to formulate deep matching patterns.</span>
            </div>
          )}

          {/* Error View */}
          {error && (
            <div className="glass-card" style={{ padding: '2rem', borderColor: 'var(--error)' }}>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--error)' }}>
                <AlertCircle size={36} />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>Pipeline Exception Encountered</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: '1.6' }}>{error}</p>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.5rem', paddingTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Troubleshooting tips:</strong>
                <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <li>Verify if your Gemini API key is correct or valid.</li>
                  <li>Ensure the Spring Boot backend server is active and accessible at <code style={{color: 'var(--primary)'}}>http://localhost:8080</code>.</li>
                  <li>Confirm that the resume file has text and is not an empty or password-secured PDF.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Placeholder View */}
          {!loading && !result && !error && (
            <div className="placeholder-dashboard">
              <div className="placeholder-icon-wrapper">
                <Sparkles size={48} />
              </div>
              <h3 className="placeholder-title">Awaiting Resume Inputs</h3>
              <p className="placeholder-desc">
                Select your resume (PDF, Word, or raw text) and enter your target job description, then click "Run AI Analysis" to extract metrics, check skills alignment, or construct custom resumes.
              </p>
            </div>
          )}

          {/* Result View - ATS FIT ANALYSIS */}
          {!loading && result && !error && mode === 'analyze' && (
            <div className="dashboard-grid">
              {/* Gauges */}
              <div className="metrics-row">
                {renderGauge(result.atsScore, 'ATS Fit Score', true)}
                {renderGauge(result.matchPercentage, 'Semantic Match', false)}
              </div>

              {/* Summary */}
              <div className="glass-card summary-card">
                <h3 className="panel-title" style={{ color: 'var(--secondary)' }}>
                  <Award size={18} />
                  Match Summary
                </h3>
                <p className="summary-text">{result.summary}</p>
              </div>

              {/* Skills Matrix */}
              <div className="glass-card skills-matrix-card">
                <h3 className="panel-title" style={{ color: 'var(--primary)' }}>
                  <Briefcase size={18} />
                  Semantic Skills Matrix
                </h3>
                <div className="skills-matrix-sections">
                  {/* Matching Skills */}
                  <div>
                    <span className="skills-section-label" style={{ color: 'var(--success)' }}>
                      <Check size={14} /> Matching Skills ({result.matchingSkills?.length || 0})
                    </span>
                    <div className="skills-badge-list">
                      {result.matchingSkills?.length > 0 ? (
                        result.matchingSkills.map((sk, i) => (
                          <span key={i} className="skill-badge match">{sk}</span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No matching skills identified.</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div>
                    <span className="skills-section-label" style={{ color: 'var(--error)' }}>
                      <AlertCircle size={14} /> Missing Skills ({result.missingSkills?.length || 0})
                    </span>
                    <div className="skills-badge-list">
                      {result.missingSkills?.length > 0 ? (
                        result.missingSkills.map((sk, i) => (
                          <span key={i} className="skill-badge missing">{sk}</span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>All core skills matched!</span>
                      )}
                    </div>
                  </div>

                  {/* Recommended Skills */}
                  <div>
                    <span className="skills-section-label" style={{ color: 'var(--primary)' }}>
                      <Sparkles size={14} /> Recommended Growth Skills ({result.recommendedSkills?.length || 0})
                    </span>
                    <div className="skills-badge-list">
                      {result.recommendedSkills?.length > 0 ? (
                        result.recommendedSkills.map((sk, i) => (
                          <span key={i} className="skill-badge recommended">{sk}</span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No additional skills recommended.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Blocks */}
              <div className="feedback-grid">
                {/* Experience Feedback */}
                <div className="glass-card feedback-card">
                  <div className="feedback-card-header">
                    <span className="feedback-card-title">Experience Fit</span>
                    <span className={`feedback-pill ${result.atsScore >= 75 ? 'good' : 'warning'}`}>
                      {result.atsScore >= 75 ? 'Strong' : 'Moderate'}
                    </span>
                  </div>
                  <p className="feedback-card-content">{result.experienceFeedback}</p>
                </div>

                {/* Education Feedback */}
                <div className="glass-card feedback-card">
                  <div className="feedback-card-header">
                    <span className="feedback-card-title">Education Fit</span>
                    <span className="feedback-pill good">Verified</span>
                  </div>
                  <p className="feedback-card-content">{result.educationFeedback}</p>
                </div>

                {/* Format Feedback */}
                <div className="glass-card feedback-card">
                  <div className="feedback-card-header">
                    <span className="feedback-card-title">ATS Layout Format</span>
                    <span className="feedback-pill good">Clean</span>
                  </div>
                  <p className="feedback-card-content">{result.formatFeedback}</p>
                </div>
              </div>

              {/* Actionable Improvement Checklist */}
              <div className="glass-card checklist-card">
                <h3 className="panel-title" style={{ color: 'var(--success)' }}>
                  <CheckSquare size={18} />
                  Actionable Checklist Gaps
                </h3>
                <div className="checklist-list">
                  {result.actionableSuggestions?.length > 0 ? (
                    result.actionableSuggestions.map((sug, i) => (
                      <div key={i} className="checklist-item">
                        <ChevronRight className="checklist-check" size={16} />
                        <span className="checklist-text">{sug}</span>
                      </div>
                    ))
                  ) : (
                    <span className="checklist-text">No immediate improvements needed. Ready to apply!</span>
                  )}
                </div>
              </div>

              {/* Suggested Bullet point rewrites */}
              {result.suggestedBulletPoints?.length > 0 && (
                <div className="glass-card bullet-enhancements-card">
                  <h3 className="panel-title" style={{ color: 'var(--accent)' }}>
                    <Sparkles size={18} />
                    Suggested Bullet Enhancements
                  </h3>
                  <div className="bullets-list">
                    {result.suggestedBulletPoints.map((item, i) => (
                      <div key={i} className="bullet-item-container">
                        <div className="bullet-original-section">
                          <span className="bullet-label-tag red">Original Bullet</span>
                          <p className="bullet-text old">"{item.original}"</p>
                        </div>
                        <div className="bullet-optimized-section">
                          <span className="bullet-label-tag green">Optimized (AI Recommended)</span>
                          <button 
                            className="copy-bullet-btn" 
                            title="Copy optimized bullet"
                            onClick={() => copyToClipboard(item.optimized, `bullet-${i}`)}
                          >
                            {copiedText === `bullet-${i}` ? <Check size={14} style={{color: 'var(--success)'}} /> : <Copy size={14} />}
                          </button>
                          <p className="bullet-text">"{item.optimized}"</p>
                        </div>
                        <div className="bullet-reason">
                          <strong>Reason:</strong> {item.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Result View - STRUCTURED PROFILE PARSER */}
          {!loading && result && !error && mode === 'parse' && (
            <div className="dashboard-grid">
              {/* Profile Main Header */}
              <div className="glass-card parser-header-card">
                <div className="profile-avatar-row">
                  <div className="profile-avatar">
                    {result.candidateName ? result.candidateName.charAt(0) : <User />}
                  </div>
                  <div className="profile-identity">
                    <span className="profile-name">{result.candidateName || 'Unnamed Candidate'}</span>
                    <span className="profile-title">{result.experience?.[0]?.jobTitle || 'Professional Professional'}</span>
                  </div>
                </div>

                <div className="profile-contact-row">
                  {result.email && (
                    <span className="profile-contact-item">
                      <Mail size={14} />
                      {result.email}
                    </span>
                  )}
                  {result.phone && (
                    <span className="profile-contact-item">
                      <Phone size={14} />
                      {result.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Overview Summary */}
              {result.summary && (
                <div className="glass-card summary-card">
                  <h3 className="panel-title" style={{ color: 'var(--secondary)' }}>
                    <User size={18} />
                    Parsed Summary
                  </h3>
                  <p className="summary-text">"{result.summary}"</p>
                </div>
              )}

              {/* Skills parsed list */}
              <div className="glass-card skills-matrix-card">
                <h3 className="panel-title" style={{ color: 'var(--primary)' }}>
                  <Award size={18} />
                  Core Skill Keywords ({result.skills?.length || 0})
                </h3>
                <div className="skills-badge-list">
                  {result.skills?.length > 0 ? (
                    result.skills.map((sk, i) => (
                      <span key={i} className="skill-badge match" style={{ background: 'rgba(6, 182, 212, 0.08)', color: 'var(--secondary)', borderColor: 'rgba(6, 182, 212, 0.2)' }}>{sk}</span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No skills extracted.</span>
                  )}
                </div>
              </div>

              {/* Work Experience Timeline */}
              {result.experience?.length > 0 && (
                <div className="glass-card experience-timeline-card">
                  <h3 className="panel-title" style={{ color: 'var(--primary)' }}>
                    <Briefcase size={18} />
                    Employment Experience History
                  </h3>
                  <div className="timeline-wrapper">
                    {result.experience.map((work, i) => (
                      <div key={i} className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-header">
                          <div className="company-title-group">
                            <span className="company-name">{work.companyName || 'Unknown Employer'}</span>
                            <span className="job-title">{work.jobTitle || 'Software Engineer'}</span>
                          </div>
                          {work.duration && <span className="job-duration">{work.duration}</span>}
                        </div>
                        {work.description?.length > 0 && (
                          <ul className="job-bullets">
                            {work.description.map((bullet, j) => (
                              <li key={j} className="job-bullet">{bullet}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education list */}
              {result.education?.length > 0 && (
                <div>
                  <h3 className="panel-title" style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>
                    <GraduationCap size={18} />
                    Education Details
                  </h3>
                  <div className="education-section">
                    {result.education.map((edu, i) => (
                      <div key={i} className="glass-card education-card">
                        <span className="edu-institution">{edu.institution || 'University'}</span>
                        <span className="edu-degree">{edu.degree || 'Degree Program'}</span>
                        {edu.graduationYear && <span className="edu-year">Graduated: {edu.graduationYear}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Result View - RESUME CUSTOMIZER (OPTIMIZE) */}
          {!loading && result && !error && mode === 'optimize' && (
            <div className="dashboard-grid">
              {/* Strategic Advice Card */}
              {result.overallSuggestions && (
                <div className="advice-callout">
                  <div className="advice-icon-container">
                    <Sparkles size={20} />
                  </div>
                  <div className="advice-content">
                    <span className="advice-title">Strategic AI Advice</span>
                    <span className="advice-text">{result.overallSuggestions}</span>
                  </div>
                </div>
              )}

              {/* Bullet enhancements side by side */}
              {result.bulletPointEnhancements?.length > 0 && (
                <div className="glass-card bullet-enhancements-card">
                  <h3 className="panel-title" style={{ color: 'var(--primary)' }}>
                    <Briefcase size={18} />
                    Optimized Achievement Bullets
                  </h3>
                  <div className="bullets-list">
                    {result.bulletPointEnhancements.map((item, i) => (
                      <div key={i} className="bullet-item-container">
                        <div className="bullet-original-section">
                          <span className="bullet-label-tag red">Original Bullet</span>
                          <p className="bullet-text old">"{item.original}"</p>
                        </div>
                        <div className="bullet-optimized-section">
                          <span className="bullet-label-tag green">Optimized (Ready for Resume)</span>
                          <button 
                            className="copy-bullet-btn" 
                            title="Copy optimized bullet"
                            onClick={() => copyToClipboard(item.optimized, `opt-bullet-${i}`)}
                          >
                            {copiedText === `opt-bullet-${i}` ? <Check size={14} style={{color: 'var(--success)'}} /> : <Copy size={14} />}
                          </button>
                          <p className="bullet-text">"{item.optimized}"</p>
                        </div>
                        <div className="bullet-reason">
                          <strong>Rationale:</strong> {item.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tailored Cover Letter Card */}
              {result.tailoredCoverLetter && (
                <div className="glass-card cover-letter-card">
                  <div className="cover-letter-header">
                    <h3 className="panel-title" style={{ color: 'var(--secondary)', marginBottom: 0 }}>
                      <FileText size={18} />
                      Tailored Cover Letter
                    </h3>
                    <div className="cover-letter-actions">
                      <button 
                        className="action-btn primary"
                        onClick={() => copyToClipboard(result.tailoredCoverLetter, 'coverLetter')}
                      >
                        {copiedText === 'coverLetter' ? (
                          <>
                            <Check size={14} /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} /> Copy Letter
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="cover-letter-text-box">
                    {result.tailoredCoverLetter}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Main Footer */}
      <footer className="app-footer">
        <p>Built with Spring Boot REST APIs, Apache PDFBox/POI parsing, & Google Gemini 1.5 LLM models.</p>
        <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>© 2026 Antigravity ATS Team. All rights reserved.</p>
      </footer>
    </div>
  );
}
