import { CategoryMap, defaultCategoryMap } from "./types";

/**
 * storage에서 CategoryMap을 불러옴. 없으면 defaultCategoryMap 사용.
 */
function getCategoryMap(cb: (map: CategoryMap) => void) {
  chrome.storage.local.get(["categoryMap"], data => {
    cb(data.categoryMap || { ...defaultCategoryMap });
  });
}

/**
 * 키워드 기반 분류 함수: 카테고리별 키워드가 하나라도 포함되면 해당 카테고리로 분류.
 */
function keywordCategorize(subject: string, sender: string, body: string, map: CategoryMap): string {
  for (const [cat, meta] of Object.entries(map)) {
    if (meta.keywords.some(kw => subject.includes(kw) || body.includes(kw))) {
      return cat;
    }
  }
  return "일반";
}

/**
 * (예시) ML 기반 분류 함수 - 추후 확장 가능.
 */
function mlCategorize(subject: string, sender: string, body: string): string {
  // 예: "!"가 많으면 광고로 분류 (임시 로직)
  if ((subject + body).split("!").length > 4) return "광고/이벤트";
  return "일반";
}

/**
 * 메일 행(tr.zA)에 카테고리 뱃지를 붙인다.
 */
function addCategoryBadge(mailElem: Element, category: string, map: CategoryMap) {
  if (mailElem.querySelector(".category-badge")) return;
  const badge = document.createElement("span");
  badge.className = "category-badge";
  badge.textContent = category;
  // 카테고리별 색상 적용
  const color = map[category]?.color || "#1976d2";
  badge.style.background = color;
  badge.style.color = "#fff";
  badge.style.marginLeft = "8px";
  badge.style.borderRadius = "8px";
  badge.style.padding = "2px 8px";
  badge.style.fontSize = "12px";
  badge.style.fontWeight = "bold";
  const subjectElem = mailElem.querySelector(".bog");
  if (subjectElem) subjectElem.appendChild(badge);
}

/**
 * 현재 화면의 메일(tr.zA)들을 순회하며 분류 & 뱃지 표시.
 */
function scanAndCategorizeMails(mode: "keyword" | "ml", map: CategoryMap) {
  const mailRows = document.querySelectorAll("tr.zA");
  mailRows.forEach(row => {
    const subject = row.querySelector(".bog")?.textContent ?? "";
    const sender = row.querySelector(".yX.xY .yP, .yW .yP")?.textContent ?? "";
    const snippet = row.querySelector(".y2")?.textContent ?? "";

    let category = "일반";
    if (mode === "keyword") {
      category = keywordCategorize(subject, sender, snippet, map);
    } else if (mode === "ml") {
      category = mlCategorize(subject, sender, snippet);
    }
    addCategoryBadge(row, category, map);
  });
}

/**
 * storage에서 mode/categoryMap을 불러와 메일 분류 실행.
 */
function startCategorizer() {
  chrome.storage.local.get(["mode", "categoryMap"], data => {
    const mode: "keyword" | "ml" = data.mode || "keyword";
    const map: CategoryMap = data.categoryMap || { ...defaultCategoryMap };
    scanAndCategorizeMails(mode, map);
  });
}

// Gmail DOM 변화 감지 → 자동 재분류
const observer = new MutationObserver(() => {
  startCategorizer();
});
observer.observe(document.body, { childList: true, subtree: true });

// 최초 1회 실행
startCategorizer();

// storage 변경시 재분류
chrome.storage.onChanged.addListener(changes => {
  if (changes.mode || changes.categoryMap) {
    startCategorizer();
  }
});
