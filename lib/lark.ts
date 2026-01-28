import axios from 'axios';

const APP_ID = process.env.APP_ID;
const APP_SECRET = process.env.APP_SECRET;
const APP_TOKEN = process.env.APP_TOKEN; // Base Token
const TABLE_ID = process.env.TABLE_ID;

// Log configuration status (without leaking secrets)
console.log('Lark Config Check:', {
  hasAppId: !!APP_ID,
  hasAppSecret: !!APP_SECRET,
  hasAppToken: !!APP_TOKEN,
  hasTableId: !!TABLE_ID
});

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getTenantAccessToken() {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  console.log('Getting new Tenant Access Token...');
  const url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal";
  
  try {
    const response = await axios.post(url, {
      app_id: APP_ID,
      app_secret: APP_SECRET,
    });

    if (response.data.code !== 0) {
      console.error('Lark Token Error:', response.data);
      throw new Error(`Failed to get access token: ${response.data.msg}`);
    }

    tokenCache = {
      token: response.data.tenant_access_token,
      expiresAt: Date.now() + (response.data.expire - 300) * 1000,
    };

    return tokenCache.token;
  } catch (error: any) {
    console.error('Lark Token Network/System Error:', error.message);
    if (error.response) {
       console.error('Error Response:', error.response.data);
    }
    throw error;
  }
}

export async function fetchToWatchVideos() {
  const token = await getTenantAccessToken();
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/records/search`;
  
  const response = await axios.post(url, {
    filter: {
      conjunction: "and",
      conditions: [
        {
          field_name: "状态",
          operator: "is",
          value: ["待看"]
        }
      ]
    },
    automatic_fields: true 
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (response.data.code !== 0) {
    throw new Error(`Failed to fetch videos: ${response.data.msg}`);
  }

  return response.data.data.items;
}

export async function deleteVideoRecord(recordId: string) {
  const token = await getTenantAccessToken();
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/records/${recordId}`;

  const response = await axios.delete(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (response.data.code !== 0) {
    throw new Error(`Failed to delete video: ${response.data.msg}`);
  }

  return response.data;
}

export async function updateVideoStatus(recordId: string, status: 'Done' | 'Trash', note?: string) {
  // If status is Trash, we delete the record entirely
  if (status === 'Trash') {
    return deleteVideoRecord(recordId);
  }

  const token = await getTenantAccessToken();
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/records/${recordId}`;
  
  const fields: any = {};
  
  if (status === 'Done') {
    fields["状态"] = "已看";
  }

  if (note) {
    // Note field "笔记" is a text field
    fields["笔记"] = note;
  }

  const response = await axios.put(url, { fields }, {
    headers: { Authorization: `Bearer ${token}` }
  });

   if (response.data.code !== 0) {
    throw new Error(`Failed to update video: ${response.data.msg}`);
  }
  
  return response.data.data.record;
}
