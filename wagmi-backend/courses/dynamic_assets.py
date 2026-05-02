import datetime

def generate_certificate_svg(student_name, course_title, school_name, date_str=None):
    """
    Generates a 'cool ass' SVG certificate with dynamic text.
    Uses Neo-Brutalist inspired design with neon accents and high contrast.
    """
    if not date_str:
        date_str = datetime.date.today().strftime("%B %d, %Y")
    
    # Escape special characters for SVG (simple version)
    student_name = student_name.upper()
    course_title = course_title.upper()
    school_name = school_name.upper()

    svg_template = f"""
<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1e1b4b;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#a855f7;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="0.5" stroke-opacity="0.05"/>
        </pattern>
    </defs>

    <!-- Background -->
    <rect width="1200" height="800" fill="url(#bgGrad)"/>
    <rect width="1200" height="800" fill="url(#grid)"/>
    
    <!-- Neon Border -->
    <rect x="40" y="40" width="1120" height="720" fill="none" stroke="url(#accentGrad)" stroke-width="6" filter="url(#glow)"/>
    <rect x="50" y="50" width="1100" height="700" fill="none" stroke="white" stroke-width="1" stroke-opacity="0.2"/>

    <!-- Decorative Corner Blocks (Neo-Brutalist) -->
    <rect x="30" y="30" width="100" height="100" fill="url(#accentGrad)" />
    <rect x="1070" y="30" width="100" height="100" fill="#eab308" />
    <rect x="30" y="670" width="100" height="100" fill="#38bdf8" />
    <rect x="1070" y="670" width="100" height="100" fill="#22c55e" />

    <!-- Text Content -->
    <text x="600" y="160" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="#a855f7" text-anchor="middle" font-weight="900" letter-spacing="8" filter="url(#glow)">STUDYVERSE VERIFIED PROGRESS</text>
    
    <text x="600" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle" font-weight="600" letter-spacing="2">THIS CERTIFIES THAT THE LEARNER</text>
    
    <!-- Student Name -->
    <text x="600" y="380" font-family="system-ui, -apple-system, sans-serif" font-size="72" fill="#ffffff" text-anchor="middle" font-weight="900" style="text-shadow: 0 0 10px rgba(255,255,255,0.5);">{student_name}</text>
    
    <path d="M 400 410 L 800 410" stroke="url(#accentGrad)" stroke-width="2" />

    <text x="600" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle" font-weight="600" letter-spacing="2">HAS SUCCESSFULLY COMPLETED THE ON-CHAIN CURRICULUM</text>
    
    <!-- Course Title -->
    <text x="600" y="560" font-family="system-ui, -apple-system, sans-serif" font-size="44" fill="#eab308" text-anchor="middle" font-weight="800">{course_title}</text>
    
    <!-- Footer -->
    <text x="600" y="700" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#475569" text-anchor="middle" font-weight="700">ISSUED ON {date_str} | SCHOOL NODE: {school_name}</text>
    
    <!-- Badge / Seal -->
    <circle cx="1000" cy="550" r="60" fill="url(#accentGrad)" fill-opacity="0.2" stroke="url(#accentGrad)" stroke-width="2" stroke-dasharray="4,4" />
    <text x="1000" y="555" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="900">VERIFIED</text>
    
</svg>
    """
    return svg_template
