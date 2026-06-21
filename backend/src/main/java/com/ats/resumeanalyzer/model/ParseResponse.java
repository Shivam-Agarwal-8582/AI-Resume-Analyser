package com.ats.resumeanalyzer.model;

import java.util.List;

public record ParseResponse(
    String candidateName,
    String email,
    String phone,
    List<String> skills,
    List<WorkExperience> experience,
    List<Education> education,
    String summary
) {}
