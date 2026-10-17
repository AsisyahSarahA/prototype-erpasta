import re

with open('crm/crm.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if '<section id="page-quotation"' in line:
        print(f"Page quotation HTML starts at line {idx+1}")
    if 'function convertOfferingToQuotation' in line:
        print(f"convertOfferingToQuotation at line {idx+1}")
    if 'function renderQuotation' in line or 'function renderQuotations' in line or 'function filterQuotation' in line:
        print(f"render/filter Quotations at line {idx+1}: {line.strip()}")
    if 'TASK 12' in line or 'Task 12' in line:
        print(f"Task 12 mention at line {idx+1}: {line.strip()}")
