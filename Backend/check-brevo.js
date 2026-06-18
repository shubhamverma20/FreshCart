const { BrevoClient } = require('@getbrevo/brevo');
require('dotenv').config();

async function testBrevoConnection() {
  console.log("=========================================");
  console.log("🔍 Checking Brevo API Status...");
  console.log("=========================================");

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL;
  const senderName = process.env.SENDER_NAME;

  console.log(`- Configured Sender Email: ${senderEmail || 'Not defined'}`);
  console.log(`- Configured Sender Name:  ${senderName || 'Not defined'}`);

  if (!apiKey) {
    console.error("❌ ERROR: BREVO_API_KEY is not defined in your .env file.");
    console.log("\n💡 Solution: Add BREVO_API_KEY=your_real_api_key to Backend/.env");
    return;
  }

  if (apiKey === 'your_api_key') {
    console.error("❌ ERROR: BREVO_API_KEY is set to the default placeholder 'your_api_key'.");
    console.log("\n💡 Solution: Please replace the placeholder in Backend/.env with your actual Brevo API Key.");
    return;
  }

  // Mask the API key for security logging
  const maskedKey = apiKey.length > 10 
    ? `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}` 
    : '***';
  console.log(`- API Key Detected: ${maskedKey}`);

  console.log("\n⏳ Initializing Brevo Client and testing authentication...");
  try {
    const brevoClient = new BrevoClient({ apiKey });
    
    // Call the account API to verify the key and get details
    console.log("⏳ Fetching Brevo account details...");
    const accountInfo = await brevoClient.account.getAccount();
    
    console.log("\n✅ SUCCESS: Brevo API connection is working!");
    console.log("-----------------------------------------");
    console.log(`- Account Email: ${accountInfo.email}`);
    console.log(`- Name:          ${accountInfo.firstName} ${accountInfo.lastName}`);
    console.log(`- Company:       ${accountInfo.companyName || 'N/A'}`);
    
    if (accountInfo.plan && accountInfo.plan.length > 0) {
      console.log("- Plan Details:");
      accountInfo.plan.forEach(p => {
        console.log(`  • Type: ${p.type}, Credits: ${p.credits}, Start: ${p.startDate || 'N/A'}`);
      });
    }
    console.log("-----------------------------------------");
    console.log("🚀 You are ready to send transactional emails!");

  } catch (error) {
    console.error("\n❌ ERROR: Failed to connect to Brevo API.");
    console.error(`- Error Message: ${error.message || error}`);
    
    if (error.response && error.response.body) {
      console.error("- Details from Brevo API:");
      console.error(JSON.stringify(error.response.body, null, 2));
    } else if (error.status) {
      console.error(`- HTTP Status Code: ${error.status}`);
    }
    
    console.log("\n💡 Troubleshooting Tips:");
    console.log("1. Check if your API Key in Backend/.env is correct and active.");
    console.log("2. Ensure your Brevo account is active and not suspended.");
    console.log("3. Verify your internet connection.");
  }
}

testBrevoConnection();
