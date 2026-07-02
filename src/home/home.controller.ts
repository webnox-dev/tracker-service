import { Controller, Get, Header } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { HomeService } from './home.service';

@ApiExcludeController()
@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  getLandingPage(): string {
    return this.homeService.getLandingPage();
  }

  @Get('tracker.js')
  @Header('Content-Type', 'application/javascript')
  getTrackerJs(): string {
    return `(function () {
  if (window.IntentTrackerInitialized) {
    return;
  }
  window.IntentTrackerInitialized = true;

  const config = window.IntentTracker;
  if (!config || !config.apiKey || !config.endpoint) {
    console.error("IntentTracker config missing");
    return;
  }

  let anonymousId = localStorage.getItem("it_anon_id");
  if (!anonymousId) {
    anonymousId = crypto.randomUUID ? crypto.randomUUID() : generateUUID();
    localStorage.setItem("it_anon_id", anonymousId);
  }

  let sessionId = sessionStorage.getItem("it_sess_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : generateUUID();
    sessionStorage.setItem("it_sess_id", sessionId);
  }

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function sendEvent(eventType, fields = {}) {
    const payload = {
      anonymousId: anonymousId,
      sessionId: sessionId,
      accountId: config.apiKey,
      eventType: eventType,
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer || null,
      timestamp: new Date().toISOString(),
      metadata: {},
      ...fields
    };

    fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      mode: "cors"
    }).catch(err => console.error("Failed to send tracking event", err));
  }

  // Auto-send page view on script load
  sendEvent("page_view");

  // Scroll Tracking (25%, 50%, 75%, 100%)
  const scrollThresholds = [25, 50, 75, 100];
  const reachedThresholds = new Set();
  
  window.addEventListener("scroll", throttle(function() {
    const docEl = document.documentElement;
    const scrollPos = window.scrollY || docEl.scrollTop;
    const totalHeight = docEl.scrollHeight - docEl.clientHeight;
    if (totalHeight <= 0) return;
    
    const percentage = Math.round((scrollPos / totalHeight) * 100);
    
    for (let i = 0; i < scrollThresholds.length; i++) {
      const t = scrollThresholds[i];
      if (percentage >= t && !reachedThresholds.has(t)) {
        reachedThresholds.add(t);
        sendEvent("page_view", { scrollPercentage: t });
      }
    }
  }, 300));

  // Click Tracking
  window.addEventListener("click", function(e) {
    const target = e.target.closest("a, button");
    if (!target) return;
    
    sendEvent("click", {
      metadata: {
        elementId: target.id || null,
        elementClass: target.className || null,
        text: target.innerText?.substring(0, 50) || null,
        href: target.href || null
      }
    });
  });

  // Helper Throttle
  function throttle(func, delay) {
    let lastTime = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastTime >= delay) {
        lastTime = now;
        func.apply(this, args);
      }
    };
  }

  // Simple SPA routing support - watch for pathname changes
  let lastPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      reachedThresholds.clear();
      sendEvent("page_view");
    }
  });
  
  if (document.querySelector("head")) {
    observer.observe(document.querySelector("head"), {
      subtree: true,
      characterData: true,
      childList: true
    });
  }
})();`;
  }
}
