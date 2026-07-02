const CATEGORIES = {
  "Player":     { fields:[{k:"health",l:"Vida base"},{k:"stamina",l:"Stamina base"}] },
  "Resource":   { fields:[{k:"source",l:"Origem (onde vem)"},{k:"stack",l:"Empilha?"}] },
  "Weapon/Tool":{ fields:[{k:"damage",l:"Dano"},{k:"harvests",l:"Coleta / corta"}] },
  "Consumable": { fields:[{k:"effect",l:"Efeito"},{k:"duration",l:"Duração"}] },
  "Equipment":  { fields:[{k:"bonus",l:"Bônus"}] },
  "Station":    { fields:[{k:"makes",l:"O que produz"},{k:"levels",l:"Mecânica de nível"}] },
  "Spirit":     { fields:[{k:"command",l:"Comando"},{k:"ability",l:"Habilidade"},{k:"expires",l:"Expira?"}] },
  "Creature":   { fields:[{k:"behavior",l:"Comportamento"},{k:"defeat",l:"Como lidar"},{k:"drops",l:"Drops"}] },
  "Enemy":      { fields:[{k:"behavior",l:"Comportamento"},{k:"hp",l:"Vida"},{k:"damage",l:"Dano"},{k:"drops",l:"Drops"}] },
  "Gatherable": { fields:[{k:"yields",l:"Rende"},{k:"tool",l:"Ferramenta"}] },
  "Area":       { fields:[{k:"contains",l:"Contém"},{k:"entry",l:"Entrada"},{k:"exit",l:"Saída / gate"}] }
};

