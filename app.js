// ============================================================
// Moonrite — Compêndio (modelo + lógica)
// ============================================================

// Ícones placeholder (emoji) por categoria — servem de stand-in até a arte real
const CAT_ICON = {
  "Player":"🧙","Raw Resource":"🪵","Item":"📦","Weapon/Tool":"⚔️","Consumable":"🍢",
  "Equipment":"🛡️","Station":"⚗️","System":"🔄","System State":"⬆️","Spirit":"✨",
  "Creature":"🐸","Enemy":"👹","Gatherable":"🌿","Area":"🗺️"
};
// Ícones específicos por entidade (placeholder) — sobrepõem o da categoria quando existem
const ENTITY_ICON = {
  "Branches":"🌿","Stone":"🪨","Log":"🪵","Stick":"🥢","Stone Blade":"🔪","Mushroom":"🍄",
  "Crude Axe":"🪓","Stone Sword":"🗡️","Bone Sword":"🦴","Dead Frog":"🐸","Boar Meat":"🥩",
  "Bone":"🦴","Boar Hide":"🟫","Boulders":"🪨","Light Flower":"🌸","Root":"🌱",
  "Leather":"🟤","Bone Blade":"🦴","Leather Armor":"🦺","Rock Talisman":"🧿",
  "Mushroom Skewer":"🍢","Grilled Meat":"🍖","Cauldron":"⚗️","Artisan Workbench":"🛠️",
  "Estátua da Natureza":"🗿","Tannery":"🧵","Nature Spirit":"🍃","Flesh and Bone Spirit":"💀",
  "Light Spirit":"🔆","Sapo":"🐸","Boar":"🐗","Aquiles":"🛡️","Devourer":"👹","Dutra":"👾",
  "POI Inicial":"🏞️","Overworld":"🗺️","POI do Aquiles":"⚔️","POI do Devourer":"🕳️","POI Clareira":"🌳",
  "Player":"🧙",
  "Loop do Cauldron":"🔄","Sistema de Combate":"⚔️","Sistema de Refino":"🛠️","Captura de Espírito":"🫧",
  "Cauldron Lv1":"1️⃣","Cauldron Lv2":"2️⃣","Cauldron Lv3":"3️⃣","Cauldron Lv4":"4️⃣"
};
function iconFor(ent){
  if(!ent) return "•";
  return ENTITY_ICON[ent.name] || CAT_ICON[ent.category] || "•";
}
function iconForName(name){
  const e=findE(name);
  if(e) return iconFor(e);
  return ENTITY_ICON[name] || "•";
}

// Campos específicos por categoria (schema da ontologia)
const CATEGORIES = {
  "Player":       { fields:[{k:"health",l:"Vida base"},{k:"stamina",l:"Stamina base"},{k:"verbs",l:"Verbos que executa"}] },
  "Raw Resource": { fields:[{k:"obtain",l:"Como se obtém"},{k:"source",l:"Origem no mundo"},{k:"stack",l:"Empilha?"}] },
  "Item":         { fields:[{k:"obtain",l:"Como se obtém (craft/mundo)"},{k:"role",l:"Papel"},{k:"stack",l:"Empilha?"}] },
  "Weapon/Tool":  { fields:[{k:"damage",l:"Dano"},{k:"harvests",l:"Coleta / corta"},{k:"obtain",l:"Como se obtém"}] },
  "Consumable":   { fields:[{k:"effect",l:"Efeito"},{k:"duration",l:"Duração"},{k:"obtain",l:"Como se obtém"}] },
  "Equipment":    { fields:[{k:"bonus",l:"Bônus"},{k:"obtain",l:"Como se obtém"}] },
  "Station":      { fields:[{k:"makes",l:"O que produz"},{k:"partOf",l:"Sistema a que pertence"}] },
  "System":       { fields:[{k:"loop",l:"O loop em uma frase"},{k:"states",l:"Estados (se houver)"},{k:"flows",l:"Fluxos que agrupa"}] },
  "System State": { fields:[{k:"system",l:"Sistema-mãe"},{k:"unlocks",l:"O que este estado desbloqueia"},{k:"reachedBy",l:"Como se chega"}] },
  "Spirit":       { fields:[{k:"command",l:"Comando"},{k:"ability",l:"Habilidade"},{k:"expires",l:"Expira?"}] },
  "Creature":     { fields:[{k:"behavior",l:"Comportamento"},{k:"defeat",l:"Como lidar"},{k:"drops",l:"Drops"}] },
  "Enemy":        { fields:[{k:"behavior",l:"Comportamento"},{k:"hp",l:"Vida"},{k:"damage",l:"Dano"},{k:"drops",l:"Drops"}] },
  "Gatherable":   { fields:[{k:"yields",l:"Rende"},{k:"tool",l:"Ferramenta"}] },
  "Area":         { fields:[{k:"contains",l:"Contém"},{k:"entry",l:"Entrada"},{k:"exit",l:"Saída / gate"}] }
};

// Ordem/pesos dos caminhos
const PATHS = ["critico","estendido","opcional"];
const PATH_LABEL = { critico:"crítico", estendido:"estendido", opcional:"opcional" };

// Tipos de fluxo — separam craft de coleta pra análise de órfãos
const FLOW_KIND = { craft:"craft", refino:"refino", coleta:"coleta", feed:"feed", cozinha:"cozinha" };
const FLOW_KIND_LABEL = { craft:"craft", refino:"refino", coleta:"coleta", feed:"feed", cozinha:"cozinha" };

