"""Run on VPS1 after the isolated API health check passes. No credentials printed."""
from pathlib import Path
import shutil
import subprocess
import urllib.request

root = Path('/opt/o7/apps/vialterna3-olivia36')
config = Path('/opt/o7/mailcow/data/conf/nginx/olivia-private-chat.conf')
backup = Path('/opt/o7/backups/vialterna3-olivia36/olivia-private-chat.before.conf')
assert urllib.request.urlopen('http://127.0.0.1:8136/health', timeout=5).status == 200
text = config.read_text()
assert 'server_name olivia.o7digitalgroup.com;' in text
if 'location ^~ /vialterna-demo/' not in text:
    if not backup.exists():
        backup.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(config, backup)
    replacement = text.replace('    location / {', (root / 'proxy-location.conf').read_text() + '    location / {', 1)
    assert replacement != text
    config.write_text(replacement)
    result = subprocess.run(['docker','exec','mailcowdockerized-nginx-mailcow-1','nginx','-t'], capture_output=True, text=True)
    if result.returncode:
        config.write_text(text)
        raise SystemExit(result.stderr)
    subprocess.run(['docker','exec','mailcowdockerized-nginx-mailcow-1','nginx','-s','reload'],check=True)
print('Demo prefix installed; existing default Olivia route preserved.')