function defaultModel(){
  const e=(name,category,path,nature,description,fields)=>({name,category,path:path||'critico',nature:nature||'',description:description||'',fields:fields||{}});
  const entities=[
    e("Player","Player","critico","O feiticeiro que você controla.","Reúne recursos, comanda espíritos e restaura o Cauldron. Tudo no jogo gira em torno das ações do Player.",{health:"100",stamina:"100"}),
    e("Branches","Resource","critico","Madeira leve de uso geral.","Coletada no chão da Área Inicial. Primeiro recurso do jogo; restaura o Cauldron e crafta ferramentas cruas.",{source:"Chão do POI Inicial",stack:"Sim"}),
    e("Stone","Resource","critico","Mineral de uso geral.","Coletada no chão ou quebrada de Boulders. Base de lâminas e talismãs.",{source:"Chão / Boulders",stack:"Sim"}),
    e("Log","Resource","critico","Madeira grande.","Cortada de árvores com ferramenta. Refinada em Stick na Artisan Workbench.",{source:"Regular Tree",stack:"Sim"}),
    e("Mushroom","Gatherable","critico","Cogumelo coletável.","Alimenta o Cauldron até o nível 2. Também vira consumíveis de buff.",{yields:"Mushroom",tool:"Mão"}),
    e("Stick","Resource","critico","Refinado de Log.","Componente de armas. Feito na Artisan Workbench.",{source:"Refino de Log",stack:"Sim"}),
    e("Stone Blade","Resource","critico","Refinado de Stone.","Gume que compõe a Stone Sword.",{source:"Refino de Stone",stack:"Sim"}),
    e("Crude Axe","Weapon/Tool","critico","A primeira ferramenta.","Craftada direto de Branches + Stone, sem refino. Corta madeira e vinhas; dano baixo.",{damage:"Baixo",harvests:"Madeira, vinhas"}),
    e("Stone Sword","Weapon/Tool","critico","Arma de corte.","Primeira arma de combate real. Também é consumida ao craftar o Flesh and Bone Spirit.",{damage:"Médio",harvests:"—"}),
    e("Dead Frog","Resource","critico","Sapo capturado.","Obtido quando o Nature Spirit captura o Sapo. Alimenta o Cauldron no nível 3.",{source:"Nature Spirit + Sapo",stack:"Sim"}),
    e("Boar Meat","Resource","critico","Carne do javali.","Drop do Boar. Alimenta o Cauldron e crafta o Flesh and Bone Spirit.",{source:"Drop do Boar",stack:"Sim"}),
    e("Bone","Resource","critico","Osso do javali.","Drop do Boar. Compõe spirit e Bone Blade.",{source:"Drop do Boar",stack:"Sim"}),
    e("Boar Hide","Resource","critico","Couro do javali.","Drop do Boar. Refinado em Leather na Tannery (opcional).",{source:"Drop do Boar",stack:"Sim"}),
    e("Cauldron","Station","critico","O coração do jogo.","Estação central. Restaurada com Branches, evolui por níveis conforme é alimentada, e cada nível desbloqueia um novo espírito.",{makes:"Spirits, Stone Sword",levels:"1→4 via feeding"}),
    e("Artisan Workbench","Station","critico","Bancada de refino.","Transforma recursos crus em intermediários: Log→Stick, Stone→Stone Blade.",{makes:"Stick, Stone Blade",levels:"—"}),
    e("Estátua da Natureza","Station","critico","Portal vivo.","Gateway que libera a saída da Área Inicial. Só ativa com um Nature Spirit.",{makes:"—",levels:"—"}),
    e("Nature Spirit","Spirit","critico","O primeiro companheiro.","Craftado no Cauldron. Comandado com Q para interagir com o mundo — captura o Sapo sem sofrer o veneno.",{command:"Q → interagir",ability:"Imune a veneno; captura Sapo",expires:"Sim"}),
    e("Flesh and Bone Spirit","Spirit","critico","O segundo companheiro.","Craftado com Bone + Boar Meat + uma espada. Desbloqueado no Cauldron nível 3.",{command:"Q",ability:"A definir",expires:"Sim"}),
    e("Sapo","Creature","critico","Bicho ligeiro e traiçoeiro.","Foge quando o Player tenta pegar e solta veneno na falha. Só o Nature Spirit captura sem dano.",{behavior:"Foge, envenena",defeat:"Nature Spirit",drops:"Dead Frog"}),
    e("Boar","Enemy","critico","Javali selvagem.","Ataca com investida (charge) quando o Player entra no alcance. Rodeia o POI do Aquiles.",{behavior:"Charge attack",hp:"A definir",damage:"A definir",drops:"Meat, Bone, Hide"}),
    e("Aquiles","Enemy","critico","O guardião final.","Boss da demo, dentro do próprio POI.",{behavior:"A definir",hp:"A definir",damage:"A definir",drops:"—"}),
    e("POI Inicial","Area","critico","O vale de partida.","Canyon inicial com duas sub-áreas. Onde o Player encontra o Cauldron quebrado.",{contains:"Cauldron, Branches, Stone, Mushroom",entry:"Início do jogo",exit:"Estátua da Natureza"}),
    e("Overworld","Area","critico","O mundo aberto (Mapa 1).","Onde vivem Boar, Sapo, árvores e o POI do Aquiles.",{contains:"Boar, Sapo, Regular Tree, POI do Aquiles",entry:"Estátua da Natureza",exit:"POI do Aquiles"}),
    e("POI do Aquiles","Area","critico","A arena do boss.","Acessada com 2 espíritos.",{contains:"Aquiles",entry:"Gate de 2 espíritos",exit:"Fim da demo"}),
    e("Boulders","Gatherable","opcional","Pedregulho.","Quebra em Stone com ferramenta.",{yields:"Stone",tool:"Axe"}),
    e("Light Flower","Gatherable","opcional","Flor luminosa.","Coletada no POI Clareira. Alimenta o Cauldron nível 4 e crafta o Light Spirit.",{yields:"Light Flower",tool:"Mão"}),
    e("Root","Resource","opcional","Raiz.","Drop do Dutra. Alimenta o Cauldron nível 4.",{source:"Drop do Dutra",stack:"Sim"}),
    e("Leather","Resource","opcional","Couro curtido.","Refinado de Boar Hide na Tannery.",{source:"Tannery",stack:"Sim"}),
    e("Bone Blade","Resource","opcional","Gume de osso.","Refinado de Bone; compõe a Bone Sword.",{source:"Refino de Bone",stack:"Sim"}),
    e("Bone Sword","Weapon/Tool","opcional","Espada de osso.","Craftada de Bone Blade.",{damage:"A definir",harvests:"—"}),
    e("Leather Armor","Equipment","opcional","Armadura de couro.","Craftada de Leather.",{bonus:"Defesa (a definir)"}),
    e("Rock Talisman","Equipment","opcional","Amuleto de pedra.","Aumenta a vida máxima.",{bonus:"+10 vida máx"}),
    e("Mushroom Skewer","Consumable","opcional","Espetinho de cogumelo.","Buff temporário.",{effect:"+10 vida, +15 stamina máx",duration:"5min"}),
    e("Grilled Meat","Consumable","opcional","Carne grelhada.","Buff temporário.",{effect:"+25 vida máx",duration:"20min"}),
    e("Tannery","Station","opcional","Curtume.","Refina Boar Hide em Leather.",{makes:"Leather",levels:"—"}),
    e("Light Spirit","Spirit","opcional","O terceiro companheiro.","Craftado com Light Flower + arma. Cauldron nível 4.",{command:"Q",ability:"A definir",expires:"Sim"}),
    e("Dutra","Enemy","opcional","Criatura da clareira.","Aparece em grupos de 5. Combatida com ajuda dos espíritos.",{behavior:"Grupo",hp:"A definir",damage:"A definir",drops:"Root, Mushroom"}),
    e("POI Clareira","Area","opcional","Clareira luminosa.","Contém Dutras e Light Flowers.",{contains:"Dutra, Light Flower",entry:"A ancorar",exit:"—"})
  ];
  const flows=[
    {name:"Refinar Stick",inputs:{Log:1},out:{Stick:1},path:"critico"},
    {name:"Refinar Stone Blade",inputs:{Stone:1},out:{"Stone Blade":1},path:"critico"},
    {name:"Craft Crude Axe",inputs:{Branches:1,Stone:1},out:{"Crude Axe":1},path:"critico"},
    {name:"Craft Stone Sword",inputs:{Stick:1,"Stone Blade":1},out:{"Stone Sword":1},path:"critico"},
    {name:"Restaurar Cauldron (nível 1)",inputs:{Branches:4},out:{"Cauldron nível 1":1},path:"critico"},
    {name:"Feed Cauldron nível 2",inputs:{Mushroom:5},out:{"Cauldron nível 2":1},path:"critico"},
    {name:"Craft Nature Spirit",inputs:{Stone:1,Mushroom:1},out:{"Nature Spirit":1},path:"critico"},
    {name:"Feed Cauldron nível 3",inputs:{"Boar Meat":3,"Dead Frog":3},out:{"Cauldron nível 3":1},path:"critico"},
    {name:"Craft Flesh and Bone Spirit",inputs:{Bone:1,"Boar Meat":1,"Stone Sword":1},out:{"Flesh and Bone Spirit":1},path:"critico"},
    {name:"Loot do Boar",inputs:{Boar:1},out:{"Boar Meat":1,Bone:1,"Boar Hide":1},path:"critico"},
    {name:"Capturar Sapo (Nature Spirit)",inputs:{Sapo:1},out:{"Dead Frog":1},path:"critico"},
    {name:"Refinar Leather",inputs:{"Boar Hide":1},out:{Leather:1},path:"opcional"},
    {name:"Refinar Bone Blade",inputs:{Bone:1},out:{"Bone Blade":1},path:"opcional"},
    {name:"Craft Bone Sword",inputs:{"Bone Blade":1,Stick:1},out:{"Bone Sword":1},path:"opcional"},
    {name:"Craft Leather Armor",inputs:{Leather:2},out:{"Leather Armor":1},path:"opcional"},
    {name:"Craft Rock Talisman",inputs:{Stone:2},out:{"Rock Talisman":1},path:"opcional"},
    {name:"Feed Cauldron nível 4",inputs:{Root:5,"Light Flower":1},out:{"Cauldron nível 4":1},path:"opcional"},
    {name:"Craft Light Spirit",inputs:{"Light Flower":1,"Stone Sword":1},out:{"Light Spirit":1},path:"opcional"},
    {name:"Loot do Dutra",inputs:{Dutra:1},out:{Root:1,Mushroom:1},path:"opcional"}
  ].map((f,i)=>({id:'f'+i,...f}));
  const gates=[
    {id:'g1',name:"Restauração do Cauldron",key:"Branches",unlocks:"Alchemy desbloqueada",path:"critico"},
    {id:'g2',name:"Cauldron nível 2",key:"Mushroom",unlocks:"Spirit tab desbloqueada",path:"critico"},
    {id:'g3',name:"Estátua da Natureza",key:"Nature Spirit",unlocks:"Saída → Overworld",path:"critico"},
    {id:'g4',name:"Cauldron nível 3",key:"Boar Meat + Dead Frog",unlocks:"2º spirit",path:"critico"},
    {id:'g5',name:"Portão do POI do Aquiles",key:"Flesh and Bone Spirit",unlocks:"Acesso ao boss",path:"critico"},
    {id:'g6',name:"Cauldron nível 4",key:"Root + Light Flower",unlocks:"3º spirit",path:"opcional"}
  ];
  return {entities,flows,gates};
}

