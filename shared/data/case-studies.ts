export interface CaseStudy {
  id: number;
  industry: string;
  iconName: string;
  companyDescription: string;
  summary: string;
  highlight: string;
  url: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 1,
    industry: "製造業",
    iconName: "mdi-factory",
    companyDescription: "株式会社JVCケンウッド様",
    summary:
      "約7万ページの製品情報をMARS FINDERで一元検索。多言語対応でグローバル展開も支援。",
    highlight: "満足度100点",
    url: "https://www.marsflag.com/ja/case-studies/marsfinder/jvckenwood.html",
  },
  {
    id: 2,
    industry: "電機メーカー",
    iconName: "mdi-domain",
    companyDescription: "株式会社日立製作所様",
    summary:
      "約100万ドキュメント・500ドメインの大規模サイト検索を実現。型番検索の精度向上を達成。",
    highlight: "約100万ドキュメント対応",
    url: "https://www.marsflag.com/ja/case-studies/marsfinder/hitachi.html",
  },
  {
    id: 3,
    industry: "公営競技",
    iconName: "mdi-horse",
    companyDescription: "日本中央競馬会（JRA）様",
    summary:
      "年間数十億PVの大規模サイトにMARS FINDERを導入。ユーザビリティが格段に向上。",
    highlight: "ユーザビリティ格段向上",
    url: "https://www.marsflag.com/ja/case-studies/marsfinder/jra.html",
  },
];
