"""MCP client for the project's AgentCore Gateway ("cvtools"), whose tools answer from the work history.

Deployment sets AGENTCORE_GATEWAY_CVTOOLS_URL on the Runtime and lets it call the Gateway, which
authorizes with AWS IAM: every MCP request is signed (SigV4) with the Runtime's AWS credentials.
"""
import os

import httpx
from botocore.auth import SigV4Auth
from botocore.awsrequest import AWSRequest
from botocore.session import Session
from mcp.client.streamable_http import streamablehttp_client
from strands.tools.mcp import MCPClient

GATEWAY_URL = os.getenv("AGENTCORE_GATEWAY_CVTOOLS_URL")
REGION = os.getenv("AWS_REGION")


class GatewayAuth(httpx.Auth):
    requires_request_body = True

    def __init__(self, region: str):
        self._credentials = Session().get_credentials()
        self._region = region

    def auth_flow(self, request: httpx.Request):
        signed = AWSRequest(
            method=request.method,
            url=str(request.url),
            data=request.content,
            headers={
                "host": request.url.host,
                "content-type": request.headers.get("content-type", ""),
            },
        )
        SigV4Auth(
            self._credentials.get_frozen_credentials(),
            "bedrock-agentcore",
            self._region,
        ).add_auth(signed)
        request.headers.update(dict(signed.headers))
        yield request


def get_gateway_client() -> MCPClient | None:
    if not GATEWAY_URL:
        return None
    return MCPClient(
        lambda: streamablehttp_client(
            GATEWAY_URL,
            auth=GatewayAuth(REGION),
        )
    )