let model=null, selected=null, editingFlow=null, editingGate=null, editingEntity=null;
const store={ ok:(()=>{try{localStorage.setItem('__t','1');localStorage.removeItem('__t');return true;}catch(e){return false;}})(),
  get(k){if(!this.ok)return null;try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}},
  set(k,v){if(!this.ok)return;try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}} };
function persist(){ store.set('mr_model',model); }
function esc(s){ const d=document.createElement('div'); d.textContent=s==null?'':s; return d.innerHTML; }
function uid(p){ return p+Date.now()+Math.random().toString(36).slice(2,5); }
function findE(n){ return model.entities.find(x=>x.name===n); }

function renderNav(){
  const s=(document.getElementById('comp-search').value||'').toLowerCase();
  const groups={};
  model.entities.forEach(e=>{ if(s&&!e.name.toLowerCase().includes(s))return; (groups[e.category]=groups[e.category]||[]).push(e); });
  const nav=document.getElementById('comp-nav'); nav.innerHTML='';
  Object.keys(groups).sort().forEach(cat=>{
    const h=document.createElement('div'); h.className='cat-header';
    h.innerHTML=`<span class="cat-title">${esc(cat)}</span><span class="muted">${groups[cat].length}</span>`;
    const body=document.createElement('div');
    h.onclick=()=>body.style.display=body.style.display==='none'?'block':'none';
    groups[cat].sort((a,b)=>a.name.localeCompare(b.name)).forEach(ent=>{
      const it=document.createElement('div'); it.className='nav-item'+(selected===ent.name?' sel':'');
      it.innerHTML=`${esc(ent.name)} <span class="np">· ${esc(ent.path)}</span>`;
      it.onclick=()=>{ selected=ent.name; renderNav(); renderPage(); };
      body.appendChild(it);
    });
    nav.appendChild(h); nav.appendChild(body);
  });
}
function relationsFor(name){
  const producedBy=[],consumedIn=[],keyFor=[];
  model.flows.forEach(f=>{ if(f.out&&f.out[name]!=null)producedBy.push(f); if(f.inputs&&f.inputs[name]!=null)consumedIn.push(f); });
  model.gates.forEach(g=>{ if(g.key.split(/\s*\+\s*/).map(x=>x.trim()).includes(name))keyFor.push(g); });
  return {producedBy,consumedIn,keyFor};
}
function renderPage(){
  const p=document.getElementById('comp-page');
  if(!selected){ p.innerHTML='<span class="muted">Selecione uma entidade.</span>'; return; }
  const ent=findE(selected); if(!ent){ p.innerHTML='<span class="muted">Não encontrada.</span>'; return; }
  const rel=relationsFor(ent.name);
  const schema=CATEGORIES[ent.category];
  const stats=(schema?schema.fields:[]).filter(f=>ent.fields&&ent.fields[f.k]).map(f=>`<div class="stat"><div class="sl">${esc(f.l)}</div><div class="sv">${esc(ent.fields[f.k])}</div></div>`).join('');
  const pill=(txt,fn)=>`<span class="rel-pill" onclick="${fn}">${txt}</span>`;
  const flowPill=f=>pill(esc(f.name),`gotoFlow('${f.id}')`);
  let html=`<div class="page-head">
    <div><div class="page-title">${esc(ent.name)}</div>${ent.nature?`<div class="page-nature">${esc(ent.nature)}</div>`:''}
    <div class="page-badges"><span class="badge">${esc(ent.category)}</span><span class="badge ${ent.path==='critico'?'crit':'opt'}">${ent.path==='critico'?'crítico':'opcional'}</span></div></div>
    <button onclick="editEntity(${JSON.stringify(ent.name)})">✎ editar</button></div>`;
  if(ent.description) html+=`<div class="page-desc">${esc(ent.description)}</div>`;
  if(stats) html+=`<div class="stat-grid">${stats}</div>`;
  html+=`<div class="rel-section"><div class="rel-label">Produzido por</div>${rel.producedBy.length?rel.producedBy.map(flowPill).join(''):'<span class="muted">—</span>'}</div>`;
  html+=`<div class="rel-section"><div class="rel-label">Usado em</div>${rel.consumedIn.length?rel.consumedIn.map(flowPill).join(''):'<span class="muted">—</span>'}</div>`;
  html+=`<div class="rel-section"><div class="rel-label">É chave para</div>${rel.keyFor.length?rel.keyFor.map(g=>pill('🔒 '+esc(g.name),`gotoGate('${g.id}')`)).join(''):'<span class="muted">—</span>'}</div>`;
  p.innerHTML=html;
}
function gotoFlow(id){ document.querySelector('[data-tab=fluxos]').click(); const f=model.flows.find(x=>x.id===id); if(f) openFlowForm(f); }
function gotoGate(id){ document.querySelector('[data-tab=prog]').click(); const g=model.gates.find(x=>x.id===id); if(g) openGateForm(g); }

