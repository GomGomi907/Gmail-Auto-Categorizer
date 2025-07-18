/** 카테고리 속성(키워드, 색상 등) 객체 타입 */
export interface CategoryMeta {
  keywords: string[];
  color: string;
  // icon?: string; // 필요시
}

/** 전체 카테고리 맵 */
export type CategoryMap = { [cat: string]: CategoryMeta };

/** 초기값 (앱 최초 실행 시) */
export const defaultCategoryMap: CategoryMap = {
  "광고/이벤트": {
    keywords: ["광고", "이벤트", "프로모션"],
    color: "#ffeb3b",
  },
  "소셜": {
    keywords: ["페이스북", "트위터", "인스타그램"],
    color: "#03a9f4",
  },
  "업무": {
    keywords: ["회의", "보고서", "프로젝트"],
    color: "#8bc34a",
  },
  "개인": {
    keywords: ["가족", "친구", "개인"],
    color: "#e91e63",
  },
  "일반": {
    keywords: [],
    color: "#9e9e9e",
  }
};
