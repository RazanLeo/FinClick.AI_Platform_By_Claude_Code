const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../lib/supabase');

async function executeSqlFile(filePath) {
    try {
        console.log('Reading SQL file:', filePath);
        const sqlContent = fs.readFileSync(filePath, 'utf8');

        // Split the content by semicolons to handle multiple statements
        const statements = sqlContent.split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`Found ${statements.length} SQL statements to execute`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    console.log(`Executing statement ${i + 1}/${statements.length}...`);

                    // Execute raw SQL using supabase
                    const { data, error } = await supabaseAdmin.rpc('execute_sql', {
                        sql_statement: statement
                    });

                    if (error) {
                        console.error(`Error in statement ${i + 1}:`, error);
                        errorCount++;
                    } else {
                        successCount++;
                    }
                } catch (err) {
                    console.error(`Exception in statement ${i + 1}:`, err.message);
                    errorCount++;
                }
            }
        }

        console.log(`\nExecution completed:`);
        console.log(`- Successful statements: ${successCount}`);
        console.log(`- Failed statements: ${errorCount}`);

        if (errorCount > 0) {
            console.log('\nAttempting alternative approach with direct queries...');
            await executeSqlDirect(sqlContent);
        }

    } catch (error) {
        console.error('Error executing SQL file:', error);
    }
}

async function executeSqlDirect(sqlContent) {
    try {
        // Try to execute specific parts directly

        // 1. Create tables if they don't exist
        if (sqlContent.includes('CREATE TABLE IF NOT EXISTS company_sectors')) {
            console.log('Creating company_sectors table...');
            // Table creation should already be handled by migration
        }

        // 2. Clear existing data
        console.log('Clearing existing data...');
        await supabaseAdmin.from('company_activities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabaseAdmin.from('company_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabaseAdmin.from('legal_entities').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 3. Insert sectors
        console.log('Inserting sectors...');
        const sectors = [
            {
                name_en: 'Energy and Natural Resources',
                name_ar: 'قطاع الطاقة والموارد الطبيعية',
                code: 'ENERGY',
                description_en: 'Oil, gas, renewable energy, nuclear power, hydrogen energy',
                description_ar: 'النفط والغاز والطاقة المتجددة والطاقة النووية وطاقة الهيدروجين'
            },
            {
                name_en: 'Basic Materials and Chemicals',
                name_ar: 'قطاع المواد الأساسية والكيماويات',
                code: 'CHEMICALS',
                description_en: 'Basic chemicals, petrochemicals, specialized chemicals, plastics, polymers',
                description_ar: 'الكيماويات الأساسية والبتروكيماويات والكيماويات المتخصصة والبلاستيك والبوليمرات'
            },
            {
                name_en: 'Mining and Metals',
                name_ar: 'قطاع التعدين والمعادن',
                code: 'MINING',
                description_en: 'Precious metals, base metals, iron and steel, rare earth minerals, quarrying',
                description_ar: 'المعادن الثمينة والمعادن الأساسية والحديد والصلب والمعادن النادرة والمحاجر'
            },
            {
                name_en: 'Financial and Banking',
                name_ar: 'القطاع المالي والمصرفي',
                code: 'FINANCE',
                description_en: 'Commercial banks, Islamic banks, investment banks, insurance, fintech',
                description_ar: 'البنوك التجارية والبنوك الإسلامية وبنوك الاستثمار والتأمين والتكنولوجيا المالية'
            },
            {
                name_en: 'Healthcare',
                name_ar: 'قطاع الرعاية الصحية',
                code: 'HEALTHCARE',
                description_en: 'Hospitals, clinics, pharmaceuticals, biotechnology, medical devices',
                description_ar: 'المستشفيات والعيادات والأدوية والتكنولوجيا الحيوية والأجهزة الطبية'
            }
        ];

        const { data: insertedSectors, error: sectorError } = await supabaseAdmin
            .from('company_sectors')
            .insert(sectors)
            .select();

        if (sectorError) {
            console.error('Error inserting sectors:', sectorError);
        } else {
            console.log(`Successfully inserted ${insertedSectors.length} sectors`);
        }

        // 4. Insert some sample activities
        if (insertedSectors && insertedSectors.length > 0) {
            console.log('Inserting sample activities...');
            const activities = [
                {
                    sector_id: insertedSectors[0].id, // Energy
                    name_en: 'Oil and Gas Exploration',
                    name_ar: 'استكشاف النفط والغاز',
                    code: 'OIL_EXPLOR',
                    description_en: 'Oil and gas exploration and production',
                    description_ar: 'استكشاف وإنتاج النفط والغاز'
                },
                {
                    sector_id: insertedSectors[1].id, // Chemicals
                    name_en: 'Basic Chemicals Manufacturing',
                    name_ar: 'تصنيع الكيماويات الأساسية',
                    code: 'BASIC_CHEM',
                    description_en: 'Production of basic chemical compounds',
                    description_ar: 'إنتاج المركبات الكيماوية الأساسية'
                }
            ];

            const { data: insertedActivities, error: activityError } = await supabaseAdmin
                .from('company_activities')
                .insert(activities)
                .select();

            if (activityError) {
                console.error('Error inserting activities:', activityError);
            } else {
                console.log(`Successfully inserted ${insertedActivities.length} activities`);
            }
        }

        // 5. Insert legal entities
        console.log('Inserting legal entities...');
        const legalEntities = [
            {
                name_en: 'Limited Liability Company',
                name_ar: 'الشركة ذات المسؤولية المحدودة',
                code: 'LLC',
                description_en: 'Limited liability company',
                description_ar: 'شركة ذات المسؤولية المحدودة'
            },
            {
                name_en: 'Public Joint Stock Company',
                name_ar: 'شركة المساهمة العامة',
                code: 'PJSC',
                description_en: 'Publicly traded joint stock company',
                description_ar: 'شركة مساهمة عامة متداولة'
            },
            {
                name_en: 'Private Joint Stock Company',
                name_ar: 'شركة المساهمة الخاصة',
                code: 'PRJSC',
                description_en: 'Private joint stock company',
                description_ar: 'شركة مساهمة خاصة'
            },
            {
                name_en: 'Sole Proprietorship',
                name_ar: 'المؤسسة الفردية',
                code: 'SP',
                description_en: 'Individual business establishment',
                description_ar: 'مؤسسة فردية للأعمال'
            }
        ];

        const { data: insertedEntities, error: entityError } = await supabaseAdmin
            .from('legal_entities')
            .insert(legalEntities)
            .select();

        if (entityError) {
            console.error('Error inserting legal entities:', entityError);
        } else {
            console.log(`Successfully inserted ${insertedEntities.length} legal entities`);
        }

        console.log('\nSample data insertion completed successfully!');

    } catch (error) {
        console.error('Error in direct execution:', error);
    }
}

// Get the SQL file path from command line arguments
const sqlFilePath = process.argv[2];

if (!sqlFilePath) {
    console.error('Please provide a SQL file path as an argument');
    console.error('Usage: node execute_sql.js <path-to-sql-file>');
    process.exit(1);
}

const fullPath = path.resolve(sqlFilePath);

if (!fs.existsSync(fullPath)) {
    console.error(`SQL file not found: ${fullPath}`);
    process.exit(1);
}

executeSqlFile(fullPath)
    .then(() => {
        console.log('SQL execution script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });