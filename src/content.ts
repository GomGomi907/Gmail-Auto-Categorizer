import { CategoryMap, defaultCategoryMap } from "./types";

/**
 * 현재 접속한 서비스가 Gmail인지 판별
 */
function isGoogle(): boolean {
  return location.hostname.includes("mail.google.com");
}

/**
 * 현재 접속한 서비스가 Naver인지 판별
 */
function isNaver(): boolean {
  return location.hostname.includes("naver.com");
}

/**
 * storage에서 CategoryMap을 불러옴. 없으면 defaultCategoryMap 사용.
 */
function getCategoryMap(cb: (map: CategoryMap) => void) {
  chrome.storage.local.get(["categoryMap"], data => {
    cb(data.categoryMap || { ...defaultCategoryMap });
  });
}

/**
 * 본문에서 키워드를 추출
 * 간단히 공백/특수문자로 분리 후 2글자 이상인 토큰만 반환
 */
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(token => token.length > 1);
}

/**
 * 키워드 추출 후 맥락을 이용한 분류 함수
 */
function keywordCategorize(subject: string, sender: string, body: string, map: CategoryMap): string {
  const keywords = extractKeywords(`${subject} ${body}`);
  let bestCategory = "일반";
  let bestScore = 0;

  for (const [cat, meta] of Object.entries(map)) {
    const score = meta.keywords.reduce((acc, kw) => acc + (keywords.includes(kw.toLowerCase()) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat;
    }
  }

  return bestCategory;
}

/**
 * ML 기반 분류 함수 (임시 로직)
 */
function mlCategorize(subject: string, sender: string, body: string): string {
  if ((subject + body).split("!").length > 4) return "광고/이벤트";
  return "일반";
}

/**
 * 카테고리 뱃지를 생성해서 제목 요소에 삽입
 */
function addCategoryBadge(targetElem: Element, category: string, map: CategoryMap) {
  if (targetElem.querySelector(".category-badge")) return;

  const badge = document.createElement("span");
  badge.className = "category-badge";
  badge.textContent = category;

  const color = map[category]?.color || "#1976d2";
  badge.style.background = color;
  badge.style.color = "#fff";
  badge.style.marginLeft = "8px";
  badge.style.borderRadius = "8px";
  badge.style.padding = "2px 8px";
  badge.style.fontSize = "12px";
  badge.style.fontWeight = "bold";

  targetElem.appendChild(badge);
}

/**
 * Gmail 메일 목록 분류 처리
 */
function scanGmailMails(mode: "keyword" | "ml", map: CategoryMap) {
  const mailRows = document.querySelectorAll("tr.zA");
  mailRows.forEach(row => {
    const subjectElem = row.querySelector(".bog");
    const subject = subjectElem?.textContent ?? "";
    const sender = row.querySelector(".yX.xY .yP, .yW .yP")?.textContent ?? "";
    const snippet = row.querySelector(".y2")?.textContent ?? "";

    let category = "일반";
    if (mode === "keyword") {
      category = keywordCategorize(subject, sender, snippet, map);
    } else if (mode === "ml") {
      category = mlCategorize(subject, sender, snippet);
    }

    if (subjectElem?.parentElement) {
      addCategoryBadge(subjectElem.parentElement, category, map);
    }
  });
}

/**
 * Naver 메일 목록 분류 처리
 */
function scanNaverMails(mode: "keyword" | "ml", map: CategoryMap) {
  const mailRows = document.querySelectorAll("li.mail_item");
  mailRows.forEach(row => {
    const subjectElem = row.querySelector(".mail_inner");
    const subject = subjectElem?.textContent?.trim() || "";
    const sender = row.querySelector(".mail_sender")?.textContent?.trim() || "";
    const snippet = row.querySelector(".mail_text, .mail_preview")?.textContent?.trim() || "";

    let category = "일반";
    if (mode === "keyword") {
      category = keywordCategorize(subject, sender, snippet, map);
    } else if (mode === "ml") {
      category = mlCategorize(subject, sender, snippet);
    }

    if (subjectElem) {
      addCategoryBadge(subjectElem, category, map);
    }
  });
}

/**
 * 현재 페이지에 맞는 분류 실행
 */
function scanAndCategorizeMails(mode: "keyword" | "ml", map: CategoryMap) {
  if (isGoogle()) {
    scanGmailMails(mode, map);
  } else if (isNaver()) {
    scanNaverMails(mode, map);
  }
}

/**
 * storage에서 설정값을 불러와 분류 실행
 */
function startCategorizer() {
  chrome.storage.local.get(["mode", "categoryMap"], data => {
    const mode: "keyword" | "ml" = data.mode || "keyword";
    const map: CategoryMap = data.categoryMap || { ...defaultCategoryMap };
    scanAndCategorizeMails(mode, map);
  });
}

/**
 * MutationObserver 설정
 */
let observer: MutationObserver | null = null;
function setupObserver() {
  if (observer) observer.disconnect();

  const target = isGoogle()
    ? document.querySelector(".Cp") ?? document.body
    : document.body;

  observer = new MutationObserver(() => {
    setTimeout(() => {
      startCategorizer();
    }, 500); // 렌더 완료 대기
  });

  observer.observe(target, { childList: true, subtree: true });
}

/**
 * 최초 실행
 */
startCategorizer();
setupObserver();

/**
 * SPA 페이지 전환 감지
 */
let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setupObserver();
    startCategorizer();
  }
}, 1000);

/**
 * storage 변경 감지
 */
chrome.storage.onChanged.addListener((changes) => {
  if (changes.mode || changes.categoryMap) {
    startCategorizer();
  }
});
