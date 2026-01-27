// Script to generate seraph games store
const fs = require('fs');
const path = require('path');

// List of seraph game URLs
const gameUrls = `https://verdjs.github.io/seraph/games/slope/index.html
https://verdjs.github.io/seraph/games/subwaysurfers/index.html
https://verdjs.github.io/seraph/games/flappy/index.html
https://verdjs.github.io/seraph/games/papaspizzaria/index.html
https://verdjs.github.io/seraph/games/papasburgeria/index.html
https://verdjs.github.io/seraph/games/sm64/index.html
https://verdjs.github.io/seraph/games/run3/index.html
https://verdjs.github.io/seraph/games/bitlife/index.html
https://verdjs.github.io/seraph/games/crossy/index.html
https://verdjs.github.io/seraph/games/mc/index.html
https://verdjs.github.io/seraph/games/cookieclicker/index.html
https://verdjs.github.io/seraph/games/templerun2/index.html
https://verdjs.github.io/seraph/games/ducklife4/index.html
https://verdjs.github.io/seraph/games/dinogame/index.html
https://verdjs.github.io/seraph/games/jetpackjoyride/index.html
https://verdjs.github.io/seraph/games/retrobowl/index.html
https://verdjs.github.io/seraph/games/fruitninja/index.html
https://verdjs.github.io/seraph/games/doodlejump/index.html
https://verdjs.github.io/seraph/games/2048/index.html
https://verdjs.github.io/seraph/games/tetris/index.html
https://verdjs.github.io/seraph/games/fancypantsadventure/index.html
https://verdjs.github.io/seraph/games/happywheels/index.html
https://verdjs.github.io/seraph/games/papashotdoggeria/index.html
https://verdjs.github.io/seraph/games/paperio2/index.html
https://verdjs.github.io/seraph/games/superhot/index.html
https://verdjs.github.io/seraph/games/thebindingofisaac/index.html
https://verdjs.github.io/seraph/games/townscaper/index.html
https://verdjs.github.io/seraph/games/tunnelrush/index.html
https://verdjs.github.io/seraph/games/themehotel/index.html
https://verdjs.github.io/seraph/games/escapingtheprison/index.html
https://verdjs.github.io/seraph/games/stealingthediamond/index.html
https://verdjs.github.io/seraph/games/infiltratingtheairship/index.html
https://verdjs.github.io/seraph/games/fleeingthecomplex/index.html
https://verdjs.github.io/seraph/games/theimpossiblequiz/index.html
https://verdjs.github.io/seraph/games/solitaire/index.html
https://verdjs.github.io/seraph/games/drifthunters/index.html
https://verdjs.github.io/seraph/games/vex6/index.html
https://verdjs.github.io/seraph/games/amongus/index.html
https://verdjs.github.io/seraph/games/surf/index.html
https://verdjs.github.io/seraph/games/motox3m/index.html
https://verdjs.github.io/seraph/games/fnaf/index.html
https://verdjs.github.io/seraph/games/fnaf-2/index.html
https://verdjs.github.io/seraph/games/fnaf-3/index.html
https://verdjs.github.io/seraph/games/fnaf-4/index.html
https://verdjs.github.io/seraph/games/riddleschool/riddleschool1/index.html
https://verdjs.github.io/seraph/games/riddleschool/riddleschool2/index.html
https://verdjs.github.io/seraph/games/riddleschool/riddleschool3/index.html
https://verdjs.github.io/seraph/games/riddleschool/riddleschool4/index.html
https://verdjs.github.io/seraph/games/riddleschool/riddleschool5/index.html
https://verdjs.github.io/seraph/games/riddleschool/riddletransfer/index.html
https://verdjs.github.io/seraph/games/riddleschool/riddletransfer2/index.html
https://verdjs.github.io/seraph/games/driftboss/index.html
https://verdjs.github.io/seraph/games/fnf/index.html
https://verdjs.github.io/seraph/games/pacman/index.html
https://verdjs.github.io/seraph/games/papaspancakeria/index.html
https://verdjs.github.io/seraph/games/rooftop/index.html
https://verdjs.github.io/seraph/games/baldisbasics/index.html
https://verdjs.github.io/seraph/games/bobtherobber2/index.html
https://verdjs.github.io/seraph/games/minesweeper/index.html
https://verdjs.github.io/seraph/games/pokemonemerald/index.html
https://verdjs.github.io/seraph/games/pokemonfirered/index.html
https://verdjs.github.io/seraph/games/supermariobros/index.html
https://verdjs.github.io/seraph/games/supermariokart/index.html
https://verdjs.github.io/seraph/games/supermarioworld/index.html
https://verdjs.github.io/seraph/games/thereisnogame/index.html
https://verdjs.github.io/seraph/games/worldshardestgame/index.html
https://verdjs.github.io/seraph/games/castlevania/index.html
https://verdjs.github.io/seraph/games/donkeykong/index.html
https://verdjs.github.io/seraph/games/drmario/index.html
https://verdjs.github.io/seraph/games/metroid/index.html
https://verdjs.github.io/seraph/games/supermariobros2/index.html
https://verdjs.github.io/seraph/games/supermariobros3/index.html
https://verdjs.github.io/seraph/games/thelegendofzelda/index.html
https://verdjs.github.io/seraph/games/warioware/index.html
https://verdjs.github.io/seraph/games/yoshisisland/index.html
https://verdjs.github.io/seraph/games/donkeykongland/index.html
https://verdjs.github.io/seraph/games/kirbysdreamland/index.html
https://verdjs.github.io/seraph/games/supermarioland/index.html
https://verdjs.github.io/seraph/games/dogeminer/index.html
https://verdjs.github.io/seraph/games/tanukisunset/index.html
https://verdjs.github.io/seraph/games/aquaparkslides/index.html
https://verdjs.github.io/seraph/games/colorswitch/index.html
https://verdjs.github.io/seraph/games/papasfreezeria/index.html
https://verdjs.github.io/seraph/games/btd/btd/index.html
https://verdjs.github.io/seraph/games/btd/btd2/index.html
https://verdjs.github.io/seraph/games/btd/btd3/index.html
https://verdjs.github.io/seraph/games/btd/btd4/index.html
https://verdjs.github.io/seraph/games/bomberman/index.html
https://verdjs.github.io/seraph/games/fireemblem/index.html
https://verdjs.github.io/seraph/games/iceclimber/index.html
https://verdjs.github.io/seraph/games/mariokartsupercircuit/index.html
https://verdjs.github.io/seraph/games/pokemonleafgreen/index.html
https://verdjs.github.io/seraph/games/pokemonruby/index.html
https://verdjs.github.io/seraph/games/pokemonsapphire/index.html
https://verdjs.github.io/seraph/games/superstarsaga/index.html
https://verdjs.github.io/seraph/games/adofai/index.html
https://verdjs.github.io/seraph/games/supersmashflash/index.html
https://verdjs.github.io/seraph/games/supermeatboy/index.html
https://verdjs.github.io/seraph/games/stickmanhook/index.html
https://verdjs.github.io/seraph/games/defendthetank/index.html
https://verdjs.github.io/seraph/games/sortthecourt/index.html
https://verdjs.github.io/seraph/games/thisistheonlylevel/index.html
https://verdjs.github.io/seraph/games/run/index.html
https://verdjs.github.io/seraph/games/run2/index.html
https://verdjs.github.io/seraph/games/battleships/index.html
https://verdjs.github.io/seraph/games/breakingthebank/index.html
https://verdjs.github.io/seraph/games/ducklife/index.html
https://verdjs.github.io/seraph/games/ducklife2/index.html
https://verdjs.github.io/seraph/games/ducklife3/index.html
https://verdjs.github.io/seraph/games/linerider/index.html
https://verdjs.github.io/seraph/games/mariocombat/index.html
https://verdjs.github.io/seraph/games/raftwars2/index.html
https://verdjs.github.io/seraph/games/spaceinvaders/index.html
https://verdjs.github.io/seraph/games/animalcrossingwildworld/index.html
https://verdjs.github.io/seraph/games/mariokartds/index.html
https://verdjs.github.io/seraph/games/newsupermariobros/index.html
https://verdjs.github.io/seraph/games/nintendogs/index.html
https://verdjs.github.io/seraph/games/sm64ds/index.html
https://verdjs.github.io/seraph/games/gunmayhem/index.html
https://verdjs.github.io/seraph/games/learntofly/index.html
https://verdjs.github.io/seraph/games/rooftop2/index.html
https://verdjs.github.io/seraph/games/fireboywatergirl/index.html
https://verdjs.github.io/seraph/games/chibiknight/index.html
https://verdjs.github.io/seraph/games/clusterrush/index.html
https://verdjs.github.io/seraph/games/doodledefender/index.html
https://verdjs.github.io/seraph/games/learntofly2/index.html
https://verdjs.github.io/seraph/games/papasscooperia/index.html
https://verdjs.github.io/seraph/games/papassushiria/index.html
https://verdjs.github.io/seraph/games/papaswingeria/index.html
https://verdjs.github.io/seraph/games/raftwars/index.html
https://verdjs.github.io/seraph/games/unfairmario/index.html
https://verdjs.github.io/seraph/games/boxingphysics2/index.html
https://verdjs.github.io/seraph/games/aceattorney/index.html
https://verdjs.github.io/seraph/games/metalgearsolid/index.html
https://verdjs.github.io/seraph/games/mother3/index.html
https://verdjs.github.io/seraph/games/pokemondiamond/index.html
https://verdjs.github.io/seraph/games/pokemonplatinum/index.html
https://verdjs.github.io/seraph/games/pokemonsoulsilver/index.html
https://verdjs.github.io/seraph/games/advancewars/index.html
https://verdjs.github.io/seraph/games/banjopilot/index.html
https://verdjs.github.io/seraph/games/supermonkeyballjr/index.html
https://verdjs.github.io/seraph/games/theimpossiblequiz2/index.html
https://verdjs.github.io/seraph/games/papasdonuteria/index.html
https://verdjs.github.io/seraph/games/fancypantsadventure2/index.html
https://verdjs.github.io/seraph/games/tinyfishing/index.html
https://verdjs.github.io/seraph/games/bigredbutton/index.html
https://verdjs.github.io/seraph/games/achievementunlocked/index.html
https://verdjs.github.io/seraph/games/kirbymassattack/index.html
https://verdjs.github.io/seraph/games/sonicadvance/index.html
https://verdjs.github.io/seraph/games/wormsworldparty/index.html
https://verdjs.github.io/seraph/games/badicecream/index.html
https://verdjs.github.io/seraph/games/badicecream2/index.html
https://verdjs.github.io/seraph/games/badicecream3/index.html
https://verdjs.github.io/seraph/games/adventurecapitalist/index.html
https://verdjs.github.io/seraph/games/monkeymart/index.html
https://verdjs.github.io/seraph/games/doom64/index.html
https://verdjs.github.io/seraph/games/banjokazooie/index.html
https://verdjs.github.io/seraph/games/donkeykong64/index.html
https://verdjs.github.io/seraph/games/fzerox/index.html
https://verdjs.github.io/seraph/games/kirby64/index.html
https://verdjs.github.io/seraph/games/mariokart64/index.html
https://verdjs.github.io/seraph/games/marioparty/index.html
https://verdjs.github.io/seraph/games/marioparty2/index.html
https://verdjs.github.io/seraph/games/ocarinaoftime/index.html
https://verdjs.github.io/seraph/games/starfox64/index.html
https://verdjs.github.io/seraph/games/supersmashbros/index.html
https://verdjs.github.io/seraph/games/streetfighter2/index.html
https://verdjs.github.io/seraph/games/getawayshootout/index.html
https://verdjs.github.io/seraph/games/rabbitsamurai/index.html
https://verdjs.github.io/seraph/games/mariopartyds/index.html
https://verdjs.github.io/seraph/games/professorlayton/index.html
https://verdjs.github.io/seraph/games/scribblenauts/index.html
https://verdjs.github.io/seraph/games/advancewars2/index.html
https://verdjs.github.io/seraph/games/harvestmoon/index.html
https://verdjs.github.io/seraph/games/mariotennis/index.html
https://verdjs.github.io/seraph/games/megamanzero/index.html
https://verdjs.github.io/seraph/games/pokemonmysterydungeon/index.html
https://verdjs.github.io/seraph/games/pokemonunbound/index.html
https://verdjs.github.io/seraph/games/papascheeseria/index.html
https://verdjs.github.io/seraph/games/papascupcakeria/index.html
https://verdjs.github.io/seraph/games/papasbakeria/index.html
https://verdjs.github.io/seraph/games/papaspastaria/index.html
https://verdjs.github.io/seraph/games/gunmayhem2/index.html
https://verdjs.github.io/seraph/games/gunmayhemredux/index.html
https://verdjs.github.io/seraph/games/achievementunlocked2/index.html
https://verdjs.github.io/seraph/games/achievementunlocked3/index.html
https://verdjs.github.io/seraph/games/factoryballs/index.html
https://verdjs.github.io/seraph/games/skywire/index.html
https://verdjs.github.io/seraph/games/supermarioflash/index.html
https://verdjs.github.io/seraph/games/goldensun/index.html
https://verdjs.github.io/seraph/games/metroidfusion/index.html
https://verdjs.github.io/seraph/games/dbzsupersonicwarriors/index.html
https://verdjs.github.io/seraph/games/warioland4/index.html
https://verdjs.github.io/seraph/games/ducklife5/index.html
https://verdjs.github.io/seraph/games/learntofly3/index.html
https://verdjs.github.io/seraph/games/bloxors/index.html
https://verdjs.github.io/seraph/games/electricman2/index.html
https://verdjs.github.io/seraph/games/portal/index.html
https://verdjs.github.io/seraph/games/portal2/index.html
https://verdjs.github.io/seraph/games/skywire2/index.html
https://verdjs.github.io/seraph/games/ducklife6/index.html
https://verdjs.github.io/seraph/games/boxingrandom/index.html
https://verdjs.github.io/seraph/games/cellmachine/index.html
https://verdjs.github.io/seraph/games/stickmanboost/index.html
https://verdjs.github.io/seraph/games/vex3/index.html
https://verdjs.github.io/seraph/games/vex4/index.html
https://verdjs.github.io/seraph/games/skibidi1v100/index.html
https://verdjs.github.io/seraph/games/goldeneye007/index.html
https://verdjs.github.io/seraph/games/majorasmask/index.html
https://verdjs.github.io/seraph/games/papermario/index.html
https://verdjs.github.io/seraph/games/mariogolf/index.html
https://verdjs.github.io/seraph/games/pokemonstadium/index.html
https://verdjs.github.io/seraph/games/excitebike64/index.html
https://verdjs.github.io/seraph/games/pokemonsnap/index.html
https://verdjs.github.io/seraph/games/marioparty3/index.html
https://verdjs.github.io/seraph/games/sonicadvance2/index.html
https://verdjs.github.io/seraph/games/bowsersinsidestory/index.html
https://verdjs.github.io/seraph/games/spirittracks/index.html
https://verdjs.github.io/seraph/games/thesims2/index.html
https://verdjs.github.io/seraph/games/tetrisds/index.html
https://verdjs.github.io/seraph/games/sonicrush/index.html
https://verdjs.github.io/seraph/games/thesims3/index.html
https://verdjs.github.io/seraph/games/superprincesspeach/index.html
https://verdjs.github.io/seraph/games/legobatman/index.html
https://verdjs.github.io/seraph/games/doom2/index.html
https://verdjs.github.io/seraph/games/dukenukemadvance/index.html
https://verdjs.github.io/seraph/games/mariopartyadvance/index.html
https://verdjs.github.io/seraph/games/mariopinballland/index.html
https://verdjs.github.io/seraph/games/pacmanworld/index.html
https://verdjs.github.io/seraph/games/rayman3/index.html
https://verdjs.github.io/seraph/games/shrek2/index.html
https://verdjs.github.io/seraph/games/simcity/index.html
https://verdjs.github.io/seraph/games/simpsonsroadrage/index.html
https://verdjs.github.io/seraph/games/diddykongracing/index.html
https://verdjs.github.io/seraph/games/waverace64/index.html
https://verdjs.github.io/seraph/games/quest64/index.html
https://verdjs.github.io/seraph/games/gex64/index.html
https://verdjs.github.io/seraph/games/dukenukem64/index.html
https://verdjs.github.io/seraph/games/mortalkombat4/index.html
https://verdjs.github.io/seraph/games/badpiggies/index.html
https://verdjs.github.io/seraph/games/supermarioflash2/index.html
https://verdjs.github.io/seraph/games/swordsandsandals/index.html
https://verdjs.github.io/seraph/games/swordsandsandals2/index.html
https://verdjs.github.io/seraph/games/wordle/index.html
https://verdjs.github.io/seraph/games/vex/index.html
https://verdjs.github.io/seraph/games/vex2/index.html
https://verdjs.github.io/seraph/games/vex5/index.html
https://verdjs.github.io/seraph/games/vex7/index.html
https://verdjs.github.io/seraph/games/stack/index.html
https://verdjs.github.io/seraph/games/skibiditoiletattack/index.html
https://verdjs.github.io/seraph/games/motox3mpool/index.html
https://verdjs.github.io/seraph/games/offlineparadise/index.html
https://verdjs.github.io/seraph/games/linktothepast/index.html
https://verdjs.github.io/seraph/games/donkeykongcountry/index.html
https://verdjs.github.io/seraph/games/donkeykongcountry2/index.html
https://verdjs.github.io/seraph/games/superbomberman/index.html
https://verdjs.github.io/seraph/games/mariopaint/index.html
https://verdjs.github.io/seraph/games/megamanx/index.html
https://verdjs.github.io/seraph/games/supermariorpg/index.html
https://verdjs.github.io/seraph/games/supertennis/index.html
https://verdjs.github.io/seraph/games/warioswoods/index.html
https://verdjs.github.io/seraph/games/worldshardestgame2/index.html
https://verdjs.github.io/seraph/games/bubbletanks2/index.html
https://verdjs.github.io/seraph/games/chooseyourweapon/index.html
https://verdjs.github.io/seraph/games/chooseyourweapon2/index.html
https://verdjs.github.io/seraph/games/chooseyourweapon3/index.html
https://verdjs.github.io/seraph/games/connect4/index.html
https://verdjs.github.io/seraph/games/electricbox/index.html
https://verdjs.github.io/seraph/games/mctowerdefence2/index.html
https://verdjs.github.io/seraph/games/cars2/index.html
https://verdjs.github.io/seraph/games/cookingmama/index.html
https://verdjs.github.io/seraph/games/adventuretime/index.html
https://verdjs.github.io/seraph/games/garfieldgetsreal/index.html
https://verdjs.github.io/seraph/games/wariowaretouched/index.html
https://verdjs.github.io/seraph/games/kirbypowerpaintbrush/index.html
https://verdjs.github.io/seraph/games/sonicandknuckles/index.html
https://verdjs.github.io/seraph/games/alteredbeast/index.html
https://verdjs.github.io/seraph/games/sonicspinball/index.html
https://verdjs.github.io/seraph/games/sonicthehedgehog3/index.html
https://verdjs.github.io/seraph/games/streetsofrage/index.html
https://verdjs.github.io/seraph/games/goldenaxe/index.html
https://verdjs.github.io/seraph/games/kirbyamazingmirror/index.html
https://verdjs.github.io/seraph/games/championisland/index.html
https://verdjs.github.io/seraph/games/supermarioconstruct/index.html
https://verdjs.github.io/seraph/games/clickerheroes/index.html
https://verdjs.github.io/seraph/games/stairrace3d/index.html
https://verdjs.github.io/seraph/games/slope2/index.html
https://verdjs.github.io/seraph/games/paperio3d/index.html
https://verdjs.github.io/seraph/games/motox3mspooky/index.html
https://verdjs.github.io/seraph/games/motox3mwinter/index.html
https://verdjs.github.io/seraph/games/snake/index.html
https://verdjs.github.io/seraph/games/papastacomia/index.html
https://verdjs.github.io/seraph/games/ovo/index.html
https://verdjs.github.io/seraph/games/knifehit/index.html
https://verdjs.github.io/seraph/games/cubefield/index.html
https://verdjs.github.io/seraph/games/burgerandfrights/index.html
https://verdjs.github.io/seraph/games/chess/index.html
https://verdjs.github.io/seraph/games/fnfmidfight/index.html
https://verdjs.github.io/seraph/games/thumbfighter/index.html
https://verdjs.github.io/seraph/games/snowbattleio/index.html
https://verdjs.github.io/seraph/games/lazyjump3d/index.html
https://verdjs.github.io/seraph/games/goball/index.html
https://verdjs.github.io/seraph/games/flippyfish/index.html
https://verdjs.github.io/seraph/games/shopempire/index.html
https://verdjs.github.io/seraph/games/monsterbrawl/index.html
https://verdjs.github.io/seraph/games/multitask/index.html
https://verdjs.github.io/seraph/games/shift/index.html
https://verdjs.github.io/seraph/games/shift2/index.html
https://verdjs.github.io/seraph/games/shift3/index.html
https://verdjs.github.io/seraph/games/shift4/index.html
https://verdjs.github.io/seraph/games/monopoly/index.html
https://verdjs.github.io/seraph/games/picrossds/index.html
https://verdjs.github.io/seraph/games/wariowarediy/index.html
https://verdjs.github.io/seraph/games/pizzatower/index.html
https://verdjs.github.io/seraph/games/territorialio/index.html
https://verdjs.github.io/seraph/games/1v1lol/index.html
https://verdjs.github.io/seraph/games/ballisticchickens/index.html
https://verdjs.github.io/seraph/games/basketbrosio/index.html
https://verdjs.github.io/seraph/games/mcclassic/index.html
https://verdjs.github.io/seraph/games/deathrun3d/index.html
https://verdjs.github.io/seraph/games/soccerrandom/index.html
https://verdjs.github.io/seraph/games/sprinter/index.html
https://verdjs.github.io/seraph/games/tron/index.html
https://verdjs.github.io/seraph/games/1on1soccer/index.html
https://verdjs.github.io/seraph/games/badtimesimulator/index.html
https://verdjs.github.io/seraph/games/amazingropepolice/index.html
https://verdjs.github.io/seraph/games/celeste/index.html
https://verdjs.github.io/seraph/games/justfalllol/index.html
https://verdjs.github.io/seraph/games/ngon/index.html
https://verdjs.github.io/seraph/games/rocketsoccer/index.html
https://verdjs.github.io/seraph/games/stickmanclimb/index.html
https://verdjs.github.io/seraph/games/osumania/index.html
https://verdjs.github.io/seraph/games/helixjump/index.html
https://verdjs.github.io/seraph/games/dadish/index.html
https://verdjs.github.io/seraph/games/dadish2/index.html
https://verdjs.github.io/seraph/games/dadish3/index.html
https://verdjs.github.io/seraph/games/snowrider3d/index.html
https://verdjs.github.io/seraph/games/tubejumpers/index.html
https://verdjs.github.io/seraph/games/yohoho/index.html
https://verdjs.github.io/seraph/games/10minutestilldawn/index.html
https://verdjs.github.io/seraph/games/volleyrandom/index.html
https://verdjs.github.io/seraph/games/waterworks/index.html
https://verdjs.github.io/seraph/games/geometryrash/index.html
https://verdjs.github.io/seraph/games/holeio/index.html
https://verdjs.github.io/seraph/games/sandtrix/index.html
https://verdjs.github.io/seraph/games/shapeshipper/index.html
https://verdjs.github.io/seraph/games/slopeball/index.html
https://verdjs.github.io/seraph/games/stickmangolf/index.html
https://verdjs.github.io/seraph/games/tabs/index.html
https://verdjs.github.io/seraph/games/watermelongame/index.html
https://verdjs.github.io/seraph/games/wallsmash/index.html
https://verdjs.github.io/seraph/games/crimsonfantasia/index.html
https://verdjs.github.io/seraph/games/cuttherope/index.html
https://verdjs.github.io/seraph/games/funnymadracing/index.html
https://verdjs.github.io/seraph/games/gdlite/index.html
https://verdjs.github.io/seraph/games/grandtheftgrotto/index.html
https://verdjs.github.io/seraph/games/driftmania/index.html
https://verdjs.github.io/seraph/games/risehigher/index.html
https://verdjs.github.io/seraph/games/burritobison/index.html
https://verdjs.github.io/seraph/games/pool/index.html
https://verdjs.github.io/seraph/games/redball1/index.html
https://verdjs.github.io/seraph/games/redball3/index.html
https://verdjs.github.io/seraph/games/redball4/index.html
https://verdjs.github.io/seraph/games/redballv2/index.html
https://verdjs.github.io/seraph/games/redballv3/index.html
https://verdjs.github.io/seraph/games/roughdino/index.html
https://verdjs.github.io/seraph/games/timeshooter1/index.html
https://verdjs.github.io/seraph/games/timeshooter2/index.html
https://verdjs.github.io/seraph/games/timeshooter3/index.html
https://verdjs.github.io/seraph/games/battletoads/index.html
https://verdjs.github.io/seraph/games/castlevaniaiii/index.html
https://verdjs.github.io/seraph/games/contra/index.html
https://verdjs.github.io/seraph/games/ducktales/index.html
https://verdjs.github.io/seraph/games/kidicarus/index.html
https://verdjs.github.io/seraph/games/megaman2/index.html
https://verdjs.github.io/seraph/games/ninjagaiden/index.html
https://verdjs.github.io/seraph/games/punchout/index.html
https://verdjs.github.io/seraph/games/chronotrigger/index.html
https://verdjs.github.io/seraph/games/contraiii/index.html
https://verdjs.github.io/seraph/games/donkeykongcountry3/index.html
https://verdjs.github.io/seraph/games/earthbound/index.html
https://verdjs.github.io/seraph/games/finalfantasyvi/index.html
https://verdjs.github.io/seraph/games/fzero/index.html
https://verdjs.github.io/seraph/games/supermetroid/index.html
https://verdjs.github.io/seraph/games/banjotooie/index.html
https://verdjs.github.io/seraph/games/harvestmoon64/index.html
https://verdjs.github.io/seraph/games/jetforcegemini/index.html
https://verdjs.github.io/seraph/games/mysticalninja/index.html
https://verdjs.github.io/seraph/games/turokdinosaurhunter/index.html
https://verdjs.github.io/seraph/games/yoshisstory/index.html
https://verdjs.github.io/seraph/games/kirbysdreamland2/index.html
https://verdjs.github.io/seraph/games/linksawakeningdx/index.html
https://verdjs.github.io/seraph/games/metroidii/index.html
https://verdjs.github.io/seraph/games/supermarioland2/index.html
https://verdjs.github.io/seraph/games/wariolandii/index.html
https://verdjs.github.io/seraph/games/castlevaniaariaofsorrow/index.html
https://verdjs.github.io/seraph/games/finalfantasytacticsadvance/index.html
https://verdjs.github.io/seraph/games/drilldozer/index.html
https://verdjs.github.io/seraph/games/advancewarsdayofruin/index.html
https://verdjs.github.io/seraph/games/castlevaniadawnofsorrow/index.html
https://verdjs.github.io/seraph/games/castlevaniaorderofecclesia/index.html
https://verdjs.github.io/seraph/games/marioandluigipartnersintime/index.html
https://verdjs.github.io/seraph/games/comixzone/index.html
https://verdjs.github.io/seraph/games/eccothedolphin/index.html
https://verdjs.github.io/seraph/games/gunstarheroes/index.html
https://verdjs.github.io/seraph/games/phantasystariv/index.html
https://verdjs.github.io/seraph/games/rangerx/index.html
https://verdjs.github.io/seraph/games/ristar/index.html
https://verdjs.github.io/seraph/games/shiningforce/index.html
https://verdjs.github.io/seraph/games/shinobiiii/index.html
https://verdjs.github.io/seraph/games/sonicthehedgehog/index.html
https://verdjs.github.io/seraph/games/sonicthehedgehog2/index.html
https://verdjs.github.io/seraph/games/streetsofrage2/index.html
https://verdjs.github.io/seraph/games/vectorman/index.html
https://verdjs.github.io/seraph/games/vectorman2/index.html
https://verdjs.github.io/seraph/games/illusionofgaia/index.html
https://verdjs.github.io/seraph/games/pokemonyellow/index.html
https://verdjs.github.io/seraph/games/abudathealien/index.html
https://verdjs.github.io/seraph/games/battlebeavers/index.html
https://verdjs.github.io/seraph/games/controlcraft2/index.html
https://verdjs.github.io/seraph/games/ageofwar/index.html
https://verdjs.github.io/seraph/games/ageofwar2/index.html
https://verdjs.github.io/seraph/games/amorphous/index.html
https://verdjs.github.io/seraph/games/bubblespinner/index.html
https://verdjs.github.io/seraph/games/crushthecastle/index.html
https://verdjs.github.io/seraph/games/crushthecastle2/index.html
https://verdjs.github.io/seraph/games/epicbattlefantasy/index.html
https://verdjs.github.io/seraph/games/epicbattlefantasy2/index.html
https://verdjs.github.io/seraph/games/epicbattlefantasy3/index.html
https://verdjs.github.io/seraph/games/fancypantsadventure3/index.html
https://verdjs.github.io/seraph/games/floodrunner2/index.html
https://verdjs.github.io/seraph/games/floodrunner3/index.html
https://verdjs.github.io/seraph/games/dragonboy2/index.html
https://verdjs.github.io/seraph/games/neonrider/index.html
https://verdjs.github.io/seraph/games/pandemic2/index.html
https://verdjs.github.io/seraph/games/stickwar/index.html
https://verdjs.github.io/seraph/games/stickwar2/index.html
https://verdjs.github.io/seraph/games/ultimateflashsonic/index.html
https://verdjs.github.io/seraph/games/zombocalypse/index.html
https://verdjs.github.io/seraph/games/zombotron/index.html
https://verdjs.github.io/seraph/games/zombotron2/index.html
https://verdjs.github.io/seraph/games/backrooms2d/index.html
https://verdjs.github.io/seraph/games/basketrandom/index.html
https://verdjs.github.io/seraph/games/csgoclicker/index.html
https://verdjs.github.io/seraph/games/doom/index.html
https://verdjs.github.io/seraph/games/funnyshooter2/index.html
https://verdjs.github.io/seraph/games/gunfest/index.html
https://verdjs.github.io/seraph/games/infinitecraft/index.html
https://verdjs.github.io/seraph/games/lowsadventures2/index.html
https://verdjs.github.io/seraph/games/pakohighway/index.html
https://verdjs.github.io/seraph/games/recoil/index.html
https://verdjs.github.io/seraph/games/run3plus/index.html
https://verdjs.github.io/seraph/games/slopecity/index.html
https://verdjs.github.io/seraph/games/stateio/index.html
https://verdjs.github.io/seraph/games/sudoku/index.html
https://verdjs.github.io/seraph/games/superherodrop/index.html
https://verdjs.github.io/seraph/games/balloonrun/index.html
https://verdjs.github.io/seraph/games/crazytunnel3d/index.html
https://verdjs.github.io/seraph/games/eagler1.8/index.html
https://verdjs.github.io/seraph/games/geometrydashsky/index.html
https://verdjs.github.io/seraph/games/wubzzysamazingadventure/index.html
https://verdjs.github.io/seraph/games/golddiggerfrvr/index.html
https://verdjs.github.io/seraph/games/hexgl/index.html
https://verdjs.github.io/seraph/games/houseofhazards/index.html
https://verdjs.github.io/seraph/games/pickcrafter/index.html
https://verdjs.github.io/seraph/games/precisionclient/index.html
https://verdjs.github.io/seraph/games/subwayrunner/index.html
https://verdjs.github.io/seraph/games/xx142-b2.exe/index.html
https://verdjs.github.io/seraph/games/canopy/index.html
https://verdjs.github.io/seraph/games/cavechaos/index.html
https://verdjs.github.io/seraph/games/changetype/index.html
https://verdjs.github.io/seraph/games/cheesedreams/index.html
https://verdjs.github.io/seraph/games/chisel/index.html
https://verdjs.github.io/seraph/games/chisel2/index.html
https://verdjs.github.io/seraph/games/ditto/index.html
https://verdjs.github.io/seraph/games/feedme/index.html
https://verdjs.github.io/seraph/games/finalninja/index.html
https://verdjs.github.io/seraph/games/frostbite/index.html
https://verdjs.github.io/seraph/games/frostbite2/index.html
https://verdjs.github.io/seraph/games/icebreaker/index.html
https://verdjs.github.io/seraph/games/mutiny/index.html
https://verdjs.github.io/seraph/games/nitromemustdie/index.html
https://verdjs.github.io/seraph/games/oodlegobs/index.html
https://verdjs.github.io/seraph/games/supertreadmill/index.html
https://verdjs.github.io/seraph/games/swindler/index.html
https://verdjs.github.io/seraph/games/testsubjectarena/index.html
https://verdjs.github.io/seraph/games/testsubjectcomplete/index.html
https://verdjs.github.io/seraph/games/twinshot/index.html
https://verdjs.github.io/seraph/games/twinshot2/index.html
https://verdjs.github.io/seraph/games/3line/index.html
https://verdjs.github.io/seraph/games/bikechamp/index.html
https://verdjs.github.io/seraph/games/bikechamp2/index.html
https://verdjs.github.io/seraph/games/corporationinc/index.html
https://verdjs.github.io/seraph/games/shopempirefable/index.html
https://verdjs.github.io/seraph/games/cactusmccoy/index.html
https://verdjs.github.io/seraph/games/cactusmccoy2/index.html
https://verdjs.github.io/seraph/games/papalouie/index.html
https://verdjs.github.io/seraph/games/papalouie2/index.html
https://verdjs.github.io/seraph/games/papalouie3/index.html
https://verdjs.github.io/seraph/games/steakandjake/index.html
https://verdjs.github.io/seraph/games/steakandjakemidnightmarch/index.html`.trim().split('\n');

