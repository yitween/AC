/**
 * announcements.js — AC 公告系統
 *
 * 原理：讀取 GitHub Issues（label = "announcement"）
 *      管理者在 GitHub repo 新增 Issue 並加上 "announcement" label 即發布公告
 *      無需後端，GitHub API 公開 repo 免 token，每小時 60 次請求
 *
 * 使用方式：在任何頁面 <body> 加上 <div id="ac-announce"></div>
 *           引入此腳本後自動渲染
 *
 * ⚠ 部署前請修改下方 REPO_OWNER 和 REPO_NAME
 */

const AC_ANNOUNCE = (() => {
  // ════════════════════════════════
  //  ★ 請填入你的 GitHub 帳號與 repo 名稱
  // ════════════════════════════════
  const REPO_OWNER = 'yitween';   // e.g. 'thcca5th'
  const REPO_NAME  = 'AC';          // e.g. 'ac-coding'
  // ════════════════════════════════

  const API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?labels=announcement&state=open&per_page=5`;

  // ── 時間格式化 ──────────────────
  function fmtDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  // ── Markdown 超基礎渲染（粗體/換行/連結） ──
  function renderMd(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g, '<br>');
  }

  // ── 渲染公告卡片 ──────────────────
  function render(issues, container) {
    if (!issues.length) {
      container.innerHTML = `
        <div class="ann-empty">
          <span class="ann-empty-icon">📭</span>
          <span>目前沒有新公告</span>
        </div>`;
      return;
    }

    container.innerHTML = issues.map((issue, i) => `
      <div class="ann-card ${i === 0 ? 'ann-latest' : ''}" style="animation-delay:${i * 0.08}s">
        <div class="ann-card-header">
          <span class="ann-badge">${i === 0 ? '最新' : '公告'}</span>
          <time class="ann-date">${fmtDate(issue.created_at)}</time>
        </div>
        <h4 class="ann-title">
          <a href="${issue.html_url}" target="_blank" rel="noopener">${issue.title}</a>
        </h4>
        ${issue.body ? `<div class="ann-body">${renderMd(issue.body.slice(0, 300))}${issue.body.length > 300 ? '…' : ''}</div>` : ''}
      </div>
    `).join('');
  }

  // ── 注入 CSS ──────────────────────
  function injectCSS() {
    if (document.getElementById('ac-announce-style')) return;
    const s = document.createElement('style');
    s.id = 'ac-announce-style';
    s.textContent = `
      #ac-announce { margin-bottom: 0; }

      .ann-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 14px; flex-wrap: wrap; gap: 8px;
      }
      .ann-header-left {
        display: flex; align-items: center; gap: 10px;
      }
      .ann-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: #7fffd4;
        box-shadow: 0 0 0 0 rgba(127,255,212,0.4);
        animation: ann-pulse 2s infinite;
        flex-shrink: 0;
      }
      @keyframes ann-pulse {
        0%   { box-shadow: 0 0 0 0 rgba(127,255,212,0.4); }
        70%  { box-shadow: 0 0 0 8px rgba(127,255,212,0); }
        100% { box-shadow: 0 0 0 0 rgba(127,255,212,0); }
      }
      .ann-title-bar {
        font-size: 0.8rem; letter-spacing: 0.12em;
        text-transform: uppercase; color: #7fffd4;
        font-family: 'JetBrains Mono', monospace; font-weight: 700;
      }
      .ann-manage-link {
        font-size: 0.75rem; color: #555;
        text-decoration: none; font-family: 'JetBrains Mono', monospace;
        border: 1px solid #333; border-radius: 4px; padding: 3px 8px;
        transition: color 0.2s, border-color 0.2s;
      }
      .ann-manage-link:hover { color: #888; border-color: #555; }

      .ann-list { display: flex; flex-direction: column; gap: 10px; }

      .ann-card {
        background: #1a1a1a;
        border: 1px solid rgba(250,161,28,0.25);
        border-radius: 10px; padding: 14px 16px;
        animation: ann-in 0.35s ease both;
      }
      .ann-card.ann-latest {
        border-color: rgba(127,255,212,0.35);
        background: rgba(127,255,212,0.04);
      }
      @keyframes ann-in {
        from { opacity:0; transform: translateY(6px); }
        to   { opacity:1; transform: translateY(0); }
      }

      .ann-card-header {
        display: flex; align-items: center; gap: 8px;
        margin-bottom: 6px;
      }
      .ann-badge {
        font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em;
        padding: 2px 7px; border-radius: 20px;
        background: rgba(127,255,212,0.15); color: #7fffd4;
        font-family: 'JetBrains Mono', monospace;
      }
      .ann-latest .ann-badge {
        background: #7fffd4; color: #111;
      }
      .ann-date {
        font-size: 0.75rem; color: #555;
        font-family: 'JetBrains Mono', monospace;
        margin-left: auto;
      }

      .ann-title {
        font-size: 0.97rem; font-weight: 700;
        color: #e0e0e0; margin-bottom: 6px;
        line-height: 1.4;
      }
      .ann-title a {
        color: inherit; text-decoration: none;
        transition: color 0.2s;
      }
      .ann-title a:hover { color: #7fffd4; }

      .ann-body {
        font-size: 0.83rem; color: #777;
        line-height: 1.6;
      }
      .ann-body a { color: #7fffd4; }

      .ann-loading {
        display: flex; align-items: center; gap: 10px;
        color: #555; font-size: 0.85rem; padding: 12px 0;
      }
      .ann-spinner {
        width: 16px; height: 16px; border-radius: 50%;
        border: 2px solid #333; border-top-color: #7fffd4;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      .ann-empty {
        display: flex; align-items: center; gap: 10px;
        color: #444; font-size: 0.88rem; padding: 10px 0;
      }
      .ann-empty-icon { font-size: 1.2rem; }

      .ann-error {
        font-size: 0.82rem; color: #f87171; padding: 8px 0;
      }

      /* ── navbar 浮動公告標記 ── */
      .ann-nav-dot {
        display: inline-block;
        width: 7px; height: 7px; border-radius: 50%;
        background: #f0614a;
        margin-left: 5px; margin-bottom: 1px;
        vertical-align: middle;
        animation: ann-pulse 2s infinite;
      }

      /* ── 全站置頂橫幅（最新公告） ── */
      #ac-topbanner {
        background: linear-gradient(90deg, rgba(127,255,212,0.12), rgba(250,161,28,0.08));
        border-bottom: 1px solid rgba(127,255,212,0.2);
        padding: 8px 20px;
        display: flex; align-items: center; gap: 12px;
        font-size: 0.83rem;
        position: relative; z-index: 800;
        animation: ann-in 0.4s ease;
      }
      #ac-topbanner .tb-label {
        background: #7fffd4; color: #111;
        font-weight: 700; font-size: 0.7rem;
        padding: 2px 8px; border-radius: 20px;
        font-family: 'JetBrains Mono', monospace;
        white-space: nowrap; flex-shrink: 0;
      }
      #ac-topbanner .tb-text {
        color: #ccc; flex: 1;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      #ac-topbanner .tb-text a {
        color: #7fffd4; text-decoration: none;
      }
      #ac-topbanner .tb-close {
        background: none; border: none; color: #555;
        cursor: pointer; font-size: 1rem; padding: 0 4px;
        transition: color 0.2s; flex-shrink: 0;
      }
      #ac-topbanner .tb-close:hover { color: #ccc; }

      @media (max-width: 768px) {
        #ac-topbanner { padding: 7px 12px; font-size: 0.78rem; }
        #ac-topbanner .tb-text { font-size: 0.78rem; }
      }
    `;
    document.head.appendChild(s);
  }

  // ── 置頂橫幅（全站） ─────────────
  function showTopBanner(issue) {
    if (!issue) return;
    // 若使用者已關閉此公告則不再顯示
    const dismissed = sessionStorage.getItem('ann-dismissed');
    if (dismissed === String(issue.id)) return;

    const banner = document.createElement('div');
    banner.id = 'ac-topbanner';
    banner.innerHTML = `
      <span class="tb-label">📢 公告</span>
      <span class="tb-text">
        <a href="${issue.html_url}" target="_blank" rel="noopener">${issue.title}</a>
        <span style="color:#555;margin-left:6px">${fmtDate(issue.created_at)}</span>
      </span>
      <button class="tb-close" aria-label="關閉公告" data-id="${issue.id}">✕</button>`;

    // 插入 body 第一個子元素前（nav 之前）
    document.body.insertBefore(banner, document.body.firstChild);

    banner.querySelector('.tb-close').addEventListener('click', () => {
      sessionStorage.setItem('ann-dismissed', String(issue.id));
      banner.style.animation = 'none';
      banner.style.opacity = '0';
      banner.style.transition = 'opacity 0.2s';
      setTimeout(() => banner.remove(), 200);
    });
  }

  // ── 在 nav 上加紅點 ──────────────
  function addNavDot() {
    document.querySelectorAll('a[href="others.html"]').forEach(a => {
      if (!a.querySelector('.ann-nav-dot')) {
        const dot = document.createElement('span');
        dot.className = 'ann-nav-dot';
        dot.title = '有新公告';
        a.appendChild(dot);
      }
    });
  }

  // ── 主初始化 ─────────────────────
  async function init() {
    injectCSS();

    const container = document.getElementById('ac-announce');

    // 載入中狀態
    if (container) {
      container.innerHTML = `
        <div class="ann-loading">
          <div class="ann-spinner"></div>載入公告中…
        </div>`;
    }

    try {
      const res = await fetch(API, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });

      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      const issues = await res.json();

      // 置頂橫幅（全站）
      if (issues.length > 0) {
        showTopBanner(issues[0]);
        addNavDot();
      }

      // others.html 公告列表
      if (container) {
        const listEl = document.createElement('div');
        listEl.className = 'ann-list';
        container.innerHTML = '';
        container.appendChild(listEl);
        render(issues, listEl);
      }

    } catch (err) {
      console.warn('[AC Announce]', err);
      if (container) {
        container.innerHTML = `<div class="ann-error">⚠ 公告載入失敗（${err.message}）</div>`;
      }
    }
  }

  return { init };
})();

// 自動啟動
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', AC_ANNOUNCE.init);
} else {
  AC_ANNOUNCE.init();
}
