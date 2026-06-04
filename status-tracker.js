/**
 * Peptide Status Tracker
 * Monitors library for status changes and notifies user
 */

const STATUS_SNAPSHOT_KEY = "blue-winged-peptide-snapshot";
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

function formatChangeMessage(changes) {
  if (!changes.length) return "";

  const statusChanges = changes.filter(c => c.type === "status");
  const newPeptides = changes.filter(c => c.type === "new");
  const evidenceChanges = changes.filter(c => c.type === "evidence");

  let message = "";
  if (statusChanges.length) {
    const statusList = statusChanges
      .map(c => `<strong>${c.peptide}</strong>: ${c.oldStatus} → ${c.newStatus}`)
      .join(", ");
    message += `${statusList}. `;
  }

  if (newPeptides.length) {
    const newList = newPeptides.map(c => `<strong>${c.peptide}</strong>`).join(", ");
    message += `New entry: ${newList}. `;
  }

  if (evidenceChanges.length) {
    const evidenceList = evidenceChanges
      .map(c => `<strong>${c.peptide}</strong>: ${c.oldLevel} → ${c.newLevel} evidence`)
      .join(", ");
    message += `Evidence levels updated: ${evidenceList}.`;
  }

  return message;
}

function showStatusBanner(changes) {
  const banner = document.getElementById("statusUpdateBanner");
  const message = document.getElementById("statusUpdateMessage");

  if (!banner || !message) return;

  const formattedMessage = formatChangeMessage(changes);
  if (!formattedMessage) return;

  // Create readable summary
  const summary = changes.map(c => {
    if (c.type === "status") {
      return `${c.peptide} is now ${c.newStatus}`;
    } else if (c.type === "new") {
      return `${c.peptide} added to library`;
    }
    return "";
  }).filter(Boolean).join("; ");

  message.innerHTML = summary;
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
      showStatusBanner(changes);
      // Update snapshot for next visit
      localStorage.setItem(STATUS_SNAPSHOT_KEY, JSON.stringify(currentSnapshot));
    }
  } catch (e) {
    console.error("Error comparing peptide snapshots:", e);
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
          submitBtn.textContent = "✓ Subscribed";
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
}

// Run when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeStatusTracker();
  setupBannerControls();
});
