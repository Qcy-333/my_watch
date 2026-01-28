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

async function debugUpdate() {
  try {
    const token = await getTenantAccessToken();
    
    // 1. Fetch one record to get an ID
    console.log("Fetching a record...");
    const listUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/records?page_size=1`;
    const listResp = await axios.get(listUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (listResp.data.code !== 0) {
      console.error("Failed to list records:", listResp.data);
      return;
    }

    const item = listResp.data.data.items[0];
    if (!item) {
      console.error("No records found.");
      return;
    }
    const recordId = item.record_id;
    console.log(`Found record: ${recordId}. Trying to update...`);

    // 2. Try to update
    const updateUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/records/${recordId}`;
    
    // Payload matching lib/lark.ts
    const payload = {
      fields: {
        // "状态": "已看",
        "内容": "Debug Note Test Only"
      }
    };

    const updateResp = await axios.put(updateUrl, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Update Success:", updateResp.data);

  } catch (e) {
    console.error("Update Failed!");
    if (e.response) {
      console.error("Status:", e.response.status);
      console.error("Data:", JSON.stringify(e.response.data, null, 2));
    } else {
      console.error(e.message);
    }
  }
}

debugUpdate();
