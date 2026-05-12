exports.handler = async function (context, event, callback) {
  try {
    const client = context.getTwilioClient();
    const contents = await client.content.v1.contents.list();

    const templates = contents.map((item) => ({
      sid: item.sid,
      friendlyName: item.friendlyName,
      numVariables: item.variables ? Object.keys(item.variables).length : 0
    }));

    callback(null, { templates });
  } catch (err) {
    callback(null, { success: false, error: err.message });
  }
};
