const DATA=window.GM_DATA;
const STORY_CAST_EXPANSION={
  'trojan-war':['menelaus','priam','andromache','briseis'],
  'achilles-wrath':['priam','andromache','briseis'],
  odyssey:['telemachus','circe','calypso','hermes'],
  heracles:['eurystheus','deianira'],
  perseus:['danae','hermes'],
  oedipus:['tiresias'],
  argonauts:['pelias','aeetes'],
  'medea-tragedy':['aeetes','creon'],
  'persephone-descent':['hecate','hermes']
};
const RELATION_EXPANSION={
  helen:['menelaus','priam'],paris:['menelaus','priam'],agamemnon:['menelaus','briseis'],achilles:['briseis','priam','andromache'],hector:['priam','andromache'],patroclus:['briseis'],
  odysseus:['telemachus','circe','calypso','hermes'],penelope:['telemachus'],athena:['telemachus'],
  heracles:['eurystheus','deianira'],perseus:['danae','hermes'],oedipus:['tiresias'],jason:['pelias','aeetes'],medea:['aeetes','creon'],
  demeter:['hecate'],hades:['hecate','hermes'],persephone:['hecate','hermes'],zeus:['hermes']
};
Object.entries(STORY_CAST_EXPANSION).forEach(([id,people])=>{const story=DATA.stories.find(x=>x.id===id);if(story)story.people=[...new Set([...story.people,...people])];});
Object.entries(RELATION_EXPANSION).forEach(([id,people])=>{const person=DATA.people.find(x=>x.id===id);if(person)person.relations=[...new Set([...(person.relations||[]),...people])];});
const view=document.getElementById('view');
const searchInput=document.getElementById('globalSearch');
const searchPanel=document.getElementById('searchPanel');
const drawer=document.getElementById('drawer');
const backdrop=document.getElementById('drawerBackdrop');
const toast=document.getElementById('toast');
let currentRoute='home';
let currentFilter='全部';
let selectedGraph='athena';
let graphDepth=2;

