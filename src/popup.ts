document.addEventListener("DOMContentLoaded", () => {
  // ========================
  // 1. 분류 모드 라디오 버튼 초기화 및 변경시 storage 저장
  // ========================
  const radios = document.querySelectorAll<HTMLInputElement>("input[name=mode]");

  // storage에서 현재 모드 불러와서 라디오버튼 상태 동기화
  chrome.storage.local.get(["mode"], data => {
    const mode = data.mode || "keyword";
    radios.forEach(r => (r.checked = r.value === mode));
  });

  // 라디오버튼 값이 변경되면 storage에 저장 (모드 변경)
  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.checked) chrome.storage.local.set({ mode: radio.value });
    });
  });

  // ========================
  // 2. 키워드/카테고리 편집(옵션 페이지) 버튼
  // ========================
  const editBtn = document.getElementById("editKeywordsBtn");
  editBtn?.addEventListener("click", () => {
    // 옵션(카테고리/키워드 편집) 페이지를 새 탭으로 연다
    chrome.runtime.openOptionsPage();
    // 팝업 닫기(UX 개선)
    window.close();
  });
});
