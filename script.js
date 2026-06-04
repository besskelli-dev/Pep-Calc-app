const calcBtn = document.getElementById("calcBtn");
const printBtn = document.getElementById("printBtn");
const convertDoseBtn = document.getElementById("convertDoseBtn");
const installBtn = document.getElementById("installBtn");
const resultBox = document.getElementById("result");
const doseToggle = document.getElementById("doseToggle");
const outputMode = document.getElementById("outputMode");
const confidenceMsg = document.getElementById("confidenceMsg");
const confirmUnit = document.getElementById("confirmUnit");
const confirmSyringe = document.getElementById("confirmSyringe");
const doseHint = document.getElementById("doseHint");
const doseDisplayUnit = document.getElementById("doseDisplayUnit");
const calcViewBtn = document.getElementById("calcViewBtn");
const libraryViewBtn = document.getElementById("libraryViewBtn");
const calculatorView = document.getElementById("calculatorView");
const libraryView = document.getElementById("libraryView");
const librarySearch = document.getElementById("librarySearch");
const statusFilter = document.getElementById("statusFilter");
const categoryFilter = document.getElementById("categoryFilter");
const libraryCards = document.getElementById("libraryCards");
const libraryCount = document.getElementById("libraryCount");
const saveCurrentPresetBtn = document.getElementById("saveCurrentPresetBtn");
const presetNameInput = document.getElementById("presetName");
const customPresetList = document.getElementById("customPresetList");
const copySummaryBtn = document.getElementById("copySummaryBtn");
const copyStatus = document.getElementById("copyStatus");
const reminderType = document.getElementById("reminderType");
const reminderTitle = document.getElementById("reminderTitle");
const reminderWhen = document.getElementById("reminderWhen");
const reminderNotes = document.getElementById("reminderNotes");
const saveReminderBtn = document.getElementById("saveReminderBtn");
const reminderList = document.getElementById("reminderList");
const cleanPrintToggle = document.getElementById("cleanPrintToggle");

const peptideInput = document.getElementById("peptideMg");
const waterInput = document.getElementById("waterMl");
const doseInput = document.getElementById("doseValue");

const fieldErrors = {
  peptideMg: document.getElementById("peptideMgError"),
  waterMl: document.getElementById("waterMlError"),
  doseValue: document.getElementById("doseValueError")
};

let doseUnit = "mg";
let deferredInstallPrompt = null;
const peptideLibraryData = Array.isArray(window.PEPTIDE_LIBRARY) ? window.PEPTIDE_LIBRARY : [];
const PRESET_STORAGE_KEY = "blue-winged-custom-presets";
const REMINDER_STORAGE_KEY = "blue-winged-reminders";
const PRINT_MODE_STORAGE_KEY = "blue-winged-print-clean";
let customPresets = [];
let reminders = [];
let latestSummaryText = "";

doseToggle.querySelectorAll(".toggle-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    setDoseUnit(btn.dataset.unit, true);
  });
});

document.querySelectorAll(".preset-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    peptideInput.value = btn.dataset.peptide;
    waterInput.value = btn.dataset.water;
    clearValidationUI();
    resetResult();
  });
});

calcBtn.addEventListener("click", calculate);
printBtn.addEventListener("click", function () {
  if (!resultBox.classList.contains("hidden")) {
    window.print();
  }
});

convertDoseBtn.addEventListener("click", function () {
  const rawDose = parseFloat(doseInput.value);
  if (!Number.isFinite(rawDose) || rawDose <= 0) {
    fieldErrors.doseValue.textContent = "Enter a valid dose first, then convert.";
    return;
  }

  const targetUnit = doseUnit === "mcg" ? "mg" : "mcg";
  setDoseUnit(targetUnit, true);

  clearValidationUI();
  resetResult();
});

document.querySelectorAll("input").forEach(function (input) {
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      calculate();
    }
  });

  input.addEventListener("input", function () {
    clearValidationUI();
    resetResult();
  });
});

outputMode.addEventListener("change", function () {
  if (!resultBox.classList.contains("hidden")) {
    calculate();
  }
});

[confirmUnit, confirmSyringe].forEach(function (checkbox) {
  checkbox.addEventListener("change", updateConfidenceState);
});

