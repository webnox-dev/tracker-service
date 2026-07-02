export class SiteEntity {
  id: string;
  name: string;
  domain: string;
  apiKey: string;
  status: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}
