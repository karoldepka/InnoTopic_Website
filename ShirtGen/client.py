import requests

# URL of the localhost server
SERVER_URL = 'http://127.0.0.1:5000'

# Prompt template
prompt_template = """
Fetch the following tech icons:
- Python
- JavaScript
"""

def get_icon_name_from_prompt(prompt):
    # Extract icon names from the prompt
    lines = prompt.strip().split('\n')
    icons = [line.split('- ')[1].strip().lower() + '.png' for line in lines if '- ' in line]
    return icons

def fetch_icons(icon_names):
    for icon_name in icon_names:
        response = requests.get(f"{SERVER_URL}/icon/{icon_name}")
        if response.status_code == 200:
            with open(icon_name, 'wb') as f:
                f.write(response.content)
            print(f"Downloaded {icon_name}")
        else:
            print(f"Failed to download {icon_name}: {response.json()['error']}")

def main():
    icon_names = get_icon_name_from_prompt(prompt_template)
    fetch_icons(icon_names)

if __name__ == '__main__':
    main()