const byId=(arr,id)=>arr.find(x=>x.id===id);
const p=id=>byId(DATA.people,id);
const s=id=>byId(DATA.stories,id);
const a=id=>byId(DATA.artworks,id);
const src=id=>byId(DATA.sources,id);
const img=(x,cls='')=>`<img class="${cls}" src="${x}" alt="" loading="lazy">`;
const pills=(xs=[])=>xs.map(x=>`<span class="pill">${x}</span>`).join('');
const STORY_GUIDES={
  'titanomachy':{intro:'这不是一场单纯的神祇战争，而是一段关于权力如何从一代转到下一代的神话历史。克洛诺斯以推翻父亲开局，却又用吞食子女来阻止同样的命运；瑞亚保存宙斯，才让循环第一次被打断。',note:'《神谱》把这一故事放在宇宙秩序的建立阶段。不同传统会增删盟友和战斗细节，但宙斯取得天界统治、兄弟分掌世界的结构非常稳定。',beats:['克洛诺斯以暴力终结乌拉诺斯的统治，也继承了对被子女取代的恐惧。','为了避免预言成真，他把刚出生的孩子逐一吞下，使母神瑞亚失去所有孩子。','瑞亚在克里特秘密生下宙斯，并以襁褓包着的石块瞒过克洛诺斯。','宙斯成年后迫使克洛诺斯吐出先前吞下的兄弟姐妹，新的神祇联盟由此成形。','独眼巨人提供雷霆，百臂巨人提供压倒性的力量；武器与盟友让战争具有宇宙尺度。','双方长期对峙，冲突并不是个人决斗，而是两套神权秩序的竞争。','泰坦一方败北，反对宙斯的主要力量被囚于冥府深处。','宙斯、波塞冬与哈迪斯分配天、海、冥界，世界从此拥有可辨认的治理结构。']},
  'trojan-war':{intro:'特洛伊战争不是由一个原因引爆的故事，而是一串选择不断被放大的结果：神祇竞逐、帕里斯的裁决、海伦离开斯巴达、希腊诸王履行盟约，最后都汇入十年围城。',note:'《伊利亚特》只截取战争末期的一小段；木马与陷城属于史诗循环及后世汇编传统。阅读时应把“战争前史”“《伊利亚特》”“陷落叙事”区分开。',beats:['不和女神留下金苹果，把赫拉、雅典娜与阿佛洛狄忒拉进一场无法回避的竞逐。','宙斯把裁决交给特洛伊王子帕里斯，让神祇冲突转移到凡人身上。','三位女神各自许诺权力、胜利或最美的女子，帕里斯最终选择阿佛洛狄忒。','海伦与帕里斯前往特洛伊，希腊诸王因旧日盟约而集结远征。','战争中，阿伽门农与阿喀琉斯围绕荣誉和战利品决裂，联军因此受损。','帕特洛克罗斯之死把阿喀琉斯重新推回战场，也让赫克托耳的命运转折。','赫克托耳死后，战争仍未结束；史诗显示胜利并不能抵消失去亲人的哀伤。','木马计让城门从内部打开，特洛伊的陷落成为后世反复重述的结局。']},
  'achilles-wrath':{intro:'《伊利亚特》的核心并非“攻下特洛伊”，而是阿喀琉斯的愤怒如何伤害双方、又如何在哀悼中被暂时化解。史诗由一次荣誉冲突开始，终于敌对父子的相互理解。',note:'荷马没有讲阿喀琉斯之死或木马陷城。帕特洛克罗斯、赫克托耳与普里阿摩斯的段落，是理解全诗伦理张力的关键。',beats:['阿伽门农夺走布里塞伊斯，触碰的是阿喀琉斯作为战士应得的荣誉。','阿喀琉斯撤出战斗，个人受辱立刻演变为整个联军的危机。','没有阿喀琉斯的阿开亚军被特洛伊军逼近船营，代价由普通战士承担。','帕特洛克罗斯借用阿喀琉斯的盔甲出战，试图用朋友的名望挽回局势。','赫克托耳杀死帕特洛克罗斯，阿喀琉斯的愤怒从对统帅转为对敌人的复仇。','忒提斯为儿子求得新甲，却也知道这场复仇会缩短儿子的生命。','阿喀琉斯接受和解并重返战场，但并未真正摆脱愤怒。','他追逐赫克托耳并将其杀死，战斗的胜利紧接着是对遗体的羞辱。','普里阿摩斯来到敌营，以父亲对儿子的哀求打动阿喀琉斯。','阿喀琉斯归还遗体；双方短暂停战，为赫克托耳举行葬礼，史诗停在哀悼而非凯旋。']},
  'odyssey':{intro:'奥德修斯的归乡既是航海冒险，也是身份恢复的故事。他必须从海上怪物、神祇阻挠和自身好奇心中活下来，也必须回到伊塔卡后重新证明自己是谁。',note:'《奥德赛》的叙事不是线性旅行日记：许多冒险由奥德修斯在费埃克斯人宫中回述。佩涅洛佩的织布与婚床试探，是和海上漂流同等重要的另一条主线。',beats:['离开特洛伊后，奥德修斯并未立刻回家，归航从一开始就被劫掠与风暴打断。','食莲人的遗忘诱惑提示他：回家首先需要保住对故乡的记忆。','在独眼巨人的洞穴，他靠“无人”的名字脱身，却因报出真名招来波塞冬长期报复。','风袋本可带他回家，船员的猜疑却使机会在港口外消失。','喀耳刻把同伴变为猪，又最终成为提供冥界路线的帮助者，敌友关系并不固定。','冥府之行让奥德修斯听见死者的忠告，也看见战后英雄的不同结局。','塞壬、斯库拉与卡律布狄斯迫使他在求知、牺牲与航路之间取舍。','在卡吕普索岛上，他得到不朽的诱惑，却仍选择有限而具体的伊塔卡生活。','回到故乡后，他先以乞丐身份观察局势，耐心比武力更重要。','佩涅洛佩以婚床秘密验证身份；两人的互认完成了真正的归乡。']},
  'heracles':{intro:'赫拉克勒斯的十二功业只是他漫长人生的一部分。故事从赫拉的迫害、一次无法挽回的疯狂开始，经由劳作赎罪，最后抵达死亡与神化。',note:'十二功业在不同汇编里顺序和细节不完全相同。这里把它们理解为“赎罪任务”的连续体，而不是十二个彼此无关的怪物关卡。',beats:['赫拉克勒斯的出生就带着宙斯与赫拉冲突的印记，敌意早于他的英雄事业。','赫拉不断阻碍他，神话以此解释英雄为何必须反复承受超常的苦难。','疯狂使他伤害至亲，功业不是寻求名声，而是为不可撤销的罪行寻找赎罪。','涅墨亚狮子的皮无法被普通兵器穿透，他以近身力量取胜并穿上狮皮。','勒耳那水蛇的多头再生让战斗变成耐力与协作的考验。','其余任务横跨怪物、神圣动物、污秽与遥远边界，逐渐扩展希腊世界的地图。','德伊阿尼拉与涅索斯的故事显示，英雄在完成任务后并没有摆脱命运。','毒衣带来灼烧般的死亡；赫拉克勒斯登上火葬柴堆，随后被接纳为神。']},
  'perseus':{intro:'珀尔修斯的故事由神谕启动，又在神谕应验中闭合。美杜莎首级既是任务目标，也是一路延伸到安德洛墨达、波吕德克忒斯与雅典娜的关键神物。',note:'美杜莎的出身、是否曾为凡人等叙事差异很大；斩首任务和安德洛墨达救援是相对稳定的冒险骨架。',beats:['阿克里西俄斯担心外孙会杀死自己，于是试图通过隔绝女儿避免预言。','达那厄与婴儿珀尔修斯被放逐到海上，神谕因规避而获得新的路径。','波吕德克忒斯要求珀尔修斯取得美杜莎首级，把不可能的任务包装成礼物。','雅典娜与赫尔墨斯提供装备和方向，英雄的成功并不只是个人武勇。','他找到戈耳工栖地，并必须避免直视会使人石化的面孔。','借助反光盾牌，珀尔修斯在不直接对视的情况下斩下美杜莎首级。','归途中，他看见安德洛墨达被献给海怪，选择介入另一场神罚。','最终意外杀死祖父，证明神谕没有被逃避，却不等同于主动弑亲。']},
  'oedipus':{intro:'俄狄浦斯故事最残酷之处在于：所有人都在试图避开预言，正是这些行动把预言一步步变成现实。它既是神谕故事，也是关于求知会带来何种代价的悲剧。',note:'索福克勒斯的《俄狄浦斯王》聚焦瘟疫调查和真相揭露，而人物的婴儿时期、斯芬克斯等前史来自更广泛的神话传统。',beats:['拉伊俄斯得知自己会死于儿子之手，于是把婴儿遗弃。','婴儿被他人救下并在科林斯长大，身份的断裂让预言难以被识别。','俄狄浦斯从神谕得知自己会弑父娶母，便离开养父母以求避祸。','在三岔路口，他因争执杀死陌生老人，却不知道那正是生父。','斯芬克斯用谜题困住底比斯，俄狄浦斯因解谜成为救城者。','他因此获得王位并与王后成婚，命运的第二部分已在不知情中完成。','瘟疫迫使他寻找旧案真相，调查本身由他最强的求知欲推动。','身份揭露摧毁了他所建立的一切，真相同时成为惩罚。']},
  'argonauts':{intro:'阿尔戈远征是希腊英雄群像的早期舞台。伊阿宋的王位任务、英雄们的共同航行与美狄亚的魔法帮助，共同把金羊毛从一个王权象征变成爱情和背叛的起点。',note:'阿波罗尼奥斯的《阿尔戈英雄纪》尤其突出美狄亚的心理与爱欲；其他汇编会更强调伊阿宋的血统和远征路线。',beats:['伊阿宋被要求取得金羊毛，任务既是考验也是篡位者设下的死亡陷阱。','阿尔戈号汇集许多著名英雄，远征因此成为神话人物网络的交叉点。','航程不断遭遇陌生民族、危险海峡与神意考验，团队并非始终完整。','抵达科尔基斯后，埃厄忒斯提出几乎无法完成的劳动条件。','美狄亚在神意与爱欲驱使下决定帮助外来者伊阿宋。','她用药物帮助伊阿宋制服公牛、播种龙牙战士，并避开守护金羊毛的巨龙。','伊阿宋取得金羊毛后，两人必须连夜逃离，胜利从一开始就带有流亡的代价。','远征结束并非幸福结局，它直接通向科林斯的背弃与悲剧。']},
  'medea-tragedy':{intro:'美狄亚在科林斯的故事把“帮助英雄的异乡女子”翻转为悲剧中心。她的复仇令人恐惧，但文本也不断让观众看见背弃、流放和异乡身份如何将她推向绝境。',note:'杀子复仇是欧里庇得斯最有影响力的版本，不应被当作唯一传统；古代材料对孩子的死因、美狄亚离开的去向都有不同说法。',beats:['伊阿宋和美狄亚抵达科林斯，远征共同体被日常婚姻与政治现实取代。','伊阿宋选择与国王之女结婚，希望以新的婚姻获得地位和安全。','克瑞翁担心美狄亚的力量，下令她和孩子立刻离开城邦。','埃勾斯许诺将来提供庇护，让美狄亚在绝境中得到一条退路。','她表面上向伊阿宋示弱，暗中把报复设计成一系列不可撤回的行动。','带毒的衣饰和冠冕杀死新娘与克瑞翁，宫廷权力结构随之崩塌。','在欧里庇得斯版本中，她杀死孩子以彻底摧毁伊阿宋的未来。','日神战车带她离开，使伊阿宋无法审判或惩罚她。','其他传统给出不同的孩子命运和结局，正说明神话并不存在单一“原版”。']},
  'theseus':{intro:'忒修斯进入迷宫的故事把政治贡品、家族秘密和一根线团连在一起。真正的胜利并不只是杀死怪物，更是从一个被设计成无法逃出的空间中找回出口。',note:'弥诺陶洛斯的身世和忒修斯回航的细节在不同文本中有差异。普鲁塔克尤其关注神话与雅典历史记忆如何交织。',beats:['忒修斯的成长故事把他塑造成将要承担雅典公共责任的英雄。','雅典必须定期向克里特送出青年，贡品制度使迷宫冒险具有政治背景。','忒修斯主动随船前往，试图终结这种屈辱性的循环。','阿里阿德涅爱上他，交给他线团；她的帮助决定了冒险能否结束。','进入迷宫意味着进入代达罗斯构造的、失去方向感的空间。','忒修斯杀死弥诺陶洛斯，但暴力本身并不能告诉他如何离开。','线团引导他与同伴重返入口，证明技艺与合作和武力同样关键。','离开克里特后，阿里阿德涅的命运展开为另一条关于遗弃与酒神的故事。']},
  'ariadne':{intro:'阿里阿德涅并非迷宫故事里的一个工具性角色。她离开克里特、被忒修斯留下、再与狄俄尼索斯相遇的叙事，使“线团”之后的人生成为新的神话中心。',note:'她为何被留下、狄俄尼索斯如何出现、婚姻是否早已由神安排，各种版本并不一致。',beats:['阿里阿德涅跟随忒修斯离开故乡，切断了与克里特王室的联系。','抵达纳克索斯后，忒修斯离去；不同文本给出遗忘、抛弃或神意安排等解释。','被留下的阿里阿德涅从帮助英雄的人变成需要面对自身命运的人。','狄俄尼索斯出现，带来与英雄婚姻不同的神圣结合可能。','这段婚姻把阿里阿德涅纳入酒神的神祇世界，也让她的形象超越被遗弃者。']},
  'aphrodite-birth':{intro:'阿佛洛狄忒的出生是研究希腊神话版本差异的最佳入口：她既可以是由乌拉诺斯的创伤、海水与泡沫生出的古老力量，也可以是宙斯与狄俄涅之女。',note:'这两种传统不必强行合并。网页将它们保留为不同作者、不同叙事目的下的神谱说法。',beats:['在赫西俄德的神谱中，乌拉诺斯事件改变了宇宙的代际关系。','落入海中的神性物质与泡沫相连，爱欲女神从暴力的余波中诞生。','阿佛洛狄忒从海上出现，随后与塞浦路斯等地点传统发生联系。','她的神性既关乎美，也关乎使众神和凡人失去理性的欲望。','荷马传统则将她置入奥林匹斯家谱，明确称为宙斯与狄俄涅之女。']},
  'prometheus':{intro:'普罗米修斯故事追问的不是“火从哪里来”这么简单，而是神与人如何因祭祀、技艺和惩罚被区分开。盗火是一种为人类争取能力、也招来持续代价的行动。',note:'赫西俄德与埃斯库罗斯对普罗米修斯的态度并不相同：前者更强调宙斯秩序，后者更突出反抗者的尊严。',beats:['在墨科涅的祭祀分配中，普罗米修斯用诡计让宙斯作出看似不利的选择。','宙斯因此收回火，让人类失去制作与生存的关键能力。','普罗米修斯把火藏起并重新带给人类，使神人冲突从祭祀延伸到文明技艺。','宙斯以更严厉的方式回应，惩罚不只针对普罗米修斯，也波及人类。','他被锁缚在荒远之地，鹰每日啄食肝脏，身体又在夜间复原。']},
  'europa':{intro:'欧罗巴与公牛的故事把神的欲望、跨海迁移和克里特王族起源连在一起。对欧罗巴而言，这并非单纯的浪漫相遇，而是一场由神力主导的离岸与迁徙。',note:'后世艺术常把这一场景美化为海上游戏；阅读原典与改写时需要留意神与凡人之间并不对等的权力。',beats:['欧罗巴在海边与同伴游戏时，看见异常温顺而美丽的白牛。','宙斯化身为牛，以温顺姿态接近她并消除戒心。','她骑上牛背后，牛立刻涉海离岸，把她带离原来的世界。','抵达克里特后，她成为新的王族谱系的一部分。','故事将一位腓尼基公主的迁徙与克里特的政治、文化起源联系起来。']},
  'athens-contest':{intro:'雅典娜与波塞冬的竞争不是普通的神祇比试，而是雅典如何选择自身城市象征的神话解释。海神的力量与橄榄树代表的长期生活，构成两种不同的城市想象。',note:'波塞冬的赠礼在不同版本中有海水泉、盐泉或马；评判者也可能是诸神、国王或雅典民众。',beats:['两位神祇都要求成为新城的守护者，城市必须面对神性竞争。','波塞冬展示强力的海洋礼物，在部分传统中是盐泉或马。','雅典娜栽下橄榄树，象征食物、油、木材与可持续的城邦生活。','评判者选择雅典娜的礼物，城市由此以她命名。','波塞冬仍保有重要祭祀地位，竞争并没有让海神从雅典完全消失。']},
  'persephone-descent':{intro:'珀耳塞福涅的下行把母女分离、冥界婚姻和季节枯荣编织为一体。大地为何会不结果实，必须通过一位母亲寻找女儿的悲伤来理解。',note:'《致得墨忒耳赞歌》是核心文本；石榴籽数量与她在冥界停留的时长因版本而异。',beats:['珀耳塞福涅与同伴采花，最明亮的地表场景成为断裂的起点。','大地裂开，哈迪斯从地下出现，把她带入冥界。','得墨忒耳听见女儿呼喊，开始漫长而徒劳的寻找。','她拒绝让谷物生长，神与人都面临饥荒，悲伤成为宇宙危机。','宙斯最终介入，不是出于完全的正义，而是因为世界无法承受持续的荒芜。','石榴籽使珀耳塞福涅仍与冥界相连，回归不可能是永久的。','她在两界之间往返，母女重聚带来谷物再生。','故事也为厄琉息斯秘仪提供了关于死亡与希望的神圣框架。']},
  'apollo-daphne':{intro:'达芙妮的月桂变形不是爱情得偿所愿，而是为了逃离追逐而付出的自我改变。阿波罗的爱欲、厄洛斯的报复与达芙妮的拒绝在此相互冲突。',note:'最著名的版本来自奥维德《变形记》，它特别强调身体变形的瞬间与追逐中的不对等。',beats:['阿波罗战胜巨蟒后夸耀自己的弓箭，轻视了厄洛斯的力量。','厄洛斯以两种箭回应：金箭引发欲望，铅箭引发拒绝。','阿波罗被金箭射中，开始无法节制地追逐达芙妮。','达芙妮则不断逃离，拒绝被纳入阿波罗设想的婚姻。','在即将被追上时，她向父亲求助，宁愿失去人形。','她的手臂生出枝叶，双足扎入土地，身体化为月桂。','阿波罗无法得到她，只能把月桂纳为自己的冠饰与象征。']},
  'orpheus-eurydice':{intro:'俄耳甫斯以音乐穿越生死边界，却败在几乎已经成功的一次回望。这个故事的悲剧并不是他不够爱，而是爱与不确定性恰恰使禁令变得难以遵守。',note:'欧律狄刻的死因、俄耳甫斯后来的命运在不同传统里会变化；“不得回头”是最广为流传的核心。',beats:['欧律狄刻被蛇咬伤后死亡，婚姻在开始不久便被死亡截断。','俄耳甫斯拒绝接受失去，决定走一条活人通常不能走的路。','他的琴声穿过冥界，使平日冷酷的亡灵与惩罚者也为之动容。','哈迪斯同意放人，但设置的条件把信任变成最艰难的试炼。','他们沿着黑暗通道上行，俄耳甫斯无法确认欧律狄刻是否真的在身后。','接近出口时，他因恐惧与渴望回头。','欧律狄刻只来得及告别，第二次消失，冥界的门不再为他开启。','俄耳甫斯余生以歌声保存失落，也让这段失败成为诗歌主题。']},
  'eros-psyche':{intro:'普绪克的名字意为“灵魂”。她与厄洛斯的故事把爱情写成一连串关于信任、好奇、劳动和成长的试炼，最终由凡人成为神。',note:'它不是古风希腊神话的早期固定篇章，最完整的文学叙事出自罗马作家阿普列尤斯《金驴记》。',beats:['普绪克的美貌吸引众人，却也使阿佛洛狄忒感觉自己的神性受到冒犯。','厄洛斯受命使她爱上可怕之物，却在行动中自己爱上她。','两人只在夜晚相见，厄洛斯要求普绪克不要看见他的面容。','姐妹的怀疑使普绪克举灯窥视，灯油滴落，信任随之破裂。','失去厄洛斯后，她主动前往阿佛洛狄忒处，请求承受惩罚和试炼。','分拣谷物、取得金羊毛等任务看似不可能，却不断有自然力量相助。','她从冥界取回盒子，又因好奇打开它而陷入死亡般的睡眠。','厄洛斯救醒她，众神最终授予她不死，爱情不再依赖秘密。','二人的女儿名为欢愉，故事以神人结合收束。']},
  'daedalus-icarus':{intro:'代达罗斯的技艺既制造迷宫，也制造逃离迷宫的翅膀。伊卡洛斯的坠落并不是单纯的“不要骄傲”寓言，而是父亲的知识无法完全替代儿子亲身面对自由的风险。',note:'奥维德将飞行过程写得格外动人；阿波罗多洛斯等文本则保存了不同的逃亡与死亡细节。',beats:['代达罗斯以高超技艺建造迷宫，把克里特王室的秘密变成一座真正的建筑。','他因知晓太多或协助忒修斯而被困，工匠成为自己设计的秩序的囚徒。','无法经由陆地或海路离开，他转而从天空寻找出口。','羽毛被按大小排列，以蜡黏合成翅膀；飞行首先是一项脆弱的技术。','代达罗斯叮嘱伊卡洛斯保持中间高度，避开海水与太阳。','两人升空后，父亲回望儿子，神话短暂呈现出自由带来的喜悦。','伊卡洛斯越飞越高，蜡在热力中融化，羽毛开始散落。','他坠入大海，父亲只能继续飞行并以失子的哀痛抵达彼岸。','后世以伊卡利亚海记住这次坠落，把地名变成对冒险代价的纪念。']}
};
const STORY_LENSES={
  titanomachy:{question:'一个以暴力取得王位的人，能否逃过同样的暴力？',pivot:'瑞亚没有正面挑战克洛诺斯，而是用石块与隐匿保存了未来的可能。',echo:'战争结束后并非人人自由：失败的泰坦被囚，新的宇宙秩序也由胜者书写。'},
  'trojan-war':{question:'当神祇的竞争落到凡人身上，谁真正要为战争付出代价？',pivot:'帕里斯的选择把一场神间竞逐变成跨海远征；每个人都以为还能控制后果。',echo:'特洛伊的陷落不是胜利的终点，而是奥德修斯漂泊、阿伽门农归家遇害等下一轮悲剧的开端。'},
  'achilles-wrath':{question:'荣誉受损时，退出战场是在保护尊严，还是把代价转嫁给同伴？',pivot:'帕特洛克罗斯借甲出战，使阿喀琉斯无法再把战争当作与统帅的私人争执。',echo:'普里阿摩斯与阿喀琉斯共享丧子之痛，短暂打破敌我界线；史诗最终选择了哀悼，而非凯旋。'},
  odyssey:{question:'归乡是抵达一座岛，还是在变化之后仍能被故乡认出？',pivot:'报出真名让奥德修斯赢得片刻自豪，也把波塞冬的诅咒带上整段航程。',echo:'佩涅洛佩的试探说明归来的丈夫不是天然拥有位置的人；身份必须由共同记忆重新确认。'},
  heracles:{question:'完成伟大的功业，能否抵偿一次再也无法挽回的伤害？',pivot:'德尔斐将他导向欧律斯透斯，十二功业从炫耀力量变成了漫长的赎罪劳动。',echo:'英雄被神化并没有抹去其痛苦；赫拉克勒斯是“功绩”与“创伤”始终并存的形象。'},
  perseus:{question:'试图逃离预言，会不会反而替预言铺路？',pivot:'镜盾改变了对敌方式：他不以直视和蛮力取胜，而是以距离、技术与神助取胜。',echo:'美杜莎首级并未随任务结束而失效，它继续改变权力关系，最终成为雅典娜神盾上的图像。'},
  oedipus:{question:'如果真相会毁掉一切，追问真相仍然值得吗？',pivot:'俄狄浦斯亲自发动调查；他的勇气与毁灭他的能力，是同一种不肯停下来的求知。',echo:'在悲剧中，盲眼反而成了新的看见：他失去外在视力，却终于知道自己是谁。'},
  argonauts:{question:'一群英雄的远征，为什么最后常由一个异乡女子承担最重的代价？',pivot:'美狄亚选择帮助伊阿宋，令不可能的任务可完成，也让她与故乡永久决裂。',echo:'金羊毛带回了伊阿宋的胜利，却没有带来稳固的幸福；故事直接投下科林斯悲剧的阴影。'},
  'medea-tragedy':{question:'当一个人被背弃、驱逐且失去法律保护时，复仇会走到哪里？',pivot:'美狄亚得到埃勾斯的庇护承诺后，第一次拥有逃离计划，也因此能把报复推向终局。',echo:'欧里庇得斯没有提供轻易的道德出口：观众既目睹她的残酷，也无法忽略她被排除在城邦之外的处境。'},
  theseus:{question:'杀死怪物究竟是英雄行为，还是一个城邦借英雄重写自己的政治记忆？',pivot:'阿里阿德涅的线团把“击败”变成“生还”；没有她，忒修斯无法把胜利带出迷宫。',echo:'忒修斯获得雅典英雄的名声，阿里阿德涅却被留在另一条故事线上，叙事的光照并不平均。'},
  ariadne:{question:'当帮助他人离开迷宫的人被留下，她还能不能成为自己故事的主人？',pivot:'忒修斯离开后，阿里阿德涅失去的是故乡、伴侣与既定身份，而非仅仅一段爱情。',echo:'与狄俄尼索斯的相遇让她进入神性世界；“被遗弃者”并不是她形象的最后定义。'},
  'aphrodite-birth':{question:'同一位女神为何会拥有两套彼此不同的出身？',pivot:'赫西俄德让爱欲从宇宙暴力的余波中诞生，荷马则把她放进可辨认的奥林匹斯家庭。',echo:'版本差异不是错误，而是神话在不同诗人、地域与时代中持续生长的证据。'},
  prometheus:{question:'给人类带来技艺的行动，是解放，还是对神圣秩序的僭越？',pivot:'盗火让人类得到改变世界的能力，也让普罗米修斯的身体成为惩罚永不停止的场所。',echo:'后世常把他读成反抗者，但赫西俄德的文本提醒我们：火、祭祀与潘多拉的代价始终绑在一起。'},
  europa:{question:'当神以温顺的形象接近凡人，诱惑与掳掠之间的界线在哪里？',pivot:'欧罗巴坐上牛背的瞬间，岸边游戏突然变成了不可逆的渡海。',echo:'她被带到克里特后成为王族祖先，个人被迫离岸的经历被后来的谱系叙事转化为“起源”。'},
  'athens-contest':{question:'一座城市希望自己被什么象征定义：压倒性的力量，还是可长期维系的生活？',pivot:'橄榄树并不如海啸或战马壮观，却把食物、油、木材与共同生活放在选择的中心。',echo:'波塞冬虽未胜出，仍留在雅典的祭祀与地景中；城市神话保存的是竞争后的共存。'},
  'persephone-descent':{question:'季节的循环，为什么要通过一位母亲无法完整拥有女儿来解释？',pivot:'石榴籽令重逢带上条件：珀耳塞福涅能回来，却不能只属于地表。',echo:'故事把饥荒、收获与死亡经验连在一起，也让厄琉息斯秘仪承诺一种穿过失去的希望。'},
  'apollo-daphne':{question:'当一个人的爱欲成为另一个人的威胁，爱情叙事还剩下什么？',pivot:'达芙妮向父亲求救时，变形不是奖赏，而是逃脱追逐所付出的身体代价。',echo:'阿波罗戴上月桂冠，看似纪念爱情，实际留下的是一场未被同意的追逐痕迹。'},
  'orpheus-eurydice':{question:'如果你无法确认所爱之人是否在身后，你能否继续向前而不回头？',pivot:'出口近在眼前时的回望，不是简单的失误，而是恐惧与爱欲同时压倒了信任。',echo:'欧律狄刻第二次离去后，俄耳甫斯只能用歌声保存她；艺术因此成为无法挽回之物的容器。'},
  'eros-psyche':{question:'一段只能在黑暗中存在的爱情，能否经得起好奇与现实？',pivot:'普绪克举起灯的瞬间，她获得了知识，却失去了由秘密保护的关系。',echo:'最终的神人婚姻并非回到原点，而是经历劳动、失败与宽恕后，爱情终于不必躲藏。'},
  'daedalus-icarus':{question:'知识可以制造自由的工具，却能否教会另一个人如何使用自由？',pivot:'父亲规定的“中间高度”看似理性，却无法替伊卡洛斯抵挡飞翔本身带来的兴奋。',echo:'代达罗斯活着抵达彼岸，因此故事最沉重的部分不是坠落，而是幸存者必须继续前行。'}
};
const ART_HOTSPOTS={
  'birth-venus':[{person:'aphrodite',x:51,y:44,label:'阿佛洛狄忒'}],
  'judgement-paris':[{person:'athena',x:19,y:46,label:'雅典娜'},{person:'aphrodite',x:31,y:48,label:'阿佛洛狄忒'},{person:'hera',x:45,y:48,label:'赫拉'},{person:'paris',x:79,y:47,label:'帕里斯'}],
  'caravaggio-medusa':[{person:'medusa',x:50,y:51,label:'美杜莎'}],
  'bacchus-ariadne':[{person:'ariadne',x:10,y:55,label:'阿里阿德涅'},{person:'dionysus',x:43,y:44,label:'狄俄尼索斯'}],
  'europa':[{person:'europa',x:65,y:59,label:'欧罗巴'},{person:'zeus',x:89,y:61,label:'宙斯（公牛）'}],
  'perseus-andromeda':[{person:'perseus',x:47,y:48,label:'珀尔修斯'},{person:'medusa',x:72,y:29,label:'美杜莎首级'}]
};
function artInteractive(x,cls=''){
 const hotspots=ART_HOTSPOTS[x.id]||[];
 return `<div class="art-interactive ${cls}">${img(x.image,'art-interactive-image')}${hotspots.map(h=>`<button class="art-hotspot" data-person="${h.person}" style="--x:${h.x}%;--y:${h.y}%" aria-label="探索${h.label}：人物关系与故事"><i></i><span>${h.label}</span></button>`).join('')}${hotspots.length?'<div class="art-hotspot-hint">点击画中光点，追踪人物</div>':''}</div>`;
}
function esc(v=''){return v.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function notify(msg){toast.textContent=msg;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800)}

