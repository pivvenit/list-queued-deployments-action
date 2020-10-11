# List Queued deployments Github Action

This action returns a matrix that contains all deployments of a repository that have the 'queued' status.
We use this action to deploy those queued deployments at a scheduled moment.

## Inputs

### `repository`

**Required** Repository for which to list the queued deployments.

### `Token`

**Required** Github token used to access the REST API to fetch the deployments.

## Outputs

### `deployments`

Matrix containing the following keys (with example data):
```json
{
    "environment": "production",
    "deployment_id": 1234,
    "status": "queued",
    "ref": "deployment ref here",
    "deployment": {/* Raw deployment response from the Github Rest API */},
    "deployment_status": { /* Raw deployment_status response from the Github Rest API */}
}
```

## Example usage
```yaml
uses: pivvenit/list-queued-deployments-action
with:
  token: "${{ github.token }}"
  repository: "${{ github.repository }}"
```