/**
 * Peptide Status Tracker
 * Monitors library for status changes and notifies user
 */

const STATUS_SNAPSHOT_KEY = "blue-winged-peptide-snapshot";
const STATUS_HISTORY_KEY = "blue-winged-peptide-history";
const STATUS_HISTORY_LIMIT = 8;
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvgzgvnr"; // Will use Formspree for email collection

function createPeptideSnapshot(library) {
  if (!Array.isArray(library)) return {};
  return library.reduce((acc, peptide) => {
    acc[peptide.name] = {
      status: peptide.status,
      evidenceLevel: peptide.evidenceLevel,
      useCases: peptide.useCases || []
    };
    return acc;
  }, {});
}

function compareSnapshots(oldSnapshot, newSnapshot) {
  const changes = [];

  // Find status changes
  for (const name in newSnapshot) {
    if (oldSnapshot[name]) {
      if (oldSnapshot[name].status !== newSnapshot[name].status) {
        changes.push({
          type: "status",
          peptide: name,
          oldStatus: oldSnapshot[name].status,
          newStatus: newSnapshot[name].status
        });
      }
      if (oldSnapshot[name].evidenceLevel !== newSnapshot[name].evidenceLevel) {
        changes.push({
          type: "evidence",
          peptide: name,
          oldLevel: oldSnapshot[name].evidenceLevel,
          newLevel: newSnapshot[name].evidenceLevel
        });
      }
    }
  }

  // Find new peptides
  for (const name in newSnapshot) {
    if (!oldSnapshot[name]) {
      changes.push({
        type: "new",
        peptide: name,
        status: newSnapshot[name].status
      });
    }
  }

  return changes;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatStatusMessage(change) {
  const peptide = escapeHtml(change.peptide);
  const oldStatus = escapeHtml(change.oldStatus);
  const newStatus = escapeHtml(change.newStatus);

  if (/^approved\b/i.test(change.newStatus)) {
    return `\u2713 ${peptide} moved to Approved status!`;
  }

  return `\u2713 ${peptide} moved from ${oldStatus} to ${newStatus}.`;
}

function formatChangeMessage(changes) {
  if (!Array.isArray(changes) || changes.length === 0) {
    return "";
  }

  const lines = [];

  changes.filter(change => change.type === "status").forEach(change => {
    lines.push(formatStatusMessage(change));
  });

  changes.filter(change => change.type === "new").forEach(change => {
    const peptide = escapeHtml(change.peptide);
    const status = escapeHtml(change.status);
    lines.push(`+ Added ${peptide} (${status}).`);
  });

  changes.filter(change => change.type === "evidence").forEach(change => {
    const peptide = escapeHtml(change.peptide);
    const oldLevel = escapeHtml(change.oldLevel);
    const newLevel = escapeHtml(change.newLevel);
    lines.push(`* ${peptide} evidence changed: ${oldLevel} -> ${newLevel}.`);
  });

  const maxLines = 3;
  const visibleLines = lines.slice(0, maxLines);
  const remainingCount = lines.length - visibleLines.length;

  if (remainingCount > 0) {
    visibleLines.push(`+ ${remainingCount} more update${remainingCount === 1 ? "" : "s"}.`);
  }

  return visibleLines.join("<br>");
}

function formatHistoryLine(change) {
  if (change.type === "status") {
    if (/^approved\b/i.test(change.newStatus)) {
      return "\u2713 " + change.peptide + " moved to Approved status";
    }
    return "\u2713 " + change.peptide + " moved from " + change.oldStatus + " to " + change.newStatus;
  }

  if (change.type === "new") {
    return "+ Added " + change.peptide + " (" + change.status + ")";
  }

  if (change.type === "evidence") {
    return "* " + change.peptide + " evidence changed: " + change.oldLevel + " -> " + change.newLevel;
  }

  return "";
}

function loadStatusHistory() {
  const rawHistory = localStorage.getItem(STATUS_HISTORY_KEY);
  if (!rawHistory) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawHistory);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading status history:", error);
    return [];
  }
}

function saveStatusHistory(history) {
  localStorage.setItem(STATUS_HISTORY_KEY, JSON.stringify(history));
}

function addStatusHistoryEntry(changes) {
  const lines = changes.map(formatHistoryLine).filter(Boolean);
  if (lines.length === 0) {
    return;
  }

  const history = loadStatusHistory();
  history.unshift({
    detectedAt: new Date().toISOString(),
    lines: lines
  });

  saveStatusHistory(history.slice(0, STATUS_HISTORY_LIMIT));
}

function formatDetectedTime(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Detected recently";
  }

  return "Detected " + new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(parsed);
}

