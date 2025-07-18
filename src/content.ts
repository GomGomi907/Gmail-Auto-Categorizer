import { KeywordMap, Mode, defaultKeywords } from "./types";
import { defaultCategoryList, defaultCategoryColors } from "./types";


/**
 * chrome.storage.local에서 키워드 맵(keywordMap)을 불러온다.
 * 값이 없으면 기본값(defaultKeywords)을 사용한다.
 * @param cb - 키워드 맵을 인자로 받는 콜백 함수
 */
function getKeywordMap(cb: (map: KeywordMap) => void) {
  chrome.storage.local.get(["keywordMap"], data => {
    cb(data.keywordMap || { ...defaultKeywords });
  });
}

/**
 * 메일 행(mailElem)에 카테고리 배지(뱃지)를 추가한다.
 * 이미 배지가 있다면 중복 추가하지 않는다.
 * @param mailElem - Gmail 메일 행(tr.zA)
 * @param category - 분류 결과 카테고리명
 */
function addCategoryBadge(mailElem: Element, category: string) {
  if (mailElem.querySelector(".category-badge")) return;
  const badge = document.createElement("span");
  badge.className = "category-badge";
  badge.textContent = category;
  // --- 카테고리별 색상 동적 적용 ---
  const color = defaultCategoryColors[category] || "#1976d2";
  badge.style.background = color;
  badge.style.color = "#fff";
  badge.style.marginLeft = "8px";
  badge.style.borderRadius = "8px";
  badge.style.padding = "2px 8px";
  badge.style.fontSize = "12px";
  // ---------------------------------
  badge.style.cssText = `
    margin-left: 8px;
    color: white;
    border-radius: 8px;
    background: ${color};
    padding: 2px 8px;
    font-size: 12px;
  `;
  badge.classList.add("category-badge");
  // 메일 제목(bog) 요소에 배지 추가
  // (Gmail DOM 구조에 따라 다를 수 있음)
  const subjectElem = mailElem.querySelector(".bog");
  if (subjectElem) subjectElem.appendChild(badge);
}

/**
 * 키워드 맵을 기준으로 메일(제목, 본문 등)의 카테고리를 분류한다.
 * @param subject - 메일 제목
 * @param sender - 발신자
 * @param body - 본문(미리보기 등)
 * @param keywordMap - 카테고리별 키워드 맵
 * @returns 일치하는 카테고리명(없으면 "일반")
 */
function keywordCategorize(subject: string, sender: string, body: string, keywordMap: KeywordMap): string {
  for (const [cat, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(kw => subject.includes(kw) || body.includes(kw))) {
      return cat;
    }
  }
  return "일반";
}

/**
 * 머신러닝(또는 간단한 ML 흉내) 기반의 분류(예시)
 * 실제론 모델/서버 호출 등을 대체할 수 있음
 * @param subject - 메일 제목
 * @param sender - 발신자
 * @param body - 본문(미리보기 등)
 * @returns 분류된 카테고리명
 */
function mlCategorize(subject: string, sender: string, body: string): string {
  // 예시: "!"가 많으면 광고
  if ((subject + body).split("!").length > 4) return "광고/이벤트";
  return "일반";
}

/**
 * storage에서 분류 모드와 키워드맵을 불러와 메일을 분류 실행(start point).
 * 키워드맵이 비었거나 잘못된 경우 기본값 사용
 */
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

/**
 * 현재 화면의 모든 메일(tr.zA)에 대해 분류를 수행하고, 배지를 추가한다.
 * @param mode - "keyword" | "ml" (분류 방식)
 * @param keywordMap - 카테고리별 키워드 맵
 */
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

// ---- Gmail DOM 변화 감지 및 자동 재분류 ----

/**
 * Gmail 화면에 변화가 있을 때마다 startCategorizer를 실행
 * (메일 목록/내용 변경 자동 반영)
 */
const observer = new MutationObserver(() => {
  startCategorizer();
});
observer.observe(document.body, { childList: true, subtree: true });

/**
 * 최초 1회 실행 (초기 로드)
 */
startCategorizer();

/**
 * 분류 모드/키워드맵이 변경(storage 갱신)될 때 자동 실행
 */
chrome.storage.onChanged.addListener(changes => {
  if (changes.mode || changes.keywordMap) {
    startCategorizer();
  }
});
