/*
  This script automatically obtains and refreshes the AWS CodeArtifact authentication token
  required for 'yarn' and 'yarn install' commands.

  --- What this Script Does ---
  1. Fetches a new AWS CodeArtifact authentication token (valid for 12 hours).
  2. Saves the token in the '.env.yarn' file in node-site-venom root directory.

  --- How to Use this Script ---
  You can execute this script in two ways:

  Method 1: Direct execution
    node ./auth.js

  Method 2: Using 'yarn auth' (requires 'node_modules' to be installed)
    yarn auth

  Important: If 'node_modules' is not installed (e.g., in a fresh clone of the repository),
  Method 2 will not work. In this case, use Method 1, then run 'yarn' to initially install 'node_modules', i.e.
    node ./auth.js # Method 1
    yarn                                  # Then install 'node_modules'
  Once 'node_modules' are installed, Method 2 ('yarn auth') is the more convenient way to
  authenticate and refresh the AWS CodeArtifact authentication token.

  --- Optional but Recommended ---
  This will automatically execute this script to refresh the AWS CodeArtifact authentication token
  every time a new terminal session is opened.

  Add the following line to your shell startup file (e.g., ~/.bashrc or ~/.zshrc),
  replacing `/path/to/` with the actual path to the 'node-site-venom' directory:
    node /path/to/node-site-venom/auth.js

  --- Automated Refresh ---
  Following git events will execute this script to refresh the CodeArtifact auth token that is valid for 12 hours:
    1. post-commit
    2. post-checkout
    3. post-merge
    4. rebase
*/

const https = require("https");
const fs = require("fs");
const path = require("path");

// --- Configuration ---
// API_URL points to the endpoint that provides the CodeArtifact token.
// API Reference - https://docs.google.com/document/d/1dqzlRm7PinL7qRjsctCxAnae-3wg_D9IXM3Acd6qERw/
const API_URL =
  "https://58uk9xgnc0-vpce-0cf230e42dc69414b.execute-api.us-west-2.amazonaws.com/prod/codeartifact-token";

// Define the path to the file where the token will be stored.
const PATH_TO_NPM_ENVIRONMENT_VARIABLES = path.join(__dirname, ".npmrc");

// Function to fetch a new CodeArtifact token and store it in .env.yarn.
const auth = () =>
  new Promise((resolve, reject) => {
    const req = https.get(API_URL, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsedData = JSON.parse(data);
          const codeArtifactAuthToken = parsedData.authorizationToken;
          // The fetched token will be written to the .env.yarn file and used to authenticate yarn
          // by being exposed as the CODEARTIFACT_AUTH_TOKEN environment variable.
          const firstLine =
            "registry=https://edmunds-codeartifact-783301392013.d.codeartifact.us-west-2.amazonaws.com/npm/npm-edmunds/";
          const envContent = `${firstLine}\n//edmunds-codeartifact-783301392013.d.codeartifact.us-west-2.amazonaws.com/npm/npm-edmunds/:_authToken=${codeArtifactAuthToken}`;
          fs.writeFileSync(PATH_TO_NPM_ENVIRONMENT_VARIABLES, envContent);
          resolve();
        } catch (error) {
          reject(
            new Error(
              `Error parsing API response OR writing to ${PATH_TO_NPM_ENVIRONMENT_VARIABLES}: ${error.message}`,
            ),
          );
        }
      });
    });

    req.on("error", (error) => {
      reject(
        new Error(
          `Error fetching CodeArtifact auth token from API: ${error.message}`,
        ),
      );
    });

    req.end();
  });

// Fetch and store the token.
auth().catch((error) => {
  console.error(error); // eslint-disable-line
});
