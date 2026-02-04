
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zyqjvgwsbvoqrwljpawd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error("❌ MISSING SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspect() {
    console.log("🔍 Inspecting 'agendamentos' table columns...");

    const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .limit(1);

    if (error) {
        console.error("❌ Error:", error);
        return;
    }

    if (data && data.length > 0) {
        console.log("✅ Columns found:");
        console.log(Object.keys(data[0]));
        console.log("\nSample Row:", data[0]);
    } else {
        console.log("⚠️ Table is empty, cannot infer columns from data.");
    }
}

inspect();
