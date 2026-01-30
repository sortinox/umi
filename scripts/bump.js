#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const version = process.argv[2]

if (!version) {
  console.error("Error: Please provide a version string")
  console.error("Usage: yarn bump <version>")
  console.error("Example: yarn bump 1.2.0")
  process.exit(1)
}

// Validate version format (simple check for semantic versioning)
if (!/^\d+\.\d+\.\d+/.test(version)) {
  console.error(`Error: Invalid version format "${version}". Expected semantic versioning (e.g., 1.2.0)`)
  process.exit(1)
}

const childPackages = ["packages/create-umi/package.json", "packages/max/package.json", "packages/plugins/package.json"]

let updatedCount = 0

childPackages.forEach((packagePath) => {
  const fullPath = path.join(__dirname, "..", packagePath)

  try {
    const packageJson = JSON.parse(fs.readFileSync(fullPath, "utf8"))
    const oldVersion = packageJson.version
    packageJson.version = version

    fs.writeFileSync(fullPath, JSON.stringify(packageJson, null, 2) + "\n")
    console.log(`✓ Updated ${packagePath}: ${oldVersion} → ${version}`)
    updatedCount++
  } catch (error) {
    console.error(`✗ Failed to update ${packagePath}: ${error.message}`)
  }
})

console.log(`\nSuccessfully updated ${updatedCount}/${childPackages.length} package(s)`)

if (updatedCount !== childPackages.length) {
  process.exit(1)
}