function defaultModel(){
  const e=(name,category,path,nature,description,fields)=>({name,category,path:path||'critico',nature:nature||'',description:description||'',fields:fields||{}});
  const entities=[
    // --- Player ---
    e("Player","Player","critico","O feiticeiro que você controla.","Reúne recursos, comanda espíritos, constrói e restaura o Cauldron. Toda a economia é mediada pelos verbos do Player: coletar, craftar, comandar, equipar, consumir, combater.",{health:"100",stamina:"100",verbs:"coletar, craftar, comandar, equipar, consumir, combater"}),

    // --- Raw Resources (só obtidos no mundo, nunca craftados) ---
    e("Branches","Raw Resource","critico","Madeira leve de uso geral.","Coletada no chão da Área Inicial. Primeiro recurso do jogo; restaura o Cauldron e crafta o Crude Axe.",{obtain:"Pickable",source:"Chão do POI Inicial",stack:"Sim"}),
    e("Stone","Raw Resource","critico","Mineral de uso geral.","Coletada no chão ou quebrada de Boulders. Base de lâminas e talismãs.",{obtain:"Pickable / drop de Boulders",source:"Chão / Boulders",stack:"Sim"}),
    e("Log","Raw Resource","critico","Madeira grande.","Cortada de árvores com ferramenta. Refinada em Stick na Artisan Workbench.",{obtain:"Corte de árvore",source:"Regular Tree",stack:"Sim"}),
    e("Mushroom","Raw Resource","critico","Cogumelo coletável.","Alimenta o Cauldron até o nível 2 e vira consumíveis de buff.",{obtain:"Gatherable",source:"POI Inicial / Overworld",stack:"Sim"}),
    e("Dead Frog","Raw Resource","estendido","Sapo capturado.","Obtido quando o Nature Spirit captura o Sapo. Alimenta o Cauldron no nível 3.",{obtain:"Drop (via Nature Spirit)",source:"Sapo",stack:"Sim"}),
    e("Boar Meat","Raw Resource","critico","Carne do javali.","Drop do Boar. Alimenta o Cauldron e crafta o Flesh and Bone Spirit.",{obtain:"Drop de monstro",source:"Boar",stack:"Sim"}),
    e("Bone","Raw Resource","critico","Osso do javali.","Drop do Boar. Compõe spirit e Bone Blade.",{obtain:"Drop de monstro",source:"Boar",stack:"Sim"}),
    e("Boar Hide","Raw Resource","estendido","Couro do javali.","Drop do Boar. Refinado em Leather na Tannery.",{obtain:"Drop de monstro",source:"Boar",stack:"Sim"}),
    e("Root","Raw Resource","opcional","Raiz.","Drop do Dutra. Alimenta o Cauldron nível 4.",{obtain:"Drop de monstro",source:"Dutra",stack:"Sim"}),

    // --- Gatherables (nós de coleta no mundo) ---
    e("Boulders","Gatherable","estendido","Pedregulho.","Quebra em Stone com ferramenta.",{yields:"Stone",tool:"Crude Axe"}),
    e("Light Flower","Gatherable","opcional","Flor luminosa.","Coletada no POI Clareira. Alimenta o Cauldron nível 4 e crafta o Light Spirit.",{yields:"Light Flower",tool:"Mão"}),

    // --- Items (craftados OU obtidos; não-vivos) ---
    e("Stick","Item","critico","Refinado de Log.","Componente de armas. Feito na Artisan Workbench.",{obtain:"Refino (Log)",role:"Componente de arma",stack:"Sim"}),
    e("Stone Blade","Item","critico","Refinado de Stone.","Gume que compõe a Stone Sword.",{obtain:"Refino (Stone)",role:"Componente de arma",stack:"Sim"}),
    e("Bone Blade","Item","opcional","Gume de osso.","Refinado de Bone; compõe a Bone Sword.",{obtain:"Refino (Bone)",role:"Componente de arma",stack:"Sim"}),
    e("Leather","Item","estendido","Couro curtido.","Refinado de Boar Hide na Tannery.",{obtain:"Refino (Boar Hide)",role:"Componente de armadura",stack:"Sim"}),

    // --- Weapon/Tool ---
    e("Crude Axe","Weapon/Tool","critico","A primeira ferramenta.","Craftada direto de Branches + Stone, sem refino. Corta madeira e vinhas; dano baixo. É a única arma sem etapa de refino — por isso existe cedo, antes da Workbench.",{damage:"Baixo",harvests:"Madeira, vinhas",obtain:"Craft (Cauldron/inventário)"}),
    e("Stone Sword","Weapon/Tool","critico","Arma de corte.","Primeira arma de combate real. Também é consumida ao craftar o Flesh and Bone Spirit.",{damage:"Médio",harvests:"—",obtain:"Craft"}),
    e("Bone Sword","Weapon/Tool","opcional","Espada de osso.","Craftada de Bone Blade + Stick.",{damage:"A definir",harvests:"—",obtain:"Craft"}),

    // --- Equipment ---
    e("Leather Armor","Equipment","opcional","Armadura de couro.","Craftada de Leather.",{bonus:"Defesa (a definir)",obtain:"Craft"}),
    e("Rock Talisman","Equipment","estendido","Amuleto de pedra.","Aumenta a vida máxima.",{bonus:"+10 vida máx",obtain:"Craft"}),

    // --- Consumables ---
    e("Mushroom Skewer","Consumable","estendido","Espetinho de cogumelo.","Buff temporário. Cozinhado a partir de Mushroom.",{effect:"+10 vida, +15 stamina máx",duration:"5min",obtain:"Cozinha (Mushroom)"}),
    e("Grilled Meat","Consumable","estendido","Carne grelhada.","Buff temporário. Cozinhado a partir de Boar Meat.",{effect:"+25 vida máx",duration:"20min",obtain:"Cozinha (Boar Meat)"}),

    // --- Stations ---
    e("Cauldron","Station","critico","O coração do jogo.","Estação central. Restaurada com Branches, evolui por níveis conforme é alimentada, e cada nível desbloqueia um novo espírito. Pertence ao sistema Loop do Cauldron.",{makes:"Spirits, Stone Sword",partOf:"Loop do Cauldron"}),
    e("Artisan Workbench","Station","critico","Bancada de refino.","Transforma recursos crus em intermediários: Log→Stick, Stone→Stone Blade. Pertence ao Sistema de Refino.",{makes:"Stick, Stone Blade",partOf:"Sistema de Refino"}),
    e("Estátua da Natureza","Station","critico","Portal vivo.","Gateway que libera a saída da Área Inicial. Só ativa com um Nature Spirit.",{makes:"—",partOf:"—"}),
    e("Tannery","Station","estendido","Curtume.","Refina Boar Hide em Leather. Pertence ao Sistema de Refino.",{makes:"Leather",partOf:"Sistema de Refino"}),

    // --- Systems (mãe) ---
    e("Loop do Cauldron","System","critico","O motor de progressão.","Alimentar o Cauldron sobe seu nível; cada nível desbloqueia um novo tipo de espírito e novas áreas. É o loop central que amarra coleta, craft e progressão. Tem quatro estados: Lv1 a Lv4.",{loop:"Alimentar → subir nível → desbloquear espírito/área",states:"Cauldron Lv1, Lv2, Lv3, Lv4",flows:"Restaurar Cauldron, Feed nível 2/3/4"}),
    e("Sistema de Combate","System","critico","Como o Player enfrenta o mundo.","Combate corpo-a-corpo com armas craftadas; inimigos dropam recursos. Alimenta o loot que volta pro Cauldron.",{loop:"Equipar arma → combater → lootar",states:"—",flows:"Loot do Boar, Loot do Dutra"}),
    e("Sistema de Refino","System","critico","Recurso cru vira componente.","Estações (Workbench, Tannery) transformam recursos crus em intermediários com timer. Ponte entre coleta e craft de armas/armaduras.",{loop:"Recurso cru → estação → componente",states:"—",flows:"Refinar Stick, Stone Blade, Bone Blade, Leather"}),
    e("Captura de Espírito","System","estendido","Comandar espíritos pra interagir.","O Player comanda um espírito (Q) para agir sobre o mundo sem se expor — capturar o Sapo sem tomar veneno é o caso-âncora.",{loop:"Comandar espírito → interagir → obter recurso",states:"—",flows:"Capturar Sapo"}),

    // --- System States (sub-entidades do Cauldron) ---
    e("Cauldron Lv1","System State","critico","Cauldron restaurado.","Primeiro estado após restaurar o Cauldron com Branches. Desbloqueia a Alchemy (craft básico).",{system:"Loop do Cauldron",unlocks:"Alchemy / craft básico",reachedBy:"Restaurar com 4 Branches"}),
    e("Cauldron Lv2","System State","critico","Cauldron desperto.","Desbloqueia a aba de espíritos, permitindo craftar o Nature Spirit.",{system:"Loop do Cauldron",unlocks:"Spirit tab (1º espírito)",reachedBy:"Feed com 5 Mushroom"}),
    e("Cauldron Lv3","System State","critico","Cauldron pulsante.","Desbloqueia o segundo espírito (Flesh and Bone).",{system:"Loop do Cauldron",unlocks:"2º espírito",reachedBy:"Feed com 3 Boar Meat + 3 Dead Frog"}),
    e("Cauldron Lv4","System State","opcional","Cauldron pleno.","Desbloqueia o terceiro espírito (Light).",{system:"Loop do Cauldron",unlocks:"3º espírito",reachedBy:"Feed com 5 Root + 1 Light Flower"}),

    // --- Spirits ---
    e("Nature Spirit","Spirit","critico","O primeiro companheiro.","Craftado no Cauldron. Comandado com Q para interagir com o mundo — captura o Sapo sem sofrer o veneno.",{command:"Q → interagir",ability:"Imune a veneno; captura Sapo",expires:"Sim"}),
    e("Flesh and Bone Spirit","Spirit","critico","O segundo companheiro.","Craftado com Bone + Boar Meat + uma espada. Desbloqueado no Cauldron nível 3.",{command:"Q",ability:"A definir",expires:"Sim"}),
    e("Light Spirit","Spirit","opcional","O terceiro companheiro.","Craftado com Light Flower + arma. Cauldron nível 4.",{command:"Q",ability:"A definir",expires:"Sim"}),

    // --- Creature ---
    e("Sapo","Creature","estendido","Bicho ligeiro e traiçoeiro.","Foge quando o Player tenta pegar e solta veneno na falha. Só o Nature Spirit captura sem dano.",{behavior:"Foge, envenena",defeat:"Nature Spirit",drops:"Dead Frog"}),

    // --- Enemies ---
    e("Boar","Enemy","critico","Javali selvagem.","Ataca com investida (charge) quando o Player entra no alcance. Rodeia os POIs do Overworld.",{behavior:"Charge attack",hp:"A definir",damage:"A definir",drops:"Meat, Bone, Hide"}),
    e("Aquiles","Enemy","critico","O guardião do meio.","Sub-boss dentro do próprio POI. Superá-lo abre caminho para o POI do Devourer.",{behavior:"A definir",hp:"A definir",damage:"A definir",drops:"—"}),
    e("Devourer","Enemy","critico","O gate final do bioma.","Boss final do 1º bioma. Encerra a progressão crítica da demo; dispara o popup de wishlist.",{behavior:"A definir",hp:"A definir",damage:"A definir",drops:"—"}),
    e("Dutra","Enemy","opcional","Criatura da clareira.","Aparece em grupos de 5. Combatida com ajuda dos espíritos.",{behavior:"Grupo",hp:"A definir",damage:"A definir",drops:"Root, Mushroom"}),

    // --- Areas ---
    e("POI Inicial","Area","critico","O vale de partida.","Canyon inicial com duas sub-áreas. Onde o Player encontra o Cauldron quebrado.",{contains:"Cauldron, Branches, Stone, Mushroom",entry:"Início do jogo",exit:"Estátua da Natureza"}),
    e("Overworld","Area","critico","O mundo aberto (Mapa 1).","Onde vivem Boar, Sapo, árvores e os POIs de Aquiles e do Devourer.",{contains:"Boar, Sapo, Regular Tree, POI do Aquiles, POI do Devourer",entry:"Estátua da Natureza",exit:"POI do Devourer"}),
    e("POI do Aquiles","Area","critico","A arena do sub-boss.","Acessada com 2 espíritos.",{contains:"Aquiles",entry:"Gate de 2 espíritos",exit:"POI do Devourer"}),
    e("POI do Devourer","Area","critico","A arena final.","Acessada após vencer Aquiles.",{contains:"Devourer",entry:"Derrotar Aquiles",exit:"Fim da demo"}),
    e("POI Clareira","Area","opcional","Clareira luminosa.","Contém Dutras e Light Flowers.",{contains:"Dutra, Light Flower",entry:"A ancorar",exit:"—"})
  ];

  // Fluxos com kind (craft/refino/coleta/feed/cozinha)
  const rawFlows=[
    // refino
    {name:"Refinar Stick",kind:"refino",station:"Artisan Workbench",inputs:{Log:1},out:{Stick:1},path:"critico"},
    {name:"Refinar Stone Blade",kind:"refino",station:"Artisan Workbench",inputs:{Stone:1},out:{"Stone Blade":1},path:"critico"},
    {name:"Refinar Bone Blade",kind:"refino",station:"Artisan Workbench",inputs:{Bone:1},out:{"Bone Blade":1},path:"opcional"},
    {name:"Refinar Leather",kind:"refino",station:"Tannery",inputs:{"Boar Hide":1},out:{Leather:1},path:"estendido"},
    // craft
    {name:"Craft Crude Axe",kind:"craft",station:"Cauldron",inputs:{Branches:1,Stone:1},out:{"Crude Axe":1},path:"critico"},
    {name:"Craft Stone Sword",kind:"craft",station:"Cauldron",inputs:{Stick:1,"Stone Blade":1},out:{"Stone Sword":1},path:"critico"},
    {name:"Craft Bone Sword",kind:"craft",station:"Cauldron",inputs:{"Bone Blade":1,Stick:1},out:{"Bone Sword":1},path:"opcional"},
    {name:"Craft Nature Spirit",kind:"craft",station:"Cauldron",inputs:{Stone:1,Mushroom:1},out:{"Nature Spirit":1},path:"critico"},
    {name:"Craft Flesh and Bone Spirit",kind:"craft",station:"Cauldron",inputs:{Bone:1,"Boar Meat":1,"Stone Sword":1},out:{"Flesh and Bone Spirit":1},path:"critico"},
    {name:"Craft Light Spirit",kind:"craft",station:"Cauldron",inputs:{"Light Flower":1,"Stone Sword":1},out:{"Light Spirit":1},path:"opcional"},
    {name:"Craft Leather Armor",kind:"craft",station:"Cauldron",inputs:{Leather:2},out:{"Leather Armor":1},path:"opcional"},
    {name:"Craft Rock Talisman",kind:"craft",station:"Cauldron",inputs:{Stone:2},out:{"Rock Talisman":1},path:"estendido"},
    // cozinha (consumíveis)
    {name:"Cozinhar Mushroom Skewer",kind:"cozinha",station:"Cauldron",inputs:{Mushroom:2},out:{"Mushroom Skewer":1},path:"estendido"},
    {name:"Cozinhar Grilled Meat",kind:"cozinha",station:"Cauldron",inputs:{"Boar Meat":1},out:{"Grilled Meat":1},path:"estendido"},
    // feed (sobe estado do Cauldron)
    {name:"Restaurar Cauldron (Lv1)",kind:"feed",station:"Cauldron",inputs:{Branches:4},out:{"Cauldron Lv1":1},path:"critico"},
    {name:"Feed Cauldron Lv2",kind:"feed",station:"Cauldron",inputs:{Mushroom:5},out:{"Cauldron Lv2":1},path:"critico"},
    {name:"Feed Cauldron Lv3",kind:"feed",station:"Cauldron",inputs:{"Boar Meat":3,"Dead Frog":3},out:{"Cauldron Lv3":1},path:"critico"},
    {name:"Feed Cauldron Lv4",kind:"feed",station:"Cauldron",inputs:{Root:5,"Light Flower":1},out:{"Cauldron Lv4":1},path:"opcional"},
    // coleta (drops / quebra)
    {name:"Loot do Boar",kind:"coleta",station:"—",inputs:{Boar:1},out:{"Boar Meat":1,Bone:1,"Boar Hide":1},path:"critico"},
    {name:"Loot do Dutra",kind:"coleta",station:"—",inputs:{Dutra:1},out:{Root:1,Mushroom:1},path:"opcional"},
    {name:"Capturar Sapo",kind:"coleta",station:"—",inputs:{Sapo:1},out:{"Dead Frog":1},path:"estendido"},
    {name:"Quebrar Boulders",kind:"coleta",station:"—",inputs:{Boulders:1},out:{Stone:1},path:"estendido"}
  ];
  const flows=rawFlows.map((f,i)=>({id:'f'+i,...f}));

  const gates=[
    {id:'g1',name:"Restauração do Cauldron",key:"Branches",unlocks:"Cauldron Lv1 (Alchemy)",path:"critico"},
    {id:'g2',name:"Cauldron nível 2",key:"Mushroom",unlocks:"Cauldron Lv2 (spirit tab)",path:"critico"},
    {id:'g3',name:"Estátua da Natureza",key:"Nature Spirit",unlocks:"Saída → Overworld",path:"critico"},
    {id:'g4',name:"Cauldron nível 3",key:"Boar Meat + Dead Frog",unlocks:"Cauldron Lv3 (2º spirit)",path:"critico"},
    {id:'g5',name:"Portão do POI do Aquiles",key:"Flesh and Bone Spirit",unlocks:"Arena do Aquiles",path:"critico"},
    {id:'g6',name:"Portão do Devourer",key:"Aquiles derrotado",unlocks:"Arena do Devourer (boss final)",path:"critico"},
    {id:'g7',name:"Cauldron nível 4",key:"Root + Light Flower",unlocks:"Cauldron Lv4 (3º spirit)",path:"opcional"}
  ];
  return {entities,flows,gates};
}

