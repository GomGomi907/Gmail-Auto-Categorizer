import { KeywordMap, Mode, defaultKeywords } from "./types";
import { defaultCategoryList, defaultCategoryColors } from "./types";

/**
 * chrome.storage.local에서 키워드 맵(keywordMap)을 불러온다.
 * 값이 없으면 기본값(defaultKeywords)을 사용한다.
 * @param cb - 키워드 맵을 인자로 받는 콜백 함수
 */

/**
 * chrome.storage.local에서 keywordMap을 불러와 콜백(cb)으로 전달한다.
 * 값이 없으면 defaultKeywords를 복사해서 사용.
 */
function getKeywordMap(cb: (map: KeywordMap) => void) {
  chrome.storage.local.get(["keywordMap"], data => {
    cb(data.keywordMap || { ...defaultKeywords });
  });
}

/**
 * keywordMap을 chrome.storage.local에 저장한다.
 * @param map - 저장할 카테고리/키워드 맵
 */
function setKeywordMap(map: KeywordMap) {
  chrome.storage.local.set({ keywordMap: map });
}

/**
 * 카테고리 목록을 options.html에 렌더링한다.
 * 각 카테고리별로 키워드/추가/삭제/입력창 등을 동적으로 생성
 * @param map - 현재 카테고리/키워드 맵
 */
function renderCategoryList(map: KeywordMap) {
  const listDiv = document.getElementById("categoryList")!;
  listDiv.innerHTML = "";
  Object.entries(map).forEach(([cat, keywords]) => {
    const catDiv = document.createElement("div");
    catDiv.className = "category";

    const head = document.createElement("span");
    head.className = "cat-head";
    head.textContent = cat;

    if (!["일반"].includes(cat)) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "삭제";
      delBtn.className = "del-cat-btn";
      delBtn.onclick = () => removeCategory(cat);
      head.appendChild(delBtn);
    }
    catDiv.appendChild(head);

    keywords.forEach(kw => {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = kw;
      // --- 카테고리별 색상 동적 적용 ---
      const color = defaultCategoryColors[cat] || "#1976d2";
      badge.style.background = color;
      badge.style.color = "#fff";
      badge.style.margin = "2px";
      badge.style.borderRadius = "8px";
      badge.style.padding = "2px 8px";
      badge.style.fontSize = "12px";
      // ---------------------------------
      const rm = document.createElement("span");
      rm.className = "remove-btn";
      rm.textContent = "×";
      rm.onclick = () => removeKeyword(cat, kw);
      badge.appendChild(rm);
      catDiv.appendChild(badge);
    });

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "키워드 추가";
    input.className = "input";
    input.addEventListener("keydown", e => {
      if (e.key === "Enter" && input.value.trim()) {
        addKeyword(cat, input.value.trim());
        input.value = "";
      }
    });
    const addBtn = document.createElement("button");
    addBtn.textContent = "추가";
    addBtn.className = "add-btn";
    addBtn.onclick = () => {
      if (input.value.trim()) {
        addKeyword(cat, input.value.trim());
        input.value = "";
      }
    };
    catDiv.appendChild(input);
    catDiv.appendChild(addBtn);

    listDiv.appendChild(catDiv);
  });
}

/**
 * 특정 카테고리에 새로운 키워드를 추가한다.
 * @param cat - 카테고리명
 * @param kw - 추가할 키워드
 */
function addKeyword(cat: string, kw: string) {
  getKeywordMap(map => {
    if (!map[cat].includes(kw)) {
      map[cat].push(kw);
      setKeywordMap(map);
      renderCategoryList(map);
    }
  });
}

/**
 * 특정 카테고리에서 특정 키워드를 삭제한다.
 * @param cat - 카테고리명
 * @param kw - 삭제할 키워드
 */
function removeKeyword(cat: string, kw: string) {
  getKeywordMap(map => {
    map[cat] = map[cat].filter(k => k !== kw);
    setKeywordMap(map);
    renderCategoryList(map);
  });
}

/**
 * 새로운 카테고리를 추가한다. 이미 존재하면 추가하지 않음.
 * @param cat - 추가할 카테고리명
 */
function addCategory(cat: string) {
  getKeywordMap(map => {
    if (!map[cat]) {
      map[cat] = [];
      setKeywordMap(map);
      renderCategoryList(map);
    }
  });
}

/**
 * 특정 카테고리를 삭제한다.
 * @param cat - 삭제할 카테고리명
 */
function removeCategory(cat: string) {
  getKeywordMap(map => {
    delete map[cat];
    setKeywordMap(map);
    renderCategoryList(map);
  });
}

/**
 * DOMContentLoaded 시점에 카테고리/키워드 목록을 그려주고,
 * '카테고리 추가' 버튼의 이벤트 핸들러를 등록한다.
 */
document.addEventListener("DOMContentLoaded", () => {
  getKeywordMap(renderCategoryList);

  document.getElementById("addCatBtn")?.addEventListener("click", () => {
    const input = document.getElementById("newCatName") as HTMLInputElement;
    if (input.value.trim()) {
      addCategory(input.value.trim());
      input.value = "";
    }
  });
});