function setRoute(route){
  currentRoute=route; window.scrollTo({top:0,behavior:'smooth'});
  document.querySelectorAll('[data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===route));
  const renderers={home:renderHome,stories:renderStories,people:renderPeople,art:renderArt,graph:renderGraph,sources:renderSources,variants:renderVariants,about:renderAbout};
  (renderers[route]||renderHome)();
  view.focus({preventScroll:true});
}

document.addEventListener('click',e=>{
  const r=e.target.closest('[data-route]'); if(r){setRoute(r.dataset.route);return}
  const story=e.target.closest('[data-story]'); if(story){openStory(story.dataset.story);return}
  const person=e.target.closest('[data-person]'); if(person){openPerson(person.dataset.person);return}
  const art=e.target.closest('[data-art]'); if(art){openArtwork(art.dataset.art);return}
  const source=e.target.closest('[data-source]'); if(source){openSource(source.dataset.source);return}
});

document.getElementById('themeBtn').addEventListener('click',()=>{
  document.body.classList.toggle('light');
  document.getElementById('themeBtn').textContent=document.body.classList.contains('light')?'☀':'☾';
});

function homeStoryCard(story){return `<article class="story-card" data-story="${story.id}">${img(story.image,'card-img')}<div class="card-body"><div class="card-top"><h3>${story.title}</h3><span class="meta">${story.category}</span></div><p>${story.summary}</p><div class="tags">${pills(story.people.slice(0,3).map(id=>p(id)?.name).filter(Boolean))}</div></div></article>`}
function personCard(person){return `<article class="person-card" data-person="${person.id}">${img(person.image,'card-img portrait')}<div class="card-body"><div class="card-top"><h3>${person.name}</h3><span class="meta">${person.type}</span></div><div class="meta">${person.en} · ${person.grc}</div><p>${person.domain}</p><div class="tags">${pills(person.stories.slice(0,2).map(id=>s(id)?.title).filter(Boolean))}</div></div></article>`}
function artCard(art){return `<article class="art-card" data-art="${art.id}">${img(art.image,'card-img')}<div class="card-body"><div class="card-top"><h3>${art.title}</h3><span class="meta">${art.realImage?'馆藏图':'演示图'}</span></div><p>${art.artist} · ${art.date}</p><div class="tags">${pills((art.people||[]).slice(0,3).map(id=>p(id)?.name).filter(Boolean))}</div></div></article>`}

function renderHome(){
 view.innerHTML=`
 <section class="hero">
   ${img('assets/images/hero_hd.webp')}
   <div class="hero-content"><div class="eyebrow">EXPLORE GREEK MYTHOLOGY</div><h1>进入一个可以不断追踪的<br>希腊神话世界</h1><p>从人物、故事、神谱、名画与古典原典之间来回穿梭。每个故事都拆成事件，每个事件都能回到人物关系与来源。</p><div class="hero-actions"><button class="btn-primary" data-route="stories">开始探索故事</button><button class="btn-secondary" data-route="graph">打开神话关系图</button></div></div>
   <div class="hero-stats"><div class="stat"><strong>${DATA.people.length}</strong><span>原型人物</span></div><div class="stat"><strong>${DATA.stories.length}</strong><span>完整故事线</span></div><div class="stat"><strong>${DATA.artworks.length}</strong><span>艺术专题</span></div></div>
 </section>
 <section class="entry-grid"><button class="entry" data-route="people"><b>从一个人物开始</b><p>查看完整人物故事线、亲缘、敌友、参与事件、原典与艺术形象。</p></button><button class="entry" data-route="stories"><b>从一个故事开始</b><p>以章节与事件为主线阅读，再随时跳到人物、地点和相关故事。</p></button><button class="entry" data-route="art"><b>从一幅名画开始</b><p>识别画中人物与具体神话瞬间，再追踪画面背后的故事和古典来源。</p></button></section>
 <div class="section-title"><div><h2>热门故事</h2><p>不是孤立文章，而是可进入的叙事网络。</p></div><button class="link-btn" data-route="stories">查看全部 →</button></div>
 <section class="card-grid">${DATA.stories.slice(0,4).map(homeStoryCard).join('')}</section>
 <div class="section-title"><div><h2>今天从雅典娜开始</h2><p>一个人物可以同时通往神谱、史诗、城市神话和艺术史。</p></div></div>
 <section class="feature-layout"><div class="feature-story">${img('assets/images/people/athena.webp')}<div class="feature-copy"><div class="eyebrow">人物档案</div><h2>雅典娜</h2><p>${p('athena').summary}</p><button class="btn-primary" data-person="athena">打开完整人物线</button></div></div><div class="mini-list">${['trojan-war','odyssey','perseus'].map(id=>{const x=s(id);return `<article class="mini-item" data-story="${x.id}">${img(x.image)}<div><h3>${x.title}</h3><p>${x.summary.slice(0,62)}……</p></div></article>`}).join('')}</div></section>
 <div class="section-title"><div><h2>名画中的神话</h2><p>艺术作品被视为“后世再现”，不会和古典文本证据混在一起。</p></div><button class="link-btn" data-route="art">进入艺术馆 →</button></div>
 <section class="card-grid">${DATA.artworks.slice(0,4).map(artCard).join('')}</section>`;
}

function renderStories(){
 const cats=['全部',...new Set(DATA.stories.map(x=>x.category))];
 const filtered=currentFilter==='全部'?DATA.stories:DATA.stories.filter(x=>x.category===currentFilter);
 view.innerHTML=`<div class="eyebrow">STORY LIBRARY</div><h1 class="page-title">故事全集</h1><p class="page-sub">故事是这个知识库的主入口。每个故事拆成章节与事件，同时挂接人物、原典和艺术作品；点击任意卡片查看完整故事线。</p><div class="filters">${cats.map(c=>`<button class="filter-btn ${c===currentFilter?'active':''}" data-cat="${c}">${c}</button>`).join('')}</div><section class="card-grid">${filtered.map(homeStoryCard).join('')}</section>`;
 view.querySelectorAll('[data-cat]').forEach(b=>b.addEventListener('click',()=>{currentFilter=b.dataset.cat;renderStories()}));
}

function renderPeople(){
 const types=['全部',...new Set(DATA.people.map(x=>x.type))];
 const active=window.peopleFilter||'全部';
 const list=active==='全部'?DATA.people:DATA.people.filter(x=>x.type===active);
 view.innerHTML=`<div class="eyebrow">CHARACTER ATLAS</div><h1 class="page-title">人物全集</h1><p class="page-sub">人物页不是孤立简介，而是自动汇总其全部关系、故事、事件、版本与艺术形象。原型数据中每位人物都已经能跨模块跳转。</p><div class="people-layout"><aside class="side-filter"><h3>人物类型</h3>${types.map(t=>`<button class="${t===active?'active':''}" data-type="${t}">${t}<span style="float:right">${t==='全部'?DATA.people.length:DATA.people.filter(x=>x.type===t).length}</span></button>`).join('')}</aside><section class="card-grid">${list.map(personCard).join('')}</section></div>`;
 view.querySelectorAll('[data-type]').forEach(b=>b.addEventListener('click',()=>{window.peopleFilter=b.dataset.type;renderPeople()}));
}

function renderArt(){
 const featured=a('birth-venus');
 view.innerHTML=`<div class="eyebrow">MYTH IN ART</div><h1 class="page-title">名画中的希腊神话</h1><p class="page-sub">从一幅画进入它背后的故事：画中人物是谁、处于哪个事件节点、对应什么古典来源，以及同一题材如何被不同艺术家反复解释。</p>
 <section class="art-hero">${artInteractive(featured,'art-hero-image')}<div class="art-info"><div class="eyebrow">本期名画</div><h1>${featured.title}</h1><div class="meta">${featured.en}</div><p>${featured.summary}</p><dl class="kv"><dt>艺术家</dt><dd>${featured.artist}</dd><dt>年代</dt><dd>${featured.date}</dd><dt>馆藏</dt><dd>${featured.museum}</dd><dt>神话故事</dt><dd>${s(featured.story).title}</dd></dl><div class="relation-chain"><b>知识关系</b><div class="chain"><span>赫西俄德传统</span><i>→</i><span>阿佛洛狄忒诞生</span><i>→</i><span>${featured.title}</span><i>→</i><span>文艺复兴视觉再现</span></div></div><div class="hero-actions"><button class="btn-primary" data-art="birth-venus">打开画作详情</button><button class="btn-secondary" data-story="aphrodite-birth">阅读神话</button></div></div></section>
 <div class="section-title"><div><h2>艺术作品与专题</h2><p>艺术专题统一使用独立高清本地图像，并沿用同一套 Artwork 数据模型。</p></div></div><section class="card-grid">${DATA.artworks.map(artCard).join('')}</section><div class="notice" style="margin-top:18px"><strong>版权与数据层分开：</strong>当前艺术专题已替换为独立高清本地图像；人物—故事—原典—名画关系仍由同一数据层驱动。</div>`;
}

function renderGraph(){
 const center=p(selectedGraph)||p('athena');
 const relatedTo=x=>DATA.people.filter(y=>y.id!==x.id&&((x.relations||[]).includes(y.id)||(y.relations||[]).includes(x.id)));
 const direct=relatedTo(center);
 const directIds=new Set(direct.map(x=>x.id));
 const outer=new Map;
 if(graphDepth===2) direct.forEach(parent=>relatedTo(parent).forEach(child=>{if(child.id!==center.id&&!directIds.has(child.id)&&!outer.has(child.id))outer.set(child.id,{n:child,parent});}));
 const outerNodes=[...outer.values()].slice(0,14);
 const cx=490,cy=355,innerR=178,outerR=292;
 const ring=(items,r,offset=0)=>items.map((o,i)=>({ ...o,x:cx+Math.cos((Math.PI*2*i/items.length)-Math.PI/2+offset)*r,y:cy+Math.sin((Math.PI*2*i/items.length)-Math.PI/2+offset)*r}));
 const innerNodes=ring(direct.map(n=>({n})),innerR);
 const innerById=new Map(innerNodes.map(x=>[x.n.id,x]));
 const outerPlaced=ring(outerNodes,outerR,Math.PI/outerNodes.length||0).map(x=>({...x,parentNode:innerById.get(x.parent.id)}));
 const allNodes=[...innerNodes,...outerPlaced];
 const nodeSvg=(o,i,kind)=>{const r=kind==='inner'?38:27;return `<g class="graph-node graph-node-${kind}" data-graph-person="${o.n.id}"><circle cx="${o.x}" cy="${o.y}" r="${r+6}"/><image href="${o.n.image}" x="${o.x-r}" y="${o.y-r}" width="${r*2}" height="${r*2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-${i})"/><text x="${o.x}" y="${o.y+r+20}" text-anchor="middle">${o.n.name}</text></g>`};
 view.innerHTML=`<div class="eyebrow">KNOWLEDGE GRAPH</div><h1 class="page-title">神话世界</h1><p class="page-sub">以当前人物为中心展示直接关系，并可展开第二层关联。点击任何节点即可把它设为新的中心；关系会同时识别双向记录。</p><section class="graph-shell"><div class="graph-stage"><div class="graph-toolbar"><button data-graph-reset>回到雅典娜</button><button data-graph-depth>${graphDepth===2?'收起第二层':'展开第二层'}</button><button data-route="people">人物列表</button></div><div class="graph-count">中心 1 · 直接 ${direct.length} · ${graphDepth===2?`延伸 ${outerNodes.length}`:'聚焦模式'}</div><svg viewBox="0 0 980 720" role="img" aria-label="希腊神话人物关系图"><defs><clipPath id="centerClip"><circle cx="${cx}" cy="${cy}" r="58"/></clipPath>${allNodes.map((o,i)=>{const r=i<innerNodes.length?38:27;return `<clipPath id="clip-${i}"><circle cx="${o.x}" cy="${o.y}" r="${r}"/></clipPath>`}).join('')}</defs>${innerNodes.map(o=>`<line class="graph-edge graph-edge-direct" x1="${cx}" y1="${cy}" x2="${o.x}" y2="${o.y}"/>`).join('')}${outerPlaced.map(o=>o.parentNode?`<line class="graph-edge graph-edge-outer" x1="${o.parentNode.x}" y1="${o.parentNode.y}" x2="${o.x}" y2="${o.y}"/>`:'').join('')}<g class="graph-node graph-node-center" data-person="${center.id}"><circle cx="${cx}" cy="${cy}" r="64"/><image href="${center.image}" x="${cx-58}" y="${cy-58}" width="116" height="116" preserveAspectRatio="xMidYMid slice" clip-path="url(#centerClip)"/><text x="${cx}" y="${cy+86}" text-anchor="middle">${center.name}</text></g>${innerNodes.map((o,i)=>nodeSvg(o,i,'inner')).join('')}${outerPlaced.map((o,i)=>nodeSvg(o,innerNodes.length+i,'outer')).join('')}</svg></div><aside class="graph-info">${img(center.image)}<div><div class="eyebrow">当前中心</div><h2>${center.name}</h2><div class="meta">${center.en} · ${center.grc}</div><p>${center.summary}</p><div class="graph-key"><span><i class="key-inner"></i>直接关系</span><span><i class="key-outer"></i>第二层关联</span></div><div class="tags">${pills(direct.map(x=>x.name))}</div><div class="hero-actions"><button class="btn-primary" data-person="${center.id}">完整人物线</button></div></div></aside></section>`;
 view.querySelectorAll('[data-graph-person]').forEach(el=>el.addEventListener('click',()=>{selectedGraph=el.dataset.graphPerson;renderGraph()}));
 view.querySelector('[data-graph-reset]').addEventListener('click',()=>{selectedGraph='athena';renderGraph()});
 view.querySelector('[data-graph-depth]').addEventListener('click',()=>{graphDepth=graphDepth===2?1:2;renderGraph()});
}

function renderSources(){
 view.innerHTML=`<div class="eyebrow">PRIMARY SOURCES</div><h1 class="page-title">古典原典</h1><p class="page-sub">这个网站把“古典文本证据”和“后世艺术再现”严格分开。原典是 Claim/Story 的依据；名画是 Reception/Artwork 层。</p><section class="source-grid">${DATA.sources.map(x=>`<article class="source-card" data-source="${x.id}"><div class="eyebrow">${x.period}</div><h3>${x.name}</h3><p>${x.summary}</p><div class="work-list"><strong>${x.work}</strong><div>点击查看关联故事与人物 →</div></div></article>`).join('')}</section>`;
}

function renderVariants(){
 view.innerHTML=`<div class="eyebrow">VARIANT-AWARE MYTH</div><h1 class="page-title">版本比较</h1><p class="page-sub">希腊神话没有唯一正典。这里把互相冲突的传统并排展示，而不是强行合并成一个“标准答案”。</p><div class="section-title"><div><h2>阿佛洛狄忒究竟如何诞生？</h2><p>同一人物的起源，在不同作者传统中可以同时成立。</p></div></div><section class="compare-grid"><article class="compare-card"><div class="eyebrow">赫西俄德传统</div><h3>海生的阿佛洛狄忒</h3><blockquote>知识库保存为：乌拉诺斯事件 → 海水/泡沫 → 阿佛洛狄忒出现。</blockquote><div class="diff"><b>来源</b><span>《神谱》</span></div><div class="diff"><b>父母字段</b><span>不直接压成普通“父 + 母”关系</span></div><div class="diff"><b>艺术关联</b><span data-art="birth-venus" style="cursor:pointer;color:var(--gold-2)">《维纳斯的诞生》 →</span></div></article><article class="compare-card"><div class="eyebrow">荷马传统</div><h3>宙斯与狄俄涅之女</h3><blockquote>知识库保存为：宙斯 + 狄俄涅 → 阿佛洛狄忒，并明确标记来源为荷马传统。</blockquote><div class="diff"><b>来源</b><span>《伊利亚特》相关传统</span></div><div class="diff"><b>父母字段</b><span>Zeus / Dione</span></div><div class="diff"><b>处理方式</b><span>与赫西俄德 Claim 同时保留</span></div></article></section><div class="notice" style="margin-top:16px"><strong>核心原则：</strong>VariantGroup 负责告诉前端“这些 Claim 是同一个问题的不同传统”，来源不会被抹掉，用户可以按作者过滤整个神话世界。</div>`;
}

function renderAbout(){
 view.innerHTML=`<div class="eyebrow">ABOUT THE PROTOTYPE</div><h1 class="page-title">关于这个网站包</h1><p class="page-sub">这是一个完全离线可运行的高保真交互原型：界面、人物插画、故事卡片、名画关联、关系图、搜索与详情抽屉均已实现。</p><div class="notice"><strong>当前不是“全量古典语料数据库”。</strong>为了让你先拿到能看的产品，我先填入 18 位代表人物、12 条完整故事线和 6 个艺术专题。<code>data.js</code> 的结构就是后续全量数据接口；接 MANTO/Wikidata/Perseus 时只替换数据层，不需要重写网页。</div><div class="section-title"><div><h2>下一阶段的数据对象</h2></div></div><section class="entry-grid"><div class="entry"><b>Person / Entity</b><p>中文名、英文名、古希腊文、别名、类型、关系、故事、事件、原典、名画。</p></div><div class="entry"><b>Story / Episode / Event</b><p>故事 → 章节 → 场景/事件，人物页面通过事件自动聚合完整故事线。</p></div><div class="entry"><b>Artwork / Source / Variant</b><p>把古典证据、后世艺术和版本冲突分成独立层，避免知识结构被混成一团。</p></div></section>`;
}

function openDrawer(html){drawer.innerHTML=`<button class="drawer-close" aria-label="关闭">×</button>${html}`;drawer.classList.add('open');backdrop.classList.remove('hidden');drawer.querySelector('.drawer-close').addEventListener('click',closeDrawer)}
function closeDrawer(){drawer.classList.remove('open');backdrop.classList.add('hidden')}
backdrop.addEventListener('click',closeDrawer);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDrawer();searchPanel.classList.add('hidden')}});

