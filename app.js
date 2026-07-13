// ============================================================
// Moonrite — Compêndio (modelo + lógica)
// ============================================================

// Ícones placeholder (emoji) por categoria — servem de stand-in até a arte real
const CAT_ICON = {
  "Player":"🧙","Raw Resource":"🪵","Component":"🔩","Tool":"🪓","Weapon":"⚔️",
  "Consumable":"🍢","Equipment":"🛡️","Station":"⚗️","System":"🔄","System State":"⬆️",
  "Spirit":"✨","Creature":"🐸","Enemy":"👹","Gatherable":"🌿","Buildable":"🧱","Local":"🗺️"
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
  "Sistema de Construção":"🏗️",
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

// ---- Supertipos (eixo 1: o que a entidade É — com herança) ----
const SUPERTYPES = {
  "Item":        { label:"Item", glossary:"Tudo que entra no inventário do jogador. Supertipo: Raw Resource, Component, Tool, Weapon, Equipment e Consumable são todos Items." },
  "WorldObject": { label:"World Object", glossary:"Existe no mundo e NÃO entra no inventário. Props coletáveis, estações e peças de construção já colocadas." },
  "Actor":       { label:"Actor", glossary:"Entidade viva ou agente que age no mundo: o Player, espíritos, criaturas e inimigos." },
  "System":      { label:"System", glossary:"Abstração de regras que amarra entidades e fluxos — não é uma coisa física, é uma mecânica." },
  "Local":       { label:"Local", glossary:"Os lugares do jogo. Um Local não está no mundo — ele É o mundo: contém tudo o mais e se aninha em hierarquia (Bioma › POI › Sub-área)." }
};

// Campos + supertipo + glossário por categoria (schema da ontologia rigorosa)
const CATEGORIES = {
  // --- Item (entra no inventário) ---
  "Player":       { super:"Actor",       glossary:"O agente controlado pelo jogador. Âncora de todos os verbos (coletar, craftar, comandar, equipar, construir).", fields:[{k:"health",l:"Vida base"},{k:"stamina",l:"Stamina base"},{k:"verbs",l:"Verbos que executa"}] },
  "Raw Resource": { super:"Item",         glossary:"Matéria bruta. Só se obtém no mundo (colhida de Gatherable, drop de Actor, ou pickable no chão) — NUNCA é craftada. É folha do grafo de craft.", fields:[{k:"obtain",l:"Como se obtém"},{k:"source",l:"Origem no mundo"},{k:"stack",l:"Empilha?"}] },
  "Component":    { super:"Item",         glossary:"Item intermediário: refinado de um Raw Resource numa estação. Entra em receitas maiores, raramente é usado sozinho.", fields:[{k:"refinedFrom",l:"Refinado de"},{k:"role",l:"Papel"},{k:"stack",l:"Empilha?"}] },
  "Tool":         { super:"Item",         glossary:"Item equipável usado para colher/interagir com o mundo (não é arma de combate primário).", fields:[{k:"harvests",l:"Coleta / corta"},{k:"obtain",l:"Como se obtém"}] },
  "Weapon":       { super:"Item",         glossary:"Item equipável de combate.", fields:[{k:"damage",l:"Dano"},{k:"obtain",l:"Como se obtém"}] },
  "Equipment":    { super:"Item",         glossary:"Item vestível que dá bônus passivo (armadura, amuleto).", fields:[{k:"bonus",l:"Bônus"},{k:"obtain",l:"Como se obtém"}] },
  "Consumable":   { super:"Item",         glossary:"Item de uso único que aplica um efeito temporário.", fields:[{k:"effect",l:"Efeito"},{k:"duration",l:"Duração"},{k:"obtain",l:"Como se obtém"}] },
  // --- WorldObject (não entra no inventário) ---
  "Gatherable":   { super:"WorldObject",  glossary:"Prop fixo no mundo que, ao ser colhido/quebrado, DROPA um ou mais Items. O prop não é um item — é a fonte (ex: árvore dropa Log; Boulders dropa Stone).", fields:[{k:"drops",l:"Dropa (item)"},{k:"tool",l:"Ferramenta"}] },
  "Station":      { super:"WorldObject",  glossary:"Estação de trabalho no mundo onde receitas acontecem (craft, refino, cozinha).", fields:[{k:"makes",l:"O que produz"},{k:"partOf",l:"Sistema a que pertence"}] },
  "Buildable":    { super:"WorldObject",  glossary:"Peça de construção granular. Nasce direto no mundo (não passa pelo inventário) consumindo recursos, e encaixa em grid. O tipo de peça (foundation, wall, roof, stair, opening) fica no campo abaixo.", fields:[{k:"pieceType",l:"Tipo de peça (foundation/wall/roof/stair/opening)"},{k:"buildCost",l:"Custo de construção"},{k:"partOf",l:"Sistema a que pertence"}] },
  // --- Actor ---
  "Spirit":       { super:"Actor",        glossary:"Companheiro craftado no Cauldron. Comandado pelo Player para agir no mundo; expira com o tempo.", fields:[{k:"command",l:"Comando"},{k:"ability",l:"Habilidade"},{k:"expires",l:"Expira?"}] },
  "Creature":     { super:"Actor",        glossary:"Ser vivo não-hostil do mundo (fauna). Pode ser capturado/interagido, gerando drops.", fields:[{k:"behavior",l:"Comportamento"},{k:"defeat",l:"Como lidar"},{k:"drops",l:"Drops"}] },
  "Enemy":        { super:"Actor",        glossary:"Ser vivo hostil. Combatido; dropa recursos ao ser derrotado.", fields:[{k:"behavior",l:"Comportamento"},{k:"hp",l:"Vida"},{k:"damage",l:"Dano"},{k:"drops",l:"Drops"}] },
  // --- System ---
  "System":       { super:"System",       glossary:"Sistema-mãe: agrupa fluxos e estados sob uma regra (ex: Loop do Cauldron, Sistema de Construção).", fields:[{k:"loop",l:"O loop em uma frase"},{k:"states",l:"Estados (se houver)"},{k:"flows",l:"Fluxos que agrupa"}] },
  "System State": { super:"System",       glossary:"Estado discreto de um sistema (ex: Cauldron Lv1..4). Alcançado por um fluxo; desbloqueia algo.", fields:[{k:"system",l:"Sistema-mãe"},{k:"unlocks",l:"O que este estado desbloqueia"},{k:"reachedBy",l:"Como se chega"}] },
  // --- Local (o eixo dos lugares) ---
  "Local":        { super:"Local",        glossary:"Um lugar do jogo. O campo 'nível' diz se é Bioma, POI ou Sub-área; 'dentro de' aninha um lugar no outro; 'contém' lista tudo que vive nele.", fields:[{k:"level",l:"Nível (Bioma/POI/Sub-área)"},{k:"parent",l:"Dentro de (local-pai)"},{k:"contains",l:"Contém (entidades)"},{k:"entry",l:"Entrada"},{k:"exit",l:"Saída / gate"}] }
};
// helper: supertipo de uma categoria
function superOf(cat){ return (CATEGORIES[cat]&&CATEGORIES[cat].super) || null; }
function isItem(cat){ return superOf(cat)==='Item'; }
function isBuildable(cat){ return cat==='Buildable'; }
// níveis de Local
const LOCAL_LEVELS = ["Bioma","POI","Sub-área"];

// Ordem/pesos dos caminhos
const PATHS = ["critico","estendido","opcional"];
const PATH_LABEL = { critico:"crítico", estendido:"estendido", opcional:"opcional" };

// Tipos de fluxo — separam craft de coleta pra análise de órfãos
const FLOW_KIND = { craft:"craft", refino:"refino", coleta:"coleta", feed:"feed", cozinha:"cozinha", build:"build" };
const FLOW_KIND_LABEL = { craft:"craft", refino:"refino", coleta:"coleta", feed:"feed", cozinha:"cozinha", build:"build" };


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
    e("Light Flower","Raw Resource","opcional","Flor luminosa.","Colhida da moita luminosa no POI Clareira. Alimenta o Cauldron nível 4 e crafta o Light Spirit.",{obtain:"Colhida (Gatherable)",source:"Light Flower Bush",stack:"Sim"}),

    // --- Gatherables (props no mundo que DROPAM itens; não são itens) ---
    e("Boulders","Gatherable","estendido","Pedregulho no mundo.","Prop que, quebrado com ferramenta, dropa Stone. O pedregulho não vai pro inventário — o Stone que ele solta, sim.",{drops:"Stone",tool:"Crude Axe"}),
    e("Regular Tree","Gatherable","critico","Árvore.","Prop que, cortado, dropa Log. A árvore é a fonte; o Log é o item.",{drops:"Log",tool:"Crude Axe"}),
    e("Light Flower Bush","Gatherable","opcional","Moita luminosa.","Prop no POI Clareira que dropa Light Flower.",{drops:"Light Flower",tool:"Mão"}),

    // --- Components (intermediários refinados) ---
    e("Stick","Component","critico","Refinado de Log.","Componente de armas. Feito na Artisan Workbench.",{refinedFrom:"Log",role:"Componente de arma",stack:"Sim"}),
    e("Stone Blade","Component","critico","Refinado de Stone.","Gume que compõe a Stone Sword.",{refinedFrom:"Stone",role:"Componente de arma",stack:"Sim"}),
    e("Bone Blade","Component","opcional","Gume de osso.","Refinado de Bone; compõe a Bone Sword.",{refinedFrom:"Bone",role:"Componente de arma",stack:"Sim"}),
    e("Leather","Component","estendido","Couro curtido.","Refinado de Boar Hide na Tannery.",{refinedFrom:"Boar Hide",role:"Componente de armadura",stack:"Sim"}),

    // --- Tools ---
    e("Crude Axe","Tool","critico","A primeira ferramenta.","Craftada direto de Branches + Stone, sem refino. Corta madeira e vinhas. É a única ferramenta sem etapa de refino — por isso existe cedo, antes da Workbench.",{harvests:"Madeira, vinhas, Boulders",obtain:"Craft (Cauldron/inventário)"}),

    // --- Weapons ---
    e("Stone Sword","Weapon","critico","Arma de corte.","Primeira arma de combate real. Também é consumida ao craftar o Flesh and Bone Spirit.",{damage:"Médio",obtain:"Craft"}),
    e("Bone Sword","Weapon","opcional","Espada de osso.","Craftada de Bone Blade + Stick.",{damage:"A definir",obtain:"Craft"}),

    // --- Equipment ---
    e("Leather Armor","Equipment","opcional","Armadura de couro.","Craftada de Leather.",{bonus:"Defesa (a definir)",obtain:"Craft"}),
    e("Rock Talisman","Equipment","estendido","Amuleto de pedra.","Aumenta a vida máxima.",{bonus:"+10 vida máx",obtain:"Craft"}),

    // --- Consumables ---
    e("Mushroom Skewer","Consumable","estendido","Espetinho de cogumelo.","Buff temporário. Cozinhado a partir de Mushroom.",{effect:"+10 vida, +15 stamina máx",duration:"5min",obtain:"Cozinha (Mushroom)"}),
    e("Grilled Meat","Consumable","estendido","Carne grelhada.","Buff temporário. Cozinhado a partir de Boar Meat.",{effect:"+25 vida máx",duration:"20min",obtain:"Cozinha (Boar Meat)"}),
    e("Sautéed Mushrooms","Consumable","opcional","Cogumelos salteados.","Consumível de buff cozinhado a partir de Mushroom. Está no detonado do time.",{effect:"Buff (a definir)",duration:"A definir",obtain:"Cozinha (Mushroom)"}),
    e("Grilled Meat and Mushrooms","Consumable","opcional","Carne com cogumelos.","Consumível combinado (Boar Meat + Mushroom). Está no detonado do time.",{effect:"Buff combinado (a definir)",duration:"A definir",obtain:"Cozinha (Boar Meat + Mushroom)"}),

    // --- Stations ---
    e("Cauldron","Station","critico","O coração do jogo.","Estação central. Restaurada com Branches, evolui por níveis conforme é alimentada, e cada nível desbloqueia um novo espírito. Pertence ao sistema Loop do Cauldron.",{makes:"Spirits, Stone Sword",partOf:"Loop do Cauldron"}),
    e("Artisan Workbench","Station","critico","Bancada de refino.","Transforma recursos crus em intermediários: Log→Stick, Stone→Stone Blade. Pertence ao Sistema de Refino.",{makes:"Stick, Stone Blade",partOf:"Sistema de Refino"}),
    e("Estátua da Natureza","Station","critico","Portal vivo.","Gateway que libera a saída da Área Inicial. Só ativa com um Nature Spirit.",{makes:"—",partOf:"—"}),
    e("Tannery","Station","estendido","Curtume.","Refina Boar Hide em Leather. Pertence ao Sistema de Refino.",{makes:"Leather",partOf:"Sistema de Refino"}),

    // --- Systems (mãe) ---
    e("Loop do Cauldron","System","critico","O motor de progressão.","Alimentar o Cauldron sobe seu nível; cada nível desbloqueia um novo tipo de espírito e novas áreas. É o loop central que amarra coleta, craft e progressão. Tem quatro estados: Lv1 a Lv4. Mecânica de persistência (crítica): o estado/nível do Caldeirão persiste entre sessões.",{loop:"Alimentar → subir nível → desbloquear espírito/área",states:"Cauldron Lv1, Lv2, Lv3, Lv4",flows:"Restaurar Cauldron, Feed nível 2/3/4"}),
    e("Sistema de Combate","System","critico","Como o Player enfrenta o mundo.","Combate corpo-a-corpo com armas craftadas; inimigos dropam recursos. Alimenta o loot que volta pro Cauldron.",{loop:"Equipar arma → combater → lootar",states:"—",flows:"Loot do Boar, Loot do Dutra"}),
    e("Sistema de Refino","System","critico","Recurso cru vira componente.","Estações (Workbench, Tannery) transformam recursos crus em intermediários com timer. Ponte entre coleta e craft de armas/armaduras.",{loop:"Recurso cru → estação → componente",states:"—",flows:"Refinar Stick, Stone Blade, Bone Blade, Leather"}),
    e("Captura de Espírito","System","estendido","Comandar espíritos pra interagir.","O Player comanda um espírito (Q) para agir sobre o mundo sem se expor — capturar o Sapo sem tomar veneno é o caso-âncora.",{loop:"Comandar espírito → interagir → obter recurso",states:"—",flows:"Capturar Sapo"}),
    e("Sistema de Construção","System","estendido","Construção granular no mundo.","O Player constrói estruturas peça a peça direto no mundo (não passam pelo inventário) — foundations, walls, teto, escadas, aberturas. Snap em grid, encaixe entre peças e integridade estrutural. Consome recursos ao construir.",{loop:"Selecionar peça → gastar recursos → construir no grid",states:"—",flows:"Construir Wooden Foundation, Construir Wooden Wall"}),

    // --- Buildables (peças de construção — nascem no mundo, não vão ao inventário) ---
    e("Wooden Foundation","Buildable","estendido","Base de madeira.","Peça-base da construção. Construída direto no mundo consumindo Log; tudo mais encaixa em cima dela.",{pieceType:"foundation",buildCost:"2 Log",partOf:"Sistema de Construção"}),
    e("Wooden Wall","Buildable","estendido","Parede de madeira.","Encaixa nas bordas de uma Foundation. Consome Log.",{pieceType:"wall",buildCost:"1 Log",partOf:"Sistema de Construção"}),
    e("Wooden Floor","Buildable","opcional","Piso/teto de madeira.","Cobre o topo das paredes ou serve de piso para um segundo nível.",{pieceType:"roof",buildCost:"1 Log",partOf:"Sistema de Construção"}),

    // --- System States (sub-entidades do Cauldron) ---
    e("Cauldron Lv1","System State","critico","Cauldron restaurado.","Primeiro estado após restaurar o Cauldron com Branches. Desbloqueia a Alchemy (craft básico).",{system:"Loop do Cauldron",unlocks:"Alchemy / craft básico",reachedBy:"Restaurar com 4 Branches"}),
    e("Cauldron Lv2","System State","critico","Cauldron desperto.","Desbloqueia a aba de espíritos, permitindo craftar o Nature Spirit.",{system:"Loop do Cauldron",unlocks:"Spirit tab (1º espírito)",reachedBy:"Feed com 5 Mushroom"}),
    e("Cauldron Lv3","System State","critico","Cauldron pulsante.","Desbloqueia o segundo espírito (Flesh and Bone).",{system:"Loop do Cauldron",unlocks:"2º espírito",reachedBy:"Feed com 3 Boar Meat + 3 Dead Frog"}),
    e("Cauldron Lv4","System State","opcional","Cauldron pleno.","Desbloqueia o terceiro espírito (Light).",{system:"Loop do Cauldron",unlocks:"3º espírito",reachedBy:"Feed com 5 Root + 1 Light Flower"}),

    // --- Spirits ---
    e("Nature Spirit","Spirit","critico","O primeiro companheiro.","Craftado no Cauldron. Comandado com Q para interagir com o mundo — captura o Sapo sem sofrer o veneno. Companion Skills (opcional): espíritos podem ter habilidades ativas além do comando básico.",{command:"Q → interagir",ability:"Imune a veneno; captura Sapo. Companion Skills (opcional)",expires:"Sim"}),
    e("Flesh and Bone Spirit","Spirit","critico","O segundo companheiro.","Craftado com Bone + Boar Meat + uma espada. Desbloqueado no Cauldron nível 3.",{command:"Q",ability:"A definir",expires:"Sim"}),
    e("Light Spirit","Spirit","opcional","O terceiro companheiro.","Craftado com Light Flower + arma. Cauldron nível 4.",{command:"Q",ability:"A definir",expires:"Sim"}),

    // --- Creature ---
    e("Sapo","Creature","estendido","Bicho ligeiro e traiçoeiro.","Foge quando o Player tenta pegar e solta veneno na falha. Só o Nature Spirit captura sem dano. Persistência de NPCs (opcional): NPCs capturados/derrotados persistem entre sessões.",{behavior:"Foge, envenena",defeat:"Nature Spirit",drops:"Dead Frog"}),

    // --- Enemies ---
    e("Boar","Enemy","critico","Javali selvagem.","Ataca com investida (charge) quando o Player entra no alcance. Rodeia os POIs do Overworld.",{behavior:"Charge attack",hp:"A definir",damage:"A definir",drops:"Meat, Bone, Hide"}),
    e("Aquiles","Enemy","critico","O guardião do meio.","Sub-boss dentro do próprio POI. Superá-lo abre caminho para o POI do Devourer.",{behavior:"A definir",hp:"A definir",damage:"A definir",drops:"—"}),
    e("Devourer","Enemy","critico","O gate final do bioma.","Boss final do 1º bioma. Encerra a progressão crítica da demo; dispara o popup de wishlist.",{behavior:"A definir",hp:"A definir",damage:"A definir",drops:"—"}),
    e("Dutra","Enemy","opcional","Criatura da clareira.","Aparece em grupos de 5. Combatida com ajuda dos espíritos.",{behavior:"Grupo",hp:"A definir",damage:"A definir",drops:"Root, Mushroom"}),

    // --- Locais (o eixo dos lugares; nível + aninhamento) ---
    e("Primeiro Bioma","Local","critico","O bioma da demo.","O maior contêiner: define clima, paleta e trilha. Contém o POI Inicial, o Overworld e os POIs de boss.",{level:"Bioma",parent:"—",contains:"POI Inicial, Overworld, POI do Aquiles, POI do Devourer, POI Clareira",entry:"Início do jogo",exit:"Fim da demo (Devourer)"}),
    e("POI Inicial","Local","critico","O vale de partida.","Canyon inicial com duas sub-áreas. Onde o Player encontra o Cauldron quebrado.",{level:"POI",parent:"Primeiro Bioma",contains:"Cauldron, Branches, Stone, Mushroom, Boulders",entry:"Início do jogo",exit:"Estátua da Natureza"}),
    e("Overworld","Local","critico","O mundo aberto (Mapa 1).","Onde vivem Boar, Sapo, árvores e os POIs de Aquiles e do Devourer.",{level:"POI",parent:"Primeiro Bioma",contains:"Boar, Sapo, Regular Tree, POI do Aquiles, POI do Devourer",entry:"Estátua da Natureza",exit:"POI do Devourer"}),
    e("POI do Aquiles","Local","critico","A arena do sub-boss.","Acessada com 2 espíritos.",{level:"POI",parent:"Overworld",contains:"Aquiles",entry:"Gate de 2 espíritos",exit:"POI do Devourer"}),
    e("POI do Devourer","Local","critico","A arena final.","Acessada após vencer Aquiles.",{level:"POI",parent:"Overworld",contains:"Devourer",entry:"Derrotar Aquiles",exit:"Fim da demo"}),
    e("POI Clareira","Local","opcional","Clareira luminosa.","Contém Dutras e Light Flowers.",{level:"POI",parent:"Overworld",contains:"Dutra, Light Flower Bush",entry:"A ancorar",exit:"—"})
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
    {name:"Cozinhar Sautéed Mushrooms",kind:"cozinha",station:"Cauldron",inputs:{Mushroom:3},out:{"Sautéed Mushrooms":1},path:"opcional"},
    {name:"Cozinhar Grilled Meat and Mushrooms",kind:"cozinha",station:"Cauldron",inputs:{"Boar Meat":1,Mushroom:1},out:{"Grilled Meat and Mushrooms":1},path:"opcional"},
    // feed (sobe estado do Cauldron)
    {name:"Restaurar Cauldron (Lv1)",kind:"feed",station:"Cauldron",inputs:{Branches:4},out:{"Cauldron Lv1":1},path:"critico"},
    {name:"Feed Cauldron Lv2",kind:"feed",station:"Cauldron",inputs:{Mushroom:5},out:{"Cauldron Lv2":1},path:"critico"},
    {name:"Feed Cauldron Lv3",kind:"feed",station:"Cauldron",inputs:{"Boar Meat":3,"Dead Frog":3},out:{"Cauldron Lv3":1},path:"critico"},
    {name:"Feed Cauldron Lv4",kind:"feed",station:"Cauldron",inputs:{Root:5,"Light Flower":1},out:{"Cauldron Lv4":1},path:"opcional"},
    // build (produz peça de construção no mundo — consome recursos)
    {name:"Construir Wooden Foundation",kind:"build",station:"—",inputs:{Log:2},out:{"Wooden Foundation":1},path:"estendido"},
    {name:"Construir Wooden Wall",kind:"build",station:"—",inputs:{Log:1},out:{"Wooden Wall":1},path:"estendido"},
    {name:"Construir Wooden Floor",kind:"build",station:"—",inputs:{Log:1},out:{"Wooden Floor":1},path:"opcional"},
    // coleta (drops / quebra)
    {name:"Loot do Boar",kind:"coleta",station:"—",inputs:{Boar:1},out:{"Boar Meat":1,Bone:1,"Boar Hide":1},path:"critico"},
    {name:"Loot do Dutra",kind:"coleta",station:"—",inputs:{Dutra:1},out:{Root:1,Mushroom:1},path:"opcional"},
    {name:"Capturar Sapo",kind:"coleta",station:"—",inputs:{Sapo:1},out:{"Dead Frog":1},path:"estendido"},
    {name:"Quebrar Boulders",kind:"coleta",station:"—",inputs:{Boulders:1},out:{Stone:1},path:"estendido"},
    {name:"Cortar Regular Tree",kind:"coleta",station:"—",inputs:{"Regular Tree":1},out:{Log:1},path:"critico"},
    {name:"Colher Light Flower Bush",kind:"coleta",station:"—",inputs:{"Light Flower Bush":1},out:{"Light Flower":1},path:"opcional"}
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
  const nav=document.getElementById('comp-nav'); nav.innerHTML='';
  const superOrder=["Item","WorldObject","Actor","System","Local"];
  superOrder.forEach(sup=>{
    const cats=Object.keys(CATEGORIES).filter(c=>superOf(c)===sup && groups[c]);
    if(!cats.length) return;
    const count=cats.reduce((a,c)=>a+groups[c].length,0);
    const sh=document.createElement('div'); sh.className='super-header';
    sh.innerHTML=`<span>${esc(SUPERTYPES[sup]?SUPERTYPES[sup].label:sup)}</span><span class="muted">${count}</span>`;
    nav.appendChild(sh);
    cats.forEach(cat=>{
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
  });
}

function relationsFor(name){
  const producedBy=[],consumedIn=[],keyFor=[];
  model.flows.forEach(f=>{ if(f.out&&f.out[name]!=null)producedBy.push(f); if(f.inputs&&f.inputs[name]!=null)consumedIn.push(f); });
  model.gates.forEach(g=>{ if(g.key.split(/\s*\+\s*/).map(x=>x.trim()).includes(name))keyFor.push(g); });
  return {producedBy,consumedIn,keyFor};
}
// relações estruturais adicionais lidas dos campos (sistema↔estado, estação↔sistema, local↔conteúdo↔aninhamento)
function structuralRelations(ent){
  const out={ states:[], statesOf:null, stationsOfSystem:[], systemOfStation:null, containedIn:[], contains:[], parentLocal:null, childLocais:[] };
  if(ent.category==='System'){
    out.states = model.entities.filter(x=>x.category==='System State' && (x.fields.system===ent.name));
    out.stationsOfSystem = model.entities.filter(x=>x.category==='Station' && x.fields.partOf===ent.name);
  }
  if(ent.category==='System State' && ent.fields.system){ out.statesOf = findE(ent.fields.system); }
  if(ent.category==='Station' && ent.fields.partOf && ent.fields.partOf!=='—'){ out.systemOfStation = findE(ent.fields.partOf); }
  // Local contém entidades (campo contains) e onde esta entidade é citada
  model.entities.filter(x=>x.category==='Local').forEach(loc=>{
    const list=(loc.fields.contains||'').split(/,\s*/).map(s=>s.trim());
    if(list.includes(ent.name)) out.containedIn.push(loc);
  });
  if(ent.category==='Local'){
    const list=(ent.fields.contains||'').split(/,\s*/).map(s=>s.trim());
    out.contains = list.map(findE).filter(Boolean);
    // aninhamento: pai e filhos
    if(ent.fields.parent && ent.fields.parent!=='—') out.parentLocal = findE(ent.fields.parent);
    out.childLocais = model.entities.filter(x=>x.category==='Local' && x.fields.parent===ent.name);
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
    <div class="page-badges"><span class="badge sup">${esc(SUPERTYPES[superOf(ent.category)]?SUPERTYPES[superOf(ent.category)].label:superOf(ent.category)||'')}</span><span class="badge">${CAT_ICON[ent.category]||''} ${esc(ent.category)}</span><span class="badge ${pathClass(ent.path)}">${PATH_LABEL[ent.path]||ent.path}</span></div></div>
    <button onclick="editEntity(${JSON.stringify(ent.name)})">✎ editar</button></div>`;
  const gloss=CATEGORIES[ent.category]&&CATEGORIES[ent.category].glossary;
  if(gloss) html+=`<div class="cat-gloss"><span class="muted">${esc(ent.category)}:</span> ${esc(gloss)}</div>`;
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
  if(str.parentLocal) html+=`<div class="rel-section"><div class="rel-label">Dentro de</div>${entPill(str.parentLocal.name)}</div>`;
  if(str.childLocais.length) html+=`<div class="rel-section"><div class="rel-label">Locais aninhados</div>${str.childLocais.map(x=>entPill(x.name)).join('')}</div>`;
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
  // "craft-like": craft, refino, cozinha, build (produzem itens/estruturas). coleta/feed não contam.
  const craftKinds=new Set(['craft','refino','cozinha','build']);
  const inCraft=new Set(), inAnyFlow=new Set();
  model.flows.forEach(f=>{
    const names=[...Object.keys(f.inputs||{}),...Object.keys(f.out||{})];
    names.forEach(n=>{ inAnyFlow.add(n); if(craftKinds.has(f.kind)) inCraft.add(n); });
  });
  // craftáveis = subtipos de Item que NÃO são Raw Resource (Raw nunca é craftado), + Buildables (produzidos por build)
  const isCraftable=e=> (isItem(e.category) && e.category!=='Raw Resource') || isBuildable(e.category);
  const isRawSource=e=> e.category==='Raw Resource' || e.category==='Gatherable';

  const missingFromCraft=[], rawUnusedInCraft=[], structural=[];
  model.entities.forEach(e=>{
    if(inCraft.has(e.name)) return;
    if(isCraftable(e)) missingFromCraft.push(e);
    else if(isRawSource(e)) { if(!inAnyFlow.has(e.name)) rawUnusedInCraft.push(e); }
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
// ============================================================
// COMBINAÇÕES — explorador de craft (1,2,3 itens com repetição)
// ============================================================
let comboPicks = new Set();
// só Items (supertipo) entram no gerador — exclui Gatherable, Station, Buildable, Actor
function comboItems(){ return model.entities.filter(e=>isItem(e.category)).map(e=>e.name); }
function comboKey(arr){ return arr.slice().sort().join(' + '); }
// multiconjuntos de tamanho k (com repetição), ordem não importa
function multisets(items, k){
  const res=[];
  (function rec(start, combo){
    if(combo.length===k){ res.push(combo.slice()); return; }
    for(let i=start;i<items.length;i++){ combo.push(items[i]); rec(i, combo); combo.pop(); }
  })(0, []);
  return res;
}
function ensureComboStore(){ if(!model.combos) model.combos={}; } // key -> {marked, note}

function renderComboPicker(){
  ensureComboStore();
  const s=(document.getElementById('combo-search').value||'').toLowerCase();
  const box=document.getElementById('combo-picker');
  const items=comboItems().filter(n=>!s||n.toLowerCase().includes(s)).sort();
  box.innerHTML=items.map(n=>{
    const e=findE(n);
    return `<label class="combo-pick"><input type="checkbox" ${comboPicks.has(n)?'checked':''} onchange="toggleComboPick('${esc(n).replace(/'/g,"\\'")}')"> ${iconForName(n)} ${esc(n)} <span class="muted" style="margin-left:auto;font-size:10px">${esc(e?e.category:'')}</span></label>`;
  }).join('');
  document.getElementById('combo-pick-count').textContent = comboPicks.size?`(${comboPicks.size} marcados)`:'';
}
function toggleComboPick(n){ if(comboPicks.has(n))comboPicks.delete(n); else comboPicks.add(n); renderComboPicker(); renderCombos(); }
function comboSelectAllVisible(){ const s=(document.getElementById('combo-search').value||'').toLowerCase(); comboItems().filter(n=>!s||n.toLowerCase().includes(s)).forEach(n=>comboPicks.add(n)); renderComboPicker(); renderCombos(); }
function comboClear(){ comboPicks.clear(); renderComboPicker(); renderCombos(); }

