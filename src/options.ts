import { KeywordMap, Mode, defaultKeywords } from "./types";

function getKeywordMap(cb: (map: KeywordMap) => void) {
  chrome.storage.local.get(["keywordMap"], data => {
    cb(data.keywordMap || { ...defaultKeywords });
  });
}
function setKeywordMap(map: KeywordMap) {
  chrome.storage.local.set({ keywordMap: map });
}

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

function addKeyword(cat: string, kw: string) {
  getKeywordMap(map => {
    if (!map[cat].includes(kw)) {
      map[cat].push(kw);
      setKeywordMap(map);
      renderCategoryList(map);
    }
  });
}
function removeKeyword(cat: string, kw: string) {
  getKeywordMap(map => {
    map[cat] = map[cat].filter(k => k !== kw);
    setKeywordMap(map);
    renderCategoryList(map);
  });
}
function addCategory(cat: string) {
  getKeywordMap(map => {
    if (!map[cat]) {
      map[cat] = [];
      setKeywordMap(map);
      renderCategoryList(map);
    }
  });
}
function removeCategory(cat: string) {
  getKeywordMap(map => {
    delete map[cat];
    setKeywordMap(map);
    renderCategoryList(map);
  });
}

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
