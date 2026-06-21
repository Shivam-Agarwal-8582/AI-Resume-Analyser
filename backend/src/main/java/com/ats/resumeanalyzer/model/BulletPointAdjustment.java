package com.ats.resumeanalyzer.model;

public record BulletPointAdjustment(
    String original,
    String optimized,
    String reason
) {}
