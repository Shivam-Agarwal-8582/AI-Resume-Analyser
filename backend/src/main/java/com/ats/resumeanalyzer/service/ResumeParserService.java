package com.ats.resumeanalyzer.service;

import java.io.IOException;
import java.io.InputStream;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ResumeParserService {

    public String parseResume(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();
        
        if (filename == null) {
            throw new IllegalArgumentException("File name cannot be empty");
        }

        if (filename.endsWith(".pdf") || "application/pdf".equals(contentType)) {
            return parsePdf(file.getInputStream());
            
        } else if (filename.endsWith(".docx") || "application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(contentType)) {
            return parseDocx(file.getInputStream());
            
        } else if (filename.endsWith(".txt") || "text/plain".equals(contentType)) {
            return new String(file.getBytes());
        } else {
            throw new IllegalArgumentException("Unsupported file type. Please upload a PDF, DOCX, or TXT resume.");
        }
    }

    private String parsePdf(InputStream inputStream) throws IOException {
        byte[] bytes = inputStream.readAllBytes();
        try (PDDocument document = Loader.loadPDF(bytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String parseDocx(InputStream inputStream) throws IOException {
        try (XWPFDocument document = new XWPFDocument(inputStream);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        }
    }
}
