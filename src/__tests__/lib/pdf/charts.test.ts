import { buildBarChart, processCharts } from "@/lib/pdf/charts";

describe("buildBarChart", () => {
  it("should return empty string for invalid data", () => {
    expect(buildBarChart("Title", "")).toBe("");
  });

  it("should create chart HTML with correct structure", () => {
    const chart = buildBarChart("Revenue", "Jan=100,Feb=150,Mar=120");
    expect(chart).toContain("chart-container");
    expect(chart).toContain("Revenue");
    expect(chart).toContain("Jan");
    expect(chart).toContain("Feb");
    expect(chart).toContain("Mar");
  });

  it("should calculate percentages correctly", () => {
    const chart = buildBarChart("Test", "A=50,B=100");
    expect(chart).toContain("50.0%");
    expect(chart).toContain("100.0%");
  });

  it("should handle single item", () => {
    const chart = buildBarChart("Single", "Only=100");
    expect(chart).toContain("Only");
    expect(chart).toContain("100.0%");
  });

  it("should handle zero values", () => {
    const chart = buildBarChart("Title", "Zero=0,One=1");
    expect(chart).toContain("0");
    expect(chart).toContain("100.0%");
  });
});

describe("processCharts", () => {
  it("should replace paragraph-wrapped chart markers", () => {
    const html = "<p>[CHART:bar:Title:A=1,B=2]</p>";
    const result = processCharts(html);
    expect(result).toContain("chart-container");
    expect(result).not.toContain("[CHART");
  });

  it("should replace inline chart markers", () => {
    const html = "Some text [CHART:bar:Title:X=10,Y=20] more text";
    const result = processCharts(html);
    expect(result).toContain("chart-container");
    expect(result).toContain("Some text");
    expect(result).not.toContain("[CHART");
  });

  it("should handle multiple chart markers", () => {
    const html =
      "<p>[CHART:bar:Title1:A=1]</p> some text <p>[CHART:bar:Title2:B=2]</p>";
    const result = processCharts(html);
    const matches = result.match(/chart-container/g);
    expect(matches?.length).toBe(2);
  });

  it("should preserve non-chart content", () => {
    const html = "<h1>Header</h1> <p>[CHART:bar:T:A=1]</p> <p>Footer</p>";
    const result = processCharts(html);
    expect(result).toContain("<h1>Header</h1>");
    expect(result).toContain("Footer");
  });
});
