import os
import re

file_path = r'c:\Users\kr577\Documents\Dev\Wedding-web-\frontend\src\lib\themeConfig.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix interface
text = text.replace("defaultHeroImage: 'https://images.unsplash.com/photo-1549410965-09599d19a008?auto=format&fit=crop&w=2000&q=80',", "")

# Deduplicate themes
# We look for themes blocks and find lines with defaultHeroImage
# If there are multiple, keep the last one (usually the one added by the script)

theme_blocks = re.split(r"(\s+'.+': \{[\s\S]+?\},)", text)

new_blocks = []
for block in theme_blocks:
    if "defaultHeroImage:" in block:
        lines = block.split('\n')
        seen_default = False
        new_lines = []
        # Reverse to keep the last one
        for line in reversed(lines):
            if "defaultHeroImage:" in line:
                if not seen_default:
                    new_lines.append(line)
                    seen_default = True
                else:
                    # Duplicate, skip
                    continue
            else:
                new_lines.append(line)
        new_blocks.append('\n'.join(reversed(new_lines)))
    else:
        new_blocks.append(block)

text = ''.join(new_blocks)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Successfully deduplicated defaultHeroImage in themeConfig.ts")