// Function to convert game slug to display name
function formatGameName(slug) {
    // Handle special cases
    const specialNames = {
        'sm64': 'Super Mario 64',
        'mc': 'Minecraft',
        'fnaf': 'Five Nights at Freddy\'s',
        'fnaf-2': 'Five Nights at Freddy\'s 2',
        'fnaf-3': 'Five Nights at Freddy\'s 3',
        'fnaf-4': 'Five Nights at Freddy\'s 4',
        'fnf': 'Friday Night Funkin\'',
        'btd': 'Bloons TD',
        'btd2': 'Bloons TD 2',
        'btd3': 'Bloons TD 3',
        'btd4': 'Bloons TD 4',
        'adofai': 'A Dance of Fire and Ice',
        'sm64ds': 'Super Mario 64 DS',
        'gdlite': 'Geometry Dash Lite',
        '2048': '2048',
        '1v1lol': '1v1.LoL',
        '1on1soccer': '1v1 Soccer',
        '3line': '3 Line',
        'ocarinaoftime': 'Ocarina of Time',
        'linktothepast': 'A Link to the Past',
        'linksawakeningdx': 'Link\'s Awakening DX',
        'dbzsupersonicwarriors': 'DBZ Supersonic Warriors',
        'eagler1.8': 'Eaglercraft 1.8',
        'xx142-b2.exe': 'xx142-b2.exe',
        'paperio2': 'Paper.io 2',
        'paperio3d': 'Paper.io 3D',
        'riddleschool1': 'Riddle School 1',
        'riddleschool2': 'Riddle School 2',
        'riddleschool3': 'Riddle School 3',
        'riddleschool4': 'Riddle School 4',
        'riddleschool5': 'Riddle School 5',
        'riddletransfer': 'Riddle Transfer',
        'riddletransfer2': 'Riddle Transfer 2',
        'motox3m': 'Moto X3M',
        'motox3mpool': 'Moto X3M Pool Party',
        'motox3mspooky': 'Moto X3M Spooky',
        'motox3mwinter': 'Moto X3M Winter',
    };

    if (specialNames[slug]) return specialNames[slug];

    // General formatting: split camelCase, capitalize words
    return slug
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([0-9]+)/g, ' $1 ')
        .split(/[\s-_]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Parse URLs and create game entries
const games = gameUrls.map((url, index) => {
    // Extract game name from URL
    const match = url.match(/\/games\/(.+?)\/index\.html/);
    if (!match) return null;

    let gamePath = match[1];
    let slug = gamePath.split('/').pop(); // Get last part for nested paths

    return {
        name: formatGameName(slug),
        img: `/assets/img/games/seraph/${slug}.png`,
        url: url,
        embed: true // Mark as external embed (no proxy needed)
    };
}).filter(Boolean);

// Write the JSON file
const outputPath = path.join(__dirname, '..', 'assets', 'json', 'seraph.json');
fs.writeFileSync(outputPath, JSON.stringify(games, null, 2));

console.log(`Generated ${games.length} game entries`);
console.log(`Output written to: ${outputPath}`);

// Also output list of image files needed
const imagesNeeded = games.map(g => g.img.split('/').pop());
console.log('\nImage files needed:');
console.log(imagesNeeded.slice(0, 10).join(', ') + '...');
