import { execSync } from 'child_process';

try {
    const result = execSync('docker exec scrapperplanning-db psql -U scrapper -d scrapperplanning -t -c "SELECT count(*) FROM \\"PlanningEvents\\";"', { encoding: 'utf8' });
    console.log('Count:', result.trim());
} catch (err) {
    console.error('Error:', err.message);
}