function openPerson(id){const x=p(id);if(!x)return;openDrawer(`${img(x.image,'drawer-cover')}<div class="eyebrow">${x.type}</div><h2>${x.name}</h2><div class="alias">${x.en} · ${x.grc}</div><p>${x.summary}</p><div class="tags">${pills([x.domain])}</div><div class="drawer-section"><h3>人物故事线</h3><div class="timeline">${x.events.map(e=>`<div class="timeline-item"><h4>${e}</h4><p>关联事件节点 · 可继续追踪来源与参与人物</p></div>`).join('')}</div></div><div class="drawer-section"><h3>参与故事</h3><div class="drawer-links">${x.stories.map(id=>`<button data-story="${id}">${s(id)?.title||id}</button>`).join('')}</div></div><div class="drawer-section"><h3>主要关系</h3><div class="drawer-links">${x.relations.map(id=>`<button data-person="${id}">${p(id)?.name||id}</button>`).join('')}</div></div><div class="drawer-section"><h3>原典来源</h3><div class="drawer-links">${x.sources.map(id=>`<button data-source="${id}">${src(id)?.name||id}</button>`).join('')}</div></div>${x.artworks.length?`<div class="drawer-section"><h3>艺术中的形象</h3><div class="drawer-links">${x.artworks.map(id=>`<button data-art="${id}">${a(id)?.title||id}</button>`).join('')}</div></div>`:''}`)}

