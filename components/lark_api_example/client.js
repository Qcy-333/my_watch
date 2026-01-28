const lark = require("@larksuiteoapi/node-sdk");

const client = new lark.Client({
  appId: "cli_a9bd7b082ebbdceb",
  appSecret: "ewBpcbX93QKSppU0T569cgtsT7rk0pQA",
  appType: lark.AppType.SelfBuild,
  domain: lark.Domain.Feishu
});

client.userAccessToken = "u-dDGcwQ4ZxbwVp_A924ypir411wwMg4MVh2aa6B0002pU";

module.exports = client;