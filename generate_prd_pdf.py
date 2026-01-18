from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT

# File path
file_path = "VisionIAS_Mentoring_Platform_PRD.pdf"

# Create Document
doc = SimpleDocTemplate(file_path, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)

# Styles
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='MainTitle', parent=styles['Heading1'], fontSize=24, leading=28, alignment=TA_CENTER, spaceAfter=30))
styles.add(ParagraphStyle(name='SectionHeader', parent=styles['Heading2'], fontSize=16, leading=20, textColor=colors.darkblue, spaceBefore=20, spaceAfter=10))
styles.add(ParagraphStyle(name='SubHeader', parent=styles['Heading3'], fontSize=12, leading=16, textColor=colors.black, spaceBefore=10, spaceAfter=6))
styles.add(ParagraphStyle(name='BodyTextCustom', parent=styles['BodyText'], fontSize=10, leading=14, spaceAfter=6))
styles.add(ParagraphStyle(name='Quote', parent=styles['BodyText'], fontSize=10, leading=14, leftIndent=20, rightIndent=20, fontName='Helvetica-Oblique', spaceAfter=10))

# Content List
story = []

# --- Title Page ---
story.append(Paragraph("Product Requirement Document (PRD)", styles['MainTitle']))
story.append(Paragraph("<b>Project:</b> VisionIAS Mentoring Platform", styles['BodyTextCustom']))
story.append(Paragraph("<b>Version:</b> 1.0", styles['BodyTextCustom']))
story.append(Paragraph("<b>Date:</b> January 2, 2026", styles['BodyTextCustom']))
story.append(Spacer(1, 12))
story.append(Paragraph("<b>Status:</b> Draft / Initial Release", styles['BodyTextCustom']))
story.append(Spacer(1, 24))

# --- Section 1: Executive Summary ---
story.append(Paragraph("1. Executive Summary", styles['SectionHeader']))

story.append(Paragraph("<b>Vision</b>", styles['SubHeader']))
story.append(Paragraph('"A comprehensive mentoring management system that streamlines student-mentor allocation, tracks performance, facilitates communication, and provides insights for mentors, coordinators, and students preparing for UPSC examinations."', styles['Quote']))

story.append(Paragraph("<b>Key Objectives</b>", styles['SubHeader']))
objectives = [
    "• <b>Automate Operations:</b> Streamline student-mentor assignment based on capacity and program rules.",
    "• <b>Real-Time Tracking:</b> Enable live performance tracking and feedback loops.",
    "• <b>Stakeholder Synergy:</b> Facilitate seamless communication between Admins, Coordinators, Mentors, and Students.",
    "• <b>Data-Driven Decisions:</b> Provide actionable insights for coordinators to optimize resource allocation.",
    "• <b>Enhanced Learning:</b> Improve the student experience through structured, consistent mentorship."
]
for obj in objectives:
    story.append(Paragraph(obj, styles['BodyTextCustom']))

# --- Section 2: Development Pipeline ---
story.append(Paragraph("2. Development Pipeline (Priority Order)", styles['SectionHeader']))
story.append(Paragraph("The platform development is divided into three strategic phases to prioritize core functionality first.", styles['BodyTextCustom']))
story.append(Spacer(1, 12))

pipeline_data = [
    ["Phase", "Component", "Focus Areas"],
    ["Phase 1", "Admin Portal", "Foundation, Student Intake, Mentor Management, Batch Org, Core Data."],
    ["Phase 2", "Mentor & Student Portals", "Direct User Experience, Interaction, Performance Tracking, Session Mgmt."],
    ["Phase 3", "Coordinator Portal", "Supervision, Analytics, Reporting, Performance Monitoring."]
]

t_pipeline = Table(pipeline_data, colWidths=[60, 140, 260])
t_pipeline.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('fontName', (0,0), (-1,-1), 'Helvetica'),
    ('fontSize', (0,0), (-1,-1), 9),
]))
story.append(t_pipeline)

# --- Section 3: User Roles ---
story.append(Paragraph("3. User Roles & Permissions", styles['SectionHeader']))

roles_data = [
    ("1. Admin", "System Owner & Operator", "Full System Access", [
        "Student intake and queue management.",
        "<b>Exclusive Authority:</b> Mentor-student assignments.",
        "Batch allocation and system configuration."
    ]),
    ("2. Mentor Coordinator", "Supervisor & Analyst", "Read-only (Student/Mentor Data); Write (Resources/Feedback)", [
        "Monitor mentor KPIs and student progress.",
        "Resource distribution and feedback analysis.",
        "<b>Note:</b> Coordinators <i>monitor</i> but do <b>NOT</b> assign students."
    ]),
    ("3. Mentor", "Service Provider", "Personal Dashboard & Assigned Students", [
        "Conducting mentorship sessions (1-on-1 & Group).",
        "Tracking student performance and providing feedback."
    ]),
    ("4. Student", "End User", "Personal Dashboard Only", [
        "Accessing support, tracking personal progress, and attending sessions."
    ])
]

