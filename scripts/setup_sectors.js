// Simple script to add sectors, activities, and legal entities
// This script uses static data instead of reading from SQL file

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'your_supabase_url';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_role_key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSectorsAndActivities() {
    try {
        console.log('Setting up sectors, activities, and legal entities...');

        // 1. Clear existing data
        console.log('Clearing existing data...');
        await supabase.from('company_activities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('company_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('legal_entities').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 2. Insert comprehensive sectors
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
                name_en: 'Manufacturing Industries',
                name_ar: 'قطاع الصناعات التحويلية',
                code: 'MANUFACTURING',
                description_en: 'Automotive, heavy industries, electronics, electrical industries, aerospace',
                description_ar: 'صناعة السيارات والصناعات الثقيلة والإلكترونيات والصناعات الكهربائية والطيران والفضاء'
            },
            {
                name_en: 'Food and Beverages',
                name_ar: 'قطاع الأغذية والمشروبات',
                code: 'FOOD_BEVERAGE',
                description_en: 'Food processing, meat, dairy, bakery, beverages, tobacco',
                description_ar: 'تصنيع الأغذية واللحوم والألبان والمخبوزات والمشروبات والتبغ'
            },
            {
                name_en: 'Agriculture and Livestock',
                name_ar: 'قطاع الزراعة والثروة الحيوانية',
                code: 'AGRICULTURE',
                description_en: 'Crops, vegetables, fruits, livestock, poultry, aquaculture, beekeeping',
                description_ar: 'المحاصيل والخضروات والفواكه والماشية والدواجن والاستزراع المائي والنحل'
            },
            {
                name_en: 'Financial and Banking',
                name_ar: 'القطاع المالي والمصرفي',
                code: 'FINANCE',
                description_en: 'Commercial banks, Islamic banks, investment banks, insurance, fintech',
                description_ar: 'البنوك التجارية والبنوك الإسلامية وبنوك الاستثمار والتأمين والتكنولوجيا المالية'
            },
            {
                name_en: 'Real Estate and Construction',
                name_ar: 'قطاع العقارات والإنشاءات',
                code: 'REAL_ESTATE',
                description_en: 'Residential development, commercial development, property management, contracting',
                description_ar: 'التطوير العقاري السكني والتجاري وإدارة الممتلكات والمقاولات'
            },
            {
                name_en: 'Trade and Retail',
                name_ar: 'قطاع التجارة والتجزئة',
                code: 'TRADE_RETAIL',
                description_en: 'Major retailers, specialized chains, e-commerce, wholesale, international trade',
                description_ar: 'متاجر التجزئة الكبرى والسلاسل المتخصصة والتجارة الإلكترونية وتجارة الجملة والتجارة الدولية'
            },
            {
                name_en: 'Healthcare',
                name_ar: 'قطاع الرعاية الصحية',
                code: 'HEALTHCARE',
                description_en: 'Hospitals, clinics, pharmaceuticals, biotechnology, medical devices',
                description_ar: 'المستشفيات والعيادات والأدوية والتكنولوجيا الحيوية والأجهزة الطبية'
            },
            {
                name_en: 'Communications and Information Technology',
                name_ar: 'قطاع الاتصالات وتكنولوجيا المعلومات',
                code: 'TELECOM_IT',
                description_en: 'Telecommunications, internet services, software development, cloud services',
                description_ar: 'الاتصالات وخدمات الإنترنت وتطوير البرمجيات والخدمات السحابية'
            },
            {
                name_en: 'Artificial Intelligence and Machine Learning',
                name_ar: 'الذكاء الاصطناعي والتعلم الآلي',
                code: 'AI_ML',
                description_en: 'NLP, computer vision, generative AI, machine learning, chatbots, automation',
                description_ar: 'معالجة اللغات الطبيعية ورؤية الحاسوب والذكاء الاصطناعي التوليدي والتعلم الآلي والدردشة الآلية والأتمتة'
            },
            {
                name_en: 'Education and Training',
                name_ar: 'قطاع التعليم والتدريب',
                code: 'EDUCATION',
                description_en: 'Basic education, higher education, vocational training, e-learning',
                description_ar: 'التعليم الأساسي والتعليم العالي والتدريب المهني والتعليم الإلكتروني'
            },
            {
                name_en: 'Transportation and Logistics',
                name_ar: 'قطاع النقل واللوجستيات',
                code: 'TRANSPORT',
                description_en: 'Air transport, sea transport, land transport, railways, logistics services',
                description_ar: 'النقل الجوي والبحري والبري والسكك الحديدية والخدمات اللوجستية'
            },
            {
                name_en: 'Tourism and Hospitality',
                name_ar: 'قطاع السياحة والضيافة',
                code: 'TOURISM',
                description_en: 'Hotels and resorts, restaurants, travel agencies, tourism transport',
                description_ar: 'الفنادق والمنتجعات والمطاعم ووكالات السفر والنقل السياحي'
            }
        ];

        const { data: insertedSectors, error: sectorError } = await supabase
            .from('company_sectors')
            .insert(sectors)
            .select();

        if (sectorError) {
            console.error('Error inserting sectors:', sectorError);
            return;
        }

        console.log(`Successfully inserted ${insertedSectors.length} sectors`);

        // 3. Insert activities for some sectors
        console.log('Inserting activities...');
        const energySector = insertedSectors.find(s => s.code === 'ENERGY');
        const financeSector = insertedSectors.find(s => s.code === 'FINANCE');
        const healthcareSector = insertedSectors.find(s => s.code === 'HEALTHCARE');

        const activities = [];

        if (energySector) {
            activities.push(
                {
                    sector_id: energySector.id,
                    name_en: 'Oil and Gas Exploration',
                    name_ar: 'استكشاف النفط والغاز',
                    code: 'OIL_EXPLOR',
                    description_en: 'Oil and gas exploration and production',
                    description_ar: 'استكشاف وإنتاج النفط والغاز'
                },
                {
                    sector_id: energySector.id,
                    name_en: 'Oil Refining',
                    name_ar: 'تكرير النفط',
                    code: 'OIL_REFINE',
                    description_en: 'Oil refining and processing',
                    description_ar: 'تكرير ومعالجة النفط'
                },
                {
                    sector_id: energySector.id,
                    name_en: 'Solar Energy',
                    name_ar: 'الطاقة الشمسية',
                    code: 'SOLAR',
                    description_en: 'Solar energy generation and systems',
                    description_ar: 'توليد وأنظمة الطاقة الشمسية'
                }
            );
        }

        if (financeSector) {
            activities.push(
                {
                    sector_id: financeSector.id,
                    name_en: 'Commercial Banking',
                    name_ar: 'الخدمات المصرفية التجارية',
                    code: 'COMM_BANK',
                    description_en: 'Commercial banking services',
                    description_ar: 'الخدمات المصرفية التجارية'
                },
                {
                    sector_id: financeSector.id,
                    name_en: 'Investment Banking',
                    name_ar: 'الخدمات المصرفية الاستثمارية',
                    code: 'INV_BANK',
                    description_en: 'Investment banking and capital markets',
                    description_ar: 'الخدمات المصرفية الاستثمارية وأسواق رأس المال'
                },
                {
                    sector_id: financeSector.id,
                    name_en: 'Insurance Services',
                    name_ar: 'خدمات التأمين',
                    code: 'INSURANCE',
                    description_en: 'Insurance and reinsurance services',
                    description_ar: 'خدمات التأمين وإعادة التأمين'
                }
            );
        }

        if (healthcareSector) {
            activities.push(
                {
                    sector_id: healthcareSector.id,
                    name_en: 'Hospital Services',
                    name_ar: 'الخدمات المستشفيات',
                    code: 'HOSPITAL',
                    description_en: 'Hospital and medical center services',
                    description_ar: 'خدمات المستشفيات والمراكز الطبية'
                },
                {
                    sector_id: healthcareSector.id,
                    name_en: 'Pharmaceutical Manufacturing',
                    name_ar: 'تصنيع الأدوية',
                    code: 'PHARMA',
                    description_en: 'Pharmaceutical drug manufacturing',
                    description_ar: 'تصنيع الأدوية والعقاقير'
                }
            );
        }

        if (activities.length > 0) {
            const { data: insertedActivities, error: activityError } = await supabase
                .from('company_activities')
                .insert(activities)
                .select();

            if (activityError) {
                console.error('Error inserting activities:', activityError);
            } else {
                console.log(`Successfully inserted ${insertedActivities.length} activities`);
            }
        }

        // 4. Insert legal entities
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
                name_en: 'Single Person Company',
                name_ar: 'شركة الشخص الواحد',
                code: 'SPC',
                description_en: 'Single person limited liability company',
                description_ar: 'شركة شخص واحد ذات مسؤولية محدودة'
            },
            {
                name_en: 'Sole Proprietorship',
                name_ar: 'المؤسسة الفردية',
                code: 'SP',
                description_en: 'Individual business establishment',
                description_ar: 'مؤسسة فردية للأعمال'
            },
            {
                name_en: 'General Partnership',
                name_ar: 'شركة التضامن',
                code: 'GP',
                description_en: 'General partnership where all partners have unlimited liability',
                description_ar: 'شركة التضامن حيث جميع الشركاء مسؤولية غير محدودة'
            },
            {
                name_en: 'Simple Limited Partnership',
                name_ar: 'شركة التوصية البسيطة',
                code: 'SLP',
                description_en: 'Partnership with general and limited partners',
                description_ar: 'شركة توصية بشركاء متضامنين وموصين'
            },
            {
                name_en: 'Simplified Joint Stock Company',
                name_ar: 'شركة مساهمة مبسطة',
                code: 'SJSC',
                description_en: 'Simplified joint stock company under Saudi law',
                description_ar: 'شركة مساهمة مبسطة وفق النظام السعودي'
            },
            {
                name_en: 'Joint Venture Company',
                name_ar: 'شركة المحاصة',
                code: 'JV',
                description_en: 'Joint venture company for specific projects',
                description_ar: 'شركة محاصة للمشاريع المحددة'
            },
            {
                name_en: 'Holding Company',
                name_ar: 'الشركة القابضة',
                code: 'HOLDING',
                description_en: 'Parent company holding subsidiaries',
                description_ar: 'شركة أم تملك شركات تابعة'
            },
            {
                name_en: 'Subsidiary Company',
                name_ar: 'الشركة التابعة',
                code: 'SUBSIDIARY',
                description_en: 'Company owned by parent company',
                description_ar: 'شركة مملوكة لشركة أم'
            },
            {
                name_en: 'Non-Profit Organization',
                name_ar: 'منظمة غير ربحية',
                code: 'NPO',
                description_en: 'Non-profit organization',
                description_ar: 'منظمة غير ربحية'
            }
        ];

        const { data: insertedEntities, error: entityError } = await supabase
            .from('legal_entities')
            .insert(legalEntities)
            .select();

        if (entityError) {
            console.error('Error inserting legal entities:', entityError);
        } else {
            console.log(`Successfully inserted ${insertedEntities.length} legal entities`);
        }

        console.log('\n✅ Setup completed successfully!');
        console.log(`📊 Total sectors: ${insertedSectors.length}`);
        console.log(`🏢 Total activities: ${activities.length}`);
        console.log(`⚖️ Total legal entities: ${legalEntities.length}`);

    } catch (error) {
        console.error('❌ Error during setup:', error);
    }
}

// Check if this is run directly
if (require.main === module) {
    setupSectorsAndActivities()
        .then(() => {
            console.log('Script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = { setupSectorsAndActivities };