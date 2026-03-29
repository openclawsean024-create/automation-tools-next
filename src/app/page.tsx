'use client'

const toolCategories = [
  {
    name: '🤖 OpenClaw Skills',
    description: 'Alan 的核心能力集 — 各種任務所需的技能庫',
    color: 'from-indigo-500 to-purple-600',
    tools: [
      { name: 'Coding Agent', desc: '派遣 Codex / Claude Code / Pi 處理複雜開發任務', url: 'https://www.clawhub.ai', tag: '開發', tagColor: 'bg-indigo-500/20 text-indigo-300' },
      { name: 'Notion', desc: '建立、管理 Notion 頁面與資料庫', url: 'https://notion.so', tag: '協作', tagColor: 'bg-purple-500/20 text-purple-300' },
      { name: 'GitHub', desc: '互動 GitHub — Issue、PR、CI 執行與進階查詢', url: 'https://github.com', tag: '開發', tagColor: 'bg-indigo-500/20 text-indigo-300' },
      { name: 'Vercel', desc: 'Vercel 部署標準 — 部署、監控、域名管理', url: 'https://vercel.com', tag: '部署', tagColor: 'bg-green-500/20 text-green-300' },
      { name: 'Browser Automation', desc: '自然語言驅動瀏覽器自動化 — 爬蟲、表單、截圖', url: 'https://clawhub.ai/MaTriXy/agent-browser-clawdbot', tag: '自動化', tagColor: 'bg-orange-500/20 text-orange-300' },
      { name: 'Weather', desc: '天氣查詢 — 當前氣溫與未來預報', url: 'https://wttr.in', tag: '工具', tagColor: 'bg-sky-500/20 text-sky-300' },
      { name: 'Superpowers', desc: 'Spec-first、TDD、子 Agent 驅動的軟體開發工作流', url: 'https://clawhub.ai', tag: '開發', tagColor: 'bg-indigo-500/20 text-indigo-300' },
      { name: 'Agent Team', desc: '多 Agent 團隊協調 — 分工、依賴管理、異步通訊', url: 'https://clawhub.ai', tag: '協調', tagColor: 'bg-pink-500/20 text-pink-300' },
      { name: 'ClawHub', desc: '搜尋、安裝、更新與發布 Agent 技能', url: 'https://clawhub.ai', tag: '工具', tagColor: 'bg-sky-500/20 text-sky-300' },
    ],
  },
  {
    name: '🧠 AI 工具',
    description: '主流 AI 服務 — 文字、圖片、語音、程式碼生成',
    color: 'from-emerald-500 to-teal-600',
    tools: [
      { name: 'ChatGPT', desc: 'OpenAI GPT-4o — 多模態 AI 助手，支援視覺、語音、搜尋', url: 'https://chatgpt.com', tag: '文字', tagColor: 'bg-emerald-500/20 text-emerald-300' },
      { name: 'Claude', desc: 'Anthropic Claude — 長文本理解、程式碼、分析推理', url: 'https://claude.ai', tag: '文字', tagColor: 'bg-emerald-500/20 text-emerald-300' },
      { name: 'Gemini', desc: 'Google Gemini — 深度整合 Google 生態系的 多模態 AI', url: 'https://gemini.google.com', tag: '文字', tagColor: 'bg-emerald-500/20 text-emerald-300' },
      { name: 'Cursor', desc: 'AI 程式碼編輯器 — Worskpaces、Agent Mode、PR 摘要', url: 'https://cursor.com', tag: '程式碼', tagColor: 'bg-violet-500/20 text-violet-300' },
      { name: 'Windsurf', desc: 'Codeium Windsurf — Cascade AI 代理程式碼生成', url: 'https://windsurf.ai', tag: '程式碼', tagColor: 'bg-violet-500/20 text-violet-300' },
      { name: 'GitHub Copilot', desc: 'Microsoft AI 程式碼補全 — 跨語言、跨 IDE', url: 'https://github.com/features/copilot', tag: '程式碼', tagColor: 'bg-violet-500/20 text-violet-300' },
      { name: 'Midjourney', desc: 'AI 圖像生成 — 透過 Discord 指令創建精美視覺', url: 'https://midjourney.com', tag: '圖片', tagColor: 'bg-pink-500/20 text-pink-300' },
      { name: 'DALL·E', desc: 'OpenAI 圖像生成 — GPT-4o 整合，支援編輯與變體', url: 'https://chatgpt.com', tag: '圖片', tagColor: 'bg-pink-500/20 text-pink-300' },
      { name: 'ElevenLabs', desc: 'AI 語音合成 — 文字轉語音、語音克隆、多語言', url: 'https://elevenlabs.io', tag: '語音', tagColor: 'bg-amber-500/20 text-amber-300' },
      { name: 'Hailuo AI', desc: 'AI 影片生成 — S2V、人物動畫、T2V 生成', url: 'https://hailuoai.video', tag: '影片', tagColor: 'bg-red-500/20 text-red-300' },
    ],
  },
  {
    name: '⚡ 生產力工具',
    description: '日常開發與營運必備 — 專案管理、監控、部署工具',
    color: 'from-orange-500 to-red-600',
    tools: [
      { name: 'Vercel', desc: '前端部署平台 — Next.js 原生支援，Serverless Functions', url: 'https://vercel.com', tag: '部署', tagColor: 'bg-slate-500/20 text-slate-300' },
      { name: 'Netlify', desc: 'JAMstack 部署 — 靜態站點、Serverless Functions、Webhook', url: 'https://netlify.com', tag: '部署', tagColor: 'bg-slate-500/20 text-slate-300' },
      { name: 'Cloudflare', desc: 'CDN、DNS、Workers (Serverless)、Pages 部署', url: 'https://cloudflare.com', tag: '基礎設施', tagColor: 'bg-orange-500/20 text-orange-300' },
      { name: 'GitHub', desc: 'Git 托管、Actions CI/CD、Packages、Codespaces', url: 'https://github.com', tag: '開發', tagColor: 'bg-slate-500/20 text-slate-300' },
      { name: 'GitLab', desc: '完整 DevOps 平台 — CI/CD、Container Registry', url: 'https://gitlab.com', tag: '開發', tagColor: 'bg-orange-500/20 text-orange-300' },
      { name: 'Notion', desc: '文件、資料庫、專案管理 — 團隊協作空間', url: 'https://notion.so', tag: '協作', tagColor: 'bg-slate-500/20 text-slate-300' },
      { name: 'Linear', desc: 'Issue 追蹤、專案管理 — 為開發團隊打造的工具', url: 'https://linear.app', tag: '專案', tagColor: 'bg-violet-500/20 text-violet-300' },
      { name: 'Sentry', desc: '應用程式監控 — 錯誤追蹤效能監控、Session Replay', url: 'https://sentry.io', tag: '監控', tagColor: 'bg-rose-500/20 text-rose-300' },
      { name: 'DataDog', desc: '雲端監控 — 基礎設施、APM、Log 管理、Alerting', url: 'https://datadoghq.com', tag: '監控', tagColor: 'bg-rose-500/20 text-rose-300' },
      { name: 'Pingdom', desc: '網站監控 — Uptime、Response Time、SSL 憑證監控', url: 'https://pingdom.com', tag: '監控', tagColor: 'bg-amber-500/20 text-amber-300' },
    ],
  },
  {
    name: '🔧 開發者工具',
    description: 'API、資料庫、开發者平台',
    color: 'from-cyan-500 to-blue-600',
    tools: [
      { name: 'Postman', desc: 'API 測試、Collections、Environment、Mock Server', url: 'https://postman.com', tag: 'API', tagColor: 'bg-orange-500/20 text-orange-300' },
      { name: 'Stripe', desc: '支付基礎設施 — 訂閱、一次付、Connect、Sigma', url: 'https://stripe.com', tag: '支付', tagColor: 'bg-violet-500/20 text-violet-300' },
      { name: 'Supabase', desc: '開源 Firebase 替代 — PostgreSQL、即時訂閱、Auth、Edge Functions', url: 'https://supabase.com', tag: '後端', tagColor: 'bg-emerald-500/20 text-emerald-300' },
      { name: 'Firebase', desc: 'Google 行動與網頁後端平台 — Auth、Firestore、Functions', url: 'https://firebase.google.com', tag: '後端', tagColor: 'bg-amber-500/20 text-amber-300' },
      { name: 'PlanetScale', desc: 'MySQL 相容的無伺服器資料庫 — 分支、熱Clone', url: 'https://planetscale.com', tag: '資料庫', tagColor: 'bg-violet-500/20 text-violet-300' },
      { name: 'Railway', desc: '基礎設施平台 — 資料庫、Redis、Node、Python、價格親民', url: 'https://railway.app', tag: '基礎設施', tagColor: 'bg-cyan-500/20 text-cyan-300' },
      { name: 'Tailscale', desc: 'WireGuard VPN — 零配置組網、Exit Node、Subnet Router', url: 'https://tailscale.com', tag: '網路', tagColor: 'bg-sky-500/20 text-sky-300' },
      { name: 'ngrok', desc: '本地穿透 — 快速暴露本地服務到公共 URL', url: 'https://ngrok.com', tag: '網路', tagColor: 'bg-sky-500/20 text-sky-300' },
    ],
  },
]

