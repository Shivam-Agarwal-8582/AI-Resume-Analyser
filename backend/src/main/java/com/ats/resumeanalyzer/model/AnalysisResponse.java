package com.ats.resumeanalyzer.model;

import java.util.List;

public record AnalysisResponse(
    int atsScore,
    int matchPercentage,
    String summary,
    List<String> matchingSkills,
    List<String> missingSkills,
    List<String> recommendedSkills,
    String experienceFeedback,
    String educationFeedback,
    String formatFeedback,
    List<String> actionableSuggestions,
    List<BulletPointAdjustment> suggestedBulletPoints
) {}

// A record in Java is a special type introduced to represent immutable data carriers with very little boilerplate code.
