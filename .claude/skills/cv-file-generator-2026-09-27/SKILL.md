---
name: "cv-file-generator-2026-09-27"
description: "Pour new resume content into a candidate's existing .docx template, keeping fonts, sizes, layout and margins identical, and trim wording until it fits exactly one page."
---

# CV file generator

Input: (1) a template resume `.docx` whose look must be kept, (2) new resume content (text, md, docx or pasted). Output: a `.docx` in the template's exact format holding the new content, exactly one page, plus a PDF preview.

Triggers: 按照这个 docx 的格式把简历放进去, 套模板, 保持格式只换内容, 生成简历文件, 正好一页, fill this resume into the template.

Hard rules:
- Only the content changes. Fonts, font sizes, bold/italic per element, alignment, indents, bullet style, spacing, horizontal rules and page margins stay exactly as in the template. Never touch `<w:sectPr>` / `<w:pgMar>`. If the user says the margins are e.g. 1 cm but the file differs, keep the file's values and state the real values in the reply.
- Exactly one page. If it overflows, trim wording (rules below). Never shrink fonts, spacing or margins to fit.
- Experience entries ordered most recent first.
- No em dashes anywhere in the content or the reply.

## 1. Unpack and inspect the template

Read the docx skill first. Then:

```bash
W=<scratchpad>/cvgen; mkdir -p $W && cd $W
cp "<template.docx>" orig.docx
mkdir x && (cd x && unzip -q ../orig.docx) && find x -type l -delete
# embedded fonts (Google Docs exports put them in word/fonts): install so the render matches
ls x/word/fonts 2>/dev/null && mkdir -p ~/.fonts && cp x/word/fonts/*.ttf ~/.fonts/ && fc-cache -f
soffice --headless --convert-to pdf orig.docx
```

Read `orig.pdf` directly (no PNG conversion needed — read the PDF itself), then list every paragraph with its runs (index, bullet or not, bold/italic, text, tabs):

```python
import re
d=open('x/word/document.xml').read()
ps=re.findall(r'<w:p [^>]*>.*?</w:p>',d,re.S)
for i,p in enumerate(ps):
  runs=re.findall(r'<w:r(?: [^>]*)?>(.*?)</w:r>',p,re.S)
  num='num' if '<w:numPr>' in p else ''
  print(i,num,[(('B' if '<w:b w:val="1"' in r else '')+('I' if '<w:i w:val="1"' in r else ''),''.join(re.findall(r'<w:t[^>]*>(.*?)</w:t>',r)),'tab' if '<w:tab/>' in r else '') for r in runs])
print(d[d.find('<w:sectPr'):])
```

Also check `<w:docDefaults>` in `styles.xml`: if the default `jc` is `both` (justified), note it (see step 3).

Map each template element to a prototype paragraph index: name, headline, rule line, contact, section headings, blank spacer, profile text, skill label line (bold label run + plain run), role title, company/date line (note which run holds company and which holds the date, since they often use different fonts), bullet, school line, degree/date line. Roles can differ slightly in the template (e.g. one company name italic, another not); use each role slot's own prototype so the per-entry formatting is preserved.

## 2. Map the new content onto the template

- Section headings keep the template's wording (e.g. keep PROFILE even if the new text says Summary).
- The headline under the name follows the new content's target role.
- Skills: one template label line per new skill group (bold label + plain text).
- Fields the template has no slot for (e.g. job or school location) are dropped; say so in the reply.
- Template-only lines that the new content does not have (e.g. a per-role "Skills:" line) are removed.
- Date text follows the new content's wording (e.g. "Jun 2025 to Sep 2025"); mention that the template's separator can be restored if wanted.
- Accidental double blank lines in the template are normalised to one, consistent with the other entries.
- Put content in a JSON file (`content.json`): name, headline, contact, profile, skills [[label, text]], roles [{title, company, dates, bullets[]}], education [{school, degree, dates}].

## 3. Build the document from prototypes

Write `build.py` using these helpers; the assembly section at the bottom is per template (set the indices from step 1).

