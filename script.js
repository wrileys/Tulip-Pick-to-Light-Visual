let shelves;
let highlightList_1;
let highlightList_2;

let prevHighlightList_1 = [];
let prevHighlightList_2 = [];

let shelfSchema; // Define shelfSchema globally

let horizontalScale = 1;
let verticalScale = 1;
// Generate Bin Paths using dimmensions provided

function generatePath(binType, { horizontalScale, verticalScale }) {
  let binDimensions = getValue("Bin Dimensions").find(
    (b) => b["Bin ID"] === binType
  );

  if (!binDimensions) {
    console.error(`Bin dimensions not found for bin type: ${binType}`);
    return ""; // Return an empty path or some default path
  }

  let totalWidth =
    (binDimensions["Bin Total Width (mm)"] || 106) * horizontalScale;
  let totalHeight =
    (binDimensions["Bin Total Height (mm)"] || 77) * verticalScale;
  let horizontalLip =
    (binDimensions["Bin Horizontal Lip (mm)"] || 8) * horizontalScale;
  let verticalLip =
    (binDimensions["Bin Vertical Lip (mm)"] || 24) * verticalScale;

  return `M ${horizontalLip} 0 H ${totalWidth - horizontalLip} V ${
    totalHeight - verticalLip
  } H ${horizontalLip} Z H 0 V ${
    totalHeight - verticalLip
  } L ${horizontalLip} ${totalHeight} H ${
    totalWidth - horizontalLip
  } L ${totalWidth} ${totalHeight - verticalLip} V 0 Z`;
}

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
        totalBinsCreated++;
        let binDiv = createBinElement(totalBinsCreated, item.size); // Pass bin type
        shelfDiv.appendChild(binDiv);
      } else if (item.type === "gap") {
        let gapDiv = createGapElement(item.size);
        shelfDiv.appendChild(gapDiv);
      }
    });
  });
}

function selectBin(binID) {
  const selectedBin = document.getElementById(binID);
  const previouslySelectedBin = document.querySelector(".bin.selected");

  // If the clicked bin is already selected, unselect it
  if (selectedBin.classList.contains("selected")) {
    selectedBin.classList.remove("selected");
    fireEvent("Bin Selected", 0);
    setValue("Select", null); // Unselect current bin
  } else {
    // Remove 'selected' class from the previously selected bin, if any
    if (previouslySelectedBin) {
      previouslySelectedBin.classList.remove("selected");
    }

    // Select the new bin and fire event with its number
    selectedBin.classList.add("selected");
    fireEvent("Bin Selected", parseInt(selectedBin.getAttribute("binNumber")));
    setValue("Select", parseInt(selectedBin.getAttribute("binNumber")));
  }
}

function createGapElement(sizeInMillimeters) {
  const mmToPx = 1;
  let sizeInPixels = parseInt(sizeInMillimeters) * mmToPx;

  // Apply horizontal scaling
  sizeInPixels *= horizontalScale;

  let gapDiv = document.createElement("div");
  gapDiv.classList.add("gap");

  // Set width in pixels
  gapDiv.style.width = `${sizeInPixels}px`;

  return gapDiv;
}

let toggleHighlight = true; // Global toggle variable