function catFieldsHTML(cat, vals){
  const schema=CATEGORIES[cat]; if(!schema) return '';
  return `<div class="cat-fields">`+schema.fields.map(f=>`<div class="form-row"><label>${esc(f.l)}</label><input type="text" id="cf-${f.k}" value="${esc((vals&&vals[f.k])||'')}"></div>`).join('')+`</div>`;
}
function entityFormHTML(ent){
  const cats=Object.keys(CATEGORIES).map(c=>`<option value="${c}" ${ent&&ent.category===c?'selected':''}>${c}</option>`).join('');
  return `<div class="form-two">
      <div class="form-row"><label>Nome</label><input type="text" id="ef-name" value="${esc(ent?ent.name:'')}"></div>
      <div class="form-row"><label>Categoria</label><select id="ef-cat" onchange="onCatChange()">${cats}</select></div>
    </div>
    <div class="form-two">
      <div class="form-row"><label>Caminho</label><select id="ef-path"><option value="critico" ${ent&&ent.path==='opcional'?'':'selected'}>Crítico</option><option value="opcional" ${ent&&ent.path==='opcional'?'selected':''}>Opcional</option></select></div>
      <div class="form-row"><label>Natureza (uma linha)</label><input type="text" id="ef-nature" value="${esc(ent?ent.nature:'')}"></div>
    </div>
    <div class="form-row"><label>Descrição (texto do livro)</label><textarea id="ef-desc">${esc(ent?ent.description:'')}</textarea></div>
    <div id="cat-fields-holder">${catFieldsHTML(ent?ent.category:Object.keys(CATEGORIES)[0], ent?ent.fields:{})}</div>
    <div class="form-actions">
      <button class="primary" onclick="saveEntity()">Salvar</button>
      <button onclick="hide('entity-form')">Cancelar</button>
      ${ent?`<button class="danger" style="margin-left:auto;" onclick="deleteEntity()">Apagar</button>`:''}
    </div>`;
}
function onCatChange(){ const cat=document.getElementById('ef-cat').value; document.getElementById('cat-fields-holder').innerHTML=catFieldsHTML(cat,{}); }
function newEntity(){ editingEntity=null; document.getElementById('entity-form').innerHTML=entityFormHTML(null); show('entity-form'); hide('flow-form'); hide('gate-form'); }
function editEntity(name){ document.querySelector('[data-tab=autoria]').click(); editingEntity=findE(name); const el=document.getElementById('entity-form'); el.innerHTML=entityFormHTML(editingEntity); show('entity-form'); hide('flow-form'); hide('gate-form'); el.scrollIntoView({behavior:'smooth',block:'nearest'}); }
function saveEntity(){
  const name=document.getElementById('ef-name').value.trim();
  const category=document.getElementById('ef-cat').value;
  if(!name){ alert('Dá um nome.'); return; }
  const fields={}; (CATEGORIES[category].fields||[]).forEach(f=>{ const v=document.getElementById('cf-'+f.k); if(v&&v.value.trim())fields[f.k]=v.value.trim(); });
  const obj={ name, category, path:document.getElementById('ef-path').value, nature:document.getElementById('ef-nature').value.trim(), description:document.getElementById('ef-desc').value.trim(), fields };
  if(editingEntity){ const i=model.entities.findIndex(x=>x.name===editingEntity.name); model.entities[i]=obj; if(selected===editingEntity.name)selected=name; }
  else model.entities.push(obj);
  persist(); hide('entity-form'); renderAll();
}
function deleteEntity(){ if(!editingEntity||!confirm('Apagar?'))return; model.entities=model.entities.filter(x=>x.name!==editingEntity.name); if(selected===editingEntity.name)selected=null; persist(); hide('entity-form'); renderAll(); }