```python
import re, sys, json
from xml.sax.saxutils import escape
SRC='x/word/document.xml'
d=open(SRC).read()
head=d[:d.find('<w:body>')+len('<w:body>')]
tail=d[d.find('<w:sectPr'):]          # section properties (margins) kept byte-for-byte
P=re.findall(r'<w:p [^>]*>.*?</w:p>',d,re.S)
C=json.load(open(sys.argv[1]))
pg=re.search(r'<w:pgSz [^>]*w:w="(\d+)"',tail).group(1)
ml=re.search(r'w:left="(\d+)"',tail).group(1); mr=re.search(r'w:right="(\d+)"',tail).group(1)
RIGHT=int(pg)-int(ml)-int(mr)          # right margin position for right-aligned dates

def ptag(p): return re.match(r'<w:p [^>]*>',p).group(0)
def ppr(p):
    m=re.search(r'<w:pPr>.*?</w:pPr>',p,re.S); return m.group(0) if m else ''
def rprs(p): return re.findall(r'<w:r(?: [^>]*)?><w:rPr>(.*?)</w:rPr>',p,re.S)  # runs carry rsid attrs
def run(rpr,t): return f'<w:r><w:rPr>{rpr}</w:rPr><w:t xml:space="preserve">{escape(t)}</w:t></w:r>'
def tabrun(rpr): return f'<w:r><w:rPr>{rpr}</w:rPr><w:tab/></w:r>'

def text_para(tpl,text,ri=0,jc=None):
    pp=ppr(tpl)
    if jc:  # jc must sit after spacing/ind and before rPr (schema order)
        pp=re.sub(r'<w:jc w:val="\w+"/>',f'<w:jc w:val="{jc}"/>',pp,1) if '<w:jc ' in pp else pp.replace('<w:rPr>',f'<w:jc w:val="{jc}"/><w:rPr>',1)
    return ptag(tpl)+pp+run(rprs(tpl)[ri],text)+'</w:p>'
def label_para(tpl,label,text):
    r=rprs(tpl); return ptag(tpl)+ppr(tpl)+run(r[0],label)+run(r[1],text)+'</w:p>'
def dated_para(tpl,left,date,lr,dr):
    # templates often push dates right with piles of tabs/spaces, which breaks when text changes.
    # replace with ONE right-aligned tab stop at the right margin: same look, stable.
    pp=ppr(tpl).replace('<w:pPr>',f'<w:pPr><w:tabs><w:tab w:val="right" w:pos="{RIGHT}"/></w:tabs>',1)
    return ptag(tpl)+pp+run(lr,left)+tabrun(dr)+run(dr,date)+'</w:p>'

out=[]
# ---- per-template assembly (example indices; replace with the ones found in step 1) ----
# out.append(text_para(P[0],C['name'])); out.append(text_para(P[1],C['headline']))
# out.append(P[2])  # horizontal rule paragraph copied verbatim
# out.append(text_para(P[3],C['contact'])); out.append(P[4]); out.append(P[5])  # blank, PROFILE heading
# out.append(text_para(P[6],C['profile'],jc='left'))  # one paragraph instead of hard-broken lines
# for lab,txt in C['skills']: out.append(label_para(P[13],lab,txt))
# for each role k: title proto, company/date proto (+ which run index is company / date), bullet proto P[20], blank spacer between roles
# education: school proto, degree/date proto, blank between schools
open(SRC,'w').write(head+''.join(out)+tail)
```

Notes:
- If the template's profile is several hard-broken paragraphs, merge into one paragraph with the same pPr/rPr and set `jc=left` when the doc default is justified, so it keeps the ragged-right look.
- Copy blank spacers, headings and rule lines verbatim from the template.
- `<w:tabs>` goes first in `<w:pPr>` when there is no numPr/pBdr/shd; keep schema order or validation fails.

## 4. Render, check one page, validate

```bash
cat > run.sh <<'EOF'
set -e
rm -rf x && mkdir x && (cd x && unzip -q ../orig.docx) && find x -type l -delete
python3 build.py $1
(cd x && rm -f ../out.docx && zip -qXr ../out.docx .)
soffice --headless --convert-to pdf out.docx >/dev/null 2>&1
pdfinfo out.pdf | grep Pages
EOF
bash run.sh content.json
pdftotext -layout out.pdf - | less   # see where lines wrap and which bullets end in a short orphan line
python <docx-skill>/scripts/office/validate.py out.docx --original orig.docx
```

Read `out.pdf` directly and compare with `orig.pdf` (no PNG conversion needed): same fonts, sizes, positions, dates flush right, bullets aligned.

## 5. Trim to one page

Iterate `content.json` versions (c1, c2, ...) and rebuild until `Pages: 1`, then trim once more if needed so about one line of slack is left at the bottom (Word wraps slightly differently from LibreOffice).

Trim order:
1. Paragraphs or bullets whose last line holds only a few words: cut just enough words to pull that line up. This removes a whole line for the smallest edit.
2. Filler phrases: "from scratch", "then", "with owners", "long-lived", doubled qualifiers, "the release calendar" to "the calendar".
3. Profile: tighten phrasing but keep the template structure (soft skill + title + years, Highly experienced in, Passionate about, trait who can). Plain whole-number years.
4. Only if still over: drop the weakest bullet of the oldest role.

Never change numbers, metrics, employers, titles, dates or education, and never add new claims. Keep the candidate's voice.

## 6. Deliver

- Name files `<Candidate_Name>_Resume_<RoleShort>.docx` and `.pdf`; copy both out of the scratchpad to the run's working directory and state their paths (PDF as preview only, not a deliverable in its own right).
- Reply briefly in the user's language: confirm one page and validation passed; state the margins actually kept; list the format decisions made (headline, headings kept, dropped fields, removed template-only lines, date wording, tab-stop alignment); list every trim as before to after in short form; note that it was checked in LibreOffice and to confirm one page in Word.
- No em dashes.