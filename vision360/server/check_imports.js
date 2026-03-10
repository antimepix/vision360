const routes = [
    "./app.js",
    "./src/db.js",
    "./src/routes/dbTest.js",
    "./src/routes/resources.js",
    "./src/routes/students.js",
    "./src/routes/events.js",
    "./src/routes/exportData.js",
    "./src/routes/auth.js",
    "./src/routes/importOutlook.js"
];

async function check() {
    for (const r of routes) {
        try {
            await import(r);
            console.log(`✅ OK: ${r}`);
        } catch (err) {
            if (err.code === 'ERR_MODULE_NOT_FOUND') {
                console.log(`❌ FAIL: ${r} - ${err.message}`);
            } else {
                console.log(`⚠️ OTHER ERROR in ${r}: ${err.message}`);
            }
        }
    }
}

check();