// ============================================================
// Estado + storage
// ============================================================
let model=null, selected=null, editingFlow=null, editingGate=null, editingEntity=null;
const store={ ok:(()=>{try{localStorage.setItem('__t','1');localStorage.removeItem('__t');return true;}catch(e){return false;}})(),
  get(k){if(!this.ok)return null;try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}},
  set(k,v){if(!this.ok)return;try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}} };
function persist(){ store.set('mr_model',model); }
function esc(s){ const d=document.createElement('div'); d.textContent=s==null?'':s; return d.innerHTML; }
function uid(p){ return p+Date.now()+Math.random().toString(36).slice(2,5); }
function findE(n){ return model.entities.find(x=>x.name===n); }
function pathClass(p){ return p==='critico'?'crit':(p==='estendido'?'ext':'opt'); }

// ============================================================
// COMPÊNDIO — nav + página
// ============================================================
function renderNav(){
  const s=(document.getElementById('comp-search').value||'').toLowerCase();
  const groups={};
  model.entities.forEach(e=>{ if(s&&!e.name.toLowerCase().includes(s))return; (groups[e.category]=groups[e.category]||[]).push(e); });
  const order=Object.keys(CATEGORIES).filter(c=>groups[c]);
  const nav=document.getElementById('comp-nav'); nav.innerHTML='';
  order.forEach(cat=>{
    const h=document.createElement('div'); h.className='cat-header';
    h.innerHTML=`<span class="cat-title">${CAT_ICON[cat]||''} ${esc(cat)}</span><span class="muted">${groups[cat].length}</span>`;
    const body=document.createElement('div');
    h.onclick=()=>body.style.display=body.style.display==='none'?'block':'none';
    groups[cat].sort((a,b)=>a.name.localeCompare(b.name)).forEach(ent=>{
      const it=document.createElement('div'); it.className='nav-item'+(selected===ent.name?' sel':'');
      it.innerHTML=`<span class="nav-ic">${iconFor(ent)}</span> ${esc(ent.name)} <span class="np ${pathClass(ent.path)}">· ${PATH_LABEL[ent.path]||ent.path}</span>`;
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
// relações estruturais adicionais lidas dos campos (sistema↔estado, estação↔sistema, área↔conteúdo)
function structuralRelations(ent){
  const out={ states:[], statesOf:null, stationsOfSystem:[], systemOfStation:null, containedIn:[], contains:[] };
  if(ent.category==='System'){
    out.states = model.entities.filter(x=>x.category==='System State' && (x.fields.system===ent.name));
    out.stationsOfSystem = model.entities.filter(x=>x.category==='Station' && x.fields.partOf===ent.name);
  }
  if(ent.category==='System State' && ent.fields.system){ out.statesOf = findE(ent.fields.system); }
  if(ent.category==='Station' && ent.fields.partOf && ent.fields.partOf!=='—'){ out.systemOfStation = findE(ent.fields.partOf); }
  // área contém entidades (por nome citado no campo contains) e onde esta entidade é citada
  model.entities.filter(x=>x.category==='Area').forEach(area=>{
    const list=(area.fields.contains||'').split(/,\s*/).map(s=>s.trim());
    if(list.includes(ent.name)) out.containedIn.push(area);
  });
  if(ent.category==='Area'){
    const list=(ent.fields.contains||'').split(/,\s*/).map(s=>s.trim());
    out.contains = list.map(findE).filter(Boolean);
  }
  return out;
}

function renderPage(){
  const p=document.getElementById('comp-page');
  if(!selected){ p.innerHTML='<span class="muted">Selecione uma entidade.</span>'; return; }
  const ent=findE(selected); if(!ent){ p.innerHTML='<span class="muted">Não encontrada.</span>'; return; }
  const rel=relationsFor(ent.name);
  const str=structuralRelations(ent);
  const schema=CATEGORIES[ent.category];
  const stats=(schema?schema.fields:[]).filter(f=>ent.fields&&ent.fields[f.k]).map(f=>`<div class="stat"><div class="sl">${esc(f.l)}</div><div class="sv">${esc(ent.fields[f.k])}</div></div>`).join('');
  const entPill=(n)=>`<span class="rel-pill" onclick="selectEntity('${esc(n).replace(/'/g,"\\'")}')">${iconForName(n)} ${esc(n)}</span>`;
  const flowPill=f=>`<span class="rel-pill" onclick="gotoFlow('${f.id}')">${esc(f.name)} <span class="muted">(${FLOW_KIND_LABEL[f.kind]||''})</span></span>`;
  let html=`<div class="page-head">
    <div><div class="page-title">${iconFor(ent)} ${esc(ent.name)}</div>${ent.nature?`<div class="page-nature">${esc(ent.nature)}</div>`:''}
    <div class="page-badges"><span class="badge">${CAT_ICON[ent.category]||''} ${esc(ent.category)}</span><span class="badge ${pathClass(ent.path)}">${PATH_LABEL[ent.path]||ent.path}</span></div></div>
    <button onclick="editEntity(${JSON.stringify(ent.name)})">✎ editar</button></div>`;
  if(ent.description) html+=`<div class="page-desc">${esc(ent.description)}</div>`;
  if(stats) html+=`<div class="stat-grid">${stats}</div>`;

  // relações de economia
  html+=`<div class="rel-section"><div class="rel-label">Produzido por</div>${rel.producedBy.length?rel.producedBy.map(flowPill).join(''):'<span class="muted">—</span>'}</div>`;
  html+=`<div class="rel-section"><div class="rel-label">Usado em</div>${rel.consumedIn.length?rel.consumedIn.map(flowPill).join(''):'<span class="muted">—</span>'}</div>`;
  html+=`<div class="rel-section"><div class="rel-label">É chave para</div>${rel.keyFor.length?rel.keyFor.map(g=>`<span class="rel-pill" onclick="gotoGate('${g.id}')">🔒 ${esc(g.name)}</span>`).join(''):'<span class="muted">—</span>'}</div>`;

  // relações estruturais (só aparecem quando fazem sentido)
  if(str.states.length) html+=`<div class="rel-section"><div class="rel-label">Estados deste sistema</div>${str.states.map(x=>entPill(x.name)).join('')}</div>`;
  if(str.stationsOfSystem.length) html+=`<div class="rel-section"><div class="rel-label">Estações do sistema</div>${str.stationsOfSystem.map(x=>entPill(x.name)).join('')}</div>`;
  if(str.statesOf) html+=`<div class="rel-section"><div class="rel-label">Estado do sistema</div>${entPill(str.statesOf.name)}</div>`;
  if(str.systemOfStation) html+=`<div class="rel-section"><div class="rel-label">Pertence ao sistema</div>${entPill(str.systemOfStation.name)}</div>`;
  if(str.contains.length) html+=`<div class="rel-section"><div class="rel-label">Contém</div>${str.contains.map(x=>entPill(x.name)).join('')}</div>`;
  if(str.containedIn.length) html+=`<div class="rel-section"><div class="rel-label">Encontrado em</div>${str.containedIn.map(x=>entPill(x.name)).join('')}</div>`;

  p.innerHTML=html;
}
function selectEntity(n){ document.querySelector('[data-tab=comp]').click(); selected=n; renderNav(); renderPage(); }
function gotoFlow(id){ document.querySelector('[data-tab=fluxos]').click(); const f=model.flows.find(x=>x.id===id); if(f) openFlowForm(f); }
function gotoGate(id){ document.querySelector('[data-tab=prog]').click(); const g=model.gates.find(x=>x.id===id); if(g) openGateForm(g); }

// ============================================================
// AUTORIA — entidade
// ============================================================
function catFieldsHTML(cat, vals){
  const schema=CATEGORIES[cat]; if(!schema) return '';
  return `<div class="cat-fields">`+schema.fields.map(f=>`<div class="form-row"><label>${esc(f.l)}</label><input type="text" id="cf-${f.k}" value="${esc((vals&&vals[f.k])||'')}"></div>`).join('')+`</div>`;
}
function pathOptions(sel){ return PATHS.map(p=>`<option value="${p}" ${sel===p?'selected':''}>${PATH_LABEL[p]}</option>`).join(''); }
function entityFormHTML(ent){
  const cats=Object.keys(CATEGORIES).map(c=>`<option value="${c}" ${ent&&ent.category===c?'selected':''}>${c}</option>`).join('');
  return `<div class="form-two">
      <div class="form-row"><label>Nome</label><input type="text" id="ef-name" value="${esc(ent?ent.name:'')}"></div>
      <div class="form-row"><label>Categoria</label><select id="ef-cat" onchange="onCatChange()">${cats}</select></div>
    </div>
    <div class="form-two">
      <div class="form-row"><label>Caminho</label><select id="ef-path">${pathOptions(ent?ent.path:'critico')}</select></div>
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

// ============================================================
// FLUXOS — visualização facilitada + análise de órfãos
// ============================================================
function renderFlows(){
  const filter=document.getElementById('flow-filter').value;
  const kindFilter=document.getElementById('flow-kind')?document.getElementById('flow-kind').value:'';
  const root=document.getElementById('flows-root'); root.innerHTML='';

  // agrupa por kind, respeitando filtros
  const shown=model.flows.filter(f=>(!filter||f.path===filter)&&(!kindFilter||f.kind===kindFilter));
  const byKind={};
  shown.forEach(f=>{ (byKind[f.kind]=byKind[f.kind]||[]).push(f); });
  const kindOrder=["coleta","refino","cozinha","craft","feed"];
  kindOrder.filter(k=>byKind[k]).forEach(kind=>{
    const sec=document.createElement('div'); sec.className='flow-group';
    sec.innerHTML=`<div class="flow-group-title">${esc(FLOW_KIND_LABEL[kind]||kind)} <span class="muted">· ${byKind[kind].length}</span></div>`;
    byKind[kind].forEach(f=>sec.appendChild(flowCard(f)));
    root.appendChild(sec);
  });
  if(!shown.length) root.innerHTML='<span class="muted">Nenhum fluxo com esse filtro.</span>';
}
function flowCard(f){
  const ins=Object.entries(f.inputs||{}).map(([n,q])=>`<span class="ingr" onclick="event.stopPropagation();selectEntity('${esc(n).replace(/'/g,"\\'")}')">${iconForName(n)} ${q}× ${esc(n)}</span>`).join('<span class="plus">+</span>');
  const outs=Object.entries(f.out||{}).map(([n,q])=>`<span class="prod ${pathClass(f.path)}" onclick="event.stopPropagation();selectEntity('${esc(n).replace(/'/g,"\\'")}')">${iconForName(n)} ${q}× ${esc(n)}</span>`).join('<span class="plus">+</span>');
  const c=document.createElement('div'); c.className='flow-card'; c.onclick=()=>openFlowForm(f);
  const st=f.station&&f.station!=='—'?` <span class="muted">· ${esc(f.station)}</span>`:'';
  c.innerHTML=`<div class="flow-title">${esc(f.name)} <span class="badge ${pathClass(f.path)}" style="font-size:10px">${PATH_LABEL[f.path]}</span>${st}</div><div class="flow-io">${ins||'<span class="muted">—</span>'}<span class="arrow">→</span>${outs}</div>`;
  return c;
}
function flowFormHTML(f){
  const kinds=Object.keys(FLOW_KIND).map(k=>`<option value="${k}" ${f&&f.kind===k?'selected':''}>${FLOW_KIND_LABEL[k]}</option>`).join('');
  return `<div class="form-two">
      <div class="form-row"><label>Nome da receita/fluxo</label><input type="text" id="ff-name" value="${esc(f?f.name:'')}"></div>
      <div class="form-row"><label>Tipo</label><select id="ff-kind">${kinds}</select></div>
    </div>
    <div class="form-row"><label>Insumos</label><div id="ff-inputs"></div><button type="button" onclick="addFfInput()" style="align-self:flex-start;font-size:12px;">+ insumo</button></div>
    <div class="form-two">
      <div class="form-row"><label>Produz</label><input type="text" id="ff-out" list="ent-datalist" value="${f&&f.out?esc(Object.keys(f.out)[0]):''}"></div>
      <div class="form-row"><label>Qtd</label><input type="number" id="ff-outqty" value="${f&&f.out?Object.values(f.out)[0]:1}" min="1"></div>
    </div>
    <div class="form-two">
      <div class="form-row"><label>Caminho</label><select id="ff-path">${pathOptions(f?f.path:'critico')}</select></div>
      <div class="form-row"><label>Estação (opcional)</label><input type="text" id="ff-station" list="ent-datalist" value="${esc(f&&f.station?f.station:'')}"></div>
    </div>
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
  const obj={ id:editingFlow?editingFlow.id:uid('f'), name, kind:document.getElementById('ff-kind').value, inputs, out:{[outName]:parseFloat(document.getElementById('ff-outqty').value)||1}, path:document.getElementById('ff-path').value, station:document.getElementById('ff-station').value.trim()||'—' };
  if(editingFlow){ model.flows[model.flows.findIndex(x=>x.id===editingFlow.id)]=obj; } else model.flows.push(obj);
  persist(); hide('flow-form'); renderAll();
}
function deleteFlow(){ if(!editingFlow||!confirm('Apagar?'))return; model.flows=model.flows.filter(x=>x.id!==editingFlow.id); persist(); hide('flow-form'); renderAll(); }

// --- Análise: entidades fora dos fluxos de CRAFT ---
function renderOrphans(){
  const box=document.getElementById('orphans-root'); if(!box) return;
  // "craft-like": craft, refino, cozinha (produzem itens). coleta/feed não contam como craft.
  const craftKinds=new Set(['craft','refino','cozinha']);
  const inCraft=new Set(), inAnyFlow=new Set();
  model.flows.forEach(f=>{
    const names=[...Object.keys(f.inputs||{}),...Object.keys(f.out||{})];
    names.forEach(n=>{ inAnyFlow.add(n); if(craftKinds.has(f.kind)) inCraft.add(n); });
  });
  // categorias que esperamos ver em craft (itens, componentes, consumíveis, equipamento, armas)
  const craftableCats=new Set(['Item','Consumable','Equipment','Weapon/Tool']);
  const rawCats=new Set(['Raw Resource','Gatherable']);
  const structuralCats=new Set(['Area','System','System State','Player','Station','Creature','Enemy','Spirit']);

  const missingFromCraft=[], rawUnusedInCraft=[], structural=[];
  model.entities.forEach(e=>{
    if(inCraft.has(e.name)) return;
    if(craftableCats.has(e.category)) missingFromCraft.push(e);
    else if(rawCats.has(e.category)) { if(!inAnyFlow.has(e.name)) rawUnusedInCraft.push(e); }
    else structural.push(e);
  });
  // strings citadas em fluxos que não são entidades
  const names=new Set(model.entities.map(e=>e.name));
  const ghosts=[...inAnyFlow].filter(n=>!names.has(n));

  const list=(arr,empty)=>arr.length?arr.map(e=>`<span class="rel-pill" onclick="selectEntity('${esc(e.name).replace(/'/g,"\\'")}')">${iconFor(e)} ${esc(e.name)} <span class="muted">(${esc(e.category)})</span></span>`).join(''):`<span class="muted">${empty}</span>`;
  box.innerHTML=`
    <div class="orphan-block warn"><div class="rel-label">Craftáveis SEM receita de craft/refino/cozinha</div>
      <div class="muted" style="margin-bottom:6px;">Itens/armas/consumíveis/equip que deveriam ser produzidos por um fluxo e não são — buracos reais no modelo.</div>
      ${list(missingFromCraft,'nenhum — todo craftável tem receita ✓')}</div>
    <div class="orphan-block"><div class="rel-label">Recursos crus fora de QUALQUER fluxo</div>
      <div class="muted" style="margin-bottom:6px;">Raw resource / gatherable que ninguém coleta nem consome. Provavelmente falta um fluxo de coleta ou uso.</div>
      ${list(rawUnusedInCraft,'nenhum ✓')}</div>
    <div class="orphan-block"><div class="rel-label">Estruturais (esperado ficarem fora de craft)</div>
      <div class="muted" style="margin-bottom:6px;">Áreas, sistemas, NPCs, estações, player — se relacionam por conteúdo/gate, não por craft. Aqui só pra conferência.</div>
      ${list(structural,'—')}</div>
    ${ghosts.length?`<div class="orphan-block warn"><div class="rel-label">Citados em fluxos mas não existem como entidade</div>${ghosts.map(n=>`<span class="rel-pill">${esc(n)}</span>`).join('')}</div>`:''}
  `;
}

// ============================================================
// CHAVE & CADEADO — três trilhas
// ============================================================
function renderProgression(){
  const wrap=document.getElementById('prog-wrap'); wrap.innerHTML='';
  const laneMeta={critico:{title:'Crítico (mínimo até o Devourer)',cls:'crit'},estendido:{title:'Crítico estendido',cls:'ext'},opcional:{title:'Ramos opcionais',cls:'opt'}};
  PATHS.forEach(path=>{
    const gates=model.gates.filter(g=>g.path===path);
    const lane=document.createElement('div');
    lane.innerHTML=`<div class="lane-title ${laneMeta[path].cls}">${laneMeta[path].title}</div>`;
    const chain=document.createElement('div'); chain.className='chain';
    if(!gates.length){ chain.innerHTML='<span class="muted">Nenhum gate.</span>'; }
    else gates.forEach((g,i)=>{
      if(i>0){ const c=document.createElement('div'); c.className='conn'; c.textContent='↓'; chain.appendChild(c); }
      const kn=document.createElement('div'); kn.className='node';
      kn.innerHTML=`<div class="kdiamond"><div class="n-title">🔑 ${esc(g.key)}</div><div class="n-sub">chave</div></div>`;
      chain.appendChild(kn);
      const c2=document.createElement('div'); c2.className='conn'; c2.textContent='↓'; chain.appendChild(c2);
      const ln=document.createElement('div'); ln.className='node';
      ln.innerHTML=`<div class="lockbox ${laneMeta[path].cls}"><div class="n-title">🔒 ${esc(g.name)}</div><div class="n-sub">${esc(g.unlocks)}</div></div>`;
      ln.querySelector('.lockbox').onclick=()=>openGateForm(g);
      chain.appendChild(ln);
    });
    lane.appendChild(chain); wrap.appendChild(lane);
  });
}
function gateFormHTML(g){
  return `<div class="form-two">
      <div class="form-row"><label>Nome do gate</label><input type="text" id="gf-name" value="${esc(g?g.name:'')}"></div>
      <div class="form-row"><label>Chave exigida</label><input type="text" id="gf-key" list="ent-datalist" value="${esc(g?g.key:'')}"></div>
    </div>
    <div class="form-two">
      <div class="form-row"><label>Desbloqueia</label><input type="text" id="gf-unlocks" value="${esc(g?g.unlocks:'')}"></div>
      <div class="form-row"><label>Caminho</label><select id="gf-path">${pathOptions(g?g.path:'critico')}</select></div>
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

// ============================================================
// util comuns
// ============================================================
function renderAutoriaList(){
  const byCat={}; model.entities.forEach(e=>byCat[e.category]=(byCat[e.category]||0)+1);
  document.getElementById('autoria-list').innerHTML=`<div class="muted">${model.entities.length} entidades · ${model.flows.length} fluxos · ${model.gates.length} gates. Tudo criado aqui aparece no Compêndio, Fluxos e Progressão.</div>`;
}
function show(id){ document.getElementById(id).classList.remove('hidden'); }
function hide(id){ document.getElementById(id).classList.add('hidden'); }
function refreshDatalists(){ document.getElementById('ent-datalist').innerHTML=model.entities.map(e=>`<option value="${esc(e.name)}">`).join(''); }
function exportModel(){ const b=new Blob([JSON.stringify(model,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='moonrite-modelo.json'; a.click(); }
function importModel(ev){ const f=ev.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=()=>{ try{ model=JSON.parse(r.result); persist(); renderAll(); }catch(e){ alert('Inválido.'); } }; r.readAsText(f); ev.target.value=''; }
function resetModel(){ if(!confirm('Restaurar padrão? Edições locais serão perdidas.'))return; model=defaultModel(); selected=null; persist(); renderAll(); }
function renderAll(){ renderNav(); renderPage(); renderFlows(); renderOrphans(); renderProgression(); renderAutoriaList(); refreshDatalists(); }

document.querySelectorAll('.tab-btn').forEach(btn=>{ btn.addEventListener('click',()=>{
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active'); document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
}); });

// migração: se o modelo salvo for da versão antiga (sem System/kind/3 paths), recria
function modelIsCurrent(m){
  if(!m||!m.entities||!m.flows) return false;
  if(!m.flows[0]||!('kind' in m.flows[0])) return false;
  if(!m.entities.some(e=>e.category==='System')) return false;
  return true;
}
model=store.get('mr_model');
if(!modelIsCurrent(model)){ model=defaultModel(); persist(); }
renderAll();
