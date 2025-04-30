const fs = require("fs");
const path = require("path");

// Path to the source JSON file
const sourcePath = path.join(__dirname, "..", "cards", "cah-cards-full.json");
// Output directory for separated files
const outputDir = path.join(__dirname, "..", "public", "editions");

// Function to ensure directory exists
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Function to sanitize filename
function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Main function to separate editions
async function separateEditions() {
  try {
    // Create output directory if it doesn't exist
    fs.rmSync(outputDir, { recursive: true, force: true });
    ensureDirectoryExists(outputDir);

    // Read the source JSON file
    const data = fs.readFileSync(sourcePath, "utf8");
    const editions = JSON.parse(data);

    console.log(`Found ${editions.length} editions to process`);
    let editionsName = "";

    // Process each edition
    editions.forEach((edition, i) => {
      const name = edition.name;
      const sanitizedName = sanitizeFilename(name);
      const outputPath = path.join(outputDir, `${sanitizedName}.json`);

      editionsName += `"${name.replaceAll('"', '\\"')}"` + (i < editions.length - 1 ? " | " : "");

      // Write the edition to its own file
      fs.writeFileSync(outputPath, JSON.stringify(edition));
      console.log(`Created ${outputPath}`);
    });

    console.log("All editions have been separated successfully.");

    // Create an index file with just the names and file paths
    const index = editions.map((edition) => ({
      name: edition.name,
      file: `${sanitizeFilename(edition.name)}.json`,
      official: edition.official,
    }));

    fs.writeFileSync(path.join(outputDir, "../../cards/editionsindex.json"), JSON.stringify(index));
    console.log("Created editions index file");
    fs.writeFileSync(
      path.join(outputDir, "../../cards/editions.ts"),
      `export type CardEditionsT = ${editionsName};\nexport const CardEditions = [${editionsName.replaceAll("|", ",").trim()}];`
    );
    console.log("Created editions type file");
  } catch (error) {
    console.error("Error processing files:", error);
  }
}

// Run the separation process
separateEditions();
