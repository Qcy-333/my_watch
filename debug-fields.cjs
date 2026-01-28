const axios = require('axios');

const APP_ID = 'cli_a9bd7b082ebbdceb';
const APP_SECRET = 'ewBpcbX93QKSppU0T569cgtsT7rk0pQA';
const APP_TOKEN = 'Nkl3b3oPQarDwVs1XU9ca5RRnAf';
const TABLE_ID = 'tblYSwf02zn3ZplE';

async function getTenantAccessToken() {
  const url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal";
  const response = await axios.post(url, {
    app_id: APP_ID,
    app_secret: APP_SECRET,
  });

  if (response.data.code !== 0) {
    throw new Error(`Failed to get access token: ${response.data.msg}`);
  }

  return response.data.tenant_access_token;
}

async function listFields() {
  try {
    const token = await getTenantAccessToken();
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/fields`;
    
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.code !== 0) {
      console.error("Error fetching fields:", response.data);
      return;
    }

    const fields = response.data.data.items;
    // const statusField = fields.find(f => f.field_name === "状态" || f.field_name === "Status");

    console.log("All Fields:", JSON.stringify(fields, null, 2));
  } catch (e) {
    console.error("Error:", e.response ? e.response.data : e.message);
  }
}

listFields();
