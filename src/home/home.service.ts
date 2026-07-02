import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HomeService {
  constructor(private readonly configService: ConfigService) {}

  getLandingPage(): string {
    const serviceName = this.configService.getOrThrow<string>('app.serviceName');
    const swaggerPath = this.configService.getOrThrow<string>('app.swaggerPath');
    const port = this.configService.getOrThrow<number>('app.port');

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${serviceName}</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f4f7fb;
        --panel: rgba(255, 255, 255, 0.86);
        --panel-border: rgba(15, 23, 42, 0.08);
        --text: #0f172a;
        --muted: #475569;
        --accent: #0f766e;
        --accent-strong: #115e59;
        --line: rgba(15, 23, 42, 0.08);
        --shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(20, 184, 166, 0.16), transparent 34%),
          radial-gradient(circle at top right, rgba(14, 165, 233, 0.12), transparent 30%),
          linear-gradient(180deg, #eef4fb 0%, var(--bg) 100%);
      }

      .shell {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 32px 20px;
      }

      .frame {
        width: min(960px, 100%);
        padding: 40px;
        border: 1px solid var(--panel-border);
        border-radius: 28px;
        background: var(--panel);
        backdrop-filter: blur(12px);
        box-shadow: var(--shadow);
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(15, 118, 110, 0.08);
        color: var(--accent-strong);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .eyebrow::before {
        content: "";
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--accent);
        box-shadow: 0 0 0 6px rgba(15, 118, 110, 0.12);
      }

      h1 {
        margin: 22px 0 12px;
        font-size: clamp(40px, 7vw, 68px);
        line-height: 0.95;
        letter-spacing: -0.04em;
      }

      .lead {
        max-width: 620px;
        margin: 0;
        color: var(--muted);
        font-size: 18px;
        line-height: 1.65;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        margin-top: 28px;
      }

      .button,
      .button-secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 170px;
        padding: 14px 18px;
        border-radius: 14px;
        text-decoration: none;
        font-weight: 700;
        transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
      }

      .button {
        color: white;
        background: linear-gradient(135deg, var(--accent) 0%, #0f5f8b 100%);
        box-shadow: 0 18px 30px rgba(15, 118, 110, 0.18);
      }

      .button-secondary {
        color: var(--text);
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.88);
      }

      .button:hover,
      .button-secondary:hover {
        transform: translateY(-1px);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
        margin-top: 36px;
      }

      .stat {
        padding: 18px 18px 20px;
        border-radius: 18px;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.78);
      }

      .label {
        margin: 0 0 8px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .value {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        letter-spacing: -0.03em;
      }

      .detail {
        margin: 4px 0 0;
        color: var(--muted);
        font-size: 14px;
      }

      .note {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 20px;
        margin-top: 26px;
        padding-top: 26px;
        border-top: 1px solid var(--line);
      }

      .section-title {
        margin: 0 0 10px;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .meta-list {
        display: grid;
        gap: 10px;
      }

      .meta-item {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        font-size: 14px;
      }

      .meta-item span:first-child {
        color: var(--muted);
      }

      code,
      pre {
        font-family: "Consolas", "SFMono-Regular", monospace;
      }

      pre {
        margin: 0;
        padding: 18px;
        overflow-x: auto;
        border-radius: 18px;
        border: 1px solid rgba(15, 23, 42, 0.07);
        background: #0f172a;
        color: #dbeafe;
        font-size: 13px;
        line-height: 1.55;
      }

      .footer {
        margin-top: 24px;
        color: var(--muted);
        font-size: 13px;
      }

      @media (max-width: 840px) {
        .frame {
          padding: 28px;
          border-radius: 22px;
        }

        .grid,
        .note {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 560px) {
        .shell {
          padding: 18px;
        }

        .frame {
          padding: 22px;
        }

        .lead {
          font-size: 16px;
        }

        .actions {
          flex-direction: column;
        }

        .button,
        .button-secondary {
          width: 100%;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="frame">
        <div class="eyebrow">B2B Intent Platform</div>
        <h1>Tracker Service</h1>
        <p class="lead">
          Event collection, payload validation, and database persistence for the JavaScript SDK.
          This service is running cleanly on port ${port} and is ready for integrations.
        </p>

        <div class="actions">
          <a class="button" href="/${swaggerPath}">Open Swagger</a>
          <a class="button-secondary" href="/health">View Health Status</a>
        </div>

        <div class="grid">
          <article class="stat">
            <p class="label">Server</p>
            <p class="value">localhost:${port}</p>
            <p class="detail">Primary local access point</p>
          </article>
          <article class="stat">
            <p class="label">Endpoint</p>
            <p class="value">POST /api/v1/events</p>
            <p class="detail">Tracking event ingestion</p>
          </article>
          <article class="stat">
            <p class="label">Status</p>
            <p class="value">Operational</p>
            <p class="detail">Validation, storage, and docs enabled</p>
          </article>
        </div>

        <div class="note">
          <div>
            <p class="section-title">Service Summary</p>
            <div class="meta-list">
              <div class="meta-item">
                <span>Health Check</span>
                <strong>GET /health</strong>
              </div>
              <div class="meta-item">
                <span>Swagger Docs</span>
                <strong>/${swaggerPath}</strong>
              </div>
              <div class="meta-item">
                <span>Response Style</span>
                <strong>Consistent JSON envelopes</strong>
              </div>
            </div>
          </div>

          <div>
            <p class="section-title">Quick Request</p>
            <pre>POST /api/v1/events
{
  "accountId": "demo-site",
  "eventType": "page_view",
  "path": "/pricing"
}</pre>
          </div>
        </div>

        <p class="footer">Simple, production-friendly landing page for quick local verification.</p>
      </section>
    </main>
  </body>
</html>`;
  }
}
