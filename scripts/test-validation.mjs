
async function testApi(endpoint, testName, payload, expectFail = true) {
    try {
        const res = await fetch(`http://localhost:3000/api/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (expectFail) {
            if (res.status === 400 || res.status === 500) {
                console.log(`✅ [PASS] ${testName} - Successfully rejected. Error: ${data.error}`);
                return true;
            } else {
                console.log(`❌ [FAIL] ${testName} - Was not rejected! Status: ${res.status}`);
                return false;
            }
        } else {
            if (res.status === 201 || res.status === 200) {
                console.log(`✅ [PASS] ${testName} - Successfully accepted!`);
                return true;
            } else {
                console.log(`❌ [FAIL] ${testName} - Was rejected unexpectedly! Error: ${data.error}`);
                return false;
            }
        }
    } catch (err) {
        console.error(`💥 [ERROR] ${testName} - Fetch failed: ${err.message}`);
        return false;
    }
}

async function runTests() {
    console.log("=== RUNNING VALIDATION TESTS ===\n");
    let passed = 0;
    let total = 0;

    const validBrandPayload = {
        name: "Golden Coffee",
        company: "Golden Co",
        email: "test@example.com",
        phone: "1234567890",
        password: "Password123#",
        pincode: "160000",
        investment_range: "Rs. 10 Lakh - 20 Lakh",
        max_investment_limit: "Rs. 20 Lakh - 30 Lakh",
        minInvestment: 1000000,
        maxInvestment: 2000000
    };

    const validInvestorPayload = {
        name: "John Investor",
        email: "john@example.com",
        phone: "1234567890",
        password: "Password123#",
        pincode: "160000",
        investment_range: "Rs. 2 Lakh - 5 Lakh",
        max_investment_limit: "Rs. 5 Lakh - 10 Lakh",
        budgetMin: 200000,
        budgetMax: 500000
    };

    // T1: 9-digit phone
    total++;
    if (await testApi('brands', 'T1: 9-digit phone number', { ...validBrandPayload, phone: '123456789' }, true)) passed++;

    // T2: 11-digit phone
    total++;
    if (await testApi('brands', 'T2: 11-digit phone number', { ...validBrandPayload, phone: '12345678901' }, true)) passed++;

    // T3: 5-digit pincode
    total++;
    if (await testApi('investors', 'T3: 5-digit pincode', { ...validInvestorPayload, pincode: '16000' }, true)) passed++;

    // T4: Invalid email
    total++;
    if (await testApi('brands', 'T4: Invalid email', { ...validBrandPayload, email: 'vishal@' }, true)) passed++;

    // T5: 5-character password
    total++;
    if (await testApi('investors', 'T5: 5-character password', { ...validInvestorPayload, password: '12345' }, true)) passed++;

    // T6: Max Investment < Min Investment
    total++;
    if (await testApi('brands', 'T6: Max < Min Investment', { ...validBrandPayload, minInvestment: 1000000, maxInvestment: 500000 }, true)) passed++;

    // T7: Empty fields
    total++;
    if (await testApi('investors', 'T7: Empty required fields', {}, true)) passed++;

    // T8: Valid Brand
    total++;
    if (await testApi('brands', 'T8: Valid Brand Registration', validBrandPayload, false)) passed++;

    // T9: Valid Investor
    total++;
    if (await testApi('investors', 'T9: Valid Investor Registration', validInvestorPayload, false)) passed++;

    console.log(`\n=== RESULTS: ${passed}/${total} TESTS PASSED ===`);
}

runTests();
