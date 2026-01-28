# 查询记录

该接口用于查询数据表中的现有记录，单次最多查询 500 行记录，支持分页获取。

## 注意事项

若多维表格开启了高级权限，你需确保调用身份拥有多维表格的可管理权限，否则可能出现调用成功但返回数据为空的情况。了解具体步骤，参考[如何为应用或用户开通文档权限]

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/search
HTTP Method | POST
接口频率限制 | [20 次/秒]
支持的应用类型 | Custom App、Store App
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用**<br>开启任一权限即可 | 根据条件搜索记录(base:record:retrieve)<br>查看、评论、编辑和管理多维表格(bitable:app)<br>查看、评论和导出多维表格(bitable:app:readonly)
字段权限要求 | **注意事项**：该接口返回体中存在下列敏感字段，仅当开启对应的权限后才会返回；如果无需获取这些字段，则不建议申请<br>获取用户基本信息(contact:user.base:readonly)<br>获取用户 user ID(contact:user.employee_id:readonly)<br>以应用身份访问通讯录(contact:contact:access_as_app)<br>读取通讯录(contact:contact:readonly)<br>以应用身份读取通讯录(contact:contact:readonly_as_app)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>或<br>`user_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer u-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token]
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 路径参数

名称 | 类型 | 描述
---|---|---
app_token | string | 多维表格 App 的唯一标识。不同形态的多维表格，其 app_token 的获取方式不同：<br>- 如果多维表格的 URL 以 ==**feishu.cn/base**== 开头，该多维表格的 app_token 是下图高亮部分：<br>![app_token.png](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/6916f8cfac4045ba6585b90e3afdfb0a_GxbfkJHZBa.png?height=766&lazyload=true&width=3004)<br>- 如果多维表格的 URL 以 ==**feishu.cn/wiki**== 开头，你需调用知识库相关[获取知识空间节点信息]接口获取多维表格的 app_token。当 obj_type 的值为 bitable 时，obj_token 字段的值才是多维表格的 app_token。<br>了解更多，参考[多维表格 app_token 获取方式]。<br>**示例值**："NQRxbRkBMa6OnZsjtERcxhNWnNh"<br>**数据校验规则**：<br>- 长度范围：`0` ～ `100` 字符
table_id | string | 多维表格数据表的唯一标识。获取方式：<br>- 你可通过多维表格 URL 获取 `table_id`，下图高亮部分即为当前数据表的 `table_id`<br>- 也可通过[列出数据表]接口获取 `table_id`<br>![](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/18741fe2a0d3cafafaf9949b263bb57d_yD1wkOrSju.png?height=746&lazyload=true&maxWidth=700&width=2976)<br>**示例值**："tbl0xe5g8PP3U3cS"<br>**数据校验规则**：<br>- 长度范围：`0` ～ `50` 字符

### 查询参数

名称 | 类型 | 必填 | 描述
---|---|---|---
user_id_type | string | 否 | 用户 ID 类型<br>**示例值**：open_id<br>**可选值有**：<br>- open_id：标识一个用户在某个应用中的身份。同一个用户在不同应用中的 Open ID 不同。[了解更多：如何获取 Open ID]<br>- union_id：标识一个用户在某个应用开发商下的身份。同一用户在同一开发商下的应用中的 Union ID 是相同的，在不同开发商下的应用中的 Union ID 是不同的。通过 Union ID，应用开发商可以把同个用户在多个应用中的身份关联起来。[了解更多：如何获取 Union ID？]<br>- user_id：标识一个用户在某个租户内的身份。同一个用户在租户 A 和租户 B 内的 User ID 是不同的。在同一个租户内，一个用户的 User ID 在所有应用（包括商店应用）中都保持一致。User ID 主要用于在不同的应用间打通用户数据。[了解更多：如何获取 User ID？]<br>**默认值**：`open_id`<br>**当值为 `user_id`，字段权限要求**：<br>获取用户 user ID(contact:user.employee_id:readonly)
page_token | string | 否 | 分页标记，第一次请求不填，表示从头开始遍历；分页查询结果还有更多项时会同时返回新的 page_token，下次遍历可采用该 page_token 获取查询结果<br>**示例值**：eVQrYzJBNDNONlk4VFZBZVlSdzlKdFJ4bVVHVExENDNKVHoxaVdiVnViQT0=
page_size | int | 否 | 分页大小。最大值为 500<br>**示例值**：10<br>**默认值**：`20`

### 请求体

名称 | 类型 | 必填 | 描述
---|---|---|---
view_id | string | 否 | 多维表格中视图的唯一标识。获取方式：<br>- 在多维表格的 URL 地址栏中，view_id 是下图中高亮部分：<br>![view_id.png](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/140668632c97e0095832219001d17c54_DJMgVH9x2S.png?height=748&lazyload=true&width=2998)<br>- 通过[列出视图]接口获取。暂时无法获取到嵌入到云文档中的多维表格的 view_id。<br>**注意**：<br>当 filter 参数 或 sort 参数不为空时，请求视为对数据表中的全部数据做条件过滤，指定的 view_id 会被忽略。<br>**示例值**："vewqhz51lk"<br>**数据校验规则**：<br>- 长度范围：`0` ～ `50` 字符
field_names | string\[\] | 否 | 字段名称，用于指定本次查询返回记录中包含的字段<br>**示例值**：["字段1","字段2"]<br>**数据校验规则**：<br>- 长度范围：`0` ～ `200`
sort | sort\[\] | 否 | 排序条件<br>**数据校验规则**：<br>- 长度范围：`0` ～ `100`
field_name | string | 否 | 字段名称<br>**示例值**："多行文本"<br>**数据校验规则**：<br>- 长度范围：`0` ～ `1000` 字符
desc | boolean | 否 | 是否倒序排序<br>**示例值**：true<br>**默认值**：`false`
filter | filter_info | 否 | 包含条件筛选信息的对象。了解 filter 填写指南和使用示例（如怎样同时使用 `and` 和 `or` 逻辑链接词），参考[记录筛选参数填写指南]。
conjunction | string | 否 | 表示条件之间的逻辑连接词，该字段必填，请忽略左侧必填列的否<br>**示例值**："and"<br>**可选值有**：<br>- and：满足全部条件<br>- or：满足任一条件<br>**数据校验规则**：<br>- 长度范围：`0` ～ `10` 字符
conditions | condition\[\] | 否 | 筛选条件集合<br>**数据校验规则**：<br>- 长度范围：`0` ～ `50`
field_name | string | 是 | 筛选条件的左值，值为字段的名称<br>**示例值**："字段1"<br>**数据校验规则**：<br>- 长度范围：`0` ～ `1000` 字符
operator | string | 是 | 条件运算符<br>**示例值**："is"<br>**可选值有**：<br>- is：等于<br>- isNot：不等于（不支持日期字段，了解如何查询日期字段，参考[日期字段填写说明]）<br>- contains：包含（不支持日期字段）<br>- doesNotContain：不包含（不支持日期字段）<br>- isEmpty：为空<br>- isNotEmpty：不为空<br>- isGreater：大于<br>- isGreaterEqual：大于等于（不支持日期字段）<br>- isLess：小于<br>- isLessEqual：小于等于（不支持日期字段）<br>- like：LIKE 运算符。暂未支持<br>- in：IN 运算符。暂未支持
value | string\[\] | 否 | 条件的值，可以是单个值或多个值的数组。不同字段类型和不同的 operator 可填的值不同。详情参考[字段目标值（value）填写说明]。<br>**示例值**：["文本内容"]<br>**数据校验规则**：<br>- 长度范围：`0` ～ `10`
automatic_fields | boolean | 否 | 是否自动计算并返回创建时间（created_time）、修改时间（last_modified_time）、创建人（created_by）、修改人（last_modified_by）这四类字段。默认为 false，表示不返回。<br>**示例值**：false

### 请求体示例
```json
{
  "view_id": "vewqhz51lk",
  "field_names": [
    "字段1",
    "字段2"
  ],
  "sort": [
    {
      "field_name": "多行文本",
      "desc": true
    }
  ],
  "filter": {
    "conjunction": "and",
    "conditions": [
      {
        "field_name": "职位",
        "operator": "is",
        "value": [
          "初级销售员"
        ]
      },
      {
        "field_name": "销售额",
        "operator": "isGreater",
        "value": [
          "10000.0"
        ]
      }
    ]
  },
  "automatic_fields": false
}
```

## 响应

### 响应体

名称 | 类型 | 描述
---|---|---
code | int | 错误码，非 0 表示失败
msg | string | 错误描述
data | \- | \-
items | app.table.record\[\] | 数组类型。record 结果。了解 record 数据结构，参考[数据结构]。
fields | map&lt;string, union&gt; | 记录字段
record_id | string | 记录 ID
created_by | person | 创建人
id | string | 人员 ID。与查询参数 user_id_type 指定的类型一致。
name | string | 中文姓名
en_name | string | 英文姓名
email | string | 邮箱
avatar_url | string | 头像链接<br>**字段权限要求（满足任一）**：<br>获取用户基本信息(contact:user.base:readonly)<br>以应用身份访问通讯录(contact:contact:access_as_app)<br>读取通讯录(contact:contact:readonly)<br>以应用身份读取通讯录(contact:contact:readonly_as_app)
created_time | int | 创建时间
last_modified_by | person | 修改人
id | string | 人员 ID。与查询参数 user_id_type 指定的类型一致。
name | string | 中文姓名
en_name | string | 英文姓名
email | string | 邮箱
avatar_url | string | 头像链接<br>**字段权限要求（满足任一）**：<br>获取用户基本信息(contact:user.base:readonly)<br>以应用身份访问通讯录(contact:contact:access_as_app)<br>读取通讯录(contact:contact:readonly)<br>以应用身份读取通讯录(contact:contact:readonly_as_app)
last_modified_time | int | 最近更新时间
shared_url | string | 记录分享链接(批量获取记录接口将返回该字段)
record_url | string | 记录链接(检索记录接口将返回该字段)
has_more | boolean | 是否还有更多项
page_token | string | 分页标记，当 has_more 为 true 时，会同时返回新的 page_token，否则不返回 page_token
total | int | 记录总数

# 更新记录

更新多维表格数据表中的一条记录。

## 前提条件

调用此接口前，请确保当前调用身份（tenant_access_token 或 user_access_token）已有多维表格的编辑等文档权限，否则接口将返回 HTTP 403 或 400 状态码。了解更多，参考[如何为应用或用户开通文档权限]。

## 注意事项

- 从其它数据源同步的数据表，不支持对记录进行增加、删除、和修改操作。
- 更新记录为增量更新，仅更新传入的字段。如果想对记录中的某个字段值置空，可将字段设为 null，例如：
```json
{
  "fields": {
    "文本字段": null
  }
}
```

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/:record_id
HTTP Method | PUT
接口频率限制 | [50 次/秒]
支持的应用类型 | Custom App、Store App
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用**<br>开启任一权限即可 | 更新记录(base:record:update)<br>查看、评论、编辑和管理多维表格(bitable:app)
字段权限要求 | **注意事项**：该接口返回体中存在下列敏感字段，仅当开启对应的权限后才会返回；如果无需获取这些字段，则不建议申请<br>获取用户基本信息(contact:user.base:readonly)<br>获取用户 user ID(contact:user.employee_id:readonly)<br>以应用身份访问通讯录(contact:contact:access_as_app)<br>读取通讯录(contact:contact:readonly)<br>以应用身份读取通讯录(contact:contact:readonly_as_app)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>或<br>`user_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer u-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token]
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"