function updateHighlights() {
  let bins = document.querySelectorAll(".bin");
  let currentHighlightList_1 = getValue("Highlight list 1");
  let currentHighlightList_2 = getValue("Highlight list 2");

  // Moved to local variables
  const highlightColor1 = getValue("Highlight color 1");
  const highlightColor2 = getValue("Highlight color 2");

  bins.forEach((binDiv) => {
    let binNumber = parseInt(binDiv.getAttribute("binNumber"));
    let binSvgPath = binDiv.querySelector("svg path");

    let binColor = getValue("Bin color");
    binSvgPath.setAttribute("fill", binColor);

    let isHighlighted1 = currentHighlightList_1.includes(binNumber);
    let isHighlighted2 = currentHighlightList_2.includes(binNumber);

    let newColor = binColor;

    // Toggle which highlight has priority and update color
    if (toggleHighlight) {
      if (isHighlighted1) {
        newColor = highlightColor1;
      } else if (isHighlighted2) {
        newColor = highlightColor2;
      }
    } else {
      if (isHighlighted2) {
        newColor = highlightColor2;
      } else if (isHighlighted1) {
        newColor = highlightColor1;
      }
    }

    if (isHighlighted1 && isHighlighted2) {
      // Assuming newColor is an object with RGBA values and needs to be converted to a color string
      let colorString = `rgba(${newColor.r}, ${newColor.g}, ${newColor.b}, ${newColor.a})`;

      fireEvent("Bin Color Change", {
        "Bin Number": binNumber,
        newColor: newColor,
      });
    }

    binSvgPath.setAttribute("fill", newColor);
  });

  prevHighlightList_1 = currentHighlightList_1.slice();
  prevHighlightList_2 = currentHighlightList_2.slice();

  toggleHighlight = !toggleHighlight;
}

// Run the updateHighlights function initially and then periodically
updateHighlights();
setInterval(updateHighlights, 1500); // Adjust the interval as needed

function createBinElement(binId, binType) {
  let binDiv = document.createElement("div");
  binDiv.id = "bin" + binId;
  binDiv.setAttribute("binNumber", binId);
  binDiv.classList.add("bin");

  let path = generatePath(binType, { horizontalScale, verticalScale });
  let binDimensions = getValue("Bin Dimensions").find(
    (b) => b["Bin ID"] === binType
  );
  let width =
    (binDimensions?.["Bin Total Width (mm)"] || 106) * horizontalScale;
  let height = (binDimensions?.["Bin Total Height (mm)"] || 77) * verticalScale;

  binDiv.innerHTML = `<svg viewBox="0 0 ${width} ${height}"><path d="${path}" fill="red"></path></svg>`;

  // Adjust the height of the bin element
  binDiv.style.height = `${height}px`;

  binDiv.addEventListener("click", () => selectBin(binDiv.id));

  return binDiv;
}

// Assuming updateHighlights needs to be called every second
setInterval(updateHighlights, 1500);

// Parse configuration and build rack on initial load

let rackConfig = getValue("Rack Config Text");
// function parseShelfConfig(rackConfig) {
//   if (!rackConfig || !rackConfig.Shelves) {
//     console.error("Invalid or missing rack configuration.");
//     return [];
//   }

//   return rackConfig.Shelves.map((shelf) => {
//     return shelf.Items.map((item) => {
//       if (item.Type === "Bin") {
//         return { type: "bin", id: item["Bin ID"], size: item["Size(mm)"] };
//       } else if (item.Type === "Gap") {
//         return { type: "gap", size: item["Size(mm)"] };
//       }
//     });
//   });
// }

function parseShelfConfig(stringifiedRackConfig) {
  let newRackConfig;
  try {
    newRackConfig = JSON.parse(stringifiedRackConfig);
  } catch (error) {
    console.error("Invalid or malformed rack configuration JSON.");
    console.log(stringifiedRackConfig);
    return [];
  }

  if (!Array.isArray(newRackConfig)) {
    console.error("Rack configuration is not an array.");
    return [];
  }

  let shelves = {};

  newRackConfig.forEach((item) => {
    shelves[item.Shelf] = shelves[item.Shelf] || [];

    if (item.Type === "Bin") {
      shelves[item.Shelf].push({
        type: "bin",
        size: item.Size,
        binNumber: item["Bin Number"],
      });
    } else if (item.Type === "Gap") {
      shelves[item.Shelf].push({
        type: "gap",
        size: item.Size, // Assuming the size provided is suitable for your use case
      });
    }
  });

  return Object.keys(shelves).map((shelfNumber) => shelves[shelfNumber]);
}

shelfSchema = parseShelfConfig(rackConfig);
buildrack();

// Start periodic updates of highlights
updateHighlights();
setInterval(updateHighlights, 1500);
