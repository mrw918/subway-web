import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

def analyze(filename):
    with open(filename, encoding="utf-8") as f:
        content = f.read()
    
    # All text elements content (stripped of spaces)
    texts = re.findall(r'<text[^>]*>(.*?)</text>', content, re.DOTALL)
    print("=== " + filename + " ===")
    print("text elements: " + str(len(texts)))
    for t in texts:
        raw = re.sub(r'<[^>]+>', '', t)
        import html
        clean = html.unescape(raw).replace(' ','').replace('\n','').replace('\r','')
        if 4 <= len(clean) <= 80:
            print("  TEXT: " + repr(clean))
    print()

analyze("知识路线图 新ci 1-1.svg")
analyze("知识路线图 新ci 1-2.svg")
