with open('crm/crm.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("HTML section around 3245 (30 lines):")
for i in range(3244, min(3300, len(lines))):
    print(f"{i+1}: {lines[i]}", end='')

print("\n" + "="*50 + "\n")
print("JS section around 21630-21750:")
for i in range(21630, min(21750, len(lines))):
    print(f"{i+1}: {lines[i]}", end='')
