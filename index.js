const core = require('@actions/core');
const github = require('@actions/github');

(async function() {
    try {
        const repository = core.getInput('repository');
        core.info(`Listing deployments for ${repository}`);

        const [owner, repo] = repository.split('/');
        const authToken = core.getInput('token');
        const octokit = github.getOctokit(authToken);

        const output = [];
        const seenEnvironments = [];

        for await (const {data: deployments} of octokit.paginate.iterator(
            await octokit.request('GET /repos/{owner}/{repo}/deployments', {
                owner: owner,
                repo: repo,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28',
                    'Accept': 'application/vnd.github.v3+json'
                }
            })
        )) {
            for (const deployment of deployments) {
                core.info(`Deployment: ${deployment.environment} (#${deployment.id})`);
                if (seenEnvironments[deployment.environment]) {
                    continue;
                }
                const {data: statuses } = await octokit.repos.listDeploymentStatuses({
                    owner,
                    repo,
                    deployment_id: deployment.id
                });
                // Ignore deployments without statuses
                if (statuses.length < 1) {
                    continue;
                }
                core.info(`Status: ${deployment.environment} (#${deployment.id}) ${statuses[0].state}`);
                // The list of statuses is sorted on last to first.
                // If it is not queued, this deployment has already been handled.
                seenEnvironments[deployment.environment] = true;
                if (statuses[0].state !== "queued") {
                    continue;
                }
                output.push({
                    environment: deployment.environment,
                    deployment_id: deployment.id,
                    deployment_url: deployment.url,
                    status: statuses[0].state,
                    ref: deployment.ref,
                    deployment: deployment,
                    deployment_status: statuses[0]
                });
            }
        }
        core.info(`Matrix: ${JSON.stringify(output)}`);
        core.setOutput('deployments', {include: output});
    } catch (error) {
        core.debug(error);
        core.setFailed(error.message);
    }
})();
