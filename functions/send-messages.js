exports.handler = async function (context, event, callback) {
  const { templateSid, csvData } = event;

  if (!templateSid || !csvData) {
    return callback(null, { success: false, error: 'Missing templateSid or csvData' });
  }

  const rows = typeof csvData === 'string' ? JSON.parse(csvData) : csvData;
  const firstRow = rows[0];

  if (!firstRow) {
    return callback(null, { success: false, error: 'CSV has no data rows' });
  }

  const contentVariables = {};
  for (const key of Object.keys(firstRow)) {
    if (key !== 'phone_number') {
      contentVariables[key] = firstRow[key];
    }
  }

  const demoNumbers = [context.DEMO_PHONE_NUMBER_1, context.DEMO_PHONE_NUMBER_2].filter(Boolean);
  const results = [];
  const client = context.getTwilioClient();

  for (const demoNumber of demoNumbers) {
    try {
      const message = await client.messages.create({
        to: demoNumber,
        messagingServiceSid: context.MESSAGING_SERVICE_SID,
        contentSid: templateSid,
        contentVariables: JSON.stringify(contentVariables)
      });
      results.push({ to: demoNumber, success: true, messageSid: message.sid });
    } catch (err) {
      results.push({ to: demoNumber, success: false, error: err.message });
    }
  }

  const allSucceeded = results.every((r) => r.success);
  callback(null, { success: allSucceeded, results });
};
