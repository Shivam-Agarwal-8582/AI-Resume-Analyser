package com.ats.resumeanalyzer.model;

import java.util.List;

public record OptimizationResponse(
    String overallSuggestions,
    List<BulletPointAdjustment> bulletPointEnhancements,
    String tailoredCoverLetter
) {}
