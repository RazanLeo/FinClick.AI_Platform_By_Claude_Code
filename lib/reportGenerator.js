const fs = require('fs').promises;
const path = require('path');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, HeadingLevel } = require('docx');
const ExcelJS = require('exceljs');
const PptxGenJS = require('pptxgenjs');
const Chart = require('chart.js');
const { createCanvas } = require('canvas');
const winston = require('winston');
const { supabaseAdmin } = require('./supabase');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: './logs/report-generator.log' })
    ]
});

class ReportGenerator {
    constructor() {
        this.outputDir = './reports';
        this.templateDir = './templates';
        this.ensureDirectories();
    }

    async ensureDirectories() {
        try {
            await fs.mkdir(this.outputDir, { recursive: true });
            await fs.mkdir(this.templateDir, { recursive: true });
            await fs.mkdir('./charts', { recursive: true });
        } catch (error) {
            logger.error('Error creating directories:', error);
        }
    }

    // Main report generation function
    async generateReport(analysisId, format, language = 'en', templateType = 'standard') {
        try {
            logger.info(`Generating ${format} report for analysis ${analysisId}`);

            // Load analysis data
            const analysisData = await this.loadAnalysisData(analysisId);
            if (!analysisData) {
                throw new Error('Analysis data not found');
            }

            // Generate charts first
            const charts = await this.generateCharts(analysisData.charts_data, language);

            // Prepare report data
            const reportData = {
                ...analysisData,
                charts,
                generated_at: new Date(),
                language,
                template_type: templateType
            };

            let reportPath = null;

            // Generate based on format
            switch (format.toLowerCase()) {
                case 'pdf':
                    reportPath = await this.generatePDFReport(reportData);
                    break;
                case 'word':
                case 'docx':
                    reportPath = await this.generateWordReport(reportData);
                    break;
                case 'excel':
                case 'xlsx':
                    reportPath = await this.generateExcelReport(reportData);
                    break;
                case 'powerpoint':
                case 'pptx':
                    reportPath = await this.generatePowerPointReport(reportData);
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }

            // Save report record to database
            await this.saveReportRecord(analysisId, format, reportPath, language, templateType);

            logger.info(`Report generated successfully: ${reportPath}`);
            return {
                success: true,
                file_path: reportPath,
                file_size: await this.getFileSize(reportPath),
                format,
                language
            };

        } catch (error) {
            logger.error('Error generating report:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Load analysis data from database
    async loadAnalysisData(analysisId) {
        try {
            const { data, error } = await supabaseAdmin
                .from('analyses')
                .select(`
                    *,
                    users(first_name, last_name, company_name),
                    company_sectors(name_en, name_ar),
                    company_activities(name_en, name_ar),
                    legal_entities(name_en, name_ar)
                `)
                .eq('id', analysisId)
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            logger.error('Error loading analysis data:', error);
            return null;
        }
    }

    // Generate PDF Report
    async generatePDFReport(data) {
        const fileName = `analysis_${data.id}_${Date.now()}.pdf`;
        const filePath = path.join(this.outputDir, fileName);

        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        doc.pipe(require('fs').createWriteStream(filePath));

        const isArabic = data.language === 'ar';

        try {
            // Title Page
            await this.addPDFTitlePage(doc, data, isArabic);

            // Table of Contents
            doc.addPage();
            await this.addPDFTableOfContents(doc, data, isArabic);

            // Executive Summary
            doc.addPage();
            await this.addPDFExecutiveSummary(doc, data, isArabic);

            // Company Overview
            doc.addPage();
            await this.addPDFCompanyOverview(doc, data, isArabic);

            // Financial Analysis
            doc.addPage();
            await this.addPDFFinancialAnalysis(doc, data, isArabic);

            // Charts and Visualizations
            if (data.charts && data.charts.length > 0) {
                doc.addPage();
                await this.addPDFCharts(doc, data.charts, isArabic);
            }

            // Recommendations
            doc.addPage();
            await this.addPDFRecommendations(doc, data, isArabic);

            // Appendices
            doc.addPage();
            await this.addPDFAppendices(doc, data, isArabic);

            // Footer
            this.addPDFFooter(doc, data);

            doc.end();

            // Wait for PDF to be written
            await new Promise(resolve => doc.on('end', resolve));

            return filePath;

        } catch (error) {
            logger.error('Error generating PDF:', error);
            throw error;
        }
    }

    // Generate Word Report
    async generateWordReport(data) {
        const fileName = `analysis_${data.id}_${Date.now()}.docx`;
        const filePath = path.join(this.outputDir, fileName);

        const isArabic = data.language === 'ar';

        try {
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        // Title
                        new Paragraph({
                            text: isArabic ? 'تقرير التحليل المالي' : 'Financial Analysis Report',
                            heading: HeadingLevel.TITLE,
                            alignment: isArabic ? 'center' : 'center'
                        }),

                        // Company Name
                        new Paragraph({
                            text: data.company_name || (isArabic ? 'اسم الشركة' : 'Company Name'),
                            heading: HeadingLevel.HEADING_1,
                            alignment: isArabic ? 'right' : 'left'
                        }),

                        // Executive Summary
                        new Paragraph({
                            text: isArabic ? 'الملخص التنفيذي' : 'Executive Summary',
                            heading: HeadingLevel.HEADING_1
                        }),

                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: this.getExecutiveSummaryText(data, isArabic),
                                    size: 24
                                })
                            ]
                        }),

