"""Work-history tools for the CV agent, served through AgentCore Gateway (a Lambda target).

Gateway calls this Lambda with the tool's arguments as the event and the tool's name, prefixed with
the target's name ("workHistory___findProjects"), in the client context. The data is the CV page's
work history, exported by scripts/generate-knowledge-base.mjs to work-history.json next to this file.
"""
import json
import unicodedata
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "work-history.json").read_text(encoding="utf-8"))
ORGANISATIONS = DATA["organisations"]
DELIMITER = "___"


def _plain(text):
    """Lowercase without diacritics, so "malaga" finds "Málaga"."""
    return "".join(c for c in unicodedata.normalize("NFD", text or "") if not unicodedata.combining(c)).lower()


def _summary(org):
    return {
        "name": org["name"],
        "period": org["period"],
        "locations": org["locations"],
        "projects": [project["name"] for project in org["projects"]],
    }


def list_organisations(_args):
    """Every organisation, most recent first, with its period, locations and project names."""
    return {"person": DATA["person"], "organisations": [_summary(org) for org in ORGANISATIONS]}


def get_organisation(args):
    """One organisation in full (description, projects, roles, technologies), by name or part of it."""
    name = _plain(args.get("name"))
    matches = [org for org in ORGANISATIONS if name and name in _plain(org["name"])]
    if not matches:
        return {"error": f"No organisation matches {args.get('name')!r}",
                "organisations": [org["name"] for org in ORGANISATIONS]}
    return {"organisations": matches}


def _overlaps(org, since_year, until_year):
    """Whether the organisation's period meets the years; a period without an end is open-ended."""
    ends_after = since_year is None or org["endYear"] is None or org["endYear"] >= since_year
    starts_before = until_year is None or org["startYear"] <= until_year
    return ends_after and starts_before


def find_projects(args):
    """Projects that used a technology and/or mention a text, optionally within a range of years."""
    technology = _plain(args.get("technology"))
    text = _plain(args.get("text"))
    since_year, until_year = args.get("sinceYear"), args.get("untilYear")
    results = []
    for org in ORGANISATIONS:
        if not _overlaps(org, since_year, until_year):
            continue
        for project in org["projects"]:
            used = [tech for tech in project["technologies"] if technology and technology in _plain(tech)]
            haystack = _plain(" ".join(filter(None, [project["name"], project["description"], project["roles"]])))
            if (technology and not used) or (text and text not in haystack):
                continue
            results.append({
                "organisation": org["name"],
                "period": org["period"],
                "project": project["name"],
                "roles": project["roles"],
                "description": project["description"],
                "matchingTechnologies": used,
            })
    return {"count": len(results), "projects": results}


def get_skill_levels(args):
    """Skill levels (has / aiming for), optionally only for topics matching a name."""
    topic = _plain(args.get("topic"))
    groups = []
    for group in DATA["skills"]:
        topics = [t for t in group["topics"] if not topic or topic in _plain(t["topic"])]
        if topics:
            groups.append({"group": group["group"], "comment": group["comment"], "topics": topics})
    return {"skills": groups}


def technology_timeline(args):
    """When, where and for how many distinct years a technology was used across the work history."""
    technology = _plain(args.get("technology"))
    if not technology:
        return {"error": "Give a technology, e.g. Java"}
    usage, years = [], set()
    for org in ORGANISATIONS:
        projects = [p["name"] for p in org["projects"] if any(technology in _plain(t) for t in p["technologies"])]
        if projects:
            usage.append({"organisation": org["name"], "period": org["period"], "projects": projects})
            if org["startYear"]:
                # Without an end year, only the start year is known for certain.
                years.update(range(org["startYear"], (org["endYear"] or org["startYear"]) + 1))
    return {
        "technology": args.get("technology"),
        "usage": usage,
        "distinctYears": len(years),
        "firstYear": min(years) if years else None,
        "lastYear": max(years) if years else None,
    }


TOOLS = {
    "listOrganisations": list_organisations,
    "getOrganisation": get_organisation,
    "findProjects": find_projects,
    "getSkillLevels": get_skill_levels,
    "technologyTimeline": technology_timeline,
}


def lambda_handler(event, context):
    full_name = context.client_context.custom["bedrockAgentCoreToolName"]
    name = full_name.split(DELIMITER, 1)[-1]
    tool = TOOLS.get(name)
    if tool is None:
        return {"error": f"Unknown tool {full_name!r}"}
    return tool(event or {})
