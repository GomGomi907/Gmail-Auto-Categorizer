document.addEventListener("DOMContentLoaded", () => {
  // 모드 선택 라디오
  const radios = document.querySelectorAll<HTMLInputElement>("input[name=mode]");
  chrome.storage.local.get(["mode"], data => {
    const mode = data.mode || "keyword";
    radios.forEach(r => (r.checked = r.value === mode));
  });
  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.checked) chrome.storage.local.set({ mode: radio.value });
    });
  });

  // 키워드/카테고리 편집 버튼
  const editBtn = document.getElementById("editKeywordsBtn");
  editBtn?.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });
});
