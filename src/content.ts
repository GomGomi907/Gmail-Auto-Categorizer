import { KeywordMap, Mode, defaultKeywords } from "./types";
function getKeywordMap(cb: (map: KeywordMap) => void) {
  chrome.storage.local.get(["keywordMap"], data => {
    cb(data.keywordMap || { ...defaultKeywords });
  });
}

function addCategoryBadge(mailElem: Element, category: string) {
  if (mailElem.querySelector(".category-badge")) return;
  const badge = document.createElement("span");
  badge.className = "category-badge";
  badge.textContent = category;
  badge.style.cssText =
    "margin-left: 8px; color: white; border-radius: 8px; background:#1976d2; padding:2px 8px; font-size:12px;";
  const subjectElem = mailElem.querySelector(".bog");
  if (subjectElem) subjectElem.appendChild(badge);
}


function keywordCategorize(subject: string, sender: string, body: string, keywordMap: KeywordMap): string {
  for (const [cat, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(kw => subject.includes(kw) || body.includes(kw))) {
      return cat;
    }
  }
  return "일반";
}

function mlCategorize(subject: string, sender: string, body: string): string {
  // 예시: "!"가 많으면 광고
  if ((subject + body).split("!").length > 4) return "광고/이벤트";
  return "일반";
}

function startCategorizer() {
  chrome.storage.local.get(["mode", "keywordMap"], data => {
    const mode: "keyword" | "ml" = data.mode || "keyword";
    let keywordMap: KeywordMap = data.keywordMap;
    if (
      !keywordMap ||
      typeof keywordMap !== "object" ||
      Array.isArray(keywordMap)
    ) {
      keywordMap = defaultKeywords;
    }
    scanAndCategorizeMails(mode, keywordMap);
  });
}

function scanAndCategorizeMails(mode: "keyword" | "ml", keywordMap: KeywordMap) {
  if (!keywordMap || typeof keywordMap !== "object" || Array.isArray(keywordMap)) {
    console.warn("scanAndCategorizeMails: keywordMap 구조 이상", keywordMap);
    return;
  }
  const mailRows = document.querySelectorAll("tr.zA");
  mailRows.forEach(row => {
    const subject = row.querySelector(".bog")?.textContent ?? "";
    const sender = row.querySelector(".yX.xY .yP, .yW .yP")?.textContent ?? "";
    const snippet = row.querySelector(".y2")?.textContent ?? "";
    let category = "일반";
    if (mode === "keyword") {
      category = keywordCategorize(subject, sender, snippet, keywordMap);
    } else if (mode === "ml") {
      category = mlCategorize(subject, sender, snippet);
    }
    addCategoryBadge(row, category);
  });
}


const observer = new MutationObserver(() => {
  startCategorizer();
});
observer.observe(document.body, { childList: true, subtree: true });

startCategorizer();

chrome.storage.onChanged.addListener(changes => {
  if (changes.mode || changes.keywordMap) {
    startCategorizer();
  }
});
