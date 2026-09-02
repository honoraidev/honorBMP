# 在 Synology NAS 上架設（Docker / Container Manager）

## 需求
- DSM 7.2 以上，已安裝 **Container Manager**
- NAS 可用記憶體 ≥ 1.5 GB（build 時較吃）
- 遠端連線：用 **Tailscale**（不用 DDNS、不用開路由器 port）

---

## A. 把專案放到 NAS
把整個 `perf-app-export` 資料夾（**不含** `node_modules`、`.next`、`data`）複製到，例如：

```
/volume1/docker/chengshi-appraisal/
```

---

## B. 資料庫設定（用現有的外部 MariaDB）
不另外開資料庫容器，直接連現有的 `192.168.0.20:13306`。
連線資訊放在 `.env`（已建好）：

```
DB_HOST=192.168.0.20
DB_PORT=13306
DB_NAME=chengshi-appraisal
DB_USER=honorAIdb
DB_PASSWORD=honorAI27713778@
```

- 這台 DB 上要先有一個叫 `chengshi-appraisal` 的資料庫（獨立於 `urban_renewal`，不會互相影響）。
  沒有的話先建立：`CREATE DATABASE \`chengshi-appraisal\`;`
- 程式只會在裡面建 / 用一張表：`chengshi_appraisal_state`（單列 JSON）。
- `honorAIdb` 這個帳號需要對 `chengshi-appraisal` 有 `CREATE TABLE` 權限（第一次建表用）。
- `.env` 不會進 git、也不會打包進 image（`.dockerignore` 已排除）。

---

## C. 建立專案並啟動
Container Manager → 專案(Project) → 新增：
- 路徑：`/volume1/docker/chengshi-appraisal`
- 來源：使用現有的 `docker-compose.yml`
- 按「建置」→ 第一次會 `npm ci` + `next build`，約 3–8 分鐘

或用 SSH：
```bash
cd /volume1/docker/chengshi-appraisal
sudo docker compose up -d --build
```

> 這個 compose **不會**在 NAS 上開 `3000` 的 LAN port —— 網路完全走 `ts` 這個 Tailscale
> sidecar 容器，跟這台 NAS 上其他服務（`honor-ai-news` 等）的 Tailscale 身分**完全獨立**，
> 不會互相影響、也不會出現在同一個機器名下。啟動後要用 D 段的 Tailscale 網址才能連。

---

## D. Tailscale 連線（獨立 sidecar，HTTPS，免開 port）

這個專案的 `ts` 服務是**專屬於這個 app 的獨立 Tailscale 身分**，不會動到 NAS 本身或其他
服務既有的 Tailscale 設定（例如 `honor-ai-news`、`urban-renewal-system`）。

### D-1. 產生一支新的 Auth Key
到 https://login.tailscale.com/admin/settings/keys → **Generate auth key**：
- Reusable：關（一次性即可，容器起來後就不需要了）
- Expiry：可設久一點（例如 90 天，或視你 tailnet 政策）
- Tags：不加也可以，之後要用 ACL 再回來加

把產生的 key（`tskey-auth-xxxx`）貼到 `docker-compose.yml` 的
`ts.environment.TS_AUTHKEY=` 那行。

### D-2. 啟動
```bash
cd /volume1/docker/chengshi-appraisal
sudo docker compose up -d --build
```
第一次啟動時 `ts` 容器會用這支 key 自動註冊、命名為 `chengshi-appraisal-system`，
你可以到 https://login.tailscale.com/admin/machines 看到它，跟其他機器並列、互不影響。

### D-3. 連線
在任何已加入同一 tailnet 的裝置上開：
```
https://chengshi-appraisal-system.tailXXXX.ts.net/
```
（`tailXXXX` 換成你 tailnet 的實際網域，在後台機器清單點這台就看得到完整網址）
`ts-serve.json` 已經設定好把 443 轉給容器內的 3000，走 HTTPS、有效憑證。

### D-4. 讓其他人能用
到 https://login.tailscale.com/admin/users → **Invite**，對方裝 Tailscale App 登入同一
tailnet 後就能開上面那個網址。**完全不對公網開放**，適合放人事資料 —— 這個 sidecar
沒有設定 Funnel，跟你其他掛 Funnel 的服務不同，不會被公開網際網路存取。

### 查看狀態 / 除錯
```bash
sudo docker exec chengshi-appraisal-ts tailscale serve status
sudo docker logs chengshi-appraisal-ts
```

---

## E. 更新版本
改完程式碼、重新複製檔案後：
```bash
sudo docker compose up -d --build
```

---

## F. 資料持久化（已內建）
啟動時 `instrumentation.ts` 會自動：
- 在 `chengshi-appraisal` 資料庫建表 `chengshi_appraisal_state`（若不存在）
- 從該表載入既有狀態；表是空的就寫入種子資料

之後每次「送出自評 / 初評 / 複評 / 退回 / 人資彙整 / 核決 / 週期設定」都會自動存回 DB。
公司 / 部門 / 員工 / 密碼一律來自 `lib/store.ts` 的種子，不進 DB（改組織直接改程式即可）。

### 驗證
`web` 容器 log 應出現：`[store] hydrated from DB (95 forms)`。
重啟 `web` 容器後資料仍在，即為成功。

### 連不到 DB 會怎樣
`lib/db.ts` 連不上時會在 log 印錯誤，並**退回純記憶體模式**（不會整個掛掉），
但資料就不會保存。確認 NAS 容器能連到 `192.168.0.20:13306`
（同區網預設可通；對方 DB 也要允許此來源 IP 連入，且已建好 `chengshi-appraisal` 這個資料庫）。

### 備份
備份 `192.168.0.20` 那台的 `chengshi-appraisal` 資料庫即可，與 `urban_renewal` 各自獨立。