function renderFlows(){
  const filter=document.getElementById('flow-filter').value;
  const root=document.getElementById('flows-root'); root.innerHTML='';
  model.flows.filter(f=>!filter||f.path===filter).forEach(f=>{
    const ins=Object.entries(f.inputs||{}).map(([n,q])=>`<span class="ingr">${q}× ${esc(n)}</span>`).join('<span class="plus">+</span>');
    const outs=Object.entries(f.out||{}).map(([n,q])=>`<span class="prod ${f.path==='opcional'?'opt':''}">${q}× ${esc(n)}</span>`).join('<span class="plus">+</span>');
    const c=document.createElement('div'); c.className='flow-card'; c.onclick=()=>openFlowForm(f);
    c.innerHTML=`<div class="flow-title">${esc(f.name)} <span class="muted">(${f.path})</span></div><div class="flow-io">${ins||'<span class="muted">—</span>'}<span class="arrow">→</span>${outs}</div>`;
    root.appendChild(c);
  });
}
function flowFormHTML(f){
  return `<div class="form-row"><label>Nome da receita</label><input type="text" id="ff-name" value="${esc(f?f.name:'')}"></div>
    <div class="form-row"><label>Insumos</label><div id="ff-inputs"></div><button type="button" onclick="addFfInput()" style="align-self:flex-start;font-size:12px;">+ insumo</button></div>
    <div class="form-two">
      <div class="form-row"><label>Produz</label><input type="text" id="ff-out" list="ent-datalist" value="${f&&f.out?esc(Object.keys(f.out)[0]):''}"></div>
      <div class="form-row"><label>Qtd</label><input type="number" id="ff-outqty" value="${f&&f.out?Object.values(f.out)[0]:1}" min="1"></div>
    </div>
    <div class="form-row"><label>Caminho</label><select id="ff-path"><option value="critico" ${f&&f.path==='opcional'?'':'selected'}>Crítico</option><option value="opcional" ${f&&f.path==='opcional'?'selected':''}>Opcional</option></select></div>
    <div class="form-actions"><button class="primary" onclick="saveFlow()">Salvar</button><button onclick="hide('flow-form')">Cancelar</button>${f?`<button class="danger" style="margin-left:auto;" onclick="deleteFlow()">Apagar</button>`:''}</div>`;
}
function addFfInput(name='',qty=1){ const c=document.getElementById('ff-inputs'); const r=document.createElement('div'); r.className='input-row'; r.innerHTML=`<input type="text" class="ffi-name" list="ent-datalist" value="${esc(name)}" placeholder="insumo"><input type="number" class="ffi-qty" value="${qty}" min="1"><button type="button" onclick="this.parentElement.remove()">✕</button>`; c.appendChild(r); }
function openFlowForm(f){ document.querySelector('[data-tab=autoria]').click(); editingFlow=f||null; const el=document.getElementById('flow-form'); el.innerHTML=flowFormHTML(f); show('flow-form'); hide('entity-form'); hide('gate-form');
  const box=document.getElementById('ff-inputs'); box.innerHTML=''; if(f&&f.inputs&&Object.keys(f.inputs).length)Object.entries(f.inputs).forEach(([n,q])=>addFfInput(n,q)); else addFfInput();
  el.scrollIntoView({behavior:'smooth',block:'nearest'}); }