installBtn.addEventListener("click", async function () {
  if (!deferredInstallPrompt) {
    return;
  }

  deferredInstallPrompt.prompt();
  const choiceResult = await deferredInstallPrompt.userChoice;
  if (choiceResult.outcome === "accepted") {
    installBtn.classList.add("hidden");
  }
  deferredInstallPrompt = null;
});

window.addEventListener("beforeinstallprompt", function (event) {
  event.preventDefault();
  deferredInstallPrompt = event;
  installBtn.classList.remove("hidden");
});

window.addEventListener("appinstalled", function () {
  installBtn.classList.add("hidden");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./service-worker.js");
  });
}

calcViewBtn.addEventListener("click", function () {
  switchView("calculator");
});

libraryViewBtn.addEventListener("click", function () {
  switchView("library");
});

[librarySearch, statusFilter, categoryFilter].forEach(function (control) {
  control.addEventListener("input", renderLibrary);
  control.addEventListener("change", renderLibrary);
});

saveCurrentPresetBtn.addEventListener("click", saveCurrentPreset);
customPresetList.addEventListener("click", handleCustomPresetActions);
copySummaryBtn.addEventListener("click", copySummary);
saveReminderBtn.addEventListener("click", saveReminder);
reminderList.addEventListener("click", handleReminderActions);
document.querySelectorAll(".section-toggle").forEach(function (button) {
  button.addEventListener("click", function () {
    const card = button.closest("[data-collapsible]");
    if (!card) {
      return;
    }

    const collapsed = card.classList.toggle("is-collapsed");
    button.setAttribute("aria-expanded", String(!collapsed));
    button.textContent = collapsed ? "Show" : "Hide";
  });
});

cleanPrintToggle.addEventListener("change", function () {
  const enabled = cleanPrintToggle.checked;
  document.body.classList.toggle("print-clean", enabled);
  localStorage.setItem(PRINT_MODE_STORAGE_KEY, enabled ? "1" : "0");
});

updateConfidenceState();
refreshDoseUnitUI();
initializeLibrary();
initializeCustomPresets();
initializeReminders();
initializePrintMode();
initializeMobileCompactMode();

