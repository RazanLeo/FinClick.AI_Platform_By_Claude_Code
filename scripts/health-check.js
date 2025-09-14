#!/usr/bin/env node

const { supabaseAdmin } = require('../lib/supabase');
const ExternalDataService = require('../lib/externalDataService');

class HealthChecker {
    constructor() {
        this.externalData = new ExternalDataService();
        this.checks = [];
    }

    async runAllChecks() {
        console.log('🏥 FinClick.AI Health Check\n');

        const checks = [
            { name: 'Database Connection', check: () => this.checkDatabase() },
            { name: 'External APIs', check: () => this.checkExternalAPIs() },
            { name: 'File System', check: () => this.checkFileSystem() },
            { name: 'Environment Variables', check: () => this.checkEnvironment() },
            { name: 'System Resources', check: () => this.checkResources() },
            { name: 'Application Routes', check: () => this.checkRoutes() }
        ];

        let allHealthy = true;

        for (const { name, check } of checks) {
            try {
                const result = await check();
                console.log(`✅ ${name}: ${result.message}`);
            } catch (error) {
                console.log(`❌ ${name}: ${error.message}`);
                allHealthy = false;
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log(`Overall Status: ${allHealthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
        console.log('='.repeat(50));

        return allHealthy;
    }

    async checkDatabase() {
        try {
            // Test basic connection
            const { data, error } = await supabaseAdmin
                .from('users')
                .select('count')
                .limit(1);

            if (error && !error.message.includes('relation "users" does not exist')) {
                throw new Error(`Database connection failed: ${error.message}`);
            }

            // Check migrations table
            const { data: migrations } = await supabaseAdmin
                .from('migrations')
                .select('count');

            // Check if core tables exist
            const tables = ['users', 'analyses', 'analysis_types', 'reports'];
            const tableChecks = [];

            for (const table of tables) {
                const { error: tableError } = await supabaseAdmin
                    .from(table)
                    .select('count')
                    .limit(1);

                tableChecks.push({
                    table,
                    exists: !tableError || tableError.message.includes('does not exist')
                });
            }

            const existingTables = tableChecks.filter(t => t.exists).length;

            return {
                message: `Connected, ${existingTables}/${tables.length} core tables exist`
            };

        } catch (error) {
            throw new Error(`Database check failed: ${error.message}`);
        }
    }

    async checkExternalAPIs() {
        try {
            const apiStatus = this.externalData.getApiStatus();
            const activeApis = Object.values(apiStatus).filter(status => status === true).length;
            const totalApis = Object.keys(apiStatus).length;

            if (activeApis === 0) {
                throw new Error('No external APIs are configured');
            }

            const issues = [];

            // Check specific APIs
            if (!process.env.OPENAI_API_KEY) {
                issues.push('OpenAI API key missing');
            }

            if (!process.env.FINANCIAL_MODELING_PREP_API_KEY) {
                issues.push('FMP API key missing');
            }

            if (issues.length > 0) {
                return {
                    message: `${activeApis}/${totalApis} APIs configured (Issues: ${issues.join(', ')})`
                };
            }

            return {
                message: `${activeApis}/${totalApis} APIs configured and ready`
            };

        } catch (error) {
            throw new Error(`External API check failed: ${error.message}`);
        }
    }

    async checkFileSystem() {
        const fs = require('fs').promises;
        const path = require('path');

        try {
            const directories = [
                'uploads',
                'reports',
                'charts',
                'logs'
            ];

            const dirStatus = [];

            for (const dir of directories) {
                try {
                    await fs.access(dir);
                    const stats = await fs.stat(dir);
                    dirStatus.push({
                        dir,
                        exists: true,
                        writable: stats.mode & 0o200
                    });
                } catch (error) {
                    if (error.code === 'ENOENT') {
                        // Try to create directory
                        try {
                            await fs.mkdir(dir, { recursive: true });
                            dirStatus.push({ dir, exists: true, writable: true, created: true });
                        } catch (createError) {
                            dirStatus.push({ dir, exists: false, writable: false, error: createError.message });
                        }
                    } else {
                        dirStatus.push({ dir, exists: true, writable: false, error: error.message });
                    }
                }
            }

            const workingDirs = dirStatus.filter(d => d.exists && d.writable).length;
            const issues = dirStatus.filter(d => !d.exists || !d.writable);

            if (issues.length > 0) {
                const issueMessages = issues.map(i => `${i.dir}: ${i.error || 'not writable'}`);
                return {
                    message: `${workingDirs}/${directories.length} directories OK (Issues: ${issueMessages.join(', ')})`
                };
            }

            return {
                message: `All ${directories.length} required directories are accessible and writable`
            };

        } catch (error) {
            throw new Error(`File system check failed: ${error.message}`);
        }
    }

    checkEnvironment() {
        const required = [
            'NODE_ENV',
            'PORT',
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY',
            'JWT_SECRET'
        ];

        const optional = [
            'OPENAI_API_KEY',
            'GEMINI_API_KEY',
            'FINANCIAL_MODELING_PREP_API_KEY',
            'ALPHA_VANTAGE_API_KEY',
            'PAYTABS_PROFILE_ID',
            'PAYTABS_SERVER_KEY'
        ];

        const missing = required.filter(key => !process.env[key]);
        const optionalMissing = optional.filter(key => !process.env[key]);

        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        let message = `All ${required.length} required variables set`;

        if (optionalMissing.length > 0) {
            message += `, ${optional.length - optionalMissing.length}/${optional.length} optional variables set`;
        }

        return { message };
    }

    checkResources() {
        const os = require('os');

        try {
            const totalMemory = os.totalmem();
            const freeMemory = os.freemem();
            const memoryUsage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();
            const uptime = process.uptime();

            const memoryUsedPercent = ((totalMemory - freeMemory) / totalMemory * 100).toFixed(1);
            const appMemoryMB = (memoryUsage.rss / 1024 / 1024).toFixed(1);
            const uptimeHours = (uptime / 3600).toFixed(1);

            // Check for potential issues
            const warnings = [];

            if (memoryUsedPercent > 90) {
                warnings.push('High system memory usage');
            }

            if (appMemoryMB > 1000) {
                warnings.push('High application memory usage');
            }

            if (freeMemory < 100 * 1024 * 1024) { // Less than 100MB free
                warnings.push('Low free memory');
            }

            let message = `Memory: ${memoryUsedPercent}% used, App: ${appMemoryMB}MB, Uptime: ${uptimeHours}h`;

            if (warnings.length > 0) {
                message += ` (Warnings: ${warnings.join(', ')})`;
            }

            return { message };

        } catch (error) {
            throw new Error(`Resource check failed: ${error.message}`);
        }
    }

    async checkRoutes() {
        const http = require('http');
        const https = require('https');

        try {
            const port = process.env.PORT || 3000;
            const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
            const hostname = process.env.BASE_URL || `http://localhost:${port}`;

            // Simple health endpoint check
            const healthUrl = `${hostname}/health`;

            return new Promise((resolve, reject) => {
                const client = protocol === 'https' ? https : http;

                const req = client.get(healthUrl, { timeout: 5000 }, (res) => {
                    if (res.statusCode === 200) {
                        resolve({ message: 'Health endpoint accessible' });
                    } else {
                        reject(new Error(`Health endpoint returned status ${res.statusCode}`));
                    }
                });

                req.on('error', (error) => {
                    if (error.code === 'ECONNREFUSED') {
                        reject(new Error('Application not running or not accessible'));
                    } else {
                        reject(new Error(`Route check failed: ${error.message}`));
                    }
                });

                req.on('timeout', () => {
                    req.destroy();
                    reject(new Error('Route check timed out'));
                });
            });

        } catch (error) {
            throw new Error(`Route check failed: ${error.message}`);
        }
    }

    async generateReport() {
        console.log('\n📊 Generating detailed health report...\n');

        const report = {
            timestamp: new Date().toISOString(),
            system: {
                platform: process.platform,
                nodeVersion: process.version,
                arch: process.arch,
                env: process.env.NODE_ENV
            },
            checks: {}
        };

        // Run individual checks and collect results
        const checks = [
            { name: 'database', check: () => this.checkDatabase() },
            { name: 'externalApis', check: () => this.checkExternalAPIs() },
            { name: 'fileSystem', check: () => this.checkFileSystem() },
            { name: 'environment', check: () => this.checkEnvironment() },
            { name: 'resources', check: () => this.checkResources() }
        ];

        for (const { name, check } of checks) {
            try {
                const result = await check();
                report.checks[name] = { status: 'healthy', ...result };
            } catch (error) {
                report.checks[name] = { status: 'unhealthy', error: error.message };
            }
        }

        console.log('Health Report:');
        console.log(JSON.stringify(report, null, 2));

        return report;
    }
}

// CLI interface
async function main() {
    const checker = new HealthChecker();
    const command = process.argv[2];

    try {
        switch (command) {
            case 'report':
                await checker.generateReport();
                break;

            case 'database':
                const dbResult = await checker.checkDatabase();
                console.log('✅ Database:', dbResult.message);
                break;

            case 'apis':
                const apiResult = await checker.checkExternalAPIs();
                console.log('✅ External APIs:', apiResult.message);
                break;

            case 'files':
                const fileResult = await checker.checkFileSystem();
                console.log('✅ File System:', fileResult.message);
                break;

            case 'env':
                const envResult = checker.checkEnvironment();
                console.log('✅ Environment:', envResult.message);
                break;

            case 'resources':
                const resourceResult = checker.checkResources();
                console.log('✅ Resources:', resourceResult.message);
                break;

            default:
                const isHealthy = await checker.runAllChecks();
                process.exit(isHealthy ? 0 : 1);
        }
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Health check script error:', error);
        process.exit(1);
    });
}

module.exports = HealthChecker;