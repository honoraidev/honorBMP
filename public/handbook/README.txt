把員工手冊的 PDF 檔放在這個資料夾。

檔名需對應 lib/handbook.ts 內各章節 attachments[].file 設定，例如：
  work-rules-20230327.pdf  →  對應「出勤與工作規範」的「丞石集團工作規則」

畫面上的「預覽」會用 <iframe src="/handbook/檔名"> 內嵌顯示，
「下載」則直接開新分頁指向同一路徑。

attachments[].file 未設定的項目，畫面會顯示「尚未上傳／無檔案」。
