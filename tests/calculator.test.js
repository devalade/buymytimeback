/**
 * @fileoverview Tests for the calculator module using Node's built-in test runner.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeStats, formatDuration, nf } from "../js/calculator.js";
import { setLang } from "../js/i18n.js";

describe("computeStats", () => {
  it("returns zero stats for an empty list", () => {
    const stats = computeStats([]);
    assert.equal(stats.perDay, 0);
    assert.equal(stats.perWeek, 0);
    assert.equal(stats.perMonth, 0);
    assert.equal(stats.perYear, 0);
    assert.equal(stats.lifePct, 0);
    assert.equal(stats.recoverPerYear, 0);
    assert.equal(stats.recoverDays, 0);
  });

  it("computes totals for a single activity", () => {
    const stats = computeStats([{ id: "a1", name: "Test", minutes: 60 }]);
    assert.equal(stats.perDay, 60);
    assert.equal(stats.perWeek, 420);
    assert.equal(stats.perMonth, 60 * 30.44);
    assert.equal(stats.perYear, 60 * 365.25);
    assert.ok(stats.recoverDays > 0);
  });

  it("sums multiple activities", () => {
    const stats = computeStats([
      { id: "a1", name: "A", minutes: 30 },
      { id: "a2", name: "B", minutes: 45 }
    ]);
    assert.equal(stats.perDay, 75);
    assert.equal(stats.lifePct, (75 / 960) * 100);
  });

  it("treats all listed time as recoverable", () => {
    const stats = computeStats([{ id: "a1", name: "Daily", minutes: 120 }]);
    assert.equal(stats.recoverPerYear, stats.perYear);
    assert.equal(stats.recoverDays, stats.perYear / 1440);
  });
});

describe("formatDuration", () => {
  it("formats minutes only", () => {
    setLang("en");
    assert.equal(formatDuration(45), "45 min");
  });

  it("formats whole hours", () => {
    setLang("en");
    assert.equal(formatDuration(120), "2 h");
  });

  it("formats hours and minutes", () => {
    setLang("en");
    assert.equal(formatDuration(125), "2 h 5");
  });

  it("formats days", () => {
    setLang("en");
    assert.equal(formatDuration(1440), "1 d");
  });

  it("formats days and hours", () => {
    setLang("en");
    assert.equal(formatDuration(1500), "1 d 1 h");
  });

  it("rounds negative values to zero", () => {
    setLang("en");
    assert.equal(formatDuration(-10), "0 min");
  });
});

describe("nf", () => {
  it("formats numbers with locale separators", () => {
    setLang("en");
    assert.equal(nf(1000), "1,000");
  });

  it("rounds decimals", () => {
    setLang("en");
    assert.equal(nf(99.7), "100");
  });
});
