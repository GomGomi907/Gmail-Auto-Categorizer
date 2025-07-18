/**
 * 카테고리명(문자열)을 key로, 해당 카테고리에 속하는 키워드(string[] 배열)를 value로 갖는 맵 타입
 * 예: { "업무": ["보고서", "회의"], ... }
 */
export type KeywordMap = { [cat: string]: string[] };

/**
 * 메일 분류 모드: "keyword" (키워드 기반) | "ml" (머신러닝/AI 기반)
 */
export type Mode = "keyword" | "ml";

/**
 * 초기 기본 카테고리별 키워드 맵
 */
export const defaultKeywords: KeywordMap = {
  "광고/이벤트": ["광고", "이벤트", "프로모션"],
  "소셜": ["페이스북", "트위터", "인스타그램"],
  "업무": ["회의", "보고서", "프로젝트"],
  "개인": ["가족", "친구", "개인"],
  일반: []
};

/**
 * 기본 분류 모드 (최초 진입 시 "keyword" 모드)
 */
export const defaultMode: Mode = "keyword";

/**
 * 현재 기본 카테고리명 배열 (defaultKeywords의 key 목록)
 */
export const categories = Object.keys(defaultKeywords);

/**
 * "일반" 카테고리명(기본값)
 */
export const defaultCategory = "일반";

/**
 * KeywordMap의 복사본 (불변 기본값)
 */
export const defaultKeywordMap: KeywordMap = { ...defaultKeywords };

/**
 * 카테고리명 배열(순서 고정)
 */
export const defaultCategoryList = ["광고/이벤트", "소셜", "업무", "개인", "일반"];

/**
 * 각 카테고리별 배경색(hex 코드)
 */
export const defaultCategoryColors: { [cat: string]: string } = {
  "광고/이벤트": "#83781bff",
  소셜: "#03a9f4",
  업무: "#8bc34a",
  개인: "#e91e63",
  일반: "#9e9e9e"
};

/**
 * 각 카테고리별 아이콘명(예: 머티리얼/커스텀 아이콘용)
 */
export const defaultCategoryIcons: { [cat: string]: string } = {
  "광고/이벤트": "ads",
  소셜: "social",
  업무: "work",
  개인: "personal",
  일반: "general"
};

/**
 * 카테고리 기본 표시 순서
 */
export const defaultCategoryOrder: string[] = [
  "광고/이벤트",
  "소셜",
  "업무",
  "개인",
  "일반"
];
