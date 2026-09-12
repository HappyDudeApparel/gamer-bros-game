from pathlib import Path
p=Path(__file__).resolve().parents[1]/'pass16-world1'/'app.js'
s=p.read_text()
s=s.replace("chargeBar=$('#chargeBar'),pad=$('#pad')","chargeBar=$('#chargeBar'),chargeWrap=$('#chargeWrap'),pad=$('#pad')")
s=s.replace("import { createGamerBro } from '../playground-v2/gamer-bro.js?v=pass14';","import { createGamerBro } from '../playground-v2/gamer-bro.js?v=pass16';")
s=s.replace("window.__pass16RouteValidation=validation","window.__pass16RouteValidation=validation")
p.write_text(s)
print('PASS16_RUNTIME_NORMALIZED')
