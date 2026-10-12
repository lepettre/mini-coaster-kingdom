import json,os,base64
t=open('template.html').read()
t=t.replace('/*LOGIC*/',open('logic.js').read()).replace('/*GENB*/',open('genb.js').read()).replace('/*RENDER*/',open('render.js').read()).replace('/*UI*/',open('ui.js').read())
lv=json.load(open('levels24.json'))
t=t.replace('/*LEVELS*/[]',json.dumps(lv,separators=(',',':'),ensure_ascii=False))
pool=json.load(open('pool.json')) if os.path.exists('pool.json') else []
t=t.replace('/*POOL*/[]',json.dumps(pool,separators=(',',':')))
st={k:json.load(open('station_%s.json'%k)) for k in ['B1','A2','D1','C1']}
t=t.replace('/*STATIONS*/{}',json.dumps(st,separators=(',',':')))
b64=lambda p:base64.b64encode(open(p,'rb').read()).decode()
man={"name":"Mini Coaster Kingdom","short_name":"Mini Coaster Kingdom","start_url":".","display":"standalone","orientation":"portrait","background_color":"#1E0D0B","theme_color":"#1E0D0B","icons":[{"src":"data:image/png;base64,"+b64('icon-180.png'),"sizes":"180x180","type":"image/png"}]}
icon=('<link rel="apple-touch-icon" href="data:image/png;base64,%s">\n<link rel="icon" type="image/png" href="data:image/png;base64,%s">\n<link rel="manifest" href="data:application/manifest+json;base64,%s">\n'
 '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<meta name="apple-mobile-web-app-title" content="Mini Coaster Kingdom">')%(b64('icon-180.png'),b64('icon-180.png'),base64.b64encode(json.dumps(man,ensure_ascii=False).encode()).decode())
t=t.replace('<!--ICON-->',icon)
os.makedirs('dist',exist_ok=True)
open('dist/mini-coaster-kingdom.html','w').write(t)
print(len(t)//1024,'KB',len(lv),'Level',len(pool),'Pool')
