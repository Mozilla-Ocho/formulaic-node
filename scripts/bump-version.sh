#!/bin/bash

# Exit immediately if any command fails
set -e

# Available SemVer options
VALID_SEMVER_OPTIONS=("major" "minor" "patch")

# Function to check if a value exists in an array
function contains() {
    local element match="$1"
    shift
    for element; do
        [[ "$element" == "$match" ]] && return 0
    done
    return 1
}

# Check if the user passed an argument for the semver type (default to "patch")
SEMVER=${1:-patch}

# Validate the semver argument
if ! contains "$SEMVER" "${VALID_SEMVER_OPTIONS[@]}"; then
    echo "Invalid semver argument: '$SEMVER'. Valid options are: major, minor, patch."
    exit 1
fi

# Ensure we are in a git repository
if ! git rev-parse --git-dir >/dev/null 2>&1; then
    echo "Not a git repository!"
    exit 1
fi

# Ensure there are no uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "There are uncommitted changes. Please commit or stash them before running this script."
    exit 1
fi

# Increment the version in package.json using npm version command
NEW_VERSION=$(npm version "$SEMVER" --no-git-tag-version)

# Commit the version bump in package.json
git add package.json
git commit -m "Bump version to $NEW_VERSION"

# Create a git tag for the new version
git tag "$NEW_VERSION"

# Push the commit and the tag to the origin remote
git push origin
git push origin "$NEW_VERSION"

echo "Version bumped to $NEW_VERSION and tag pushed to origin."
