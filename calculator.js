(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.PeptideCalc = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  const LIMITS = {
    peptideMgMin: 0,
    peptideMgMax: 100,
    waterMlMin: 0,
    waterMlMax: 30,
    doseMgMin: 0,
    doseMgMax: 50,
    doseMcgMin: 0,
    doseMcgMax: 50000,
    maxDecimals: 3
  };

  function round(value, places) {
    const factor = Math.pow(10, places);
    return Math.round(value * factor) / factor;
  }

  function countDecimals(value) {
    const parts = String(value).split(".");
    return parts[1] ? parts[1].length : 0;
  }

  function toNumber(value) {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : NaN;
    }

    return parseFloat(String(value).trim());
  }

  function convertDose(doseValue, doseUnit) {
    const numericDose = toNumber(doseValue);

    if (doseUnit === "mg") {
      return {
        doseMg: numericDose,
        doseMcg: numericDose * 1000
      };
    }

    return {
      doseMg: numericDose / 1000,
      doseMcg: numericDose
    };
  }

  function validateInputs(inputs) {
    const errors = {};
    const peptideMg = toNumber(inputs.peptideMg);
    const waterMl = toNumber(inputs.waterMl);
    const doseValue = toNumber(inputs.doseValue);
    const doseUnit = inputs.doseUnit === "mg" ? "mg" : "mcg";

    if (!Number.isFinite(peptideMg) || peptideMg <= LIMITS.peptideMgMin) {
      errors.peptideMg = "Enter a peptide amount greater than 0 mg.";
    } else if (peptideMg > LIMITS.peptideMgMax) {
      errors.peptideMg = "Peptide amount looks too high. Check the vial label.";
    } else if (countDecimals(peptideMg) > LIMITS.maxDecimals) {
      errors.peptideMg = "Use up to 3 decimal places for peptide amount.";
    }

    if (!Number.isFinite(waterMl) || waterMl <= LIMITS.waterMlMin) {
      errors.waterMl = "Enter a water amount greater than 0 mL.";
    } else if (waterMl > LIMITS.waterMlMax) {
      errors.waterMl = "Water amount looks too high for one vial.";
    } else if (countDecimals(waterMl) > LIMITS.maxDecimals) {
      errors.waterMl = "Use up to 3 decimal places for water amount.";
    }

    if (!Number.isFinite(doseValue) || doseValue <= 0) {
      errors.doseValue = "Enter a dose greater than 0.";
    } else if (countDecimals(doseValue) > LIMITS.maxDecimals) {
      errors.doseValue = "Use up to 3 decimal places for dose value.";
    }

    if (!errors.doseValue) {
      if (doseUnit === "mg" && doseValue > LIMITS.doseMgMax) {
        errors.doseValue = "Dose in mg looks too high. Recheck units.";
      }

      if (doseUnit === "mcg" && doseValue > LIMITS.doseMcgMax) {
        errors.doseValue = "Dose in mcg looks too high. Recheck units.";
      }
    }

    const convertedDose = convertDose(doseValue, doseUnit);
    if (!errors.doseValue && !errors.peptideMg && convertedDose.doseMg > peptideMg) {
      errors.doseValue = "Dose is larger than the entire vial amount.";
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors: errors,
      values: {
        peptideMg: peptideMg,
        waterMl: waterMl,
        doseValue: doseValue,
        doseUnit: doseUnit,
        doseMg: convertedDose.doseMg,
        doseMcg: convertedDose.doseMcg
      }
    };
  }

  function calculateResult(values) {
    const concentrationMgPerMl = values.peptideMg / values.waterMl;
    const concentrationMcgPerMl = concentrationMgPerMl * 1000;
    const volumeMl = values.doseMg / concentrationMgPerMl;
    const units = volumeMl * 100;

    return {
      concentrationMgPerMl: concentrationMgPerMl,
      concentrationMcgPerMl: concentrationMcgPerMl,
      volumeMl: volumeMl,
      units: units
    };
  }

  function formatTimestamp(dateObj) {
    const date = dateObj || new Date();
    return date.toLocaleString();
  }

  return {
    LIMITS: LIMITS,
    round: round,
    convertDose: convertDose,
    validateInputs: validateInputs,
    calculateResult: calculateResult,
    formatTimestamp: formatTimestamp
  };
});
