import { writeFile, unlink, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import mammoth from 'mammoth';

// Helper: check file type
function getAllowedExtension(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['pdf', 'docx', 'txt'].includes(ext)) {
    return ext;
  }
  return null;
}

// Helper: clean extracted text
function cleanText(text) {
  // Remove URLs
  text = text.replace(/http\S+/g, '');
  
  // Remove DOIs
  text = text.replace(/\bDOI:\s*\S+/g, '');
  
  // Remove common page footers/headers
  text = text.replace(/^.*?(Vol\.|Page|©|Copyright|Fall|Spring|Summer|Winter)\s?\d{0,4}.*$/gm, '');
  
  // Remove email addresses
  text = text.replace(/[\w\.-]+@[\w\.-]+/g, '');
  
  // Remove figure/table captions
  text = text.replace(/^\s*(Figure|Table)\s*\d+.*$/gm, '');
  
  // Remove form feeds
  text = text.replace(/\f/g, '');
  
  // Remove multiple newlines (replace 2+ with single)
  text = text.replace(/\n{2,}/g, '\n');
  
  // Remove multiple spaces
  text = text.replace(/\s{2,}/g, ' ');
  
  return text.trim();
}

// Helper: extract text from PDF
async function extractPdfText(filePath) {
  try {
    const pdfBuffer = await readFile(filePath);
    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      text += textContent.items.map((item) => item.str).join('') + '\n';
    }

    return text;
  } catch (err) {
    throw new Error(`PDF parsing failed: ${err.message}`);
  }
}

// Helper: extract text from DOCX
async function extractDocxText(filePath) {
  try {
    const buffer = await readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (err) {
    throw new Error(`DOCX parsing failed: ${err.message}`);
  }
}

// Helper: extract text from TXT
async function extractTxtText(filePath) {
  return await readFile(filePath, 'utf-8');
}

export async function POST(request) {
  let tempFilePath = null;

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check file type
    const ext = getAllowedExtension(file.name);
    if (!ext) {
      return Response.json(
        { error: 'Unsupported file type. Use PDF, DOCX, or TXT.' },
        { status: 400 }
      );
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    tempFilePath = join(tmpdir(), `upload-${Date.now()}.${ext}`);
    await writeFile(tempFilePath, buffer);

    console.log(`📄 Processing ${ext.toUpperCase()} file: ${file.name}`);

    let rawText = '';

    // Extract text based on file type
    if (ext === 'pdf') {
      rawText = await extractPdfText(tempFilePath);
    } else if (ext === 'docx') {
      rawText = await extractDocxText(tempFilePath);
    } else if (ext === 'txt') {
      rawText = await extractTxtText(tempFilePath);
    }

    // Clean the extracted text
    const cleanedText = cleanText(rawText);

    // Optional: chunk text (for very long documents)
    const chunkSize = 3000;
    const chunks = [];
    for (let i = 0; i < cleanedText.length; i += chunkSize) {
      chunks.push(cleanedText.substring(i, i + chunkSize));
    }
    const finalText = chunks.join('\n\n--- Page Break ---\n\n');

    console.log(`✅ Extracted ${cleanedText.length} characters from file`);

    return Response.json({
      text: finalText,
      rawLength: rawText.length,
      cleanedLength: cleanedText.length,
      fileName: file.name,
    });
  } catch (error) {
    console.error('❌ File upload error:', error);
    return Response.json(
      { error: `File processing failed: ${error.message}` },
      { status: 500 }
    );
  } finally {
    // Clean up temp file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (err) {
        console.warn('Could not delete temp file:', err);
      }
    }
  }
}

export const config = {
  maxDuration: 60,
};

export const runtime = 'nodejs';