function setDoseUnit(unit, convertExistingValue) {
  const nextUnit = unit === "mg" ? "mg" : "mcg";

  if (convertExistingValue && nextUnit !== doseUnit) {
    convertDoseValue(doseUnit, nextUnit);
  }

  doseUnit = nextUnit;
  doseToggle.querySelectorAll(".toggle-btn").forEach(function (button) {
    const active = button.dataset.unit === doseUnit;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  refreshDoseUnitUI();
  resetResult();
}

function convertDoseValue(fromUnit, toUnit) {
  const rawDose = parseFloat(doseInput.value);
  if (!Number.isFinite(rawDose) || rawDose <= 0) {
    return;
  }

  const converted = PeptideCalc.convertDose(rawDose, fromUnit);
  const nextValue = toUnit === "mg" ? converted.doseMg : converted.doseMcg;
  doseInput.value = PeptideCalc.round(nextValue, 3);
}

function refreshDoseUnitUI() {
  doseDisplayUnit.textContent = doseUnit;

  if (doseUnit === "mcg") {
    convertDoseBtn.textContent = "Convert to mg";
  } else {
    convertDoseBtn.textContent = "Convert to mcg";
  }

  doseHint.textContent = "Current dose unit: " + doseUnit + ". Switching units auto-converts your entered dose.";
}

function calculate() {
  if (!isConfidenceConfirmed()) {
    showError("Complete the Confidence Check before calculating.");
    return;
  }

  const validation = PeptideCalc.validateInputs({
    peptideMg: peptideInput.value,
    waterMl: waterInput.value,
    doseValue: doseInput.value,
    doseUnit: doseUnit
  });

  clearValidationUI();
  if (!validation.valid) {
    showFieldErrors(validation.errors);
    showError("Please correct the highlighted fields before calculating.");
    return;
  }

  const result = PeptideCalc.calculateResult(validation.values);
  showResult(validation.values, result);
}

function showFieldErrors(errors) {
  Object.keys(fieldErrors).forEach(function (key) {
    const hasError = Boolean(errors[key]);
    fieldErrors[key].textContent = errors[key] || "";

    const input = document.getElementById(key);
    const row = input.closest(".input-row");
    if (row) {
      row.classList.toggle("invalid", hasError);
    }
  });
}

function clearValidationUI() {
  Object.keys(fieldErrors).forEach(function (key) {
    fieldErrors[key].textContent = "";
    const input = document.getElementById(key);
    const row = input.closest(".input-row");
    if (row) {
      row.classList.remove("invalid");
    }
  });
}

function selectedOutputMode() {
  const selected = document.querySelector('input[name="mode"]:checked');
  return selected ? selected.value : "both";
}

function renderPrimaryValue(mode, units, volumeMl) {
  if (mode === "units") {
    return {
      headline: "Draw this much on a U-100 insulin syringe:",
      big: PeptideCalc.round(units, 1) + " units",
      sub: "(exact: " + units.toFixed(4) + " units)"
    };
  }

  if (mode === "ml") {
    return {
      headline: "Draw this fluid volume:",
      big: PeptideCalc.round(volumeMl, 3) + " mL",
      sub: "(exact: " + volumeMl.toFixed(6) + " mL)"
    };
  }

  return {
    headline: "Draw this much on a U-100 insulin syringe:",
    big: PeptideCalc.round(units, 1) + " units",
    sub: "(" + PeptideCalc.round(volumeMl, 3) + " mL, exact " + units.toFixed(4) + " units)"
  };
}

function showResult(values, result) {
  const mode = selectedOutputMode();
  const primary = renderPrimaryValue(mode, result.units, result.volumeMl);
  const timestamp = PeptideCalc.formatTimestamp(new Date());
  const syringeVisual = buildSyringeVisual(result.units);
  const dosesPerVialExact = values.peptideMg / values.doseMg;
  const fullDosesPerVial = Math.floor(dosesPerVialExact);
  const remainingMg = values.peptideMg - (fullDosesPerVial * values.doseMg);
  const hasPartialDose = remainingMg > 0;
  const practicalSummary = hasPartialDose
    ? fullDosesPerVial + " full doses + 1 partial dose"
    : fullDosesPerVial + " full doses";
  const doseSummary =
    '<div class="dose-count">Exact dose count: <strong>' +
    PeptideCalc.round(dosesPerVialExact, 2) +
    '</strong><br>Practical dose count: <strong>' +
    practicalSummary +
    '</strong> (~' +
    PeptideCalc.round(remainingMg * 1000, 1) +
    ' mcg left)</div>';

  resultBox.className = "result";
  resultBox.innerHTML =
    '<div class="headline">' + primary.headline + "</div>" +
    '<div class="big">' + primary.big + "</div>" +
    '<div class="big-sub">' + primary.sub + "</div>" +
    doseSummary +
    syringeVisual +
    '<div class="work">' +
      '<div class="work-title">How this was worked out</div>' +
      '<div class="work-line">1. Concentration: ' + values.peptideMg + " mg / " + values.waterMl +
        ' mL = <strong>' + PeptideCalc.round(result.concentrationMgPerMl, 3) + ' mg/mL</strong> (' + PeptideCalc.round(result.concentrationMcgPerMl, 0) + " mcg/mL)</div>" +
      '<div class="work-line">2. Volume for dose: ' + PeptideCalc.round(values.doseMcg, 2) + " mcg / " + PeptideCalc.round(result.concentrationMcgPerMl, 0) +
        ' mcg/mL = <strong>' + PeptideCalc.round(result.volumeMl, 3) + " mL</strong></div>" +
      '<div class="work-line">3. U-100 units: ' + PeptideCalc.round(result.volumeMl, 3) +
        ' mL x 100 = <strong>' + PeptideCalc.round(result.units, 1) + " units</strong></div>" +
      '<div class="work-line">4. Exact dose count: ' + values.peptideMg + ' mg / ' + values.doseMg +
        ' mg = <strong>' + PeptideCalc.round(dosesPerVialExact, 2) + ' doses</strong>; practical: <strong>' + practicalSummary + '</strong></div>' +
    "</div>" +
    '<div class="timestamp">Calculated: ' + timestamp + "</div>";

  latestSummaryText =
    "Blue Winged Solutions - Reconstitution Summary\n" +
    "Calculated: " + timestamp + "\n" +
    "Peptide: " + values.peptideMg + " mg\n" +
    "Bacteriostatic water: " + values.waterMl + " mL\n" +
    "Dose: " + values.doseValue + " " + values.doseUnit + "\n" +
    "Draw: " + PeptideCalc.round(result.units, 1) + " units (" + PeptideCalc.round(result.volumeMl, 3) + " mL)\n" +
    "Concentration: " + PeptideCalc.round(result.concentrationMgPerMl, 3) + " mg/mL\n" +
    "Dose count: exact " + PeptideCalc.round(dosesPerVialExact, 2) + ", practical " + practicalSummary;

  scrollToResult();
}

function showError(message) {
  resultBox.className = "result error";
  resultBox.innerHTML = '<div class="msg">' + message + "</div>";
  scrollToResult();
}

function resetResult() {
  resultBox.className = "result hidden";
  resultBox.innerHTML = "";
  latestSummaryText = "";
}

function buildSyringeVisual(units) {
  const singleSyringeUnits = 100;
  const roundedUnits = PeptideCalc.round(units, 1);
  const clampedPercent = Math.max(0, Math.min(100, (units / singleSyringeUnits) * 100));
  const fullSyringes = Math.floor(units / singleSyringeUnits);
  const remainderUnits = units % singleSyringeUnits;
  const remainderRounded = PeptideCalc.round(remainderUnits, 1);
  const graduationMarks = buildGraduationMarks();

  let note = "";
  if (units > singleSyringeUnits) {
    note = '<div class="syringe-note">Dose exceeds one syringe: ' + fullSyringes + ' full syringe(s) + ' + remainderRounded + ' units.</div>';
  }

  return (
    '<div class="syringe-visual" aria-label="Syringe fill guide">' +
      '<div class="syringe-title">Visual syringe guide (U-100)</div>' +
      '<div class="syringe-bar">' +
        '<div class="syringe-fill" style="width:' + clampedPercent + '%"></div>' +
        '<div class="syringe-marks">' + graduationMarks + '</div>' +
      '</div>' +
      '<div class="syringe-meta">Target: <strong>' + roundedUnits + ' units</strong></div>' +
      note +
    '</div>'
  );
}

function buildGraduationMarks() {
  const marks = [];

  for (let unit = 0; unit <= 100; unit += 2) {
    const left = unit;
    const isMajor = unit % 10 === 0;
    const edgeClass = unit === 0 ? " edge-left" : (unit === 100 ? " edge-right" : "");
    const label = isMajor ? '<span class="tick-label">' + unit + '</span>' : "";
    marks.push(
      '<span class="tick ' + (isMajor ? "major" : "minor") + edgeClass + '" style="left:' + left + '%">' +
        '<span class="tick-line-top"></span>' +
        label +
      '</span>'
    );
  }

  return marks.join("");
}

function isConfidenceConfirmed() {
  return confirmUnit.checked && confirmSyringe.checked;
}

function updateConfidenceState() {
  const ready = isConfidenceConfirmed();
  calcBtn.disabled = !ready;

  if (ready) {
    confidenceMsg.textContent = "Checks complete. You can calculate now.";
  } else {
    confidenceMsg.textContent = "Check both items to enable Calculate.";
  }
}

function scrollToResult() {
  resultBox.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function switchView(viewName) {
  const showLibrary = viewName === "library";
  calculatorView.classList.toggle("hidden", showLibrary);
  libraryView.classList.toggle("hidden", !showLibrary);

  calcViewBtn.classList.toggle("active", !showLibrary);
  libraryViewBtn.classList.toggle("active", showLibrary);
  calcViewBtn.setAttribute("aria-pressed", String(!showLibrary));
  libraryViewBtn.setAttribute("aria-pressed", String(showLibrary));
}

function initializeLibrary() {
  if (!peptideLibraryData.length) {
    libraryCount.textContent = "Library data is unavailable.";
    return;
  }

  populateLibraryFilters();
  renderLibrary();
}

function populateLibraryFilters() {
  const statuses = uniqueValues(peptideLibraryData.map(function (item) {
    return item.status;
  }));

  const categories = uniqueValues(peptideLibraryData.map(function (item) {
    return item.category;
  }));

  statuses.forEach(function (status) {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    statusFilter.appendChild(option);
  });

  categories.forEach(function (category) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function uniqueValues(values) {
  return Array.from(new Set(values)).sort();
}

function renderLibrary() {
  const query = librarySearch.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;
  const selectedCategory = categoryFilter.value;

  const filtered = peptideLibraryData.filter(function (item) {
    const inStatus = selectedStatus === "all" || item.status === selectedStatus;
    const inCategory = selectedCategory === "all" || item.category === selectedCategory;
    const searchableText = [
      item.name,
      item.category,
      item.status,
      item.overview,
      item.evidenceLevel,
      item.commonRisks.join(" "),
      item.contraindications.join(" ")
    ].join(" ").toLowerCase();
    const inSearch = !query || searchableText.indexOf(query) !== -1;
    return inStatus && inCategory && inSearch;
  });

  libraryCount.textContent = "Showing " + filtered.length + " of " + peptideLibraryData.length + " entries.";
  libraryCards.innerHTML = "";

  if (!filtered.length) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "No entries match your filters.";
    libraryCards.appendChild(empty);
    return;
  }

  filtered.forEach(function (item) {
    libraryCards.appendChild(buildLibraryCard(item));
  });
}

function buildLibraryCard(item) {
  const card = document.createElement("article");
  card.className = "library-card";

  const title = document.createElement("h3");
  title.textContent = item.name;

  const meta = document.createElement("div");
  meta.className = "library-meta";

  const category = document.createElement("span");
  category.className = "pill";
  category.textContent = item.category;

  const status = document.createElement("span");
  status.className = "pill status " + statusClass(item.status);
  status.textContent = item.status;

  const evidence = document.createElement("span");
  evidence.className = "pill evidence";
  evidence.textContent = "Evidence: " + item.evidenceLevel;

  meta.appendChild(category);
  meta.appendChild(status);
  meta.appendChild(evidence);

  const overview = document.createElement("p");
  overview.className = "library-overview";
  overview.textContent = item.overview;

  const risks = buildLibraryList("Common risks", item.commonRisks);
  const contraindications = buildLibraryList("Contraindications / cautions", item.contraindications);

  const sourcesTitle = document.createElement("p");
  sourcesTitle.className = "library-list-title";
  sourcesTitle.textContent = "Sources";

  const sourcesList = document.createElement("ul");
  sourcesList.className = "source-links";
  item.sources.forEach(function (source) {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = source.label;
    li.appendChild(link);
    sourcesList.appendChild(li);
  });

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(overview);
  card.appendChild(risks);
  card.appendChild(contraindications);
  card.appendChild(sourcesTitle);
  card.appendChild(sourcesList);

  return card;
}

function buildLibraryList(titleText, items) {
  const wrapper = document.createElement("div");
  const title = document.createElement("p");
  title.className = "library-list-title";
  title.textContent = titleText;

  const list = document.createElement("ul");
  list.className = "library-list";

  items.forEach(function (entry) {
    const li = document.createElement("li");
    li.textContent = entry;
    list.appendChild(li);
  });

  wrapper.appendChild(title);
  wrapper.appendChild(list);
  return wrapper;
}

function statusClass(statusText) {
  const normalized = statusText.toLowerCase();
  if (normalized.indexOf("approved") !== -1) {
    return "approved";
  }

  if (normalized.indexOf("investigational") !== -1 || normalized.indexOf("research") !== -1) {
    return "investigational";
  }

  return "limited";
}

function initializeCustomPresets() {
  try {
    const raw = localStorage.getItem(PRESET_STORAGE_KEY);
    customPresets = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(customPresets)) {
      customPresets = [];
    }
  } catch (error) {
    customPresets = [];
  }

  renderCustomPresets();
}

function persistCustomPresets() {
  localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(customPresets));
}

function saveCurrentPreset() {
  const peptideMg = parseFloat(peptideInput.value);
  const waterMl = parseFloat(waterInput.value);
  const doseValue = parseFloat(doseInput.value);

  if (!Number.isFinite(peptideMg) || !Number.isFinite(waterMl) || !Number.isFinite(doseValue)) {
    copyStatus.textContent = "Enter peptide, water, and dose values before saving a preset.";
    copyStatus.classList.remove("hidden");
    return;
  }

  const name = presetNameInput.value.trim() || ("Preset " + (customPresets.length + 1));
  customPresets.unshift({
    id: String(Date.now()),
    name: name,
    peptideMg: peptideMg,
    waterMl: waterMl,
    doseValue: doseValue,
    doseUnit: doseUnit
  });

  persistCustomPresets();
  renderCustomPresets();
  presetNameInput.value = "";
  copyStatus.textContent = "Preset saved on this device.";
  copyStatus.classList.remove("hidden");
}

function renderCustomPresets() {
  customPresetList.innerHTML = "";

  if (!customPresets.length) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "No saved presets yet.";
    customPresetList.appendChild(empty);
    return;
  }

  customPresets.forEach(function (preset) {
    const item = document.createElement("div");
    item.className = "custom-preset-item";

    const info = document.createElement("div");
    info.innerHTML =
      '<strong>' + escapeHtml(preset.name) + '</strong>' +
      '<div class="meta">' +
      preset.peptideMg + ' mg, ' +
      preset.waterMl + ' mL, ' +
      preset.doseValue + ' ' + preset.doseUnit +
      '</div>';

    const actions = document.createElement("div");
    actions.className = "custom-preset-actions";
    actions.innerHTML =
      '<button class="mini-btn" data-action="load" data-id="' + preset.id + '">Load</button>' +
      '<button class="mini-btn" data-action="rename" data-id="' + preset.id + '">Rename</button>' +
      '<button class="mini-btn" data-action="delete" data-id="' + preset.id + '">Delete</button>';

    item.appendChild(info);
    item.appendChild(actions);
    customPresetList.appendChild(item);
  });
}

function handleCustomPresetActions(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const presetId = button.getAttribute("data-id");
  const action = button.getAttribute("data-action");
  const preset = customPresets.find(function (entry) {
    return entry.id === presetId;
  });

  if (!preset) {
    return;
  }

  if (action === "load") {
    peptideInput.value = preset.peptideMg;
    waterInput.value = preset.waterMl;
    doseInput.value = preset.doseValue;
    setDoseUnit(preset.doseUnit, false);
    clearValidationUI();
    resetResult();
    copyStatus.textContent = "Preset loaded.";
    copyStatus.classList.remove("hidden");
    return;
  }

  if (action === "rename") {
    const nextName = window.prompt("Rename preset:", preset.name);
    if (!nextName) {
      return;
    }

    preset.name = nextName.trim() || preset.name;
    persistCustomPresets();
    renderCustomPresets();
    return;
  }

  if (action === "delete") {
    customPresets = customPresets.filter(function (entry) {
      return entry.id !== presetId;
    });
    persistCustomPresets();
    renderCustomPresets();
  }
}

async function copySummary() {
  if (!latestSummaryText) {
    copyStatus.textContent = "Calculate first, then copy the summary.";
    copyStatus.classList.remove("hidden");
    return;
  }

  try {
    await navigator.clipboard.writeText(latestSummaryText);
    copyStatus.textContent = "Summary copied to clipboard.";
    copyStatus.classList.remove("hidden");
  } catch (error) {
    copyStatus.textContent = "Clipboard blocked. Try again or copy from the result panel.";
    copyStatus.classList.remove("hidden");
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function initializeReminders() {
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    reminders = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(reminders)) {
      reminders = [];
    }
  } catch (error) {
    reminders = [];
  }

  renderReminders();
}

function persistReminders() {
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(reminders));
}

