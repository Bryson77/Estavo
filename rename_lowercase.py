import os
import re

root_dir = r'c:\Users\letha\Documents\GitHub\EstateHQPlatform'
exclude_dirs = {'.git', 'node_modules', '.next', '.expo', 'dist', 'build', '.pnpm'}
include_extensions = {'.ts', '.tsx', '.json', '.md', '.mdx', '.txt', '.sql', '.env', '.env.local', '.env.development', '.env.production', '.css', '.js', '.jsx'}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We already replaced EstateHQ and ESTATEHQ. Now replace estatehq
    new_content = content.replace('estatehq', 'estavo')
    # Also catch any missed cases just in case
    new_content = new_content.replace('EstateHQ', 'Estavo')
    new_content = new_content.replace('ESTATEHQ', 'ESTAVO')
    
    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated: {filepath}')

for dirpath, dirnames, filenames in os.walk(root_dir):
    dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
    for filename in filenames:
        ext = os.path.splitext(filename)[1].lower()
        if ext in include_extensions or filename.startswith('.env'):
            filepath = os.path.join(dirpath, filename)
            try:
                process_file(filepath)
            except Exception as e:
                print(f'Error processing {filepath}: {e}')
