let shelves;
// let binsPer;
let highlightList;
let stockoutList;
let paths = {
  A: "M 6 0 H 100 V 53 H 6 Z H 0 V 53 L 6 77 H 100 L 106 53 V 0 Z M 13 59 V 71 H 93 V 59 H 91 V 69 H 15 V 59 Z", // Path for A bins
  B: "M 9 0 H 131 V 53 H 9 Z H 0 V 53 L 9 77 H 131 L 140 53 V 0 Z M 18 59 V 72 H 120 V 59 H 118 V 70 H 20 V 59 Z", // Path for B bins
  C: "M 10 0 H 202 V 53 H 10 Z H 0 V 53 L 10 77 H 202 L 212 53 V 0 Z M 27 59 V 72 H 183 V 59 H 180 V 69 H 30 V 59 Z", // Path for C bins
  D: "M 8 0 H 292 V 53 H 8 Z H 0 V 53 L 8 76 H 292 L 300 53 V 0 Z M 24 59 V 71 H 276 V 59 H 273 V 69 H 27 V 59 Z", // Path for D bins
};
let shelfSchema; // Define shelfSchema globally

// ---

function buildrack() {
  let rack = document.querySelector("#rack");
  let totalBinsCreated = 0; // Keep track of the total bins created so far

  if (rack === null) {
    console.error("Element with ID 'rack' not found.");
    return;
  }

  // Clear existing content in the rack
  rack.innerHTML = "";

  // Iterate over each shelf in the shelfSchema
  shelfSchema.forEach((shelf) => {
    let shelfDiv = document.createElement("div");
    shelfDiv.classList.add("shelf");
    rack.appendChild(shelfDiv);

    shelf.forEach((item) => {
      if (item.type === "bin") {
        // Increment totalBinsCreated before creating the next bin
        totalBinsCreated++;
        let binDiv = createBinElement(totalBinsCreated, paths[item.size]);
        shelfDiv.appendChild(binDiv);
      } else if (item.type === "gap") {
        let gapDiv = createGapElement(item.size);
        shelfDiv.appendChild(gapDiv);
      }
    });
  });
}
// Helper functions to modularize the creation of bins and gaps.

function createBinElement(binNumber, path) {
  let binDiv = document.createElement("div");
  binDiv.id = "bin" + binNumber;
  binDiv.setAttribute("binNumber", binNumber);
  binDiv.classList.add("bin");
  binDiv.innerHTML = `<svg viewBox="0 0 300 77"><path d="${path}" fill="#FFFFFF"></path></svg>`;

  // Add event listener for bin selection if needed
  binDiv.addEventListener("click", () => selectBin(binDiv.id));

  return binDiv;
}

function createGapElement(size) {
  let gapDiv = document.createElement("div");
  gapDiv.classList.add("gap");
  gapDiv.style.width = size + "px";
  return gapDiv;
}

function updateHighlights() {
  let bins = document.querySelectorAll(".bin");

  bins.forEach((binDiv) => {
    let binNumber = binDiv.getAttribute("binNumber");
    let binSvgPath = binDiv.querySelector("svg path");

    // Retrieve the list of highlighted bins along with their colors
    let highlightList = getValue("Highlight list"); // Expected to be an array of objects { binNumber: Number, color: String }
    let stockoutList = getValue("Stockout list"); // Array of bin numbers
    let binColor = getValue("Bin color"); // Default bin color

    // Reset to default bin color
    binSvgPath.setAttribute("fill", binColor);

    // Check if the bin is in the stockout list
    if (stockoutList && stockoutList.includes(parseInt(binNumber))) {
      binSvgPath.setAttribute("fill", getValue("Stockout color"));
    }
    // Check if the bin is in the highlight list
    if (highlightList && highlightList.includes(parseInt(binNumber))) {
      binSvgPath.setAttribute("fill", getValue("Highlight color"));
    }
  });
}

// Run the updateHighlights function initially and then periodically
updateHighlights();
setInterval(updateHighlights, 1000); // Adjust the interval as needed

function selectBin(binID) {
  let selectedBin = document.getElementById(binID);

  // Toggle the 'selected' class on the clicked bin
  if (selectedBin) {
    selectedBin.classList.toggle("selected");
    // Perform additional actions as needed when a bin is selected
    // Example: fireEvent, setValue, etc.
  }
}

function createBinElement(binId, path) {
  let binDiv = document.createElement("div");
  binDiv.id = "bin" + binId;
  binDiv.setAttribute("binNumber", binId);
  binDiv.classList.add("bin");
  binDiv.innerHTML = `<svg viewBox="0 0 300 77"><path d="${path}"></path></svg>`;

  // Adding click event listener for bin selection
  binDiv.addEventListener("click", () => selectBin(binDiv.id));

  return binDiv;
}

// Assuming updateHighlights needs to be called every second
setInterval(updateHighlights, 1000);

// Parse configuration and build rack on initial load
let configText =
  "[Shelf 1: -1:=10mm, 1:=A, 2:=B, 2-3:=95mm, 3:=A, 4:=D, 4-5:=20cm, 5:=C], [Shelf 2: 1:=B, 2-3:=15mm, 3:=C]";
shelfSchema = parseShelfConfig(configText);
buildrack();

function parseShelfConfig(configText) {
  // Split the configuration text into individual shelf configurations
  let shelfConfigs = configText.match(/\[Shelf \d+: [^\]]+\]/g);

  if (!shelfConfigs) {
    console.error("Invalid configuration format.");
    return [];
  }

  return shelfConfigs.map((shelfConfig) => {
    // Remove the shelf label and brackets
    let configItems = shelfConfig.replace(/\[Shelf \d+: /, "").slice(0, -1);

    // Split the shelf configuration into individual items
    let items = configItems.split(", ");

    return items.map((item) => {
      // Split each item into identifier and value/type using the ':=' operator
      let [identifier, value] = item.split(":=");

      // Determine if the item is a bin or a gap
      if (identifier.includes("-")) {
        // It's a gap
        return { type: "gap", range: identifier, size: value };
      } else {
        // It's a bin
        return { type: "bin", id: parseInt(identifier), size: value };
      }
    });
  });
}


// Start periodic updates of highlights
updateHighlights();
setInterval(updateHighlights, 1000);