const automationItems = [
  { name: '每日系統更新', desc: '每日 05:00 自動執行系統更新，確保所有元件運行在最新版本', schedule: '0 5 * * *', status: '✅ 運行中', statusColor: 'text-emerald-400' },
  { name: '技能掃描', desc: '每日 06:00 掃描並更新可用技能列表，保持能力地圖最新', schedule: '0 6 * * *', status: '✅ 運行中', statusColor: 'text-emerald-400' },
  { name: '每小時進度檢查', desc: '每小時檢查執行中的專案進度，有進展或問題時主動回報', schedule: '0 * * * *', status: '🚀 即將上線', statusColor: 'text-indigo-400' },
  { name: '每日摘要', desc: '每日 09:00 生成昨日專案摘要，包含完成工作、待解決問題', schedule: '0 9 * * *', status: '🚀 即將上線', statusColor: 'text-indigo-400' },
  { name: '每週回顧', desc: '每週一 09:00 執行每週專案回顧，回顧上週進度並規劃本週目標', schedule: '0 9 * * 1', status: '🚀 即將上線', statusColor: 'text-indigo-400' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] px-6 py-24 text-center border-b border-slate-800">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-[128px]"></div>
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-orange-500 rounded-full blur-[128px]"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">⚡ 自動化工具集</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            24/7 自動化開發系統 — 收錄所有 AI 工具連結與簡介，成為你的終極工具入口網站
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <span className="px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-medium border border-indigo-500/30">
              🤖 {toolCategories.reduce((acc, c) => acc + c.tools.length, 0)} 工具收錄
            </span>
            <span className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-medium border border-emerald-500/30">
              ⚡ 5 大分類
            </span>
            <span className="px-4 py-2 rounded-full bg-orange-500/20 text-orange-300 text-sm font-medium border border-orange-500/30">
              🔄 自動更新
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-20">
        {/* Tool Categories */}
        {toolCategories.map((category) => (
          <section key={category.name}>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{category.name}</h2>
            </div>
            <p className="text-slate-400 mb-8">{category.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {category.tools.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-[#1E293B] border border-slate-700 rounded-2xl p-6 card-hover hover:border-indigo-500/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {tool.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${tool.tagColor}`}>
                      {tool.tag}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{tool.desc}</p>
                  <div className="mt-4 flex items-center text-indigo-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    前往連結 →
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}

        {/* Automation Schedule */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-white">⏰ 自動化工作排程</h2>
          </div>
          <p className="text-slate-400 mb-8">Alan 的定時自動化工作流程</p>
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">工作名稱</th>
                  <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium hidden md:table-cell">排程</th>
                  <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {automationItems.map((item) => (
                  <tr key={item.name} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{item.name}</div>
                      <div className="text-sm text-slate-500 mt-0.5">{item.desc}</div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <code className="text-sm font-mono text-indigo-300 bg-slate-800 px-3 py-1 rounded-lg">
                        {item.schedule}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${item.statusColor}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1E293B] to-indigo-900/50 rounded-3xl p-12 md:p-16 text-center border border-indigo-500/20">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-600 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-500 rounded-full blur-[100px]"></div>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">🤖 需要建立新自動化流程？</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              告訴我你的需求，我會自動拆解任務、設定排程並執行
            </p>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
            >
              開始使用 →
            </a>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 text-center text-slate-500 text-sm">
        <p>自動化工具集 · OpenClaw · 24/7 全天候運行</p>
        <p className="mt-1">Last updated: {new Date().toLocaleDateString('zh-TW')}</p>
      </footer>
    </div>
  )
}
