package com.ats.resumeanalyzer.controller;

import com.ats.resumeanalyzer.model.AnalysisResponse;
import com.ats.resumeanalyzer.model.OptimizationResponse;
import com.ats.resumeanalyzer.model.ParseResponse;
import com.ats.resumeanalyzer.service.GeminiService;
import com.ats.resumeanalyzer.service.ResumeParserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/ats")
@CrossOrigin
public class AtsController {

    private final ResumeParserService parserService;
    private final GeminiService geminiService;

    public AtsController(ResumeParserService parserService, GeminiService geminiService) {
        this.parserService = parserService;
        this.geminiService = geminiService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "resumeText", required = false) String resumeText,
            @RequestParam("jobDescription") String jobDescription,
            @RequestHeader(value = "X-Gemini-API-Key", required = false) String userApiKey) {
        
        try {
            String extractedText = getResumeText(file, resumeText);
            if (extractedText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please provide a resume file or raw text."));
            }
            if (jobDescription == null || jobDescription.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Job description is required."));
            }
            
            AnalysisResponse response = geminiService.analyzeResume(extractedText, jobDescription, userApiKey);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "An error occurred during resume analysis: " + e.getMessage()));
        }
    }

    @PostMapping("/parse")
    public ResponseEntity<?> parse(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "resumeText", required = false) String resumeText,
            @RequestHeader(value = "X-Gemini-API-Key", required = false) String userApiKey) {
        
        try {
            String extractedText = getResumeText(file, resumeText);
            if (extractedText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please provide a resume file or raw text."));
            }
            
            ParseResponse response = geminiService.parseResume(extractedText, userApiKey);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "An error occurred during resume parsing: " + e.getMessage()));
        }
    }

    @PostMapping("/optimize")
    public ResponseEntity<?> optimize(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "resumeText", required = false) String resumeText,
            @RequestParam("jobDescription") String jobDescription,
            @RequestHeader(value = "X-Gemini-API-Key", required = false) String userApiKey) {
        
        try {
            String extractedText = getResumeText(file, resumeText);
            if (extractedText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please provide a resume file or raw text."));
            }
            if (jobDescription == null || jobDescription.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Job description is required."));
            }
            
            OptimizationResponse response = geminiService.optimizeResume(extractedText, jobDescription, userApiKey);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "An error occurred during resume optimization: " + e.getMessage()));
        }
    }

    private String getResumeText(MultipartFile file, String resumeText) throws IOException {
        if (file != null && !file.isEmpty()) {
            return parserService.parseResume(file);
        } else if (resumeText != null && !resumeText.trim().isEmpty()) {
            return resumeText;
        }
        return "";
    }
}