for role, role_type, access, resps in roles_data:
    story.append(Paragraph(f"<b>{role}</b>", styles['SubHeader']))
    story.append(Paragraph(f"• <b>Role:</b> {role_type}", styles['BodyTextCustom']))
    story.append(Paragraph(f"• <b>Access:</b> {access}", styles['BodyTextCustom']))
    story.append(Paragraph("• <b>Primary Responsibilities:</b>", styles['BodyTextCustom']))
    for r in resps:
        story.append(Paragraph(f"&nbsp;&nbsp;&nbsp;- {r}", styles['BodyTextCustom']))
    story.append(Spacer(1, 6))

story.append(PageBreak())

# --- Section 4: Portal Features ---
story.append(Paragraph("4. Detailed Portal Features", styles['SectionHeader']))

story.append(Paragraph("A. Admin Portal (The Foundation)", styles['SubHeader']))
story.append(Paragraph("• <b>Dashboard:</b> Visual Analytics (Capacity utilization), KPIs (Unallocated students, available capacity), Quick Actions.", styles['BodyTextCustom']))
story.append(Paragraph("• <b>Intake Queue Management:</b> Real-time table with days-waiting tracker, Advanced filtering, Bulk assignment.", styles['BodyTextCustom']))
story.append(Paragraph("• <b>Mentor Directory:</b> Profile views, Capacity tracking, Status indicators (Available, Near Limit, Full).", styles['BodyTextCustom']))

story.append(Paragraph("B. Mentor Portal", styles['SubHeader']))
story.append(Paragraph("• <b>Dashboard:</b> KPI overview, Upcoming session calendar.", styles['BodyTextCustom']))
story.append(Paragraph("• <b>Session Management:</b> 1-on-1 session logs, history, and notes.", styles['BodyTextCustom']))
story.append(Paragraph("• <b>Student Roster:</b> Detailed performance tracking per student.", styles['BodyTextCustom']))

story.append(Paragraph("C. Student Portal", styles['SubHeader']))
story.append(Paragraph("• <b>Dashboard Metrics:</b> Attendance (%), Assignments completed, Test ranks.", styles['BodyTextCustom']))
story.append(Paragraph("• <b>'My Mentor' Page:</b> Assigned State (Profile, Call/Message buttons) vs Unassigned State (Alerts).", styles['BodyTextCustom']))

story.append(Paragraph("D. Coordinator Portal", styles['SubHeader']))
story.append(Paragraph("• <b>Supervisory Dashboard:</b> Alerts for pending assignments (7/10/14 days), Mentor performance alerts.", styles['BodyTextCustom']))
story.append(Paragraph("• <b>Analytics:</b> Mentor load distribution, student satisfaction trends.", styles['BodyTextCustom']))

# --- Section 5: User Workflows ---
story.append(Paragraph("5. User Workflows", styles['SectionHeader']))
story.append(Paragraph("<b>Student Assignment Flow</b>", styles['SubHeader']))
flow_steps = [
    "1. <b>Registration:</b> Student registers -> Appears in Intake Queue.",
    "2. <b>Selection:</b> Admin filters and selects student(s).",
    "3. <b>Assignment:</b> Admin opens Unified Assignment Modal (System checks capacity).",
    "4. <b>Confirmation:</b> Admin confirms assignment.",
    "5. <b>Notification:</b> Student receives mentor details; Mentor receives new roster update."
]
for step in flow_steps:
    story.append(Paragraph(step, styles['BodyTextCustom']))

story.append(Paragraph("<b>Mentor Profile Management</b>", styles['SubHeader']))
profile_steps = [
    "1. Navigate to Mentor Directory.",
    "2. Select 'Edit Profile' on specific mentor card.",
    "3. Update Departments, Capacity limits, or Status.",
    "4. Save Changes (Updates reflect immediately)."
]
for step in profile_steps:
    story.append(Paragraph(step, styles['BodyTextCustom']))

# --- Section 6: Success Metrics ---
story.append(Paragraph("6. Success Metrics & KPIs", styles['SectionHeader']))

metrics_data = [
    ["Metric Category", "Indicator", "Target / Goal"],
    ["Platform Efficiency", "Assignment Time", "< 3 Days"],
    ["Resource Usage", "Mentor Utilization", "75% - 85% Capacity"],
    ["User Satisfaction", "Feedback Rating", "4.0+ / 5.0"],
    ["Engagement", "Session Attendance", "85%+"],
    ["Adoption", "Student Portal Usage", "90%+"]
]

t_metrics = Table(metrics_data, colWidths=[120, 160, 180])
t_metrics.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
]))
story.append(t_metrics)

# --- Section 7: Risks ---
story.append(Paragraph("7. Risk Mitigation & Security", styles['SectionHeader']))
story.append(Paragraph("<b>Risk Mitigation</b>", styles['SubHeader']))
risks = [
    "• <b>Scalability:</b> Architecture designed for 10,000+ students.",
    "• <b>Data Integrity:</b> Strict validation rules on intake.",
    "• <b>Adoption:</b> Zero-friction onboarding for mentors."
]
for r in risks:
    story.append(Paragraph(r, styles['BodyTextCustom']))

story.append(Paragraph("<b>Security Considerations</b>", styles['SubHeader']))
security = [
    "• <b>Access Control:</b> Strict Role-Based Access Control (RBAC).",
    "• <b>Data Protection:</b> Encryption at rest and in transit.",
    "• <b>Compliance:</b> Regular security audits and GDPR compliance."
]
for s in security:
    story.append(Paragraph(s, styles['BodyTextCustom']))

# Build
doc.build(story)
