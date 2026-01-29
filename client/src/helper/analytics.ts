/**
 * Google Analytics Helper
 */

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

/**
 * 手动追踪页面浏览
 * @param url 页面路径
 * @param title 页面标题
 */
export function trackPageView(url: string, title?: string) {
  if (!window.gtag) {
    return
  }

  window.gtag('event', 'page_view', {
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.href,
  })
}

/**
 * 手动追踪自定义事件
 * @param eventName 事件名称
 * @param params 事件参数
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (!window.gtag) {
    return
  }

  window.gtag('event', eventName, params)
}