function saveFlow(){
  const name=document.getElementById('ff-name').value.trim(); const outName=document.getElementById('ff-out').value.trim();
  if(!name||!outName){ alert('Nome e produto obrigatórios.'); return; }
  const inputs={}; document.querySelectorAll('#ff-inputs .input-row').forEach(r=>{ const n=r.querySelector('.ffi-name').value.trim(); const q=parseFloat(r.querySelector('.ffi-qty').value)||0; if(n&&q>0)inputs[n]=q; });
  const obj={ id:editingFlow?editingFlow.id:uid('f'), name, inputs, out:{[outName]:parseFloat(document.getElementById('ff-outqty').value)||1}, path:document.getElementById('ff-path').value };
  if(editingFlow){ model.flows[model.flows.findIndex(x=>x.id===editingFlow.id)]=obj; } else model.flows.push(obj);
  persist(); hide('flow-form'); renderAll();
}
function deleteFlow(){ if(!editingFlow||!confirm('Apagar?'))return; model.flows=model.flows.filter(x=>x.id!==editingFlow.id); persist(); hide('flow-form'); renderAll(); }

function renderProgression(){
  ['critico','opcional'].forEach(path=>{
    const chain=document.getElementById(path==='critico'?'crit-chain':'opt-chain'); chain.innerHTML='';
    const gates=model.gates.filter(g=>g.path===path);
    if(!gates.length){ chain.innerHTML='<span class="muted">Nenhum gate.</span>'; return; }
    gates.forEach((g,i)=>{
      if(i>0){ const c=document.createElement('div'); c.className='conn'; c.textContent='↓'; chain.appendChild(c); }
      const kn=document.createElement('div'); kn.className='node'; kn.innerHTML=`<div class="kdiamond"><div class="n-title">🔑 ${esc(g.key)}</div><div class="n-sub">chave</div></div>`; chain.appendChild(kn);
      const c2=document.createElement('div'); c2.className='conn'; c2.textContent='↓'; chain.appendChild(c2);
      const ln=document.createElement('div'); ln.className='node'; ln.innerHTML=`<div class="lockbox"><div class="n-title">🔒 ${esc(g.name)}</div><div class="n-sub">${esc(g.unlocks)}</div></div>`; ln.querySelector('.lockbox').onclick=()=>openGateForm(g); chain.appendChild(ln);
    });
  });
}
function gateFormHTML(g){
  return `<div class="form-two">
      <div class="form-row"><label>Nome do gate</label><input type="text" id="gf-name" value="${esc(g?g.name:'')}"></div>
      <div class="form-row"><label>Chave exigida</label><input type="text" id="gf-key" list="ent-datalist" value="${esc(g?g.key:'')}"></div>
    </div>
    <div class="form-two">
      <div class="form-row"><label>Desbloqueia</label><input type="text" id="gf-unlocks" value="${esc(g?g.unlocks:'')}"></div>
      <div class="form-row"><label>Caminho</label><select id="gf-path"><option value="critico" ${g&&g.path==='opcional'?'':'selected'}>Crítico</option><option value="opcional" ${g&&g.path==='opcional'?'selected':''}>Opcional</option></select></div>
    </div>
    <div class="form-actions"><button class="primary" onclick="saveGate()">Salvar</button><button onclick="hide('gate-form')">Cancelar</button>${g?`<button class="danger" style="margin-left:auto;" onclick="deleteGate()">Apagar</button>`:''}</div>`;
}
function openGateForm(g){ document.querySelector('[data-tab=autoria]').click(); editingGate=g||null; const el=document.getElementById('gate-form'); el.innerHTML=gateFormHTML(g); show('gate-form'); hide('entity-form'); hide('flow-form'); el.scrollIntoView({behavior:'smooth',block:'nearest'}); }
function saveGate(){
  const name=document.getElementById('gf-name').value.trim(); const key=document.getElementById('gf-key').value.trim();
  if(!name||!key){ alert('Nome e chave obrigatórios.'); return; }
  const obj={ id:editingGate?editingGate.id:uid('g'), name, key, unlocks:document.getElementById('gf-unlocks').value.trim(), path:document.getElementById('gf-path').value };
  if(editingGate){ model.gates[model.gates.findIndex(x=>x.id===editingGate.id)]=obj; } else model.gates.push(obj);
  persist(); hide('gate-form'); renderAll();
}
function deleteGate(){ if(!editingGate||!confirm('Apagar?'))return; model.gates=model.gates.filter(x=>x.id!==editingGate.id); persist(); hide('gate-form'); renderAll(); }

