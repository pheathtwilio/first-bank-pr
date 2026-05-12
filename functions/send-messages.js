exports.handler = async function (context, event, callback) {
  const { templateSid, csvData } = event;

  if (!templateSid || !csvData) {
    return callback(null, { success: false, error: 'Missing templateSid or csvData' });
  }

  const rows = typeof csvData === 'string' ? JSON.parse(csvData) : csvData;
  const demoNumber = context.DEMO_PHONE_NUMBER;

  const matchedRow = rows.find((row) => row.phone_number === demoNumber) || rows[0];

  const contentVariables = {};
  for (const key of Object.keys(matchedRow)) {
    if (key !== 'phone_number') {
      contentVariables[key] = matchedRow[key];
    }
  }

  try {
    const client = context.getTwilioClient();
    const message = await client.messages.create({
      to: demoNumber,
      messagingServiceSid: context.MESSAGING_SERVICE_SID,
      contentSid: templateSid,
      contentVariables: JSON.stringify(contentVariables)
    });

    callback(null, { success: true, messageSid: message.sid });
  } catch (err) {
    callback(null, { success: false, error: err.message });
  }
};
