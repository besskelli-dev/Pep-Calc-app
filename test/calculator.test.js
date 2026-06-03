const test = require("node:test");
const assert = require("node:assert/strict");
const calc = require("../calculator.js");

test("convertDose converts mcg to mg", function () {
  const result = calc.convertDose(250, "mcg");
  assert.equal(result.doseMg, 0.25);
  assert.equal(result.doseMcg, 250);
});

test("convertDose converts mg to mcg", function () {
  const result = calc.convertDose(0.5, "mg");
  assert.equal(result.doseMg, 0.5);
  assert.equal(result.doseMcg, 500);
});

test("validateInputs rejects invalid values", function () {
  const validation = calc.validateInputs({
    peptideMg: 0,
    waterMl: -1,
    doseValue: 0,
    doseUnit: "mcg"
  });

  assert.equal(validation.valid, false);
  assert.ok(validation.errors.peptideMg);
  assert.ok(validation.errors.waterMl);
  assert.ok(validation.errors.doseValue);
});

test("validateInputs rejects dose larger than vial", function () {
  const validation = calc.validateInputs({
    peptideMg: 5,
    waterMl: 2,
    doseValue: 8,
    doseUnit: "mg"
  });

  assert.equal(validation.valid, false);
  assert.equal(validation.errors.doseValue, "Dose is larger than the entire vial amount.");
});

test("calculateResult computes expected syringe units", function () {
  const result = calc.calculateResult({
    peptideMg: 5,
    waterMl: 2,
    doseMg: 0.25
  });

  assert.equal(calc.round(result.concentrationMgPerMl, 3), 2.5);
  assert.equal(calc.round(result.volumeMl, 3), 0.1);
  assert.equal(calc.round(result.units, 1), 10);
});
