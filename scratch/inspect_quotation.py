import re

with open('crm/crm.html', 'r', encoding='utf-8') as f:
    text = f.read()

print("Sections matching quotation:")
for m in re.finditer(r'<section\s+id=[\'"]([^\'"]*quotation[^\'"]*)[\'"]', text, re.I):
    print(m.group(0))

print("\nDefault DB quotations:")
match_db = re.search(r'quotations\s*:\s*\[(.*?)\],', text, re.DOTALL)
if match_db:
    print(match_db.group(0)[:500])

print("\nFunctions matching quotation:")
for m in re.finditer(r'function\s+([a-zA-Z0-9_]*quotation[a-zA-Z0-9_]*)\s*\(', text, re.I):
    print(m.group(1))

print("\nOfferings functions:")
for m in re.finditer(r'function\s+([a-zA-Z0-9_]*offering[a-zA-Z0-9_]*)\s*\(', text, re.I):
    print(m.group(1))