function renderAutoriaList(){
  document.getElementById('autoria-list').innerHTML=`<div class="muted" style="margin-bottom:8px;">${model.entities.length} entidades · ${model.flows.length} receitas · ${model.gates.length} gates. Clique numa entidade no Compêndio pra ver/editar sua página.</div>`;
}
function show(id){ document.getElementById(id).classList.remove('hidden'); }
function hide(id){ document.getElementById(id).classList.add('hidden'); }
function refreshDatalists(){
  document.getElementById('ent-datalist').innerHTML=model.entities.map(e=>`<option value="${esc(e.name)}">`).join('');
}
function exportModel(){ const b=new Blob([JSON.stringify(model,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='moonrite-modelo.json'; a.click(); }
function importModel(ev){ const f=ev.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=()=>{ try{ model=JSON.parse(r.result); persist(); renderAll(); }catch(e){ alert('Inválido.'); } }; r.readAsText(f); ev.target.value=''; }
function resetModel(){ if(!confirm('Restaurar padrão? Edições locais serão perdidas.'))return; model=defaultModel(); selected=null; persist(); renderAll(); }
function renderAll(){ renderNav(); renderPage(); renderFlows(); renderProgression(); renderAutoriaList(); refreshDatalists(); }

document.querySelectorAll('.tab-btn').forEach(btn=>{ btn.addEventListener('click',()=>{
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active'); document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
}); });

model=store.get('mr_model')||defaultModel();
if(!model.entities || !model.entities[0] || !('nature' in model.entities[0])){ model=defaultModel(); persist(); }
renderAll();
