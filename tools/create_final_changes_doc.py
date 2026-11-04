from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "Franchise Roots Admin Panel.docx"

def font(run, size=10.5, color="1F2937", bold=False, name="Aptos"):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), name)
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)
    run.bold = bold

def shade(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tcPr.append(shd)

def cell_text(cell, text, color="1F2937", bold=False, size=9.4):
    cell.text = ""
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.08
    r = p.add_run(text)
    font(r, size=size, color=color, bold=bold)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER

doc = Document()
sec = doc.sections[0]
sec.top_margin = Inches(.65)
sec.bottom_margin = Inches(.6)
sec.left_margin = Inches(.72)
sec.right_margin = Inches(.72)
normal = doc.styles["Normal"]
normal.font.name = "Aptos"
normal._element.rPr.rFonts.set(qn("w:ascii"), "Aptos")
normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos")
normal.font.size = Pt(10.5)
normal.font.color.rgb = RGBColor(31, 41, 55)
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.12
for name, size in (("Heading 1", 16), ("Heading 2", 12.5)):
    st = doc.styles[name]
    st.font.name = "Aptos Display"
    st._element.rPr.rFonts.set(qn("w:ascii"), "Aptos Display")
    st._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos Display")
    st.font.size = Pt(size)
    st.font.bold = True
    st.font.color.rgb = RGBColor(0, 0, 0)
    st.paragraph_format.space_before = Pt(14)
    st.paragraph_format.space_after = Pt(5)
    st.paragraph_format.keep_with_next = True

p = doc.add_paragraph(style="Title")
p.paragraph_format.space_after = Pt(3)
r = p.add_run("Franchise Roots Admin Panel Changes")
font(r, 25, "000000", True, "Aptos Display")
p = doc.add_paragraph("Simple summary of the website and admin panel updates")
font(p.runs[0], 11.5, "4B5563")
p.paragraph_format.space_after = Pt(14)
p = doc.add_paragraph()
r = p.add_run("Purpose. ")
font(r, 10.5, "000000", True)
r = p.add_run("This document records what was changed, why it was changed, and the expected benefit for website users and administrators.")
font(r)

doc.add_heading("1 Overview of Completed Work", 1)
t = doc.add_table(rows=1, cols=3)
t.alignment = WD_TABLE_ALIGNMENT.CENTER
t.autofit = False
for i, text in enumerate(("Area", "What changed", "Why it was done")):
    c = t.rows[0].cells[i]
    c.width = Inches((1.45, 3.05, 2.75)[i])
    shade(c, "1D4ED8")
    cell_text(c, text, "FFFFFF", True)
rows = [
    ("Premium visual redesign", "Updated public sections with consistent gradients, spacing, cards, badges, hover states and responsive behavior.", "To remove empty-looking areas and create a more polished interface."),
    ("Live data reliability", "Connected admin counters, charts, audit logs and management screens to database-backed API responses.", "So administrators see current platform information instead of placeholder values."),
    ("Performance stability", "Added safer timeouts, cache validation, request deduplication and non-blocking database initialization.", "To reduce reloads, long skeleton states and manual server restarts."),
]
for n, row in enumerate(rows):
    cells = t.add_row().cells
    for i, text in enumerate(row):
        shade(cells[i], "F3F6FF" if n % 2 == 0 else "FFFFFF")
        cell_text(cells[i], text, bold=(i == 0))

doc.add_heading("2 Public Website Design Changes", 1)
points = [
    ("Header and navigation", "Fixed active navigation contrast so Home, Solutions, Brands and Services remain readable on every route. Active links now keep a clear background and text color."),
    ("FAQ redesign", "Added numbered cards, clearer hierarchy, animated arrows, improved open states, stronger colors and responsive mobile spacing."),
    ("Business segments", "Added a verified-directory badge, summary panel, improved heading treatment and compact spacing to remove the large blank area."),
    ("Location options", "Converted location links into clean chips with icons, location count, improved heading and Show more control. The same styling works on homepage and Brands page."),
    ("Brand cards", "Improved media areas, card spacing, stats, action buttons, verification labels and fallback artwork for missing images."),
    ("Two-second image rotation", "Brand cards now rotate through multiple uploaded images every two seconds across featured sections and the Brands directory."),
]
for title, body in points:
    p = doc.add_paragraph(style="Heading 2")
    font(p.add_run(title), 12.5, "000000", True, "Aptos Display")
    doc.add_paragraph(body)

doc.add_heading("3 Admin Dashboard and Database Changes", 1)
points = [
    ("Investor leads chart", "Uses real created or applied dates and groups leads by actual week or month. Hover details show the date range, latest timestamp and new lead count."),
    ("Budget chart", "Uses parsed investor budget values and shows lead count plus total parsed amount for each range. Missing amounts are separated into an Amount not specified bucket."),
    ("Automatic analysis", "Both charts recalculate from current investor records, so peaks, quiet periods and budget distribution update automatically."),
    ("Dashboard loading", "Incomplete or failed API responses are not cached as valid zero-data snapshots, preventing stale zero values."),
    ("Audit logs", "Added bounded requests and safer log loading so the Activity and Audit Logs page does not remain stuck on skeleton content."),
    ("MongoDB connection", "Concurrent requests share a safe connection and default account seeding no longer blocks the first dashboard data read."),
    ("Registration and login", "Email, username and mobile login now use normalized values. Registration errors show the real reason instead of silently failing."),
    ("Login OTP", "Users can request a six-digit OTP using their email or registered mobile number. The code is sent to the registered email, expires in 10 minutes and is limited to five attempts."),
    ("Database timeout fix", "The app now waits for an existing MongoDB connection instead of repeatedly replacing it. This prevents User.findOne timeout errors during registration."),
]
for title, body in points:
    p = doc.add_paragraph(style="Heading 2")
    font(p.add_run(title), 12.5, "000000", True, "Aptos Display")
    doc.add_paragraph(body)

doc.add_heading("4 Error Handling and Performance", 1)
for item in [
    "API requests have timeouts so a slow response cannot keep the interface waiting forever.",
    "Brand requests use safe client caching and request deduplication to reduce repeated calls.",
    "Transient failures are not saved as empty data or zero totals.",
    "Invalid image URLs use the next available image or a branded fallback artwork.",
    "Image rotation and fallback behavior prevent broken or blank media containers.",
    "Updated authentication and database files were checked with ESLint without blocking errors.",
    "After a database or connection-code update, restart the development server once so the old connection state is cleared.",
]:
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.space_after = Pt(3)
    p.add_run(item)

doc.add_heading("5 Verification Status", 1)
t = doc.add_table(rows=1, cols=2)
t.alignment = WD_TABLE_ALIGNMENT.CENTER
t.autofit = False
for i, text in enumerate(("Check", "Result")):
    c = t.rows[0].cells[i]
    c.width = Inches((2.1, 5.15)[i])
    shade(c, "0F1A3D")
    cell_text(c, text, "FFFFFF", True)
for n, row in enumerate([
    ("ESLint", "No blocking lint errors in the updated files."),
    ("Next.js production build", "Passed successfully with all application routes generated."),
    ("Database-backed APIs", "Admin brands, investors, blogs, services, advertisements and logs use API/database responses."),
    ("Responsive UI", "Updated sections include desktop and mobile styling rules."),
]):
    cells = t.add_row().cells
    for i, text in enumerate(row):
        shade(cells[i], "F3F6FF" if n % 2 == 0 else "FFFFFF")
        cell_text(cells[i], text, bold=(i == 0))

p = doc.add_paragraph()
r = p.add_run("Operational note. ")
font(r, 10.5, "000000", True)
r = p.add_run("After deployment or a development-server restart, use one hard refresh so the browser clears older cached CSS or JavaScript. Future admin changes should update database-backed views without a manual restart.")
font(r)
footer = sec.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
font(footer.add_run("Franchise Roots | Final Website Changes Summary"), 8.5, "6B7280")
doc.save(OUT)
print(OUT)
