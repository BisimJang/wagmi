const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/Jason/Desktop/wagmi/wagmi-dapp/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const f of files) {
    if (f.includes('HomePage') || f.includes('PricingPage') || f.includes('PaymentSuccess')) {
        continue;
    }
    
    let c = fs.readFileSync(path.join(dir, f), 'utf8');
    
    // Convert text
    c = c.replace(/color:\s*'#fff'/g, "color: '#111'");
    // Convert glass backgrounds
    c = c.replace(/background:\s*'rgba\(255,\s*255,\s*255,\s*0\.[0-9]+\)'/g, "background: '#fff'");
    // Convert glass borders
    c = c.replace(/border:\s*'1px solid rgba\(255,\s*255,\s*255,\s*0\.1\)'/g, "border: '1px solid #e5e7eb'");
    
    fs.writeFileSync(path.join(dir, f), c);
}
console.log('Conversion complete');
