import * as core from "@actions/core";
import * as github from "@actions/github";

import { fetch } from "undici";

const DeployDeemaiApi = "https://deploydeemai.today/api";

interface DeployDeemaiResponse {
  message: string;
  deploydeemai: boolean;
}

async function deployDeemai(): Promise<DeployDeemaiResponse> {
  const response = (await fetch(DeployDeemaiApi).then((r) =>
    r.json()
  )) as DeployDeemaiResponse;

  if (
    "message" in response &&
    "deploydeemai" in response &&
    typeof response.message === "string" &&
    typeof response.deploydeemai === "boolean"
  ) {
    return response;
  } else {
    return {
      message: "ขนาด GitHub Actions นี้ยังทำงานผิดพลาด อย่า deploy เถอะ",
      deploydeemai: false,
    };
  }
}

async function main() {
  const token = core.getInput("token");
  const octokit = github.getOctokit(token);

  const { message, deploydeemai } = await deployDeemai();

  const { pull_request } = github.context.payload;

  if (!pull_request) {
    throw new Error("Pull Request not found");
  }

  await octokit.rest.pulls.createReviewComment({
    ...github.context.repo,
    pull_number: pull_request.number,
    body: `### ${deploydeemai ? "✅" : "❌"} ${message}`,
  });

  if (!deploydeemai) {
    core.setFailed("Please avoid deploying");
  }
}

main().catch((err) => {
  core.setFailed(err.message || `${err}`);
});