function renderCombos(){
  ensureComboStore();
  const root=document.getElementById('combos-root');
  const picks=[...comboPicks].sort();
  if(picks.length<1){ root.innerHTML='<span class="muted">Marque ao menos um item à esquerda.</span>'; document.getElementById('combo-count').textContent=''; return; }
  const sizeSel=document.getElementById('combo-size').value;
  const onlyMarked=document.getElementById('combo-only-marked').checked;
  const sizes = sizeSel==='all'?[1,2,3]:[parseInt(sizeSel)];
  let all=[];
  sizes.forEach(k=>{ multisets(picks,k).forEach(c=>all.push(c)); });
  // aplica filtro "só marcadas"
  let rows=all.map(c=>{ const key=comboKey(c); const meta=model.combos[key]||{marked:false,note:''}; return {c,key,meta}; });
  if(onlyMarked) rows=rows.filter(r=>r.meta.marked);
  document.getElementById('combo-count').textContent = rows.length+' combinaç'+(rows.length===1?'ão':'ões');
  if(rows.length>400){ root.innerHTML=`<span class="muted">${rows.length} combinações — muitas pra exibir de forma útil. Reduza os itens marcados (5–8 é o ideal) ou filtre por tamanho.</span>`; return; }
  root.innerHTML = rows.map(r=>{
    // conta repetições pra exibir "2× Stone"
    const counts={}; r.c.forEach(n=>counts[n]=(counts[n]||0)+1);
    const expr=Object.entries(counts).map(([n,q])=>`${q>1?q+'× ':''}${iconForName(n)} ${esc(n)}`).join(' + ');
    return `<div class="combo-row ${r.meta.marked?'marked':''}">
      <span class="mk" onclick="toggleComboMark('${r.key.replace(/'/g,"\\'")}')" title="marcar como ideia">${r.meta.marked?'★':'☆'}</span>
      <span class="combo-expr">${expr}</span>
      <span class="combo-note"><input type="text" value="${esc(r.meta.note||'')}" placeholder="tema / ideia…" onchange="setComboNote('${r.key.replace(/'/g,"\\'")}', this.value)"></span>
      <span class="combo-actions"><button onclick="promoteCombo('${r.key.replace(/'/g,"\\'")}')" title="virar receita no compêndio">→ receita</button></span>
    </div>`;
  }).join('');
}
function toggleComboMark(key){ ensureComboStore(); const m=model.combos[key]||{marked:false,note:''}; m.marked=!m.marked; model.combos[key]=m; persist(); renderCombos(); }
function setComboNote(key,val){ ensureComboStore(); const m=model.combos[key]||{marked:false,note:''}; m.note=val; model.combos[key]=m; persist(); }
function promoteCombo(key){
  // transforma a combinação numa receita de craft (abre o form já preenchido)
  const parts=key.split(' + ');
  const counts={}; parts.forEach(n=>counts[n]=(counts[n]||0)+1);
  const meta=(model.combos&&model.combos[key])||{};
  document.querySelector('[data-tab=autoria]').click();
  editingFlow=null;
  const el=document.getElementById('flow-form');
  el.innerHTML=flowFormHTML({kind:'craft',path:'estendido',name:meta.note?('Craft: '+meta.note):'',out:{},station:'Cauldron',inputs:counts});
  show('flow-form'); hide('entity-form'); hide('gate-form');
  const box=document.getElementById('ff-inputs'); box.innerHTML='';
  Object.entries(counts).forEach(([n,q])=>addFfInput(n,q));
  el.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function renderAll(){ renderNav(); renderPage(); renderFlows(); renderOrphans(); renderProgression(); renderAutoriaList(); refreshDatalists(); renderComboPicker(); renderCombos(); renderOntology(); }

// ============================================================
// ONTOLOGIA — glossário + diagrama abstrato
// ============================================================
function renderOntology(){
  const gbox=document.getElementById('onto-glossary'); if(!gbox) return;
  const superOrder=["Item","WorldObject","Actor","System","Local"];
  gbox.innerHTML=superOrder.map(sup=>{
    const cats=Object.keys(CATEGORIES).filter(c=>superOf(c)===sup);
    const catRows=cats.map(c=>{
      const count=model.entities.filter(e=>e.category===c).length;
      return `<div class="onto-cat"><div class="oc-name">${CAT_ICON[c]||''} ${esc(c)} <span class="muted">· ${count}</span></div><div class="oc-desc">${esc(CATEGORIES[c].glossary||'')}</div></div>`;
    }).join('');
    return `<div class="onto-super"><h4>${esc(SUPERTYPES[sup].label)}</h4><div class="sup-desc">${esc(SUPERTYPES[sup].glossary)}</div>${catRows}</div>`;
  }).join('');

  const dbox=document.getElementById('onto-diagram'); if(!dbox) return;
  dbox.innerHTML=ontologyDiagramSVG();
}
function ontologyDiagramSVG(){
  // diagrama abstrato: 5 supertipos (Item, WorldObject, Actor, System, Local) e as relações-chave
  const C={Item:'#1D9E75',World:'#BA7517',Actor:'#534AB7',Sys:'#5F5E5A',Local:'#378ADD'};
  return `<svg width="100%" viewBox="0 0 680 520" style="max-width:680px">
  <defs><marker id="oarr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.4" stroke-linecap="round"/></marker></defs>
  <rect x="20" y="20" width="315" height="150" rx="10" fill="none" stroke="${C.Item}" stroke-width="1"/>
  <text x="30" y="40" fill="${C.Item}" font-family="Spectral,serif" font-size="14" font-weight="600">Item — entra no inventário</text>
  ${['Raw Resource','Component','Tool','Weapon','Equipment','Consumable'].map((c,i)=>{const x=30+(i%3)*100,y=52+Math.floor(i/3)*54;return `<rect x="${x}" y="${y}" width="92" height="44" rx="6" fill="${C.Item}22" stroke="${C.Item}" stroke-width="0.5"/><text x="${x+46}" y="${y+27}" text-anchor="middle" fill="var(--text)" font-size="11">${c}</text>`;}).join('')}
  <rect x="345" y="20" width="315" height="150" rx="10" fill="none" stroke="${C.World}" stroke-width="1"/>
  <text x="355" y="40" fill="${C.World}" font-family="Spectral,serif" font-size="14" font-weight="600">World Object — não vai ao inventário</text>
  ${['Gatherable','Station','Buildable'].map((c,i)=>{const x=355+i*100,y=52;return `<rect x="${x}" y="${y}" width="92" height="44" rx="6" fill="${C.World}22" stroke="${C.World}" stroke-width="0.5"/><text x="${x+46}" y="${y+27}" text-anchor="middle" fill="var(--text)" font-size="11">${c}</text>`;}).join('')}
  <text x="355" y="122" fill="var(--text-dim)" font-size="10.5">Buildable colapsa foundation/wall/roof/stair/opening num campo.</text>
  <rect x="20" y="185" width="315" height="90" rx="10" fill="none" stroke="${C.Actor}" stroke-width="1"/>
  <text x="30" y="205" fill="${C.Actor}" font-family="Spectral,serif" font-size="14" font-weight="600">Actor — vivo / agente</text>
  ${['Player','Spirit','Creature','Enemy'].map((c,i)=>{const x=30+i*76,y=216;return `<rect x="${x}" y="${y}" width="70" height="40" rx="6" fill="${C.Actor}22" stroke="${C.Actor}" stroke-width="0.5"/><text x="${x+35}" y="${y+25}" text-anchor="middle" fill="var(--text)" font-size="11">${c}</text>`;}).join('')}
  <rect x="345" y="185" width="315" height="90" rx="10" fill="none" stroke="${C.Sys}" stroke-width="1"/>
  <text x="355" y="205" fill="${C.Sys}" font-family="Spectral,serif" font-size="14" font-weight="600">System — regras</text>
  ${['System','System State'].map((c,i)=>{const x=355+i*150,y=216;return `<rect x="${x}" y="${y}" width="140" height="40" rx="6" fill="${C.Sys}22" stroke="${C.Sys}" stroke-width="0.5"/><text x="${x+70}" y="${y+25}" text-anchor="middle" fill="var(--text)" font-size="11">${c}</text>`;}).join('')}
  <rect x="20" y="290" width="640" height="86" rx="10" fill="none" stroke="${C.Local}" stroke-width="1"/>
  <text x="30" y="310" fill="${C.Local}" font-family="Spectral,serif" font-size="14" font-weight="600">Local — os lugares (eixo próprio, hierárquico)</text>
  ${['Bioma','POI','Sub-área'].map((c,i)=>{const x=30+i*130,y=322;return `<rect x="${x}" y="${y}" width="120" height="40" rx="6" fill="${C.Local}22" stroke="${C.Local}" stroke-width="0.5"/><text x="${x+60}" y="${y+21}" text-anchor="middle" fill="var(--text)" font-size="11">${c}</text><text x="${x+60}" y="${y+34}" text-anchor="middle" fill="var(--text-dim)" font-size="9">nível (campo)</text>`;}).join('')}
  <text x="440" y="342" fill="var(--text-dim)" font-size="10.5">Aninham: Bioma ⊃ POI ⊃ Sub-área.</text>
  <text x="440" y="358" fill="var(--text-dim)" font-size="10.5">Um Local contém Actors,</text>
  <text x="440" y="372" fill="var(--text-dim)" font-size="10.5">World Objects, Stations, Items.</text>
  <text x="40" y="410" fill="var(--text-dim)" font-size="12" font-family="Spectral,serif" font-weight="600">Relações-chave (as arestas):</text>
  ${[
    'Gatherable →dropsItem→ Item (Raw Resource)',
    'Enemy / Creature →dropsItem→ Item',
    'Item + Item →craftedAt (Station)→ Item',
    'Item →feeds→ System → State →unlocks→ acesso',
    'Recursos →build→ Buildable (nasce no mundo)',
    'Local →contains→ entidades ; Local →dentro de→ Local',
    'Key (Item/Spirit) →gates→ Local / State'
  ].map((t,i)=>`<text x="40" y="${430+i*15}" fill="var(--text-dim)" font-size="11.5">• ${t}</text>`).join('')}
  </svg>`;
}

document.querySelectorAll('.tab-btn').forEach(btn=>{ btn.addEventListener('click',()=>{
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active'); document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
}); });

// migração: recria se o modelo salvo for de versão anterior à taxonomia com supertipos
function modelIsCurrent(m){
  if(!m||!m.entities||!m.flows) return false;
  if(!m.flows[0]||!('kind' in m.flows[0])) return false;
  // taxonomia rigorosa mais recente: eixo Local + Buildable colapsado
  if(!m.entities.some(e=>e.category==='Local')) return false;
  if(!m.entities.some(e=>e.category==='Buildable')) return false;
  return true;
}
model=store.get('mr_model');
if(!modelIsCurrent(model)){ model=defaultModel(); persist(); }
renderAll();
