const axios = require("axios");

// === input params start
const appID = process.env.APP_ID; // app_id, required, 应用 ID
// 应用唯一标识，创建应用后获得。有关app_id 的详细介绍。请参考通用参数https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/terminology。
const appSecret = process.env.APP_SECRET; // app_secret, required, 应用 secret
// 应用秘钥，创建应用后获得。有关 app_secret 的详细介绍，请参考https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/terminology。
const baseURL = process.env.BASE_URL; // string, required, 多维表格 URL
// 多维表格 App 的唯一标识。不同形态的多维表格，其 app_token 的获取方式不同：
// - 如果多维表格的 URL 以 ==**feishu.cn/base**== 开头，该多维表格的 app_token 是下图高亮部分：
//     ![app_token.png](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/6916f8cfac4045ba6585b90e3afdfb0a_GxbfkJHZBa.png?height=766&lazyload=true&width=3004)
// 
// - 如果多维表格的 URL 以 ==**feishu.cn/wiki**== 开头，你需调用知识库相关[获取知识空间节点信息](https://go.feishu.cn/s/65W4PEw1g04)接口获取多维表格的 app_token。当 obj_type 的值为 bitable 时，obj_token 字段的值才是多维表格的 app_token。
// 
// 了解更多，参考[多维表格 app_token 获取方式](https://go.feishu.cn/s/671HilYws03#-752212c)。
const noteContent = process.env.NOTE_CONTENT; // string, required, 笔记新增内容
// 要添加到笔记字段的文本内容
// === input params end

// 把错误信息和排查建议打印出来，方便排查
function axiosErrorLog(response) {
  const data = response?.data;
  if (data?.error) {
    console.error("Error:", data);
  }
}

// 获取 tenant_access_token
async function getTenantAccessToken(appID, appSecret) {
  const url =
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal";

  const payload = {
    app_id: appID,
    app_secret: appSecret,
  };

  try {
    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });

    const result = response.data;
    if (result.code !== 0) {
      console.error("Error:", result);
      throw new Error(`failed to get tenant_access_token: ${result.msg}`);
    }
    return result.tenant_access_token;
  } catch (error) {
    axiosErrorLog(error.response);
    throw new Error(`Error getting tenant_access_token: ${error.message}`);
  }
}

/**
 * 获取知识空间节点信息
 * @param {string} tenantAccessToken
 * @param {string} nodeToken
 * @returns {Promise<object>} 返回 node 对象
 */
async function getWikiNodeInfo(tenantAccessToken, nodeToken) {
  // 文档：https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node
  const url = `https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node?token=${encodeURIComponent(
    nodeToken
  )}`;
  const headers = {
    Authorization: `Bearer ${tenantAccessToken}`,
    "Content-Type": "application/json; charset=utf-8",
  };

  try {
    console.log("GET:", url);
    const response = await axios.get(url, { headers });
    const result = response.data;
    if (result.code !== 0) {
      console.error("ERROR: 获取知识空间节点信息失败", result);
      throw new Error(`failed to get wiki node info: ${result.msg}`);
    }
    if (!result.data || !result.data.node) {
      throw new Error("未获取到节点信息");
    }
    console.log("节点信息获取成功:", {
      node_token: result.data.node.node_token,
      obj_type: result.data.node.obj_type,
      obj_token: result.data.node.obj_token,
      title: result.data.node.title,
    });
    return result.data.node;
  } catch (error) {
    axiosErrorLog(error.response);
    throw new Error(`Error getting wiki node info: ${error.message}`);
  }
}

// 解析多维表格参数
async function parseBaseUrl(tenantAccessToken, baseUrlString) {
  const baseUrl = new URL(baseUrlString);
  const pathname = baseUrl.pathname;
  let appToken = baseUrl.pathname.split("/").at(-1);

  if (pathname.includes("/wiki/")) {
    const nodeInfo = await getWikiNodeInfo(tenantAccessToken, appToken);
    appToken = nodeInfo.obj_token;
  }

  const viewID = baseUrl.searchParams.get("view");
  const tableID = baseUrl.searchParams.get("table");
  return { appToken, tableID, viewID };
}

// 查询状态为"待看"的记录
async function searchRecords(tenantAccessToken, appToken, tableID) {
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableID}/records/search`;
  
  const payload = {
    filter: {
      conjunction: "and",
      conditions: [
        {
          field_name: "状态",
          operator: "is",
          value: ["待看"]
        }
      ]
    }
  };

  const headers = {
    Authorization: `Bearer ${tenantAccessToken}`,
    "Content-Type": "application/json; charset=utf-8",
  };

  try {
    console.log("POST:", url);
    console.log("请求参数:", JSON.stringify(payload, null, 2));
    
    const response = await axios.post(url, payload, { headers });
    const result = response.data;

    if (result.code !== 0) {
      const error = new Error(`failed to search records: ${result.msg}`);
      error.response = response;
      axiosErrorLog(error.response);
      throw error;
    }

    console.log("查询记录成功，数量:", result.data.items.length);
    return result.data.items;
  } catch (error) {
    axiosErrorLog(error.response);
    throw new Error(`Error searching records: ${error.message}`);
  }
}

// 更新单条记录
async function updateRecord(tenantAccessToken, appToken, tableID, recordID, status, noteContent) {
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableID}/records/${recordID}`;
  
  const payload = {
    fields: {
      "状态": status,
      "笔记": [
        {
          "text": noteContent,
          "type": "text"
        }
      ]
    }
  };

  const headers = {
    Authorization: `Bearer ${tenantAccessToken}`,
    "Content-Type": "application/json; charset=utf-8",
  };

  try {
    console.log("PUT:", url);
    console.log("请求参数:", JSON.stringify(payload, null, 2));
    
    const response = await axios.put(url, payload, { headers });
    const result = response.data;

    if (result.code !== 0) {
      const error = new Error(`failed to update record: ${result.msg}`);
      error.response = response;
      axiosErrorLog(error.response);
      throw error;
    }

    console.log("更新记录成功:", recordID);
    return result.data.record;
  } catch (error) {
    axiosErrorLog(error.response);
    throw new Error(`Error updating record: ${error.message}`);
  }
}

// 主函数
async function main() {
  try {
    // 获取 tenant_access_token
    const tenantAccessToken = await getTenantAccessToken(appID, appSecret);
    console.log("获取 tenant_access_token 成功");

    // 解析多维表格参数
    const { appToken, tableID } = await parseBaseUrl(tenantAccessToken, baseURL);
    console.log("解析多维表格参数成功:", { appToken, tableID });

    if (!tableID) {
      throw new Error("未提供 table_id，请在 URL 中包含 table 参数或通过列出数据表接口获取");
    }

    // 查询状态为"待看"的记录
    const records = await searchRecords(tenantAccessToken, appToken, tableID);
    
    if (records.length === 0) {
      console.log("没有找到状态为'待看'的记录");
      return;
    }

    // 更新每条记录
    for (const record of records) {
      await updateRecord(tenantAccessToken, appToken, tableID, record.record_id, "已看", noteContent);
    }

    console.log(`成功更新了 ${records.length} 条记录`);
  } catch (error) {
    console.error("执行过程中发生错误:", error.message);
  }
}

main();