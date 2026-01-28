const client = require("./client");
const spinner = require("./spinner");
const lark = require("@larksuiteoapi/node-sdk");

const createTable = async (body) => {
  const execSpinner = spinner("创建中");
  try {
    const requestOptions = {};

    if (client.userAccessToken) {
      Object.assign(requestOptions, lark.withUserAccessToken(client.userAccessToken));
    }

    const { data } = await client.bitable.app.create(
      {
        data: body,
      },
      requestOptions
    );

    execSpinner.succeed("创建成功");
    return data;
  } catch (e) {
    execSpinner.fail("创建失败");
  }
};
module.exports = createTable;
