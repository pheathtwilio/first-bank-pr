const Papa = require('papaparse');

exports.handler = function (context, event, callback) {
  if (!event.csv) {
    return callback(null, { success: false, error: 'No CSV data provided' });
  }

  const result = Papa.parse(event.csv, { header: true, skipEmptyLines: true });

  if (result.errors.length > 0) {
    return callback(null, { success: false, error: result.errors[0].message });
  }

  callback(null, {
    success: true,
    data: result.data,
    headers: result.meta.fields
  });
};
