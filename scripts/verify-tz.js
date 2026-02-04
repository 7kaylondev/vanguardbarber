
const { toZonedTime, formatInTimeZone } = require('date-fns-tz');
const { format } = require('date-fns');

const TIMEZONE = 'America/Sao_Paulo';

console.log('--- Timezone Logic Verification ---');

// 1. Simulate "Current Time" (Server might be UTC)
const nowServer = new Date();
console.log('Server Time (UTC?):', nowServer.toISOString());

// 2. Convert to BRL
const nowBrl = toZonedTime(nowServer, TIMEZONE);
console.log('BRL Time (Object):', nowBrl.toString());
console.log('BRL Time (Formatted):', format(nowBrl, 'yyyy-MM-dd HH:mm:ss'));

// 3. Test "Today" String Generation
const todayStr = format(nowBrl, 'yyyy-MM-dd');
console.log('Today String (BRL):', todayStr);

// 4. Test Query Range Generation (The logic I implemented)
const startIso = `${todayStr}T00:00:00-03:00`;
const endIso = `${todayStr}T23:59:59-03:00`;

console.log('Query Start ISO:', startIso);
console.log('Query End ISO:  ', endIso);

// 5. Verify Postgres Interpretation (Simulation)
// If Postgres receives '2023-10-05T00:00:00-03:00', it converts to UTC for storage/comparison?
// 00:00-03:00 should be 03:00 UTC.
const dStart = new Date(startIso);
console.log('JS Date from Start ISO (UTC):', dStart.toISOString());

const dEnd = new Date(endIso);
console.log('JS Date from End ISO (UTC):  ', dEnd.toISOString());

// Assertion
const expectedStartHourUtc = 3; // 00:00 BRL is 03:00 UTC
if (dStart.getUTCHours() === expectedStartHourUtc) {
    console.log('SUCCESS: Start Query maps to 03:00 UTC (Correct for BRL 00:00)');
} else {
    console.error(`FAILURE: Start Query maps to ${dStart.getUTCHours()}:00 UTC. Expected 03:00.`);
}

// 6. Test Display Formatting Logic
// Input: UTC string from DB representing 2023-10-05 21:00:00 BRL -> 2023-10-06 00:00:00 UTC
const mockDbValue = '2023-10-06T00:00:00Z'; // This is 21:00 previous day BRL
const display = formatInTimeZone(mockDbValue, TIMEZONE, 'dd/MM HH:mm');
console.log(`Display Test: DB ${mockDbValue} -> BRL ${display}`);

if (display.includes('21:00')) {
    console.log('SUCCESS: Display Correctly shifts UTC back to BRL');
} else {
    console.error('FAILURE: Display did not shift correctly');
}
