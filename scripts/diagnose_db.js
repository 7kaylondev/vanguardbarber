const { createClient } = require('@supabase/supabase-js');

// Hardcoded for Diagnosis check only (from .env.local)
const SUPABASE_URL = 'https://zyqjvgwsbvoqrwljpawd.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
    console.error("Please set SUPABASE_SERVICE_ROLE_KEY env var (copy from .env.local)");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function diagnose() {
    console.log("--- 🕵️ DIAGNOSING LATEST DATA (ADMIN ACCESS) ---");

    // 1. Get Latest 3 Appointments
    const { data: appts, error } = await supabase
        .from('agendamentos')
        .select(`
            id, 
            date, 
            time, 
            client_name, 
            client_id, 
            barbershop_id, 
            owner_id,
            service_id,
            created_at
        `)
        .order('created_at', { ascending: false })
        .limit(3);

    if (error) {
        console.error("Error fetching appointments:", error);
        return;
    }

    console.log(`Found ${appts.length} recent appointments:`);

    for (const appt of appts) {
        console.log(`\n📅 Appt [${appt.date} ${appt.time}] - Client: ${appt.client_name}`);
        console.log(`   - ID: ${appt.id}`);
        console.log(`   - Service ID: ${appt.service_id}`);

        // CHECK PRODUCT / SERVICE
        if (appt.service_id) {
            const { data: prod, error: prodErr } = await supabase.from('products_v2').select('*').eq('id', appt.service_id).single();
            if (prod) {
                console.log(`   📦 Product Found: ${prod.name}`);
                console.log(`      - Product Owner ID: ${prod.owner_id || '❌ NULL'}`);

                // Owner Match?
                // Note: We need to know who the intended owner is.
                // We can infer from appt.owner_id
                if (appt.owner_id && prod.owner_id) {
                    console.log(`      - Product Owner Match? ${appt.owner_id === prod.owner_id ? '✅ YES' : '❌ NO'}`);
                }
            } else {
                console.log(`   ❌ Product ID ${appt.service_id} NOT FOUND in products_v2! (Err: ${prodErr?.message})`);
            }
        }

        console.log(`   - Barbershop ID: ${appt.barbershop_id}`);
        console.log(`   - Appt Owner ID: ${appt.owner_id || '❌ NULL'}`);

        // Fetch Shop to compare Owner
        if (appt.barbershop_id) {
            const { data: shop } = await supabase.from('barbershops').select('owner_id').eq('id', appt.barbershop_id).single();
            if (shop) {
                const match = shop.owner_id === appt.owner_id;
                console.log(`   - Shop Owner ID: ${shop.owner_id} ${match ? '✅ MATCH' : '❌ MISMATCH'}`);
            }
        }

        console.log(`   - Client ID: ${appt.client_id}`);

        // 2. Check the Linked Client
        if (appt.client_id) {
            const { data: client } = await supabase
                .from('clients')
                .select('*')
                .eq('id', appt.client_id)
                .single();

            if (client) {
                console.log(`   👤 Linked Client: ${client.name}`);
                console.log(`      - ID: ${client.id}`);
                console.log(`      - Barbershop ID: ${client.barbershop_id}`);
                console.log(`      - Client Owner ID: ${client.owner_id || '❌ NULL'}`);

                // Check if Client Owner matches Shop Owner
                if (appt.barbershop_id) {
                    const { data: shop } = await supabase.from('barbershops').select('owner_id').eq('id', appt.barbershop_id).single();
                    if (shop) {
                        const match = shop.owner_id === client.owner_id;
                        console.log(`      - Client vs Shop Owner: ${match ? '✅ MATCH' : '❌ MISMATCH'}`);
                    }
                }
                console.log(`      - Auth User ID: ${client.auth_user_id || 'null (Guest)'}`);
            } else {
                console.log(`   ❌ Client ID ${appt.client_id} NOT FOUND in clients table!`);
            }
        }
    }
}

diagnose();