function renderStatusHistory() {
  const list = document.getElementById("statusHistoryList");
  const empty = document.getElementById("statusHistoryEmpty");
  const panel = document.getElementById("statusHistoryPanel");

  if (!list || !empty || !panel) {
    return;
  }

  const history = loadStatusHistory();
  list.innerHTML = "";

  if (history.length === 0) {
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");

  history.forEach(entry => {
    const item = document.createElement("article");
    item.className = "status-history-item";

    const time = document.createElement("div");
    time.className = "status-history-time";
    time.textContent = formatDetectedTime(entry.detectedAt);

    const text = document.createElement("div");
    text.className = "status-history-text";
    text.textContent = Array.isArray(entry.lines) ? entry.lines.join(" | ") : "";

    item.appendChild(time);
    item.appendChild(text);
    list.appendChild(item);
  });
}

function clearStatusHistory() {
  localStorage.removeItem(STATUS_HISTORY_KEY);
  renderStatusHistory();
}

function initializeLibraryLastUpdated() {
  const target = document.getElementById("libraryLastUpdated");
  if (!target) {
    return;
  }

  const rawDate = window.PEPTIDE_LIBRARY_LAST_UPDATED;
  if (!rawDate) {
    target.textContent = "Library last updated: not set";
    return;
  }

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    target.textContent = "Library last updated: " + rawDate;
    return;
  }

  const formatted = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(parsed);
  target.textContent = "Library last updated: " + formatted;
}

function showStatusBanner(changes) {
  const banner = document.getElementById("statusUpdateBanner");
  const message = document.getElementById("statusUpdateMessage");

  if (!banner || !message) return;

  const formattedMessage = formatChangeMessage(changes);
  if (!formattedMessage) return;

  message.innerHTML = formattedMessage;
  banner.classList.remove("hidden");
}

function initializeStatusTracker() {
  if (!Array.isArray(window.PEPTIDE_LIBRARY)) return;

  const currentSnapshot = createPeptideSnapshot(window.PEPTIDE_LIBRARY);
  const storedSnapshot = localStorage.getItem(STATUS_SNAPSHOT_KEY);

  if (!storedSnapshot) {
    // First visit - save snapshot
    localStorage.setItem(STATUS_SNAPSHOT_KEY, JSON.stringify(currentSnapshot));
    return;
  }

  try {
    const oldSnapshot = JSON.parse(storedSnapshot);
    const changes = compareSnapshots(oldSnapshot, currentSnapshot);

    if (changes.length > 0) {
      addStatusHistoryEntry(changes);
      showStatusBanner(changes);
      renderStatusHistory();
    }

    // Keep snapshot in sync with current data after a successful compare.
    localStorage.setItem(STATUS_SNAPSHOT_KEY, JSON.stringify(currentSnapshot));
  } catch (e) {
    console.error("Error comparing peptide snapshots:", e);
    localStorage.setItem(STATUS_SNAPSHOT_KEY, JSON.stringify(currentSnapshot));
  }
}

function setupBannerControls() {
  const dismissBtn = document.getElementById("dismissBannerBtn");
  const emailAlertBtn = document.getElementById("emailAlertBtn");
  const banner = document.getElementById("statusUpdateBanner");
  const modal = document.getElementById("emailAlertModal");
  const modalClose = modal ? modal.querySelector(".modal-close") : null;
  const modalOverlay = modal ? modal.querySelector(".modal-overlay") : null;
  const emailForm = document.getElementById("emailAlertForm");
  const clearHistoryBtn = document.getElementById("clearStatusHistoryBtn");

  if (dismissBtn) {
    dismissBtn.addEventListener("click", () => {
      banner.classList.add("hidden");
    });
  }

  if (emailAlertBtn) {
    emailAlertBtn.addEventListener("click", () => {
      if (modal) modal.classList.remove("hidden");
    });
  }

  if (modalClose) {
    modalClose.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }

  if (emailForm) {
    emailForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = emailForm.querySelector("input[type='email']").value;

      // Send to Formspree
      try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email,
            message: "User subscribed to peptide status update alerts via Pep-Calc app"
          })
        });

        if (response.ok) {
          const submitBtn = emailForm.querySelector("button[type='submit']");
          submitBtn.textContent = "\u2713 Subscribed";
          submitBtn.disabled = true;
          setTimeout(() => {
            modal.classList.add("hidden");
          }, 1200);
        }
      } catch (error) {
        console.error("Error submitting email:", error);
        alert("Could not subscribe. Please try again later.");
      }
    });
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
      clearStatusHistory();
    });
  }
}

// Run when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeLibraryLastUpdated();
  initializeStatusTracker();
  renderStatusHistory();
  setupBannerControls();
});
