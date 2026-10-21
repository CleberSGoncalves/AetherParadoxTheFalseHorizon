@echo off
echo [*] Sincronizando backup no GitHub (Aether Paradox: The False Horizon)...
git add .
git commit -m "auto: deploy e build Aether Paradox: The False Horizon (CrazyGames HTML5 Subversive Platformer)"
git push -u origin main
echo [OK] Backup concluido com sucesso!