function openStory(id){
 const x=s(id);if(!x)return;
 const guide=STORY_GUIDES[id]||{};
 const lens=STORY_LENSES[id];
 const beats=guide.beats||x.chapters.map(c=>'这一章节串联相关人物、场景与原典，可从下方入口继续追踪。');
 const nextStories=DATA.stories.filter(y=>y.id!==id&&(y.people.some(person=>x.people.includes(person))||y.category===x.category)).sort((a,b)=>b.people.filter(person=>x.people.includes(person)).length-a.people.filter(person=>x.people.includes(person)).length).slice(0,4);
 const lensMarkup=lens?`<div class="story-lenses"><div class="story-lens"><span>核心冲突</span><p>${lens.question}</p></div><div class="story-lens"><span>命运转折</span><p>${lens.pivot}</p></div><div class="story-lens"><span>故事余波</span><p>${lens.echo}</p></div></div>`:'';
 openDrawer(`${img(x.image,'drawer-cover')}<div class="eyebrow">${x.category}</div><h2>${x.title}</h2><div class="alias">${x.subtitle}</div><p>${guide.intro||x.summary}</p><div class="story-reading"><strong>阅读提示</strong><p>${guide.note||'神话通常存在多个来源和版本；下方内容以当前数据的主要叙事线为导读。'}</p></div>${lensMarkup}<div class="drawer-section"><h3>分章叙事</h3><div class="timeline">${x.chapters.map((c,i)=>`<div class="timeline-item"><h4>${String(i+1).padStart(2,'0')} · ${c}</h4><p>${beats[i]||'这一节点连接了人物行动、后果与后续故事。'}</p></div>`).join('')}</div></div><div class="drawer-section"><h3>主要人物</h3><div class="drawer-links">${x.people.map(id=>`<button data-person="${id}">${p(id)?.name||id}</button>`).join('')}</div></div><div class="drawer-section"><h3>古典来源</h3><div class="drawer-links">${x.sources.map(id=>`<button data-source="${id}">${src(id)?.name||id}</button>`).join('')}</div></div>${nextStories.length?`<div class="drawer-section"><h3>沿着故事继续读</h3><p class="section-note">这些故事与当前篇章共享人物或叙事主题。</p><div class="drawer-links">${nextStories.map(y=>`<button data-story="${y.id}">${y.title}</button>`).join('')}</div></div>`:''}${x.artworks.length?`<div class="drawer-section"><h3>相关名画</h3><div class="drawer-links">${x.artworks.map(id=>`<button data-art="${id}">${a(id)?.title||id}</button>`).join('')}</div></div>`:''}`)
}

