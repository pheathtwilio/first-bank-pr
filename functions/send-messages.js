exports.handler = async function (context, event, callback) {
  const { templateSid, csvData } = event;

  if (!templateSid || !csvData) {
    return callback(null, { success: false, error: 'Missing templateSid or csvData' });
  }

  const rows = typeof csvData === 'string' ? JSON.parse(csvData) : csvData;

  if (!rows.length) {
    return callback(null, { success: false, error: 'CSV has no data rows' });
  }

  const demoRows = rows.slice(0, 2);
  const results = [];
  const client = context.getTwilioClient();

  for (const row of demoRows) {
    const to = row.phone_number;
    if (!to) continue;

    const contentVariables = {};
    for (const key of Object.keys(row)) {
      if (key !== 'phone_number') {
        contentVariables[key] = row[key];
      }
    }

    try {
      const message = await client.messages.create({
        to,
        messagingServiceSid: context.MESSAGING_SERVICE_SID,
        contentSid: templateSid,
        contentVariables: JSON.stringify(contentVariables)
      });
      results.push({ to, success: true, messageSid: message.sid });
    } catch (err) {
      results.push({ to, success: false, error: err.message });
    }
  }

  const allSucceeded = results.every((r) => r.success);
  callback(null, { success: allSucceeded, results });
};