### 查询参数

名称 | 类型 | 必填 | 描述
---|---|---|---
user_id_type | string | 否 | 用户 ID 类型<br>**示例值**：open_id<br>**可选值有**：<br>- open_id：标识一个用户在某个应用中的身份。同一个用户在不同应用中的 Open ID 不同。[了解更多：如何获取 Open ID]<br>- union_id：标识一个用户在某个应用开发商下的身份。同一用户在同一开发商下的应用中的 Union ID 是相同的，在不同开发商下的应用中的 Union ID 是不同的。通过 Union ID，应用开发商可以把同个用户在多个应用中的身份关联起来。[了解更多：如何获取 Union ID？]<br>- user_id：标识一个用户在某个租户内的身份。同一个用户在租户 A 和租户 B 内的 User ID 是不同的。在同一个租户内，一个用户的 User ID 在所有应用（包括商店应用）中都保持一致。User ID 主要用于在不同的应用间打通用户数据。[了解更多：如何获取 User ID？]<br>**默认值**：`open_id`<br>**当值为 `user_id`，字段权限要求**：<br>获取用户 user ID(contact:user.employee_id:readonly)
ignore_consistency_check | boolean | 否 | 是否忽略一致性读写检查，默认为 false，即在进行读写操作时，系统将确保读取到的数据和写入的数据是一致的。可选值：<br>- true：忽略读写一致性检查，提高性能，但可能会导致某些节点的数据不同步，出现暂时不一致<br>- false：开启读写一致性检查，确保数据在读写过程中一致<br>**示例值**：true

