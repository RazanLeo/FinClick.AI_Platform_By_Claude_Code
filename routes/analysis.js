const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticate, trackActivity } = require('../middleware/auth');
const { supabaseAdmin } = require('../lib/supabase');
const AnalysisEngine = require('../lib/analysisEngine');
const ReportGenerator = require('../lib/reportGenerator');
const winston = require('winston');

const router = express.Router();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: './logs/analysis-routes.log' })
    ]
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'text/csv'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type'), false);
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

const analysisEngine = new AnalysisEngine();
const reportGenerator = new ReportGenerator();

// Get analysis types
router.get('/types', authenticate, async (req, res) => {
    try {
        const { data: analysisTypes, error } = await supabaseAdmin
            .from('analysis_types')
            .select('*')
            .eq('is_active', true)
            .order('category, name_en');

        if (error) throw error;

        // Group by category
        const groupedTypes = analysisTypes.reduce((acc, type) => {
            if (!acc[type.category]) {
                acc[type.category] = [];
            }
            acc[type.category].push(type);
            return acc;
        }, {});

        res.json({
            success: true,
            data: groupedTypes,
            total: analysisTypes.length
        });

    } catch (error) {
        logger.error('Error fetching analysis types:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analysis types',
            error: error.message
        });
    }
});

// Get sectors
router.get('/sectors', authenticate, async (req, res) => {
    try {
        const { data: sectors, error } = await supabaseAdmin
            .from('company_sectors')
            .select('*')
            .eq('is_active', true)
            .order('name_en');

        if (error) throw error;

        res.json({
            success: true,
            data: sectors
        });

    } catch (error) {
        logger.error('Error fetching sectors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sectors',
            error: error.message
        });
    }
});

// Get activities by sector
router.get('/activities/:sectorId', authenticate, async (req, res) => {
    try {
        const { sectorId } = req.params;

        const { data: activities, error } = await supabaseAdmin
            .from('company_activities')
            .select('*')
            .eq('sector_id', sectorId)
            .eq('is_active', true)
            .order('name_en');

        if (error) throw error;

        res.json({
            success: true,
            data: activities
        });

    } catch (error) {
        logger.error('Error fetching activities:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching activities',
            error: error.message
        });
    }
});

// Get legal entities
router.get('/legal-entities', authenticate, async (req, res) => {
    try {
        const { data: legalEntities, error } = await supabaseAdmin
            .from('legal_entities')
            .select('*')
            .eq('is_active', true)
            .order('name_en');

        if (error) throw error;

        res.json({
            success: true,
            data: legalEntities
        });

    } catch (error) {
        logger.error('Error fetching legal entities:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching legal entities',
            error: error.message
        });
    }
});

// Upload document
router.post('/upload', authenticate, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No document uploaded'
            });
        }

        const documentRecord = {
            user_id: req.user.id,
            filename: req.file.filename,
            original_filename: req.file.originalname,
            file_path: req.file.path,
            file_size: req.file.size,
            mime_type: req.file.mimetype,
            status: 'uploaded'
        };

        const { data: document, error } = await supabaseAdmin
            .from('documents')
            .insert(documentRecord)
            .select()
            .single();

        if (error) throw error;

        logger.info(`Document uploaded: ${document.id} by user ${req.user.id}`);

        res.json({
            success: true,
            message: 'Document uploaded successfully',
            data: document
        });

    } catch (error) {
        logger.error('Error uploading document:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading document',
            error: error.message
        });
    }
});

// Create new analysis
router.post('/', authenticate, trackActivity('analysis'), async (req, res) => {
    try {
        const {
            analysis_name,
            company_name,
            sector_id,
            activity_id,
            legal_entity_id,
            analysis_period,
            selected_analysis_types,
            document_id
        } = req.body;

        // Validate required fields
        if (!analysis_name || !company_name || !selected_analysis_types || selected_analysis_types.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const analysisRecord = {
            user_id: req.user.id,
            document_id: document_id || null,
            analysis_name,
            company_name,
            sector_id,
            activity_id,
            legal_entity_id,
            analysis_period,
            selected_analysis_types,
            status: 'pending'
        };

        const { data: analysis, error } = await supabaseAdmin
            .from('analyses')
            .insert(analysisRecord)
            .select()
            .single();

        if (error) throw error;

        logger.info(`Analysis created: ${analysis.id} by user ${req.user.id}`);

        // Start analysis processing in background
        setImmediate(() => {
            analysisEngine.runFullAnalysis(analysis.id, req.user.id, req.language || 'en')
                .catch(error => {
                    logger.error(`Background analysis failed for ${analysis.id}:`, error);
                });
        });

        res.json({
            success: true,
            message: 'Analysis created and processing started',
            data: analysis
        });

    } catch (error) {
        logger.error('Error creating analysis:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating analysis',
            error: error.message
        });
    }
});

// Get user's analyses
router.get('/', authenticate, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, company_name } = req.query;
        const offset = (page - 1) * limit;

        let query = supabaseAdmin
            .from('analyses')
            .select(`
                *,
                documents(original_filename, file_size, mime_type),
                company_sectors(name_en, name_ar),
                company_activities(name_en, name_ar),
                legal_entities(name_en, name_ar)
            `)
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) {
            query = query.eq('status', status);
        }

        if (company_name) {
            query = query.ilike('company_name', `%${company_name}%`);
        }

        const { data: analyses, error, count } = await query;

        if (error) throw error;

        res.json({
            success: true,
            data: analyses,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        logger.error('Error fetching analyses:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analyses',
            error: error.message
        });
    }
});