function openArtwork(id){const x=a(id);if(!x)return;const story=s(x.story);const hasHotspots=(ART_HOTSPOTS[x.id]||[]).length>0;openDrawer(`${artInteractive(x,'drawer-artwork')}<div class="eyebrow">Artwork · ${x.realImage?'公共领域馆藏图':'本地演示图'}</div><h2>${x.title}</h2><div class="alias">${x.en}</div><p>${x.summary}</p><dl class="kv"><dt>艺术家</dt><dd>${x.artist}</dd><dt>年代</dt><dd>${x.date}</dd><dt>馆藏/专题</dt><dd>${x.museum}</dd></dl>${hasHotspots?'<div class="art-hotspot-caption">已标记画中可明确辨认的人物；点击名称或画面光点可进入人物关系与相关故事。</div>':''}<div class="drawer-section"><h3>这幅画对应哪个故事？</h3><div class="drawer-links"><button data-story="${x.story}">${story?.title||x.story}</button></div></div><div class="drawer-section"><h3>画面关联人物</h3><div class="drawer-links">${x.people.map(id=>`<button data-person="${id}">${p(id)?.name||id}</button>`).join('')}</div></div><div class="drawer-section"><h3>神话原典</h3><div class="drawer-links">${x.sources.map(id=>`<button data-source="${id}">${src(id)?.name||id}</button>`).join('')}</div></div><div class="notice" style="margin-top:18px">Artwork 只表示后世艺术解释，不会被当作古典 Claim 的事实证据。</div>`)}

