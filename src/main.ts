import * as core from "@actions/core";

async function main() {
  // todo
}

main().catch((err) => {
  core.setFailed(err.message || `${err}`);
});
