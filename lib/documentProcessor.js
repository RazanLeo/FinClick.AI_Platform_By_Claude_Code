const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const xlsx = require('xlsx');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: './logs/document-processor.log' })
    ]
});

class DocumentProcessor {
    constructor() {
        this.supportedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'image/jpeg',
            'image/png',
            'image/tiff',
            'text/csv'
        ];
    }

    async processDocument(filePath, mimeType, language = 'eng') {
        try {
            logger.info(`Processing document: ${filePath}, type: ${mimeType}`);

            if (!this.supportedTypes.includes(mimeType)) {
                throw new Error(`Unsupported file type: ${mimeType}`);
            }

            let result = {
                extracted_data: {},
                tables: [],
                text_content: '',
                ocr_data: null,
                confidence_score: 0,
                processing_notes: []
            };

            switch (mimeType) {
                case 'application/pdf':
                    result = await this.processPDF(filePath);
                    break;

                case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                case 'application/vnd.ms-excel':
                    result = await this.processExcel(filePath);
                    break;

                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                case 'application/msword':
                    result = await this.processWord(filePath);
                    break;

                case 'text/csv':
                    result = await this.processCSV(filePath);
                    break;

                case 'image/jpeg':
                case 'image/png':
                case 'image/tiff':
                    result = await this.processImage(filePath, language);
                    break;

                default:
                    throw new Error(`Processing not implemented for: ${mimeType}`);
            }

            // Extract financial data from processed content
            result.extracted_data = this.extractFinancialData(result.text_content, result.tables);
            result.confidence_score = this.calculateConfidence(result);

            logger.info(`Document processing completed. Confidence: ${result.confidence_score}`);
            return result;

        } catch (error) {
            logger.error('Error processing document:', error);
            throw error;
        }
    }

    async processPDF(filePath) {
        try {
            const buffer = await fs.readFile(filePath);
            const data = await pdf(buffer);

            const result = {
                text_content: data.text,
                tables: this.extractTablesFromText(data.text),
                processing_notes: [`Extracted ${data.numpages} pages`],
                page_count: data.numpages
            };

            return result;

        } catch (error) {
            logger.error('Error processing PDF:', error);
            throw error;
        }
    }

    async processExcel(filePath) {
        try {
            const workbook = xlsx.readFile(filePath);
            const result = {
                text_content: '',
                tables: [],
                processing_notes: []
            };

            // Process each worksheet
            workbook.SheetNames.forEach((sheetName, index) => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

                // Convert to text
                const sheetText = jsonData
                    .map(row => row.join(' | '))
                    .join('\n');

                result.text_content += `\n--- ${sheetName} ---\n${sheetText}\n`;

                // Store as table
                if (jsonData.length > 0) {
                    result.tables.push({
                        sheet_name: sheetName,
                        headers: jsonData[0] || [],
                        data: jsonData.slice(1),
                        row_count: jsonData.length - 1
                    });
                }

                result.processing_notes.push(`Processed sheet: ${sheetName} (${jsonData.length} rows)`);
            });

            return result;

        } catch (error) {
            logger.error('Error processing Excel:', error);
            throw error;
        }
    }

    async processWord(filePath) {
        try {
            const buffer = await fs.readFile(filePath);
            const result = await mammoth.extractRawText({ buffer });

            return {
                text_content: result.value,
                tables: this.extractTablesFromText(result.value),
                processing_notes: ['Extracted text from Word document'],
                messages: result.messages
            };

        } catch (error) {
            logger.error('Error processing Word document:', error);
            throw error;
        }
    }

    async processCSV(filePath) {
        try {
            const buffer = await fs.readFile(filePath, 'utf8');
            const lines = buffer.split('\n').filter(line => line.trim());

            const headers = lines[0] ? lines[0].split(',').map(h => h.trim().replace(/"/g, '')) : [];
            const data = lines.slice(1).map(line =>
                line.split(',').map(cell => cell.trim().replace(/"/g, ''))
            );

            return {
                text_content: buffer,
                tables: [{
                    sheet_name: 'CSV Data',
                    headers: headers,
                    data: data,
                    row_count: data.length
                }],
                processing_notes: [`Processed CSV with ${data.length} rows, ${headers.length} columns`]
            };

        } catch (error) {
            logger.error('Error processing CSV:', error);
            throw error;
        }
    }

    async processImage(filePath, language = 'eng') {
        try {
            logger.info(`Starting OCR processing for image: ${filePath}`);

            // Configure Tesseract for better financial document recognition
            const { data: { text, confidence } } = await Tesseract.recognize(filePath, language, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        logger.info(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                    }
                }
            });

            return {
                text_content: text,
                tables: this.extractTablesFromText(text),
                ocr_data: {
                    confidence: confidence,
                    language: language,
                    processing_time: Date.now()
                },
                processing_notes: [`OCR completed with ${confidence}% confidence`]
            };

        } catch (error) {
            logger.error('Error processing image with OCR:', error);
            throw error;
        }
    }

    extractTablesFromText(text) {
        const tables = [];

        try {
            // Look for table-like patterns in text
            const lines = text.split('\n').map(line => line.trim()).filter(line => line);

            let currentTable = null;
            let tableLines = [];

            for (const line of lines) {
                // Detect table patterns (lines with multiple numbers/currencies)
                const hasMultipleNumbers = (line.match(/\d+[,.]?\d*/g) || []).length >= 2;
                const hasTableSeparators = line.includes('|') || line.includes('\t') || /\s{3,}/.test(line);

                if (hasMultipleNumbers || hasTableSeparators) {
                    tableLines.push(line);
                } else {
                    // End of table
                    if (tableLines.length >= 2) {
                        const table = this.parseTableLines(tableLines);
                        if (table && table.headers.length > 0) {
                            tables.push(table);
                        }
                    }
                    tableLines = [];
                }
            }

            // Check for remaining table
            if (tableLines.length >= 2) {
                const table = this.parseTableLines(tableLines);
                if (table && table.headers.length > 0) {
                    tables.push(table);
                }
            }

        } catch (error) {
            logger.error('Error extracting tables from text:', error);
        }

        return tables;
    }

    parseTableLines(lines) {
        try {
            const rows = [];

            for (const line of lines) {
                let cells = [];

                // Try different parsing methods
                if (line.includes('|')) {
                    cells = line.split('|').map(cell => cell.trim());
                } else if (line.includes('\t')) {
                    cells = line.split('\t').map(cell => cell.trim());
                } else {
                    // Split by multiple spaces
                    cells = line.split(/\s{2,}/).map(cell => cell.trim()).filter(cell => cell);
                }

                if (cells.length > 1) {
                    rows.push(cells);
                }
            }

            if (rows.length === 0) return null;

            return {
                headers: rows[0] || [],
                data: rows.slice(1),
                row_count: rows.length - 1,
                source: 'text_extraction'
            };

        } catch (error) {
            logger.error('Error parsing table lines:', error);
            return null;
        }
    }

    extractFinancialData(textContent, tables) {
        const financialData = {};

        try {
            // Define financial terms to search for (English and Arabic)
            const financialTerms = {
                'total_assets': [
                    'total assets', 'إجمالي الأصول', 'total asset', 'مجموع الأصول'
                ],
                'current_assets': [
                    'current assets', 'أصول متداولة', 'current asset', 'الأصول المتداولة'
                ],
                'current_liabilities': [
                    'current liabilities', 'خصوم متداولة', 'current liability', 'الخصوم المتداولة'
                ],
                'total_equity': [
                    'total equity', 'total shareholders equity', 'إجمالي حقوق الملكية', 'حقوق المساهمين'
                ],
                'revenue': [
                    'revenue', 'sales', 'total revenue', 'الإيرادات', 'المبيعات', 'إجمالي الإيرادات'
                ],
                'net_income': [
                    'net income', 'net profit', 'صافي الربح', 'صافي الدخل', 'الربح الصافي'
                ],
                'operating_income': [
                    'operating income', 'operating profit', 'الدخل التشغيلي', 'الربح التشغيلي'
                ],
                'gross_profit': [
                    'gross profit', 'gross income', 'الربح الإجمالي', 'إجمالي الربح'
                ],
                'cogs': [
                    'cost of goods sold', 'cost of sales', 'تكلفة البضاعة المباعة', 'تكلفة المبيعات'
                ],
                'total_debt': [
                    'total debt', 'total liabilities', 'إجمالي الديون', 'إجمالي الخصوم'
                ],
                'cash': [
                    'cash', 'cash and cash equivalents', 'النقد', 'النقد ومعادلاته'
                ],
                'inventory': [
                    'inventory', 'stock', 'المخزون', 'المخزن'
                ],
                'accounts_receivable': [
                    'accounts receivable', 'receivables', 'الذمم المدينة', 'المدينون'
                ]
            };

            // Search in text content
            const textLines = textContent.toLowerCase().split('\n');

            for (const [key, terms] of Object.entries(financialTerms)) {
                for (const term of terms) {
                    const value = this.findValueForTerm(textLines, term.toLowerCase());
                    if (value !== null) {
                        financialData[key] = value;
                        break;
                    }
                }
            }

            // Search in tables
            for (const table of tables) {
                const tableData = this.extractFromTable(table, financialTerms);
                Object.assign(financialData, tableData);
            }

            logger.info(`Extracted ${Object.keys(financialData).length} financial data points`);

        } catch (error) {
            logger.error('Error extracting financial data:', error);
        }

        return financialData;
    }

    findValueForTerm(textLines, term) {
        for (const line of textLines) {
            if (line.includes(term)) {
                // Look for numbers in the same line or next few lines
                const numbers = this.extractNumbers(line);
                if (numbers.length > 0) {
                    return numbers[numbers.length - 1]; // Take the last/largest number
                }

                // Check next 2 lines for numbers
                const lineIndex = textLines.indexOf(line);
                for (let i = 1; i <= 2; i++) {
                    if (lineIndex + i < textLines.length) {
                        const nextLineNumbers = this.extractNumbers(textLines[lineIndex + i]);
                        if (nextLineNumbers.length > 0) {
                            return nextLineNumbers[0];
                        }
                    }
                }
            }
        }
        return null;
    }

    extractFromTable(table, financialTerms) {
        const data = {};

        try {
            if (!table.headers || !table.data) return data;

            // Look through table headers and data
            for (let rowIndex = 0; rowIndex < table.data.length; rowIndex++) {
                const row = table.data[rowIndex];

                for (let colIndex = 0; colIndex < row.length; colIndex++) {
                    const cell = (row[colIndex] || '').toString().toLowerCase();

                    // Check if this cell contains a financial term
                    for (const [key, terms] of Object.entries(financialTerms)) {
                        for (const term of terms) {
                            if (cell.includes(term.toLowerCase())) {
                                // Look for a number in the same row
                                for (let valueColIndex = colIndex + 1; valueColIndex < row.length; valueColIndex++) {
                                    const value = this.parseNumericValue(row[valueColIndex]);
                                    if (value !== null) {
                                        data[key] = value;
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                        if (data[key]) break;
                    }
                }
            }

        } catch (error) {
            logger.error('Error extracting from table:', error);
        }

        return data;
    }

    extractNumbers(text) {
        if (!text) return [];

        // Match numbers with optional commas, decimals, and currency symbols
        const numberRegex = /[\d,]+\.?\d*/g;
        const matches = text.match(numberRegex) || [];

        return matches
            .map(match => this.parseNumericValue(match))
            .filter(value => value !== null && value > 0);
    }

    parseNumericValue(value) {
        if (typeof value === 'number') return value;
        if (!value || typeof value !== 'string') return null;

        try {
            // Remove currency symbols, commas, and whitespace
            let cleaned = value.replace(/[$£€¥₹,\s]/g, '');

            // Handle parentheses as negative numbers
            if (cleaned.includes('(') && cleaned.includes(')')) {
                cleaned = '-' + cleaned.replace(/[()]/g, '');
            }

            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? null : parsed;

        } catch (error) {
            return null;
        }
    }

    calculateConfidence(result) {
        let confidence = 0;

        // Base confidence on extracted data quality
        const extractedFields = Object.keys(result.extracted_data).length;
        confidence += Math.min(extractedFields * 10, 50); // Max 50 for extracted fields

        // OCR confidence if available
        if (result.ocr_data && result.ocr_data.confidence) {
            confidence += result.ocr_data.confidence * 0.3; // Max 30 for OCR
        } else {
            confidence += 30; // Assume good quality for non-OCR
        }

        // Table extraction quality
        if (result.tables && result.tables.length > 0) {
            confidence += Math.min(result.tables.length * 5, 20); // Max 20 for tables
        }

        return Math.min(Math.round(confidence), 100);
    }

    // Get supported file types
    getSupportedTypes() {
        return [...this.supportedTypes];
    }

    // Validate file type
    isSupported(mimeType) {
        return this.supportedTypes.includes(mimeType);
    }

    // Get file info
    async getFileInfo(filePath) {
        try {
            const stats = await fs.stat(filePath);
            const ext = path.extname(filePath).toLowerCase();

            return {
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                extension: ext,
                exists: true
            };

        } catch (error) {
            return {
                exists: false,
                error: error.message
            };
        }
    }
}

module.exports = DocumentProcessor;