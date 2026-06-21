package com.ats.resumeanalyzer.model;

import java.util.List;

public record WorkExperience(
    String companyName,
    String jobTitle,
    String duration,
    List<String> description
) {}
