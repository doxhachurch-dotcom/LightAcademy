css=open('style.css').read()+open('theme.css').read()
js='\n'.join(open(f).read() for f in ['core.js','data.js','logic.js','views1.js','views2.js','views3.js','school.js','edu.js','access.js','io.js','links.js'])+'\nboot();\n'
html=f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Light Academy — Gestion scolaire et financière</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>{css}</style>
</head>
<body>
<div id="app"></div><div id="modal-root"></div><div id="toast-root" class="toast-root"></div>
<script>
{js}
</script>
</body>
</html>'''
open('../index.html','w').write(html)
print(len(html))
