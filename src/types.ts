export type KeywordMap = { [cat: string]: string[] };
export type Mode = "keyword" | "ml";
export const defaultKeywords: KeywordMap = {
  "광고/이벤트": ["광고", "이벤트", "프로모션"],
  "소셜": ["페이스북", "트위터", "인스타그램"],
  "업무": ["회의", "보고서", "프로젝트"],
  "개인": ["가족", "친구", "개인"],
  일반: []
};
export const defaultMode: Mode = "keyword";
export const categories = Object.keys(defaultKeywords);
export const defaultCategory = "일반";
export const defaultKeywordMap: KeywordMap = { ...defaultKeywords };
export const defaultCategoryList = ["광고/이벤트", "소셜", "업무", "개인", "일반"];
export const defaultCategoryColors: { [cat: string]: string } = {
  "광고/이벤트": "#ffeb3b",
  소셜: "#03a9f4",
  업무: "#8bc34a",
  개인: "#e91e63",
  일반: "#9e9e9e"
};
export const defaultCategoryIcons: { [cat: string]: string } = {
  "광고/이벤트": "ads",
  소셜: "social",
  업무: "work",
  개인: "personal",
  일반: "general"
};
export const defaultCategoryOrder: string[] = [
  "광고/이벤트",
  "소셜",
  "업무",
  "개인",
  "일반"
];