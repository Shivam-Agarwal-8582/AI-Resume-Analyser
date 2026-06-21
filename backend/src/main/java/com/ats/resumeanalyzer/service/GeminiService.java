package com.ats.resumeanalyzer.service;

import com.ats.resumeanalyzer.model.AnalysisResponse;
import com.ats.resumeanalyzer.model.OptimizationResponse;
import com.ats.resumeanalyzer.model.ParseResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String configuredApiKey;

    public GeminiService(ObjectMapper objectMapper) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    private String getApiKey(String headerKey) {
        if (headerKey != null && !headerKey.trim().isEmpty()) {
            return headerKey.trim();
        }
        String envKey = System.getenv("GEMINI_API_KEY");
        if (envKey != null && !envKey.trim().isEmpty()) {
            return envKey.trim();
        }
        String googleEnvKey = System.getenv("GOOGLE_API_KEY");
        if (googleEnvKey != null && !googleEnvKey.trim().isEmpty()) {
            return googleEnvKey.trim();
        }
        if (configuredApiKey != null && !configuredApiKey.trim().isEmpty()) {
            return configuredApiKey.trim();
        }
        throw new IllegalStateException("Gemini API Key is not configured. Please set the GEMINI_API_KEY environment variable, provide it in the X-Gemini-API-Key header, or enter 'ollama' in the API key field to use your local gemma:2b model running via Ollama.");
    }

    private String executeModel(String userApiKey, String prompt) {
        boolean useOllama = "ollama".equalsIgnoreCase(userApiKey) || 
                            "ollama".equalsIgnoreCase(configuredApiKey) || 
                            "ollama".equalsIgnoreCase(System.getenv("GEMINI_API_KEY"));
        
        if (useOllama) {
            return callOllama(prompt);
        } else {
            String apiKey = getApiKey(userApiKey);
            return callGemini(apiKey, prompt);
        }
    }

    private String callOllama(String prompt) {
        String url = "http://localhost:11434/api/generate";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gemma:2b");
        requestBody.put("prompt", prompt);
        requestBody.put("stream", false);
        requestBody.put("format", "json");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map responseBody = response.getBody();
                return (String) responseBody.get("response");
            }
            throw new RuntimeException("Empty or invalid response from Ollama API");
        } catch (Exception e) {
            throw new RuntimeException("Local Ollama model request failed. Ensure 'ollama serve' is running, you have pulled gemma:2b ('ollama run gemma:2b'), and port 11434 is accessible. Details: " + e.getMessage(), e);
        }
    }

    private String callGemini(String apiKey, String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Construct request body
        Map<String, Object> requestBody = new HashMap<>();
        
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);
        
        Map<String, Object> partContainer = new HashMap<>();
        partContainer.put("parts", List.of(textPart));
        
        requestBody.put("contents", List.of(partContainer));

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        requestBody.put("generationConfig", generationConfig);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map responseBody = response.getBody();
                List candidates = (List) responseBody.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map candidate = (Map) candidates.get(0);
                    Map content = (Map) candidate.get("content");
                    if (content != null) {
                        List parts = (List) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map part = (Map) parts.get(0);
                            return (String) part.get("text");
                        }
                    }
                }
            }
            throw new RuntimeException("Empty or invalid response from Gemini API");
        } catch (Exception e) {
            throw new RuntimeException("Gemini API call failed: " + e.getMessage(), e);
        }
    }

    public AnalysisResponse analyzeResume(String resumeText, String jobDescription, String userApiKey) {
        String prompt = """
            You are an expert ATS (Applicant Tracking System) Analyzer and Professional Technical Recruiter.
            Analyze the following resume against the job description.
            
            Resume:
            \"""
            """ + resumeText + """
            \"""
            
            Job Description:
            \"""
            """ + jobDescription + """
            \"""
            
            Evaluate the resume against the job description and output a JSON object strictly matching this schema:
            {
              "atsScore": integer (0 to 100, representing overall fit based on standard ATS parsing algorithms, keyword density, role match),
              "matchPercentage": integer (0 to 100, representing skill and qualification match),
              "summary": "String summarizing the alignment between candidate and job",
              "matchingSkills": ["list of skills found in both the resume and job description"],
              "missingSkills": ["important skills from the job description that are missing from the resume"],
              "recommendedSkills": ["skills that would make the candidate stand out, related to the domain but not explicitly required"],
              "experienceFeedback": "Detailed feedback on candidate's work history alignment with the job description",
              "educationFeedback": "Feedback on education requirements matching",
              "formatFeedback": "Feedback on the layout, formatting, or parsing compatibility of the resume",
              "actionableSuggestions": ["list of 3-5 high-impact, specific actions to improve the resume"],
              "suggestedBulletPoints": [
                {
                  "original": "an actual bullet point from the resume that could be improved",
                  "optimized": "an improved version of that bullet point incorporating keywords from the job description and using action-verbs or the STAR/XYZ method",
                  "reason": "why this change is recommended"
                }
              ]
            }
            
            Ensure your output is valid JSON and contains only the requested JSON content. Do not include markdown styling blocks like ```json ... ``` inside the text string itself, return clean JSON.
            """;

        String jsonResponse = executeModel(userApiKey, prompt);
        try {
            // Clean markdown blocks if LLM added them by chance
            String cleanJson = jsonResponse.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            } else if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();
            return objectMapper.readValue(cleanJson, AnalysisResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse LLM analysis response as JSON. Response was: " + jsonResponse, e);
        }
    }

    public ParseResponse parseResume(String resumeText, String userApiKey) {
        String prompt = """
            You are an intelligent resume parsing system. Extract structured data from the following resume text.
            
            Resume:
            \"""
            """ + resumeText + """
            \"""
            
            Output a JSON object matching this schema:
            {
              "candidateName": "Full name of the candidate, null if not found",
              "email": "Email address, null if not found",
              "phone": "Phone number, null if not found",
              "skills": ["list of technical and soft skills extracted"],
              "experience": [
                {
                  "companyName": "Company name",
                  "jobTitle": "Job Title",
                  "duration": "Duration (e.g. June 2021 - Present)",
                  "description": ["list of responsibilities/achievements as bullet points"]
                }
              ],
              "education": [
                {
                  "institution": "University/School name",
                  "degree": "Degree and field of study",
                  "graduationYear": "Graduation year or expected graduation"
                }
              ],
              "summary": "Professional summary statement of the candidate"
            }
            
            Ensure your output is valid JSON and contains only the requested JSON content. Do not include markdown styling blocks like ```json ... ``` inside the text string itself, return clean JSON.
            """;

        String jsonResponse = executeModel(userApiKey, prompt);
        try {
            String cleanJson = jsonResponse.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            } else if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();
            return objectMapper.readValue(cleanJson, ParseResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse LLM parse response as JSON. Response was: " + jsonResponse, e);
        }
    }

    public OptimizationResponse optimizeResume(String resumeText, String jobDescription, String userApiKey) {
        String prompt = """
            You are a professional resume writer and career coach.
            Tailor the candidate's resume to the following job description. Generate tailored bullet points and a highly personalized, compelling cover letter.
            
            Resume:
            \"""
            """ + resumeText + """
            \"""
            
            Job Description:
            \"""
            """ + jobDescription + """
            \"""
            
            Output a JSON object matching this schema:
            {
              "overallSuggestions": "Strategic advice on how to position the resume for this role",
              "bulletPointEnhancements": [
                {
                  "original": "an actual bullet point from the resume that needs tailoring",
                  "optimized": "the tailored version of that bullet point specifically highlighting skills/keywords from the job description",
                  "reason": "why this matches the job description better"
                }
              ],
              "tailoredCoverLetter": "A complete, beautifully written professional cover letter matching the candidate's background to the job requirements"
            }
            
            Ensure your output is valid JSON and contains only the requested JSON content. Do not include markdown styling blocks like ```json ... ``` inside the text string itself, return clean JSON.
            """;

        String jsonResponse = executeModel(userApiKey, prompt);
        try {
            String cleanJson = jsonResponse.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            } else if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();
            return objectMapper.readValue(cleanJson, OptimizationResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse LLM optimization response as JSON. Response was: " + jsonResponse, e);
        }
    }
}
