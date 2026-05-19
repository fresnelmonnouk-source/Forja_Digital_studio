import { processMermaidBlocks } from "@/lib/pdf/mermaid";

describe("processMermaidBlocks", () => {
  it("should convert mermaid code blocks to div elements", () => {
    const html = '<pre><code class="language-mermaid">graph TD\n  A --&gt; B</code></pre>';
    const result = processMermaidBlocks(html);
    expect(result).toContain('<div class="mermaid">');
    expect(result).toContain("graph TD");
    expect(result).not.toContain("<pre>");
  });

  it("should decode HTML entities", () => {
    const html =
      '<pre><code class="language-mermaid">A &lt;--&gt; B &amp; C &quot;text&quot; &#39;quote&#39;</code></pre>';
    const result = processMermaidBlocks(html);
    expect(result).toContain("<-->");
    expect(result).toContain("&");
    expect(result).toContain('"');
    expect(result).toContain("'");
    expect(result).not.toContain("&lt;");
    expect(result).not.toContain("&gt;");
    expect(result).not.toContain("&amp;");
  });

  it("should handle multiple mermaid blocks", () => {
    const html = `<pre><code class="language-mermaid">graph TD</code></pre>
      <p>text</p>
      <pre><code class="language-mermaid">graph LR</code></pre>`;
    const result = processMermaidBlocks(html);
    const matches = result.match(/class="mermaid"/g);
    expect(matches?.length).toBe(2);
  });

  it("should preserve non-mermaid code blocks", () => {
    const html =
      '<pre><code class="language-javascript">const x = 1;</code></pre>';
    const result = processMermaidBlocks(html);
    expect(result).toContain("<pre>");
    expect(result).toContain("javascript");
  });

  it("should handle nested entities", () => {
    const html =
      '<pre><code class="language-mermaid">&lt;img src=&quot;test&quot;&gt;</code></pre>';
    const result = processMermaidBlocks(html);
    expect(result).toContain('<img src="test">');
  });
});