function saveReminder() {
  const whenValue = reminderWhen.value;
  const typeValue = reminderType.value;
  const titleValue = reminderTitle.value.trim() || typeValue;
  const notesValue = reminderNotes.value.trim();

  if (!whenValue) {
    copyStatus.textContent = "Choose a reminder date and time before saving.";
    copyStatus.classList.remove("hidden");
    return;
  }

  reminders.unshift({
    id: String(Date.now()),
    type: typeValue,
    title: titleValue,
    when: whenValue,
    notes: notesValue,
    done: false
  });

  persistReminders();
  renderReminders();

  reminderTitle.value = "";
  reminderNotes.value = "";

  copyStatus.textContent = "Reminder saved.";
  copyStatus.classList.remove("hidden");
}

function renderReminders() {
  reminderList.innerHTML = "";

  if (!reminders.length) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "No reminders yet.";
    reminderList.appendChild(empty);
    return;
  }

  reminders
    .slice()
    .sort(function (a, b) {
      return new Date(a.when).getTime() - new Date(b.when).getTime();
    })
    .forEach(function (reminder) {
      const item = document.createElement("div");
      item.className = "custom-preset-item" + (reminder.done ? " done" : "");

      const info = document.createElement("div");
      const whenDisplay = formatReminderDate(reminder.when);
      info.innerHTML =
        '<strong class="title">' + escapeHtml(reminder.title) + '</strong>' +
        '<div class="meta">' + escapeHtml(reminder.type) + " - " + escapeHtml(whenDisplay) + "</div>" +
        (reminder.notes ? '<div class="meta">Notes: ' + escapeHtml(reminder.notes) + "</div>" : "");

      const actions = document.createElement("div");
      actions.className = "custom-preset-actions";
      actions.innerHTML =
        '<button class="mini-btn" data-reminder-action="toggle" data-id="' + reminder.id + '">' +
          (reminder.done ? "Mark Open" : "Mark Done") +
        "</button>" +
        '<button class="mini-btn" data-reminder-action="ics" data-id="' + reminder.id + '">Add to Calendar</button>' +
        '<button class="mini-btn" data-reminder-action="delete" data-id="' + reminder.id + '">Delete</button>';

      item.appendChild(info);
      item.appendChild(actions);
      reminderList.appendChild(item);
    });
}

