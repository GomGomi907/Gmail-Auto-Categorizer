import { CategoryMap, CategoryMeta, defaultCategoryMap } from "./types";

/** storage에서 CategoryMap을 불러온다. 없으면 defaultCategoryMap 사용 */
function getCategoryMap(cb: (map: CategoryMap) => void) {
  chrome.storage.local.get(["categoryMap"], data => {
    cb(data.categoryMap || { ...defaultCategoryMap });
  });
}

/** CategoryMap을 storage에 저장 */
function setCategoryMap(map: CategoryMap) {
  chrome.storage.local.set({ categoryMap: map });
}

/** 카테고리 목록(및 키워드/컬러 등) 렌더링 */
function renderCategoryList(map: CategoryMap) {
  const listDiv = document.getElementById("categoryList")!;
  listDiv.innerHTML = "";
  Object.entries(map).forEach(([cat, meta]) => {
    const catDiv = document.createElement("div");
    catDiv.className = "category";

    // 카테고리명 + 삭제버튼
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

    // 키워드 뱃지
    meta.keywords.forEach(kw => {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = kw;
      badge.style.background = meta.color || "#1976d2";
      badge.style.color = "#fff";
      badge.style.margin = "2px";
      badge.style.borderRadius = "8px";
      badge.style.padding = "2px 8px";
      badge.style.fontSize = "12px";
      const rm = document.createElement("span");
      rm.className = "remove-btn";
      rm.textContent = "×";
      rm.onclick = () => removeKeyword(cat, kw);
      badge.appendChild(rm);
      catDiv.appendChild(badge);
    });

    // 키워드 추가 input/button
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

    // 색상 변경 input (컬러피커)
    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = meta.color;
    colorInput.className = "color-input";
    colorInput.oninput = () => changeCategoryColor(cat, colorInput.value);
    catDiv.appendChild(colorInput);

    listDiv.appendChild(catDiv);
  });
}

/** 카테고리에 키워드 추가 */
function addKeyword(cat: string, kw: string) {
  getCategoryMap(map => {
    if (!map[cat].keywords.includes(kw)) {
      map[cat].keywords.push(kw);
      setCategoryMap(map);
      renderCategoryList(map);
    }
  });
}

/** 카테고리에서 키워드 삭제 */
function removeKeyword(cat: string, kw: string) {
  getCategoryMap(map => {
    map[cat].keywords = map[cat].keywords.filter(k => k !== kw);
    setCategoryMap(map);
    renderCategoryList(map);
  });
}

/** 카테고리 추가 (색상 선택 지원) */
function addCategory(cat: string, color: string) {
  getCategoryMap(map => {
    if (!map[cat]) {
      map[cat] = { keywords: [], color: color || "#1976d2" };
      setCategoryMap(map);
      renderCategoryList(map);
    }
  });
}

/** 카테고리 색상 변경 */
function changeCategoryColor(cat: string, color: string) {
  getCategoryMap(map => {
    map[cat].color = color;
    setCategoryMap(map);
    renderCategoryList(map);
  });
}

/** 카테고리 삭제 */
function removeCategory(cat: string) {
  getCategoryMap(map => {
    delete map[cat];
    setCategoryMap(map);
    renderCategoryList(map);
  });
}

/** DOMContentLoaded: 카테고리 리스트 렌더링 및 추가 버튼 이벤트 */
document.addEventListener("DOMContentLoaded", () => {
  getCategoryMap(renderCategoryList);

  document.getElementById("addCatBtn")?.addEventListener("click", () => {
    const input = document.getElementById("newCatName") as HTMLInputElement;
    const colorInput = document.getElementById("newCatColor") as HTMLInputElement;
    if (input.value.trim()) {
      addCategory(input.value.trim(), colorInput.value || "#1976d2");
      input.value = "";
      colorInput.value = "#1976d2";
    }
  });
});
