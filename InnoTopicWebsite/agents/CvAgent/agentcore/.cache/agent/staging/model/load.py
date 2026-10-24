from strands.models.bedrock import BedrockModel


def load_model() -> BedrockModel:
    """Get Bedrock model client using IAM credentials."""
    # Claude Opus 5.5 through Bedrock's global cross-Region inference profile.
    return BedrockModel(model_id="global.anthropic.claude-opus-5-5")
