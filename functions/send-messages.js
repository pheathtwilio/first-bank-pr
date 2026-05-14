exports.handler = async function (context, event, callback) {
  const { templateSid, csvData } = event;

  if (!templateSid || !csvData) {
    return callback(null, { success: false, error: 'Missing templateSid or csvData' });
  }

  const rows = typeof csvData === 'string' ? JSON.parse(csvData) : csvData;

  if (!rows.length) {
    return callback(null, { success: false, error: 'CSV has no data rows' });
  }

  const demoNumbers = [context.DEMO_PHONE_NUMBER_1, context.DEMO_PHONE_NUMBER_2].filter(Boolean);
  const results = [];
  const client = context.getTwilioClient();

  for (let i = 0; i < demoNumbers.length; i++) {
    const row = rows[i] || rows[0];
    const contentVariables = {};
    for (const key of Object.keys(row)) {
      if (key !== 'phone_number') {
        contentVariables[key] = row[key];
      }
    }

    try {
      const message = await client.messages.create({
        to: demoNumbers[i],
        messagingServiceSid: context.MESSAGING_SERVICE_SID,
        contentSid: templateSid,
        contentVariables: JSON.stringify(contentVariables)
      });
      results.push({ to: demoNumbers[i], success: true, messageSid: message.sid });
    } catch (err) {
      results.push({ to: demoNumbers[i], success: false, error: err.message });
    }
  }

  const allSucceeded = results.every((r) => r.success);
  callback(null, { success: allSucceeded, results });
};