function handleReminderActions(event) {
  const button = event.target.closest("button[data-reminder-action]");
  if (!button) {
    return;
  }

  const reminderId = button.getAttribute("data-id");
  const action = button.getAttribute("data-reminder-action");
  const reminder = reminders.find(function (entry) {
    return entry.id === reminderId;
  });

  if (!reminder) {
    return;
  }

  if (action === "toggle") {
    reminder.done = !reminder.done;
    persistReminders();
    renderReminders();
    return;
  }

  if (action === "delete") {
    reminders = reminders.filter(function (entry) {
      return entry.id !== reminderId;
    });
    persistReminders();
    renderReminders();
    return;
  }

  if (action === "ics") {
    downloadReminderICS(reminder);
  }
}

function downloadReminderICS(reminder) {
  const startDate = new Date(reminder.when);
  const endDate = new Date(startDate.getTime() + (30 * 60 * 1000));

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Blue Winged Solutions//Peptide Reminder Planner//EN",
    "BEGIN:VEVENT",
    "UID:" + reminder.id + "@bluewingedsolutions",
    "DTSTAMP:" + toICSDate(new Date()),
    "DTSTART:" + toICSDate(startDate),
    "DTEND:" + toICSDate(endDate),
    "SUMMARY:" + sanitizeICS(reminder.title),
    "DESCRIPTION:" + sanitizeICS((reminder.type + (reminder.notes ? " - " + reminder.notes : ""))),
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = reminder.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".ics";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function toICSDate(date) {
  const pad = function (value) {
    return String(value).padStart(2, "0");
  };

  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

function sanitizeICS(text) {
  return String(text)
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatReminderDate(dateValue) {
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleString();
}

function initializePrintMode() {
  const enabled = localStorage.getItem(PRINT_MODE_STORAGE_KEY) === "1";
  cleanPrintToggle.checked = enabled;
  document.body.classList.toggle("print-clean", enabled);
}

function initializeMobileCompactMode() {
  if (!window.matchMedia("(max-width: 600px)").matches) {
    return;
  }

  document.querySelectorAll("[data-collapsible]").forEach(function (card) {
    card.classList.add("mobile-collapsed");
    card.classList.add("is-collapsed");
    const button = card.querySelector(".section-toggle");
    if (button) {
      button.setAttribute("aria-expanded", "false");
      button.textContent = "Show";
    }
  });
}
