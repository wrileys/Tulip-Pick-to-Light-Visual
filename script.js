let shelves;
let binsPer;
let highlightList;
let stockoutList;
let paths = [
  "M 5 0 H 98 V 52.8 H 5 Z H 0 V 52.8 L 5 76.8 H 98 L 103 52.8 V 0 Z M 13.5 58.8 V 70.8 H 89.5 V 58.8 H 88.3 V 69.36 H 14.7 V 58.8 Z",
];

// Replace d3.range with a custom function
function range(value) {
  return Array.from({ length: value }, (_, i) => i);
}

function updateRackSettings(key, value) {
  if (key === "Shelves") {
    shelves = range(value);
    console.log("Updated Shelves:", shelves);
  } else if (key === "Bins per shelf") {
    binsPer = range(value);
    console.log("Updated Bins:", binsPer);
  }

  // Call buildrack() only if both shelves and binsPer are initialized
  if (shelves !== undefined && binsPer !== undefined) {
    buildrack();
  }
}

// Now, use this function for both Shelves and Bins per shelf
getValue("Shelves", (value) => updateRackSettings("Shelves", value));
getValue("Bins per shelf", (value) =>
  updateRackSettings("Bins per shelf", value)
);

setInterval(updateHighlights, 1000);

// Highlight bins
function updateHighlights() {
  const bins = document.querySelectorAll(".bin svg");
  bins.forEach((binSvg) => {
    const bg = binSvg.querySelector("#bg");
    const binNumber = parseInt(binSvg.parentNode.getAttribute("binNumber"));

    let highlightList = getValue("Highlight list");
    let stockoutList = getValue("Stockout list");
    let gapList = getValue("Gap List"); // Get the Gap list

    let highlightColor = getValue("Highlight color");
    let stockoutColor = getValue("Stockout color");
    let binColor = getValue("Bin color");

    if (gapList && gapList.includes(binNumber)) {
      // Check for Gap list first
      bg.setAttribute("fill", "transparent");
    } else if (stockoutList && stockoutList.includes(binNumber)) {
      bg.setAttribute("fill", stockoutColor);
    } else if (highlightList && highlightList.includes(binNumber)) {
      bg.setAttribute("fill", highlightColor);
    } else {
      bg.setAttribute("fill", binColor);
    }
  });
}

// Selection code
function selectBin(binID) {
  const selectedBin = document.getElementById(binID);
  if (!selectedBin.classList.contains("highlight")) {
    document.querySelectorAll(".bin").forEach((bin) => {
      bin.classList.remove("highlight");
    });
    selectedBin.classList.add("highlight");
    fireEvent("Bin Selected", parseInt(selectedBin.getAttribute("binNumber")));
    setValue("Select", parseInt(selectedBin.getAttribute("binNumber")));
  } else {
    document.querySelectorAll(".bin").forEach((bin) => {
      bin.classList.remove("highlight");
    });
    fireEvent("Bin Selected", 0);
  }
}

// Build rack
function buildrack() {
  const rack = document.querySelector("#rack");
  // Check that the rack element actually exists
  if (rack !== null && binsPer !== null && shelves !== null) {
    while (rack.firstChild) {
      rack.removeChild(rack.firstChild);
    }
    // Set Background color
    document.body.style.backgroundColor =
      getValue("Background Color") || "white";
    // Add new shelves and bins
    shelves.forEach((shelfId) => {
      const shelfDiv = document.createElement("div");
      shelfDiv.id = "shelf" + shelfId.toString();
      shelfDiv.classList.add("shelf");
      rack.appendChild(shelfDiv);

      // Add the actual shelf
      const shelfBottom = document.createElement("div");
      shelfBottom.classList.add("shelf-bottom");
      shelfDiv.appendChild(shelfBottom);

      console.log("binsPer before loop:", binsPer);
      binsPer.forEach((binId) => {
        const binDiv = document.createElement("div");
        const binCalc = shelfId * getValue("Bins per shelf") + binId + 1;
        binDiv.id = "bin" + binCalc;
        binDiv.setAttribute("binNumber", binCalc.toString());
        binDiv.setAttribute("onclick", `selectBin('${binDiv.id}')`);
        binDiv.classList.add("bin");

        const binSvg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        binSvg.setAttribute("width", "100%");
        binSvg.setAttribute("height", "100%"); // Set height to 100% as well
        binSvg.setAttribute("viewBox", "0 0 104.78 76.20"); // Adjust this based on your actual SVG paths

        const pathBg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        pathBg.id = "bg";
        pathBg.setAttribute("d", paths[0]);
        pathBg.setAttribute("fill-opacity", "0.5");

        const pathLines1 = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        pathLines1.id = "lines";
        pathLines1.setAttribute("d", paths[1]);
        pathLines1.setAttribute("stroke-width", "7");

        const pathLines2 = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        pathLines2.id = "lines";
        pathLines2.setAttribute("d", paths[2]);
        pathLines2.setAttribute("stroke-width", "7");

        binSvg.appendChild(pathBg);
        binSvg.appendChild(pathLines1);
        binSvg.appendChild(pathLines2);
        binDiv.appendChild(binSvg);
        shelfDiv.appendChild(binDiv);
      });
    });

    // Update the highlights
    updateHighlights();
    // Check that the rack element and other variables actually exist
  } else {
    // Detailed debugging information
    if (rack === null) {
      console.error("Element with ID 'rack' not found.");
    }
    if (binsPer === null) {
      console.error("binsPer is null.");
    }
    if (shelves === null) {
      console.error("shelves is null.");
    }
  }
}