function openSource(id){const x=src(id);if(!x)return;const stories=DATA.stories.filter(st=>st.sources.includes(id));const people=DATA.people.filter(pe=>pe.sources.includes(id));openDrawer(`<div class="eyebrow">PRIMARY SOURCE</div><h2>${x.name}</h2><div class="alias">${x.period}</div><p>${x.summary}</p><div class="drawer-section"><h3>代表作品</h3><p>${x.work}</p></div><div class="drawer-section"><h3>关联故事</h3><div class="drawer-links">${stories.map(y=>`<button data-story="${y.id}">${y.title}</button>`).join('')||'暂无'}</div></div><div class="drawer-section"><h3>关联人物</h3><div class="drawer-links">${people.slice(0,12).map(y=>`<button data-person="${y.id}">${y.name}</button>`).join('')||'暂无'}</div></div>`)}

function doSearch(q){q=q.trim().toLowerCase();if(!q){searchPanel.classList.add('hidden');return}const results=[];DATA.people.forEach(x=>{if([x.name,x.en,x.grc,x.domain].join(' ').toLowerCase().includes(q))results.push({type:'人物',title:x.name,sub:`${x.en} · ${x.type}`,image:x.image,action:'person',id:x.id})});DATA.stories.forEach(x=>{if([x.title,x.subtitle,x.category].join(' ').toLowerCase().includes(q))results.push({type:'故事',title:x.title,sub:x.subtitle,image:x.image,action:'story',id:x.id})});DATA.artworks.forEach(x=>{if([x.title,x.en,x.artist].join(' ').toLowerCase().includes(q))results.push({type:'名画',title:x.title,sub:x.artist,image:x.image,action:'art',id:x.id})});searchPanel.innerHTML=results.length?results.slice(0,10).map(r=>`<button class="search-result" data-search-action="${r.action}" data-search-id="${r.id}">${img(r.image)}<span><strong>${esc(r.title)}</strong><br><small>${esc(r.sub)}</small></span><em>${r.type}</em></button>`).join(''):`<div style="padding:18px;color:var(--muted);font-size:12px">没有匹配结果。试试“雅典娜”“奥德修斯”“维纳斯”。</div>`;searchPanel.classList.remove('hidden');searchPanel.querySelectorAll('[data-search-action]').forEach(b=>b.addEventListener('click',()=>{searchPanel.classList.add('hidden');const {searchAction:act,searchId:id}=b.dataset;if(act==='person')openPerson(id);if(act==='story')openStory(id);if(act==='art')openArtwork(id)}))}
searchInput.addEventListener('input',e=>doSearch(e.target.value));searchInput.addEventListener('focus',e=>{if(e.target.value)doSearch(e.target.value)});document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap')&&!e.target.closest('#searchPanel'))searchPanel.classList.add('hidden')});

setRoute('home');
