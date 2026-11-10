import json,re,sys
lines=[l.rstrip('\n') for l in open(sys.argv[1],encoding='utf-8')]
doms=[];i=0
while i<len(lines):
    if re.match(r'^\d+% of exam$',lines[i]):
        d={'code':lines[i-2].strip(),'name':lines[i-1].strip(),'weight':lines[i].split('%')[0],'topics':[],'review':[],'formulas':[],'aids':[]}
        doms.append(d); mode='topics'; i+=1; buf=[]
        while i<len(lines) and not (i+2<len(lines) and re.match(r'^\d+% of exam$',lines[i+2])):
            l=lines[i].strip()
            if l=='Quick Review': mode='review'; i+=1; continue
            if l=='Key Formulas': mode='formulas'; i+=1; continue
            if l=='Memory Aids': mode='aids'; i+=1; continue
            if l.startswith('Mastery:'): mode='skip'
            if mode=='skip' or not l: 
                if mode=='topics' and not l and buf:
                    if len(buf)>=2: d['topics'].append({'t':buf[0],'d':' '.join(buf[1:])})
                    buf=[]
                i+=1; continue
            if mode=='topics': buf.append(l)
            elif mode=='review': buf.append(l)
            elif mode=='formulas': d['formulas'].append(l)
            elif mode=='aids': d['aids'].append(l)
            if mode=='review' and len(buf)==2:
                d['review'].append({'t':buf[0],'d':buf[1]}); buf=[]
            i+=1
        continue
    i+=1
for d in doms:
    d['formulas']=list(dict.fromkeys(d['formulas'])); d['aids']=list(dict.fromkeys(d['aids']))
    print(d['code'],d['weight'],len(d['topics']),len(d['review']),len(d['formulas']),len(d['aids']))
json.dump(doms,open(sys.argv[2],'w'),ensure_ascii=False)
