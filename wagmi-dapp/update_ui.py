import re

file_path = r'c:\Users\Jason\Desktop\wagmi\wagmi-dapp\src\pages\InstructorDashboard.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace dark backgrounds
content = content.replace("'#08080a'", "'#fafafa'")
content = content.replace("'rgba(13, 13, 15, 0.98)'", "'#fff'")

# Replace transparent whites with transparent blacks for borders/backgrounds
content = content.replace("'rgba(255,255,255,0.05)'", "'rgba(0,0,0,0.05)'")
content = content.replace("'rgba(255,255,255,0.1)'", "'rgba(0,0,0,0.1)'")
content = content.replace("'rgba(255,255,255,0.03)'", "'#fff'")
content = content.replace("'rgba(255,255,255,0.02)'", "'#fafafa'")
content = content.replace("'rgba(255,255,255,0.01)'", "'#fff'")

# Replace text colors
# Be careful: activeTab text is '#fff' on primary background, '#666' on transparent.
content = re.sub(r"color:\s*'#fff'", "color: '#0d0d0d'", content)

# But we need to fix the activeTab buttons: color: activeTab === 'courses' ? '#0d0d0d' : '#666' -> should be '#fff'
content = content.replace("color: activeTab === 'courses' ? '#0d0d0d' : '#666'", "color: activeTab === 'courses' ? 'var(--primary-color)' : '#666'")
content = content.replace("color: activeTab === 'institutions' ? '#0d0d0d' : '#666'", "color: activeTab === 'institutions' ? 'var(--primary-color)' : '#666'")

# Add Poppins font to the main wrapper
content = content.replace("className=\"page\"", "className=\"page studio-page\"")

# Write a style block right inside the return
style_block = '''<section className="page studio-page" style={{ padding: 0 }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
                .studio-page { font-family: 'Poppins', sans-serif; color: #0d0d0d; }
                .studio-page .glass-panel {
                    background: #fff !important;
                    border: 1px solid #eaeaea !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                    border-radius: 16px;
                }
                .studio-page button {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>'''

content = content.replace('<section className="page studio-page" style={{ padding: 0 }}>', style_block)

# Fix some specific color things
content = content.replace("color: '#444'", "color: '#666'") # lighter text for labels in light mode
content = content.replace("color: '#222'", "color: '#888'") # disabled text

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Studio UI Updated Successfully!')