### 请求体

名称 | 类型 | 必填 | 描述
---|---|---|---
fields | map&lt;string, union&gt; | 是 | 要更新的记录的数据。你需先指定数据表中的字段（即指定列），再传入正确格式的数据作为一条记录。<br>**注意**：<br>该接口支持的字段类型及其描述如下所示：<br>- 文本：原值展示，不支持 markdown 语法<br>- 数字：填写数字格式的值<br>- 单选：填写选项值，对于新的选项值，将会创建一个新的选项<br>- 多选：填写多个选项值，对于新的选项值，将会创建一个新的选项。如果填写多个相同的新选项值，将会创建多个相同的选项<br>- 日期：填写毫秒级时间戳<br>- 复选框：填写 true 或 false<br>- 条码<br>- 人员：填写用户的 open_id、union_id 或 user_id，类型需要与 user_id_type 指定的类型一致<br>- 电话号码：填写文本内容<br>- 超链接：参考以下示例，text 为文本值，link 为 URL 链接<br>- 附件：填写附件 token，需要先调用[上传素材]或[分片上传素材]接口将附件上传至该多维表格中<br>- 单向关联：填写被关联表的记录 ID<br>- 双向关联：填写被关联表的记录 ID<br>- 地理位置：填写经纬度坐标<br>不同类型字段的数据结构请参考[数据结构概述]。<br>**示例值**：{"文本":"HelloWorld"}

