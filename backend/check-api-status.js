async function checkApi() {
    const url = "https://ihjrcrcxzmvwrqcmfgam.supabase.co/rest/v1/photos";
    const key = "sb_publishable_tEfZHj4UYp0JAMpR-kggBg_7";

    console.log(`Checking API: ${url}`);
    try {
        const response = await fetch(url, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });

        console.log(`Status: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            console.log("✅ API is active!");
            console.log("Photos found:", data.length);
        } else {
            const errText = await response.text();
            console.error("❌ API returned error:", errText);
        }
    } catch (err) {
        console.error("❌ API check failed:", err.message);
    }
}

checkApi();
