/**
 * Reports Routes - FinClick.AI
 * Handles report generation, downloading, and management
 */

const express = require('express');
const router = express.Router();
const ReportGenerator = require('../lib/reportGenerator');
const { authenticateToken, requirePaid } = require('../middleware/auth');

// Generate new report
router.post('/generate', authenticateToken, requirePaid, async (req, res) => {
    try {
        const { analysisId, format, language = 'ar' } = req.body;

        if (!analysisId || !format) {
            return res.status(400).json({
                success: false,
                error_ar: 'معرف التحليل والصيغة مطلوبان',
                error_en: 'Analysis ID and format are required'
            });
        }

        // Get analysis data
        const analysis = await supabase
            .from('analyses')
            .select(`
                *,
                documents(*),
                users(*)
            `)
            .eq('id', analysisId)
            .eq('user_id', req.user.id)
            .single();

        if (!analysis.data) {
            return res.status(404).json({
                success: false,
                error_ar: 'التحليل غير موجود',
                error_en: 'Analysis not found'
            });
        }

        // Generate report
        const reportGenerator = new ReportGenerator();
        const reportPath = await reportGenerator.generateReport({
            analysis: analysis.data,
            format,
            language,
            user: req.user
        });

        // Save report record
        const { data: report } = await supabase
            .from('reports')
            .insert({
                user_id: req.user.id,
                analysis_id: analysisId,
                format,
                language,
                file_path: reportPath,
                status: 'completed'
            })
            .select()
            .single();

        res.json({
            success: true,
            data: {
                reportId: report.id,
                downloadUrl: `/api/reports/download/${report.id}`,
                format,
                language
            },
            message_ar: 'تم إنتاج التقرير بنجاح',
            message_en: 'Report generated successfully'
        });

    } catch (error) {
        console.error('Report generation error:', error);
        res.status(500).json({
            success: false,
            error_ar: 'حدث خطأ أثناء إنتاج التقرير',
            error_en: 'Error generating report'
        });
    }
});

// Download report
router.get('/download/:reportId', authenticateToken, async (req, res) => {
    try {
        const { reportId } = req.params;

        // Get report
        const { data: report } = await supabase
            .from('reports')
            .select('*')
            .eq('id', reportId)
            .eq('user_id', req.user.id)
            .single();

        if (!report) {
            return res.status(404).json({
                success: false,
                error_ar: 'التقرير غير موجود',
                error_en: 'Report not found'
            });
        }

        // Set content type based on format
        const contentTypes = {
            'pdf': 'application/pdf',
            'excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'word': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'powerpoint': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        };

        const contentType = contentTypes[report.format] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="report_${reportId}.${report.format}"`);
        res.download(report.file_path);

    } catch (error) {
        console.error('Report download error:', error);
        res.status(500).json({
            success: false,
            error_ar: 'حدث خطأ أثناء تحميل التقرير',
            error_en: 'Error downloading report'
        });
    }
});

// Get user reports
router.get('/my-reports', authenticateToken, async (req, res) => {
    try {
        const { data: reports } = await supabase
            .from('reports')
            .select(`
                *,
                analyses(type, status),
                documents(filename)
            `)
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        res.json({
            success: true,
            data: reports,
            message_ar: 'تم استرجاع التقارير بنجاح',
            message_en: 'Reports retrieved successfully'
        });

    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({
            success: false,
            error_ar: 'حدث خطأ أثناء استرجاع التقارير',
            error_en: 'Error retrieving reports'
        });
    }
});

// Delete report
router.delete('/:reportId', authenticateToken, async (req, res) => {
    try {
        const { reportId } = req.params;

        // Get report first
        const { data: report } = await supabase
            .from('reports')
            .select('*')
            .eq('id', reportId)
            .eq('user_id', req.user.id)
            .single();

        if (!report) {
            return res.status(404).json({
                success: false,
                error_ar: 'التقرير غير موجود',
                error_en: 'Report not found'
            });
        }

        // Delete file from storage
        const fs = require('fs');
        if (fs.existsSync(report.file_path)) {
            fs.unlinkSync(report.file_path);
        }

        // Delete from database
        await supabase
            .from('reports')
            .delete()
            .eq('id', reportId);

        res.json({
            success: true,
            message_ar: 'تم حذف التقرير بنجاح',
            message_en: 'Report deleted successfully'
        });

    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({
            success: false,
            error_ar: 'حدث خطأ أثناء حذف التقرير',
            error_en: 'Error deleting report'
        });
    }
});

// Get report formats and templates
router.get('/formats', authenticateToken, async (req, res) => {
    try {
        const formats = [
            {
                id: 'pdf',
                name_ar: 'تقرير PDF',
                name_en: 'PDF Report',
                description_ar: 'تقرير احترافي بصيغة PDF مع الرسوم البيانية والجداول',
                description_en: 'Professional PDF report with charts and tables',
                icon: 'fas fa-file-pdf',
                color: '#dc3545'
            },
            {
                id: 'excel',
                name_ar: 'ملف Excel',
                name_en: 'Excel File',
                description_ar: 'جداول بيانات تفاعلية مع الحسابات والرسوم البيانية',
                description_en: 'Interactive spreadsheets with calculations and charts',
                icon: 'fas fa-file-excel',
                color: '#198754'
            },
            {
                id: 'word',
                name_ar: 'مستند Word',
                name_en: 'Word Document',
                description_ar: 'تقرير نصي مفصل قابل للتعديل والطباعة',
                description_en: 'Detailed text report editable and printable',
                icon: 'fas fa-file-word',
                color: '#0d6efd'
            },
            {
                id: 'powerpoint',
                name_ar: 'عرض PowerPoint',
                name_en: 'PowerPoint Presentation',
                description_ar: 'عرض تقديمي احترافي للاجتماعات والعروض',
                description_en: 'Professional presentation for meetings and displays',
                icon: 'fas fa-file-powerpoint',
                color: '#fd7e14'
            }
        ];

        res.json({
            success: true,
            data: formats,
            message_ar: 'تم استرجاع صيغ التقارير بنجاح',
            message_en: 'Report formats retrieved successfully'
        });

    } catch (error) {
        console.error('Get formats error:', error);
        res.status(500).json({
            success: false,
            error_ar: 'حدث خطأ أثناء استرجاع الصيغ',
            error_en: 'Error retrieving formats'
        });
    }
});

module.exports = router;