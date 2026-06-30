// 各平台常见的网络代理客户端(兼容trojan / clash订阅), 统一跳转官方发布页/应用商店下载
// 链接指向 releases/latest 或 App Store 页面, 避免写死具体版本导致失效

export const platformList = ['windows', 'macos', 'linux', 'android', 'ios']

export const platformLabels = {
    windows: 'Windows',
    macos: 'macOS',
    linux: 'Linux',
    android: 'Android',
    ios: 'iOS'
}

// key 用于 i18n 描述文案 (download.desc.<key>)
export const clients = {
    windows: [
        { key: 'clashVerge', name: 'Clash Verge Rev', url: 'https://github.com/clash-verge-rev/clash-verge-rev/releases/latest' },
        { key: 'v2rayN', name: 'v2rayN', url: 'https://github.com/2dust/v2rayN/releases/latest' }
    ],
    macos: [
        { key: 'clashVerge', name: 'Clash Verge Rev', url: 'https://github.com/clash-verge-rev/clash-verge-rev/releases/latest' },
        { key: 'clashxMeta', name: 'ClashX Meta', url: 'https://github.com/MetaCubeX/ClashX.Meta/releases/latest' }
    ],
    linux: [
        { key: 'clashVerge', name: 'Clash Verge Rev', url: 'https://github.com/clash-verge-rev/clash-verge-rev/releases/latest' }
    ],
    android: [
        { key: 'clashMetaAndroid', name: 'Clash Meta for Android', url: 'https://github.com/MetaCubeX/ClashMetaForAndroid/releases/latest' },
        { key: 'v2rayNG', name: 'v2rayNG', url: 'https://github.com/2dust/v2rayNG/releases/latest' }
    ],
    ios: [
        { key: 'shadowrocket', name: 'Shadowrocket', url: 'https://apps.apple.com/app/shadowrocket/id932747118' },
        { key: 'stash', name: 'Stash', url: 'https://apps.apple.com/app/stash/id1596063349' }
    ]
}

// 根据 UA 识别当前平台, 用作下载对话框的默认选中平台
export function detectPlatform() {
    const ua = navigator.userAgent || ''
    if (/Android/i.test(ua)) return 'android'
    if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
    if (/Macintosh|Mac OS X/i.test(ua)) return 'macos'
    if (/Windows|Win64|Win32/i.test(ua)) return 'windows'
    if (/Linux/i.test(ua)) return 'linux'
    return 'windows'
}