                        // Financial Ratios Section
                        new Paragraph({
                            text: isArabic ? 'النسب المالية' : 'Financial Ratios',
                            heading: HeadingLevel.HEADING_1
                        }),

                        // Add financial ratios table
                        this.createWordFinancialTable(data.results, isArabic),

                        // Recommendations Section
                        new Paragraph({
                            text: isArabic ? 'التوصيات' : 'Recommendations',
                            heading: HeadingLevel.HEADING_1
                        }),

                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: this.getRecommendationsText(data, isArabic),
                                    size: 24
                                })
                            ]
                        })
                    ]
                }]
            });

            const buffer = await Packer.toBuffer(doc);
            await fs.writeFile(filePath, buffer);

            return filePath;

        } catch (error) {
            logger.error('Error generating Word document:', error);
            throw error;
        }
    }

    // Generate Excel Report
    async generateExcelReport(data) {
        const fileName = `analysis_${data.id}_${Date.now()}.xlsx`;
        const filePath = path.join(this.outputDir, fileName);

        const workbook = new ExcelJS.Workbook();
        const isArabic = data.language === 'ar';

        try {
            // Summary Sheet
            const summarySheet = workbook.addWorksheet(isArabic ? 'الملخص' : 'Summary');
            await this.addExcelSummarySheet(summarySheet, data, isArabic);

            // Financial Ratios Sheet
            const ratiosSheet = workbook.addWorksheet(isArabic ? 'النسب المالية' : 'Financial Ratios');
            await this.addExcelRatiosSheet(ratiosSheet, data, isArabic);

            // Raw Data Sheet
            const dataSheet = workbook.addWorksheet(isArabic ? 'البيانات الخام' : 'Raw Data');
            await this.addExcelDataSheet(dataSheet, data, isArabic);

            // Charts Sheet
            if (data.charts && data.charts.length > 0) {
                const chartsSheet = workbook.addWorksheet(isArabic ? 'الرسوم البيانية' : 'Charts');
                await this.addExcelChartsSheet(chartsSheet, data.charts, isArabic);
            }

            // Benchmarking Sheet
            const benchmarkSheet = workbook.addWorksheet(isArabic ? 'المقارنات المرجعية' : 'Benchmarking');
            await this.addExcelBenchmarkSheet(benchmarkSheet, data, isArabic);

            await workbook.xlsx.writeFile(filePath);
            return filePath;

        } catch (error) {
            logger.error('Error generating Excel report:', error);
            throw error;
        }
    }

    // Generate PowerPoint Report
    async generatePowerPointReport(data) {
        const fileName = `analysis_${data.id}_${Date.now()}.pptx`;
        const filePath = path.join(this.outputDir, fileName);

        const pres = new PptxGenJS();
        const isArabic = data.language === 'ar';

        try {
            // Title Slide
            let slide = pres.addSlide();
            slide.addText(isArabic ? 'تقرير التحليل المالي' : 'Financial Analysis Report', {
                x: 1, y: 2, w: 8, h: 1,
                fontSize: 32,
                align: 'center',
                color: '1F4E79',
                bold: true
            });

            slide.addText(data.company_name || (isArabic ? 'اسم الشركة' : 'Company Name'), {
                x: 1, y: 3.5, w: 8, h: 0.8,
                fontSize: 24,
                align: 'center',
                color: '2F5597'
            });

            slide.addText(new Date().toLocaleDateString(isArabic ? 'ar-SA' : 'en-US'), {
                x: 1, y: 5, w: 8, h: 0.5,
                fontSize: 16,
                align: 'center',
                color: '7F7F7F'
            });

            // Executive Summary Slide
            slide = pres.addSlide();
            slide.addText(isArabic ? 'الملخص التنفيذي' : 'Executive Summary', {
                x: 0.5, y: 0.5, w: 9, h: 0.8,
                fontSize: 28,
                bold: true,
                color: '1F4E79'
            });

            slide.addText(this.getExecutiveSummaryText(data, isArabic), {
                x: 0.5, y: 1.5, w: 9, h: 4,
                fontSize: 16,
                align: isArabic ? 'right' : 'left'
            });

            // Key Metrics Slide
            slide = pres.addSlide();
            slide.addText(isArabic ? 'المؤشرات الرئيسية' : 'Key Metrics', {
                x: 0.5, y: 0.5, w: 9, h: 0.8,
                fontSize: 28,
                bold: true,
                color: '1F4E79'
            });

            await this.addPowerPointMetricsTable(slide, data.results, isArabic);

            // Charts Slides
            if (data.charts && data.charts.length > 0) {
                for (let i = 0; i < data.charts.length; i++) {
                    slide = pres.addSlide();
                    await this.addPowerPointChart(slide, data.charts[i], isArabic);
                }
            }

            // Recommendations Slide
            slide = pres.addSlide();
            slide.addText(isArabic ? 'التوصيات' : 'Recommendations', {
                x: 0.5, y: 0.5, w: 9, h: 0.8,
                fontSize: 28,
                bold: true,
                color: '1F4E79'
            });

            slide.addText(this.getRecommendationsText(data, isArabic), {
                x: 0.5, y: 1.5, w: 9, h: 4,
                fontSize: 16,
                align: isArabic ? 'right' : 'left'
            });

            await pres.writeFile(filePath);
            return filePath;

        } catch (error) {
            logger.error('Error generating PowerPoint presentation:', error);
            throw error;
        }
    }

    // Chart generation functions
    async generateCharts(chartsData, language = 'en') {
        if (!chartsData || Object.keys(chartsData).length === 0) {
            return [];
        }

        const charts = [];

        try {
            // Generate financial ratios chart
            if (chartsData.financial_ratios && chartsData.financial_ratios.length > 0) {
                const chartPath = await this.createBarChart(
                    chartsData.financial_ratios,
                    language === 'ar' ? 'النسب المالية' : 'Financial Ratios',
                    language
                );
                charts.push({
                    type: 'bar',
                    title: language === 'ar' ? 'النسب المالية' : 'Financial Ratios',
                    path: chartPath
                });
            }

            // Generate trend analysis chart
            if (chartsData.trend_analysis && chartsData.trend_analysis.length > 0) {
                const chartPath = await this.createLineChart(
                    chartsData.trend_analysis,
                    language === 'ar' ? 'تحليل الاتجاهات' : 'Trend Analysis',
                    language
                );
                charts.push({
                    type: 'line',
                    title: language === 'ar' ? 'تحليل الاتجاهات' : 'Trend Analysis',
                    path: chartPath
                });
            }

            // Generate benchmark comparison chart
            if (chartsData.benchmark_comparison && chartsData.benchmark_comparison.length > 0) {
                const chartPath = await this.createRadarChart(
                    chartsData.benchmark_comparison,
                    language === 'ar' ? 'المقارنة المرجعية' : 'Benchmark Comparison',
                    language
                );
                charts.push({
                    type: 'radar',
                    title: language === 'ar' ? 'المقارنة المرجعية' : 'Benchmark Comparison',
                    path: chartPath
                });
            }

        } catch (error) {
            logger.error('Error generating charts:', error);
        }

        return charts;
    }

    async createBarChart(data, title, language) {
        const canvas = createCanvas(800, 400);
        const ctx = canvas.getContext('2d');

        // Configure Chart.js for server-side rendering
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.name || item.label),
                datasets: [{
                    label: language === 'ar' ? 'القيمة' : 'Value',
                    data: data.map(item => item.value),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#C9CBCF', '#4BC0C0'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: { size: 16 }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Save chart as image
        const chartPath = path.join('./charts', `chart_${Date.now()}_bar.png`);
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(chartPath, buffer);

        return chartPath;
    }

    async createLineChart(data, title, language) {
        const canvas = createCanvas(800, 400);
        const ctx = canvas.getContext('2d');

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => item.date || item.label),
                datasets: [{
                    label: language === 'ar' ? 'الاتجاه' : 'Trend',
                    data: data.map(item => item.value),
                    borderColor: '#36A2EB',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: { size: 16 }
                    }
                }
            }
        });

        const chartPath = path.join('./charts', `chart_${Date.now()}_line.png`);
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(chartPath, buffer);

        return chartPath;
    }

    async createRadarChart(data, title, language) {
        const canvas = createCanvas(600, 600);
        const ctx = canvas.getContext('2d');

        const chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.map(item => item.metric || item.label),
                datasets: [
                    {
                        label: language === 'ar' ? 'الشركة' : 'Company',
                        data: data.map(item => item.company || item.value),
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: '#36A2EB',
                        pointBackgroundColor: '#36A2EB'
                    },
                    {
                        label: language === 'ar' ? 'متوسط الصناعة' : 'Industry Average',
                        data: data.map(item => item.industry_avg || item.benchmark),
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: '#FF6384',
                        pointBackgroundColor: '#FF6384'
                    }
                ]
            },
            options: {
                responsive: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: { size: 16 }
                    }
                }
            }
        });

        const chartPath = path.join('./charts', `chart_${Date.now()}_radar.png`);
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(chartPath, buffer);

        return chartPath;
    }

    // Utility functions for different report sections

    getExecutiveSummaryText(data, isArabic) {
        if (data.ai_insights?.report_content?.executive_summary) {
            return data.ai_insights.report_content.executive_summary;
        }

        return isArabic ?
            'تم إجراء تحليل مالي شامل للشركة باستخدام أحدث التقنيات والذكاء الاصطناعي. يظهر التحليل نظرة عامة على الأداء المالي والتوصيات للتحسين.' :
            'A comprehensive financial analysis has been conducted for the company using the latest technologies and artificial intelligence. The analysis shows an overview of financial performance and recommendations for improvement.';
    }

    getRecommendationsText(data, isArabic) {
        if (data.recommendations?.action_items?.length > 0) {
            return data.recommendations.action_items
                .map((item, index) => `${index + 1}. ${item.recommendation || item}`)
                .join('\n');
        }

        return isArabic ?
            '1. مراجعة وتحسين إدارة رأس المال العامل\n2. تحسين هوامش الربحية\n3. تقوية المركز المالي\n4. تطوير استراتيجيات النمو' :
            '1. Review and improve working capital management\n2. Enhance profitability margins\n3. Strengthen financial position\n4. Develop growth strategies';
    }

    // Excel-specific helper functions
    async addExcelSummarySheet(sheet, data, isArabic) {
        // Add headers
        sheet.addRow([
            isArabic ? 'تفاصيل الشركة' : 'Company Details',
            isArabic ? 'القيمة' : 'Value'
        ]);

        // Add company information
        const companyRows = [
            [isArabic ? 'اسم الشركة' : 'Company Name', data.company_name || ''],
            [isArabic ? 'القطاع' : 'Sector', data.company_sectors?.name_ar || data.company_sectors?.name_en || ''],
            [isArabic ? 'النشاط' : 'Activity', data.company_activities?.name_ar || data.company_activities?.name_en || ''],
            [isArabic ? 'الكيان القانوني' : 'Legal Entity', data.legal_entities?.name_ar || data.legal_entities?.name_en || ''],
            [isArabic ? 'تاريخ التحليل' : 'Analysis Date', new Date(data.created_at).toLocaleDateString()]
        ];

        companyRows.forEach(row => sheet.addRow(row));

        // Style the headers
        sheet.getRow(1).font = { bold: true };
        sheet.getColumn(1).width = 25;
        sheet.getColumn(2).width = 30;
    }

    async addExcelRatiosSheet(sheet, data, isArabic) {
        if (!data.results) return;

        // Headers
        const headers = [
            isArabic ? 'النسبة المالية' : 'Financial Ratio',
            isArabic ? 'القيمة' : 'Value',
            isArabic ? 'التفسير' : 'Interpretation',
            isArabic ? 'الفئة' : 'Category'
        ];

        sheet.addRow(headers);

        // Add ratios data
        Object.entries(data.results).forEach(([name, result]) => {
            sheet.addRow([
                result.name_ar || name,
                result.value || 'N/A',
                this.getInterpretationText(result.interpretation, isArabic),
                result.category || ''
            ]);
        });

        // Style
        sheet.getRow(1).font = { bold: true };
        sheet.columns.forEach(col => col.width = 20);
    }

    getInterpretationText(interpretation, isArabic) {
        const interpretations = {
            excellent: isArabic ? 'ممتاز' : 'Excellent',
            good: isArabic ? 'جيد' : 'Good',
            average: isArabic ? 'متوسط' : 'Average',
            poor: isArabic ? 'ضعيف' : 'Poor',
            concerning: isArabic ? 'مثير للقلق' : 'Concerning'
        };

        return interpretations[interpretation] || interpretation;
    }

    // Save report record to database
    async saveReportRecord(analysisId, format, filePath, language, templateType) {
        try {
            const fileName = path.basename(filePath);
            const fileSize = await this.getFileSize(filePath);

            const reportRecord = {
                analysis_id: analysisId,
                format: format.toLowerCase(),
                filename: fileName,
                file_path: filePath,
                file_size: fileSize,
                language: language,
                template_used: templateType,
                generation_settings: {
                    format,
                    language,
                    template: templateType,
                    generated_at: new Date().toISOString()
                }
            };

            const { error } = await supabaseAdmin
                .from('reports')
                .insert(reportRecord);

            if (error) throw error;

        } catch (error) {
            logger.error('Error saving report record:', error);
            throw error;
        }
    }

    async getFileSize(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return stats.size;
        } catch (error) {
            return 0;
        }
    }

    // Get available templates
    getAvailableTemplates() {
        return ['standard', 'executive', 'detailed', 'custom'];
    }

    // Get supported formats
    getSupportedFormats() {
        return ['pdf', 'word', 'excel', 'powerpoint'];
    }

    // Clean up old reports
    async cleanupOldReports(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const { data: oldReports, error } = await supabaseAdmin
                .from('reports')
                .select('file_path')
                .lt('generated_at', cutoffDate.toISOString());

            if (error) throw error;

            for (const report of oldReports) {
                try {
                    await fs.unlink(report.file_path);
                    logger.info(`Deleted old report: ${report.file_path}`);
                } catch (unlinkError) {
                    logger.warn(`Failed to delete report file: ${report.file_path}`, unlinkError);
                }
            }

            // Delete from database
            const { error: deleteError } = await supabaseAdmin
                .from('reports')
                .delete()
                .lt('generated_at', cutoffDate.toISOString());

            if (deleteError) throw deleteError;

            logger.info(`Cleaned up reports older than ${daysOld} days`);

        } catch (error) {
            logger.error('Error cleaning up old reports:', error);
        }
    }
}

module.exports = ReportGenerator;