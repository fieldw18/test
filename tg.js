// 直接读取外部传入的 t.me_redirect 参数
let scheme = $argument["t.me_redirect"];

// 预定义映射关系
const mapping = {
    "Telegram": "tg",
    "Swiftgram": "sg",
    "Turrit": "turrit",
    "iMe": "ime",
    "Nicegram": "ng",
    "Lingogram": "lingo"
};

// 检查并转换
scheme = mapping[scheme] || scheme;

if (!scheme) {
    $done({});
}

// 获取当前请求的 URL
let url = $request.url;

// 更宽松的正则：匹配所有 t.me/ 开头的路径（包括 +xxxx、joinchat/xxxx、username/123 等）
let match = url.match(/(?:https?:\/\/)?t\.me\/(.+)/);

if (match) {
    let path = match[1];  // 捕获 t.me/ 后面的全部内容

    // 直接用原路径构造第三方客户端的 deep link
    // 大多数第三方客户端（如 Nicegram ng://、iMe ime://、Swiftgram sg:// 等）都支持 tg://resolve 的同类格式：scheme://resolve?domain=...
    // 对于邀请链接 t.me/+hash 或 t.me/joinchat/hash，也可以用 scheme://join?invite=hash
    // 但为了兼容最多情况，这里统一用 resolve?domain= 原路径（第三方客户端通常会智能处理）
    let newUrl = `${scheme}://resolve?domain=${encodeURIComponent(path)}`;

    // 特殊处理私人邀请链接（t.me/+ 或 t.me/joinchat/ 开头）
    if (path.startsWith('+') || path.startsWith('joinchat/')) {
        // 提取 hash 部分
        let inviteHash = path.startsWith('+') ? path.slice(1) : path.slice('joinchat/'.length);
        newUrl = `${scheme}://join?invite=${encodeURIComponent(inviteHash)}`;
    }

    // 307 重定向到第三方客户端
    $done({
        status: 307,
        headers: {
            'Location': newUrl
        }
    });
} else {
    $done({});
}