### 请求体示例
```json
{
    "fields": {
        "索引": "索引列文本类型",
        "文本": "文本内容",
        "条码":"qawqe",
        "数字": 100,
        "单选": "选项3",
        "多选": [
            "选项1",
            "选项2"
        ],
        "货币":3,
        "评分":3,
        "进度":0.25,
        "日期": 1674206443000,
        "复选框": true,
        "人员": [
            {
                "id": "ou_2910013f1e6456f16a0ce75ede950a0a"
            },
            {
                "id": "ou_e04138c9633dd0d2ea166d79f548ab5d"
            }
        ],
        "群组":[
            {
                "id": "oc_cd07f55f14d6f4a4f1b51504e7e97f48"
            }
        ],
        "电话号码": "13026162666",
        "超链接": {
            "text": "飞书多维表格官网",
            "link": "https://www.feishu.cn/product/base"
        },
        "附件": [
            {
                "file_token": "Vl3FbVkvnowlgpxpqsAbBrtFcrd"
            }
        ],
        "单向关联": [
            "recHTLvO7x",
            "recbS8zb2m"
        ],
        "双向关联": [
            "recHTLvO7x",
            "recbS8zb2m"
        ],
        "地理位置": "116.397755,39.903179"
    }
}
```

## 响应

### 响应体

名称 | 类型 | 描述
---|---|---
code | int | 错误码，非 0 表示失败
msg | string | 错误描述
data | \- | \-
record | app.table.record | 记录更新后的内容
fields | map&lt;string, union&gt; | 成功更新的记录的数据
record_id | string | 更新记录的 ID
created_by | person | 该记录的创建人。本接口不返回该参数
id | string | 用户 ID，ID 类型与 `user_id_type` 所指定的类型一致
name | string | 用户的中文名称
en_name | string | 用户的英文名称
email | string | 用户的邮箱
avatar_url | string | 头像链接<br>**字段权限要求（满足任一）**：<br>获取用户基本信息(contact:user.base:readonly)<br>以应用身份访问通讯录(contact:contact:access_as_app)<br>读取通讯录(contact:contact:readonly)<br>以应用身份读取通讯录(contact:contact:readonly_as_app)
created_time | int | 该记录的创建时间。本接口不返回该参数
last_modified_by | person | 该记录最新一次更新的修改人。本接口不返回该参数
id | string | 用户 ID，ID 类型与 `user_id_type` 所指定的类型一致
name | string | 用户的中文名称
en_name | string | 用户的英文名称
email | string | 用户的邮箱
avatar_url | string | 头像链接<br>**字段权限要求（满足任一）**：<br>获取用户基本信息(contact:user.base:readonly)<br>以应用身份访问通讯录(contact:contact:access_as_app)<br>读取通讯录(contact:contact:readonly)<br>以应用身份读取通讯录(contact:contact:readonly_as_app)
last_modified_time | int | 该记录最近一次的更新时间。本接口不返回该参数
shared_url | string | 记录分享链接。本接口不返回该参数，批量获取记录接口将返回该参数
record_url | string | 记录链接，本接口不返回该参数，查询记录接口将返回该参数
