const fs = require('fs');
const p = 'c:/Users/irina/OneDrive/Desktop/safetytrainingacademy/safetytrainingacademy/trainingAcademy-backend/controllers/bookingEmailController.js';
let c = fs.readFileSync(p, 'utf8');

// Function to add sleep between sendEmail calls
const addDelay = (functionName) => {
    const start = c.indexOf(`const ${functionName} = async`);
    if (start === -1) return;
    
    // Find the try block inside this function
    const tryIdx = c.indexOf('try {', start);
    const endFunc = c.indexOf('};', start);
    
    if (tryIdx > -1 && tryIdx < endFunc) {
        const tryBlockEnd = c.indexOf('if (res) res.status(200)', tryIdx);
        if (tryBlockEnd === -1) return;
        
        // Find the first and second sendEmail calls
        const firstSend = c.indexOf('await sendEmail', tryIdx);
        const secondSend = c.indexOf('await sendEmail', firstSend + 10);
        
        if (firstSend > -1 && secondSend > -1 && secondSend < endFunc) {
            // Find the end of the line for the first send
            const firstSendEnd = c.indexOf(';', firstSend);
            if (firstSendEnd > -1) {
                const before = c.substring(0, firstSendEnd + 1);
                const after = c.substring(firstSendEnd + 1);
                c = before + '\n\n        // ⏳ Short sleep to avoid "Too fast" SMTP error\n        await sleep(2500);\n' + after;
            }
        }
    }
};

addDelay('sendLLNCompletionNotification');
addDelay('sendEnrollmentFormCompletionNotification');
addDelay('sendCompanyCardPayment');

fs.writeFileSync(p, c, 'utf8');
console.log('Successfully added delays to prevent rate limits.');
