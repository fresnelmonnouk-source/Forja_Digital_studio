import { sanitizeHtml } from "@/lib/pdf/sanitize";

describe("sanitizeHtml (anti-injection PDF)", () => {
  it("retire les balises <script>", () => {
    const out = sanitizeHtml('<p>ok</p><script>alert(1)</script>');
    expect(out).not.toContain("<script");
    expect(out).toContain("<p>ok</p>");
  });

  it("retire les <iframe> / <object> / <embed>", () => {
    expect(sanitizeHtml('<iframe src="evil"></iframe>')).not.toContain("<iframe");
    expect(sanitizeHtml('<object data="x"></object>')).not.toContain("<object");
    expect(sanitizeHtml('<embed src="x">')).not.toContain("<embed");
  });

  it("retire les gestionnaires d'événements inline (onerror, onclick…)", () => {
    const out = sanitizeHtml('<img src="x.jpg" onerror="steal()" />');
    expect(out).not.toMatch(/onerror/i);
    expect(out).toContain("src=");
  });

  it("neutralise les URLs javascript:", () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toMatch(/javascript:/i);
  });

  it("conserve le HTML légitime (figure, img https, listes)", () => {
    const safe = '<figure class="ai-figure"><img src="https://images.unsplash.com/a.jpg" alt="x" /></figure>';
    expect(sanitizeHtml(safe)).toContain("https://images.unsplash.com/a.jpg");
    expect(sanitizeHtml("<ul><li>a</li></ul>")).toBe("<ul><li>a</li></ul>");
  });
});
