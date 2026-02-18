import re

path = r'c:\Users\kr577\Documents\Dev\Wedding-web-\frontend\src\lib\themeConfig.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Default images to use if missing
DEFAULT_HERO = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=2000&q=80'
DEFAULT_STORY = 'https://images.unsplash.com/photo-1522673607200-1645062cd958?auto=format&fit=crop&w=1000&q=80'

# Find the themeConfigs object content
match = re.search(r'export const themeConfigs: Record<string, ThemeConfig> = (\{.*?\});', content, re.DOTALL)
if not match:
    print("Could not find themeConfigs object")
    exit(1)

themes_str = match.group(1)

# Split into individual theme blocks
# We'll use a more robust regex to find the top level keys
theme_blocks = re.findall(r"'([^']+)':\s*(\{.*?\n\s*\})", themes_str, re.DOTALL)

updated_themes = []
for name, body in theme_blocks:
    # Remove existing Hero/Story images and radius/decoration if they are duplicates
    lines = body.strip().split('\n')
    new_lines = []
    seen_keys = set()
    
    # We want to keep the last occurrence or just one
    # Let's collect all key-value pairs
    pairs = {}
    other_lines = []
    
    for line in lines:
        line = line.strip()
        if not line or line == '{' or line == '}':
            continue
        
        # Match key: value
        kv_match = re.match(r'^(\w+):\s*(.*),?$', line)
        if kv_match:
            k, v = kv_match.groups()
            pairs[k] = v.rstrip(',')
        else:
            other_lines.append(line)
            
    # Always ensure Hero and Story are present
    if 'defaultHeroImage' not in pairs:
        pairs['defaultHeroImage'] = f"'{DEFAULT_HERO}'"
    if 'defaultStoryImage' not in pairs:
        pairs['defaultStoryImage'] = f"'{DEFAULT_STORY}'"
        
    # Reconstruct body
    new_body = "{\n"
    for k, v in pairs.items():
        new_body += f"        {k}: {v},\n"
    for line in other_lines:
        new_body += f"        {line}\n"
    new_body += "    }"
    
    updated_themes.append(f"    '{name}': {new_body}")

new_themes_str = "{\n" + ",\n".join(updated_themes) + "\n}"
new_content = re.sub(r'export const themeConfigs: Record<string, ThemeConfig> = \{.*?\};', 
                     f'export const themeConfigs: Record<string, ThemeConfig> = {new_themes_str};', 
                     content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully updated themeConfig.ts")