// Get specific analysis
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const { data: analysis, error } = await supabaseAdmin
            .from('analyses')
            .select(`
                *,
                documents(*),
                company_sectors(name_en, name_ar),
                company_activities(name_en, name_ar),
                legal_entities(name_en, name_ar)
            `)
            .eq('id', id)
            .eq('user_id', req.user.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Analysis not found'
                });
            }
            throw error;
        }

        res.json({
            success: true,
            data: analysis
        });

    } catch (error) {
        logger.error('Error fetching analysis:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analysis',
            error: error.message
        });
    }
});

// Get analysis status
router.get('/:id/status', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const status = await analysisEngine.getAnalysisStatus(id);

        res.json({
            success: true,
            data: status
        });

    } catch (error) {
        logger.error('Error getting analysis status:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting analysis status',
            error: error.message
        });
    }
});

// Cancel analysis
router.post('/:id/cancel', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership
        const { data: analysis, error } = await supabaseAdmin
            .from('analyses')
            .select('user_id, status')
            .eq('id', id)
            .single();

        if (error || !analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        if (analysis.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (analysis.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel completed analysis'
            });
        }

        const result = await analysisEngine.cancelAnalysis(id);

        res.json(result);

    } catch (error) {
        logger.error('Error cancelling analysis:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling analysis',
            error: error.message
        });
    }
});

// Generate report
router.post('/:id/reports', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { format, language = 'en', template = 'standard' } = req.body;

        if (!format || !['pdf', 'word', 'excel', 'powerpoint'].includes(format.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid format specified'
            });
        }

        // Verify ownership and analysis completion
        const { data: analysis, error } = await supabaseAdmin
            .from('analyses')
            .select('user_id, status')
            .eq('id', id)
            .single();

        if (error || !analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        if (analysis.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (analysis.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Analysis not completed yet'
            });
        }

        // Generate report
        const result = await reportGenerator.generateReport(id, format, language, template);

        if (result.success) {
            logger.info(`Report generated: ${result.file_path} for analysis ${id}`);
        }

        res.json(result);

    } catch (error) {
        logger.error('Error generating report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating report',
            error: error.message
        });
    }
});

// Get analysis reports
router.get('/:id/reports', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership
        const { data: analysis, error: analysisError } = await supabaseAdmin
            .from('analyses')
            .select('user_id')
            .eq('id', id)
            .single();

        if (analysisError || !analysis || analysis.user_id !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        const { data: reports, error } = await supabaseAdmin
            .from('reports')
            .select('*')
            .eq('analysis_id', id)
            .order('generated_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            data: reports
        });

    } catch (error) {
        logger.error('Error fetching reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reports',
            error: error.message
        });
    }
});

// Download report
router.get('/:id/reports/:reportId/download', authenticate, async (req, res) => {
    try {
        const { id, reportId } = req.params;

        // Verify ownership
        const { data: report, error } = await supabaseAdmin
            .from('reports')
            .select(`
                *,
                analyses!inner(user_id)
            `)
            .eq('id', reportId)
            .eq('analysis_id', id)
            .single();

        if (error || !report || report.analyses.user_id !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Update download count
        await supabaseAdmin
            .from('reports')
            .update({
                download_count: (report.download_count || 0) + 1,
                downloaded_at: new Date()
            })
            .eq('id', reportId);

        // Send file
        res.download(report.file_path, report.filename, (err) => {
            if (err) {
                logger.error('Error downloading report:', err);
                res.status(500).json({
                    success: false,
                    message: 'Error downloading report'
                });
            } else {
                logger.info(`Report downloaded: ${reportId} by user ${req.user.id}`);
            }
        });

    } catch (error) {
        logger.error('Error processing report download:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing download',
            error: error.message
        });
    }
});

// Delete analysis
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership
        const { data: analysis, error: fetchError } = await supabaseAdmin
            .from('analyses')
            .select('user_id, status')
            .eq('id', id)
            .single();

        if (fetchError || !analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        if (analysis.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (analysis.status === 'processing') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete analysis that is currently processing'
            });
        }

        const { error } = await supabaseAdmin
            .from('analyses')
            .delete()
            .eq('id', id);

        if (error) throw error;

        logger.info(`Analysis deleted: ${id} by user ${req.user.id}`);

        res.json({
            success: true,
            message: 'Analysis deleted successfully'
        });

    } catch (error) {
        logger.error('Error deleting analysis:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting analysis',
            error: error.message
        });
    }
});

// Get analysis statistics
router.get('/stats/summary', authenticate, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .rpc('get_user_analysis_stats', { user_id_param: req.user.id });

        if (error) throw error;

        res.json({
            success: true,
            data: data?.[0] || {
                total_analyses: 0,
                completed_analyses: 0,
                processing_analyses: 0,
                failed_analyses: 0,
                total_reports: 0
            }
        });

    } catch (error) {
        logger.error('Error fetching analysis statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
});

module.exports = router;