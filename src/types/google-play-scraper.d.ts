declare module "google-play-scraper" {
  export interface AppSearchResult {
    appId: string;
    title: string;
    developer: string;
    icon: string;
    score: number | null;
    scoreText: string | null;
    ratings: number | null;
    installs: string | null;
    free: boolean;
    price: number;
    priceText: string;
    summary: string;
    url: string;
    genre: string;
    genreId: string;
  }

  export interface AppDetail extends AppSearchResult {
    description: string;
    descriptionHTML: string;
    categories: Array<{ name: string; id: string }>;
  }

  export interface SearchOptions {
    term: string;
    num?: number;
    lang?: string;
    country?: string;
    fullDetail?: boolean;
    throttle?: number;
  }

  export function search(options: SearchOptions): Promise<AppSearchResult[]>;
  export function app(options: { appId: string; lang?: string; country?: string }): Promise<AppDetail>;
  export function similar(options: { appId: string; lang?: string; country?: string }): Promise<AppSearchResult[]>;

  const gplay: {
    search: typeof search;
    app: typeof app;
    similar: typeof similar;
  };
  export default gplay;
}
