import { LevelData } from './types';

export const LEVELS: LevelData[] = [
  // -------------------------------------------------------------
  // LEVEL 1: A Leydeni Palackok Csarnoka (Hall of Leyden Jars)
  // -------------------------------------------------------------
  {
    id: 1,
    title: 'A Leydeni Palackok Csarnoka',
    subtitle: '1. Pálya: Bevezetés a statikus töltésekbe',
    description: 'Tanuld meg a mozgást, a magasugrást és a dashelést! Használd az aranylemezes elektroszkópot rugóként a magasabb platformok eléréséhez, és vigyázz a szikrázó Coulomb őrökkel!',
    apparatusFeatured: ['leyden_jar', 'electroscope', 'faraday_cage'],
    width: 1400,
    height: 600,
    playerSpawn: { x: 50, y: 480 },
    goal: { x: 1300, y: 340, width: 36, height: 48 },
    checkpoints: [
      { x: 580, y: 440 }
    ],
    platforms: [
      // Main Ground floor
      { x: 0, y: 520, width: 320, height: 80, type: 'solid' },
      // Pit gap between 320 and 420 (hazard floor)
      { x: 320, y: 580, width: 100, height: 20, type: 'hazard_spark' },
      { x: 420, y: 520, width: 450, height: 80, type: 'solid' },
      // Second pit gap between 870 and 970
      { x: 870, y: 580, width: 100, height: 20, type: 'hazard_spark' },
      { x: 970, y: 520, width: 430, height: 80, type: 'solid' },

      // Raised platforms & ledges
      { x: 140, y: 420, width: 80, height: 16, type: 'solid' },
      { x: 250, y: 350, width: 70, height: 16, type: 'one_way' },
      
      // Moving platform over first spark pit
      { 
        x: 340, y: 420, width: 60, height: 16, type: 'solid',
        moving: { dx: 60, dy: 0, speed: 1.2, range: 60, progress: 0 }
      },

      // Mid-stage obstacle tower
      { x: 520, y: 440, width: 90, height: 16, type: 'solid' },
      { x: 670, y: 380, width: 80, height: 16, type: 'solid' },
      { x: 780, y: 310, width: 90, height: 16, type: 'one_way' },

      // High dash-challenge catwalks
      { x: 920, y: 360, width: 70, height: 16, type: 'solid' },
      { x: 1040, y: 390, width: 90, height: 16, type: 'solid' },
      { x: 1180, y: 390, width: 160, height: 16, type: 'solid' },

      // Wall boundaries
      { x: -20, y: 0, width: 20, height: 600, type: 'solid' },
      { x: 1400, y: 0, width: 20, height: 600, type: 'solid' }
    ],
    apparatuses: [
      // 1. Leyden Jar at spawn
      {
        id: 'leyden_spawn',
        type: 'leyden_jar',
        x: 180,
        y: 480,
        width: 24,
        height: 40,
        active: true,
        charge: 1.0,
        infoTitle: 'Leydeni palack (1745)',
        infoDesc: 'Az első elektromos kondenzátor. Ónlemezekkel bevont üvegedény, amely képes nagy mennyiségű elektrosztatikus töltést hosszú ideig tárolni.'
      },
      // 2. Gold-Leaf Electroscope (Acts as bounce spring!)
      {
        id: 'scope_mid',
        type: 'electroscope',
        x: 480,
        y: 484,
        width: 26,
        height: 36,
        active: true,
        charge: 0.8,
        infoTitle: 'Aranylemezes elektroszkóp (1787)',
        infoDesc: 'Abraham Bennet találmánya. Amikor elektromos töltés éri a fémlemezt, a vékony aranylevelek az azonos töltések taszítása miatt szétnyílnak.'
      },
      // 3. Faraday Cage checkpoint
      {
        id: 'cage_mid',
        type: 'faraday_cage',
        x: 580,
        y: 440,
        width: 44,
        height: 80,
        active: true,
        charge: 0,
        infoTitle: 'Faraday-kalitka (1836)',
        infoDesc: 'Fém hálóból készült zárt tér, amelynek belsejébe a külső elektrosztatikus térerő nem képes behatolni. Megóv a lövedékektől és villámoktól!'
      },
      // 4. Secondary Leyden Jar on high catwalk
      {
        id: 'leyden_high',
        type: 'leyden_jar',
        x: 810,
        y: 270,
        width: 24,
        height: 40,
        active: true,
        charge: 1.0,
        infoTitle: 'Nagyfeszültségű Leyden-tömb',
        infoDesc: 'Több Leydeni palack párhuzamosan kapcsolva hatalmas szikrakisülést tud előidézni.'
      }
    ],
    enemies: [
      // Ground sentry 1 (patrols between x: 620 and 800)
      {
        id: 'e_sentry_1',
        type: 'sentry',
        x: 650,
        y: 494,
        vx: 1.0,
        vy: 0,
        width: 26,
        height: 26,
        minX: 620,
        maxX: 820,
        health: 2,
        maxHealth: 2,
        shootCooldown: 90,
        shootInterval: 120,
        facing: 'left',
        isAlive: true,
        animTimer: 0
      },
      // Ground sentry 2 guarding the exit
      {
        id: 'e_sentry_2',
        type: 'sentry',
        x: 1080,
        y: 494,
        vx: 1.2,
        vy: 0,
        width: 26,
        height: 26,
        minX: 1020,
        maxX: 1220,
        health: 2,
        maxHealth: 2,
        shootCooldown: 60,
        shootInterval: 100,
        facing: 'left',
        isAlive: true,
        animTimer: 0
      }
    ],
    collectibles: [
      { id: 'c1', x: 170, y: 380, type: 'coulomb_charge', collected: false, pulseTimer: 0 },
      { id: 'c2', x: 280, y: 310, type: 'leyden_shard', collected: false, pulseTimer: 0 },
      { id: 'c3', x: 370, y: 380, type: 'coulomb_charge', collected: false, pulseTimer: 0 },
      { id: 'c4', x: 700, y: 340, type: 'health_spark', collected: false, pulseTimer: 0 },
      { id: 'c5', x: 820, y: 240, type: 'leyden_shard', collected: false, pulseTimer: 0 },
      { id: 'c6', x: 950, y: 320, type: 'coulomb_charge', collected: false, pulseTimer: 0 },
      { id: 'c7', x: 1240, y: 350, type: 'coulomb_charge', collected: false, pulseTimer: 0 }
    ]
  },

  // -------------------------------------------------------------
  // LEVEL 2: A Van de Graaff Torony (Van de Graaff Tower)
  // -------------------------------------------------------------
  {
    id: 2,
    title: 'A Van de Graaff Torony',
    subtitle: '2. Pálya: Elektrosztatikus taszítás és lebegés',
    description: 'A hatalmas Van de Graaff generátor gömbje azonos polaritás esetén felrepít a levegőbe! Válts polaritást (E / C gomb), használd a dasht a levegőben, és kerüld el a repülő szikradrónokat!',
    apparatusFeatured: ['van_de_graaff', 'electroscope', 'faraday_cage'],
    width: 1600,
    height: 700,
    playerSpawn: { x: 60, y: 580 },
    goal: { x: 1520, y: 220, width: 36, height: 48 },
    checkpoints: [
      { x: 720, y: 460 }
    ],
    platforms: [
      // Starting base
      { x: 0, y: 620, width: 320, height: 80, type: 'solid' },
      
      // Van de Graaff super-bounce platform
      { x: 320, y: 640, width: 90, height: 60, type: 'repel_pos' },
      
      // High ledges reached by electrostatic repulsion
      { x: 340, y: 360, width: 110, height: 16, type: 'solid' },
      { x: 220, y: 280, width: 90, height: 16, type: 'one_way' },
      { x: 90, y: 200, width: 100, height: 16, type: 'solid' },

      // Mid transition bridge
      { 
        x: 480, y: 420, width: 70, height: 16, type: 'solid',
        moving: { dx: 80, dy: 0, speed: 1.5, range: 80, progress: 0 }
      },
      { x: 680, y: 520, width: 220, height: 180, type: 'solid' },

      // Second section - alternating polarity plates
      { x: 940, y: 520, width: 80, height: 20, type: 'hazard_spark' },
      { x: 1040, y: 500, width: 80, height: 20, type: 'repel_pos' },
      { x: 1160, y: 420, width: 80, height: 20, type: 'repel_neg' },

      // High cat-walks towards the dome
      { x: 1280, y: 340, width: 100, height: 16, type: 'solid' },
      { 
        x: 1400, y: 280, width: 60, height: 16, type: 'solid',
        moving: { dx: 0, dy: 60, speed: 1.2, range: 60, progress: 0 }
      },
      { x: 1480, y: 270, width: 120, height: 430, type: 'solid' },

      // Floor hazard between sections
      { x: 680, y: 680, width: 800, height: 20, type: 'hazard_spark' },

      // Bounds
      { x: -20, y: 0, width: 20, height: 700, type: 'solid' },
      { x: 1600, y: 0, width: 20, height: 700, type: 'solid' }
    ],
    apparatuses: [
      // Giant Van de Graaff Generator 1 at bottom
      {
        id: 'vdg_1',
        type: 'van_de_graaff',
        x: 340,
        y: 530,
        width: 38,
        height: 90,
        polarity: 'positive',
        active: true,
        charge: 1.0,
        infoTitle: 'Van de Graaff-generátor (1929)',
        infoDesc: 'Robert Van de Graaff találmánya. Mozgó szigetelő gumiszalaggal visz fel elektromos töltést a fém gömbkupola belső felületére, milliós nagyságrendű feszültséget létrehozva!'
      },
      // Checkpoint Faraday Cage
      {
        id: 'cage_2',
        type: 'faraday_cage',
        x: 720,
        y: 440,
        width: 44,
        height: 80,
        active: true,
        charge: 0,
        infoTitle: 'Faraday-kalitka Védőkörlet',
        infoDesc: 'A fémháló eloszlatja a felületi töltéseket, így belsejében a térerő zérus (E = 0).'
      },
      // Second Van de Graaff high up
      {
        id: 'vdg_2',
        type: 'van_de_graaff',
        x: 1060,
        y: 410,
        width: 38,
        height: 90,
        polarity: 'positive',
        active: true,
        charge: 1.0,
        infoTitle: 'Nagyfeszültségű Repulziós Gömb',
        infoDesc: 'Azonos polaritású töltésnél erős elektrosztatikus taszítóerő (Coulomb-erő) keletkezik!'
      },
      // Gold-leaf electroscope on secret ledge
      {
        id: 'scope_secret',
        type: 'electroscope',
        x: 120,
        y: 164,
        width: 26,
        height: 36,
        active: true,
        charge: 0.9,
        infoTitle: 'Precíziós Elektroszkóp',
        infoDesc: 'Minél nagyobb a hordozott töltés, annál jobban kitérnek a szétváló aranylemezkék.'
      }
    ],
    enemies: [
      // Flying Drone patrolling upper air
      {
        id: 'drone_1',
        type: 'flying_drone',
        x: 480,
        y: 280,
        vx: 1.4,
        vy: 0.8,
        startY: 280,
        minX: 420,
        maxX: 660,
        width: 24,
        height: 24,
        health: 2,
        maxHealth: 2,
        shootCooldown: 80,
        shootInterval: 110,
        facing: 'left',
        isAlive: true,
        animTimer: 0
      },
      // Ground sentry on mid block
      {
        id: 'sentry_mid',
        type: 'sentry',
        x: 760,
        y: 494,
        vx: 1.2,
        vy: 0,
        minX: 700,
        maxX: 880,
        width: 26,
        height: 26,
        health: 2,
        maxHealth: 2,
        shootCooldown: 70,
        shootInterval: 110,
        facing: 'left',
        isAlive: true,
        animTimer: 0
      },
      // Flying Drone 2 near the exit
      {
        id: 'drone_2',
        type: 'flying_drone',
        x: 1320,
        y: 240,
        vx: 1.5,
        vy: 0.5,
        startY: 240,
        minX: 1250,
        maxX: 1450,
        width: 24,
        height: 24,
        health: 2,
        maxHealth: 2,
        shootCooldown: 60,
        shootInterval: 95,
        facing: 'left',
        isAlive: true,
        animTimer: 0
      }
    ],
    collectibles: [
      { id: 'c2_1', x: 180, y: 560, type: 'coulomb_charge', collected: false, pulseTimer: 0 },
      { id: 'c2_2', x: 380, y: 290, type: 'leyden_shard', collected: false, pulseTimer: 0 },
      { id: 'c2_3', x: 140, y: 150, type: 'health_spark', collected: false, pulseTimer: 0 },
      { id: 'c2_4', x: 520, y: 370, type: 'coulomb_charge', collected: false, pulseTimer: 0 },
      { id: 'c2_5', x: 800, y: 470, type: 'coulomb_charge', collected: false, pulseTimer: 0 },
      { id: 'c2_6', x: 1180, y: 380, type: 'leyden_shard', collected: false, pulseTimer: 0 },
      { id: 'c2_7', x: 1430, y: 220, type: 'coulomb_charge', collected: false, pulseTimer: 0 }
    ]
  },

  // -------------------------------------------------------------
  // LEVEL 3: Wimshurst Generátor Labirintus (Wimshurst Machine Maze)
  // -------------------------------------------------------------
  {
    id: 3,
    title: 'Wimshurst Generátor Labirintus',
    subtitle: '3. Pálya: Szikrakisülések és nagy sebességű dash',
    description: 'A forgó Wimshurst gépek ritmikus nagyfeszültségű szikrákat lőnek ki az elektródáik között! Időzítsd a dasht, hogy sértetlenül átjuss a szikraközökön, miközben a mennyezeti ágyúk tűz alatt tartanak!',
    apparatusFeatured: ['wimshurst', 'leyden_jar', 'faraday_cage'],
    width: 1700,
    height: 650,
    playerSpawn: { x: 60, y: 520 },
    goal: { x: 1620, y: 320, width: 36, height: 48 },
    checkpoints: [
      { x: 860, y: 400 }
    ],
    platforms: [
      // Starting hall
      { x: 0, y: 560, width: 280, height: 90, type: 'solid' },

      // Spark Gap 1 over hazard
      { x: 280, y: 620, width: 140, height: 30, type: 'hazard_spark' },
      { x: 420, y: 540, width: 180, height: 110, type: 'solid' },

      // Upper maze catwalks
      { x: 240, y: 430, width: 90, height: 16, type: 'solid' },
      { x: 380, y: 360, width: 100, height: 16, type: 'one_way' },
      { x: 530, y: 320, width: 90, height: 16, type: 'solid' },

      // Moving spark platform
      { 
        x: 660, y: 340, width: 70, height: 16, type: 'solid',
        moving: { dx: 90, dy: 0, speed: 1.6, range: 90, progress: 0 }
      },

      // Mid checkpoint terrace
      { x: 820, y: 480, width: 160, height: 170, type: 'solid' },

      // Spark gap hazard pit 2
      { x: 980, y: 620, width: 160, height: 30, type: 'hazard_spark' },

      // Stepping stones with polarity repellers
      { x: 1000, y: 460, width: 60, height: 16, type: 'repel_neg' },
      { x: 1120, y: 410, width: 70, height: 16, type: 'repel_pos' },
      { x: 1250, y: 370, width: 90, height: 16, type: 'solid' },

      // Final gauntlet leading to goal
      { 
        x: 1390, y: 420, width: 60, height: 16, type: 'solid',
        moving: { dx: 0, dy: 70, speed: 1.4, range: 70, progress: 0 }
      },
      { x: 1500, y: 370, width: 200, height: 280, type: 'solid' },

      // Ceilings & turrets mounts
      { x: 360, y: 0, width: 80, height: 40, type: 'solid' },
      { x: 880, y: 0, width: 90, height: 40, type: 'solid' },
      { x: 1280, y: 0, width: 90, height: 40, type: 'solid' },

      // Bounds
      { x: -20, y: 0, width: 20, height: 650, type: 'solid' },
      { x: 1700, y: 0, width: 20, height: 650, type: 'solid' }
    ],
    apparatuses: [
      // Wimshurst Machine 1 (Early obstacle)
      {
        id: 'wimshurst_1',
        type: 'wimshurst',
        x: 480,
        y: 494,
        width: 36,
        height: 46,
        active: true,
        charge: 1.0,
        infoTitle: 'Wimshurst-gép (1883)',
        infoDesc: 'James Wimshurst elektrosztatikus befolyásológépe. Két ellentétes irányban forgó szigetelőtárcsa és fém szektorok segítségével folyamatosan nagyfeszültségű szikrákat generál.'
      },
      // Checkpoint Faraday Cage
      {
        id: 'cage_3',
        type: 'faraday_cage',
        x: 860,
        y: 400,
        width: 44,
        height: 80,
        active: true,
        charge: 0,
        infoTitle: 'Faraday Menedék',
        infoDesc: 'A villámcsapások és külső szikrák a külső burkolaton folynak le a földelésbe.'
      },
      // Second Wimshurst Machine (Active high-voltage hazard)
      {
        id: 'wimshurst_2',
        type: 'wimshurst',
        x: 1270,
        y: 324,
        width: 36,
        height: 46,
        active: true,
        charge: 1.0,
        infoTitle: 'Dupla Wimshurst Kisütő',
        infoDesc: 'Az elektróda gömbök közötti távolság határozza meg a szikrakisülés áttörési feszültségét (kb. 30 kV / centiméter levegőben).'
      },
      // Leyden Jar storage battery
      {
        id: 'leyden_wim',
        type: 'leyden_jar',
        x: 1540,
        y: 330,
        width: 24,
        height: 40,
        active: true,
        charge: 1.0,
        infoTitle: 'Kondenzátortelep',
        infoDesc: 'A kísérletben felgyülemlett energia tárolóedénye.'
      }
    ],
    enemies: [
      // Ceiling Spark Turret 1
      {
        id: 'turret_1',
        type: 'spark_turret',
        x: 390,
        y: 40,
        vx: 0,
        vy: 0,
        width: 24,
        height: 28,
        health: 2,
        maxHealth: 2,
        shootCooldown: 50,
        shootInterval: 90,
        facing: 'left',
        isAlive: true,
        animTimer: 0
      },
      // Flying Drone in middle chasm
      {
        id: 'drone_wim_1',
        type: 'flying_drone',
        x: 720,
        y: 220,
        vx: 1.6,
        vy: 0.6,
        startY: 220,
        minX: 640,
        maxX: 840,
        width: 24,
        height: 24,
        health: 2,
        maxHealth: 2,
        shootCooldown: 60,
        shootInterval: 90,
        facing: 'left',
        isAlive: true,
        animTimer: 0
      },
      // Ceiling Spark Turret 2
      {
        id: 'turret_2',
        type: 'spark_turret',
        x: 910,
        y: 40,
        vx: 0,
        vy: 0,
        width: 24,
        height: 28,
        health: 2,
        maxHealth: 2,
        shootCooldown: 40,
        shootInterval: 80,
        facing: 'left',
        isAlive: true,
        animTimer: 0
      },
      // Final Ground Sentry on goal platform
      {
        id: 'sentry_final_wim',
        type: 'sentry',
        x: 1520,
        y: 344,
        vx: 1.4,
        vy: 0,
        minX: 1500,
        maxX: 1640,
        width: 26,
        height: 26,
        health: 3,
        maxHealth: 3,
        shootCooldown: 45,
        shootInterval: 75,
        facing: 'left',
        isAlive: true,
        animTimer: 0
      }
    ],
    collectibles: [
      { id: 'c3_1', x: 200, y: 510, type: 'coulomb_charge', collected: false, pulseTimer: 0 },
      { id: 'c3_2', x: 280, y: 390, type: 'leyden_shard', collected: false, pulseTimer: 0 },
      { id: 'c3_3', x: 420, y: 310, type: 'health_spark', collected: false, pulseTimer: 0 },
      { id: 'c3_4', x: 570, y: 280, type: 'coulomb_charge', collected: false, pulseTimer: 0 },
      { id: 'c3_5', x: 910, y: 440, type: 'coulomb_charge', collected: false, pulseTimer: 0 },
      { id: 'c3_6', x: 1030, y: 420, type: 'leyden_shard', collected: false, pulseTimer: 0 },
      { id: 'c3_7', x: 1150, y: 370, type: 'coulomb_charge', collected: false, pulseTimer: 0 },
      { id: 'c3_8', x: 1330, y: 310, type: 'health_spark', collected: false, pulseTimer: 0 }
    ]
  },

  // -------------------------------------------------------------
  // LEVEL 4: Coulomb Kamra & Faraday Kalitka (The Ultimate Coulomb Core)
  // -------------------------------------------------------------
  {
    id: 4,
    title: 'Coulomb Kamra & A Nagy Generátor',
    subtitle: '4. Pálya: A mester akadálypálya',
    description: 'A legnehezebb elektrosztatikus vizsga! Kombináld a Van de Graaff taszítást, a Wimshurst szikrák átugrását és a légi dashelést, hogy túléld a keresztbe tüzelő őrdroidokat és elérd az energiaközpontot!',
    apparatusFeatured: ['van_de_graaff', 'wimshurst', 'leyden_jar', 'electroscope', 'faraday_cage'],
    width: 1900,
    height: 720,
    playerSpawn: { x: 60, y: 600 },
    goal: { x: 1820, y: 240, width: 36, height: 48 },
    checkpoints: [
      { x: 950, y: 420 }
    ],
    platforms: [
      // Starting deck
      { x: 0, y: 640, width: 260, height: 80, type: 'solid' },

      // Spark death pit
      { x: 260, y: 700, width: 1400, height: 20, type: 'hazard_spark' },

      // Repulsion launchers
      { x: 300, y: 600, width: 80, height: 20, type: 'repel_pos' },
      { x: 440, y: 460, width: 90, height: 16, type: 'solid' },

      // Double moving elevator platform
      { 
        x: 580, y: 420, width: 70, height: 16, type: 'solid',
        moving: { dx: 0, dy: 90, speed: 1.8, range: 90, progress: 0 }
      },
      { x: 710, y: 320, width: 100, height: 16, type: 'one_way' },

      // High cathode bounce plate
      { x: 840, y: 360, width: 80, height: 20, type: 'repel_neg' },

      // Midpoint sanctuary terrace
      { x: 920, y: 500, width: 160, height: 220, type: 'solid' },

      // Gauntlet 2: Moving horizontal beam through spark zone
      { 
        x: 1120, y: 460, width: 80, height: 16, type: 'solid',
        moving: { dx: 110, dy: 0, speed: 2.0, range: 110, progress: 0 }
      },

      // Alternating electro-pads
      { x: 1300, y: 420, width: 80, height: 20, type: 'repel_pos' },
      { x: 1420, y: 350, width: 80, height: 20, type: 'repel_neg' },

      // Final ascension towards generator core
      { x: 1560, y: 290, width: 80, height: 16, type: 'one_way' },
      { 
        x: 1680, y: 260, width: 60, height: 16, type: 'solid',
        moving: { dx: 0, dy: 60, speed: 1.5, range: 60, progress: 0 }
      },

      // Victory chamber platform
      { x: 1770, y: 290, width: 130, height: 430, type: 'solid' },

      // Overhead ceiling bunker
      { x: 650, y: 0, width: 100, height: 40, type: 'solid' },
      { x: 1350, y: 0, width: 100, height: 40, type: 'solid' },

      // Bounds
      { x: -20, y: 0, width: 20, height: 720, type: 'solid' },
      { x: 1900, y: 0, width: 20, height: 720, type: 'solid' }
    ],
    apparatuses: [
      // Van de Graaff at start
      {
        id: 'vdg_boss_1',
        type: 'van_de_graaff',
        x: 320,
        y: 510,
        width: 38,
        height: 90,
        polarity: 'positive',
        active: true,
        charge: 1.0,
        infoTitle: 'Ipari Van de Graaff Gyorsító',
        infoDesc: 'Nagy energiájú részecskegyorsítókban és magfizikai kísérletekben alkalmazzák a feszültség előállítására.'
      },
      // Wimshurst Machine obstacle
      {
        id: 'wim_boss_1',
        type: 'wimshurst',
        x: 740,
        y: 274,
        width: 36,
        height: 46,
        active: true,
        charge: 1.0,
        infoTitle: 'Szikrakisütő Rendszer',
        infoDesc: 'A töltésszétválasztás a fém szektorok elektrosztatikus megosztása (indukciója) révén történik.'
      },
      // Central Sanctuary Faraday Cage
      {
        id: 'cage_boss',
        type: 'faraday_cage',
        x: 950,
        y: 420,
        width: 44,
        height: 80,
        active: true,
        charge: 0,
        infoTitle: 'Faraday-kalitka Védőközpont',
        infoDesc: 'Itt megpihenhetsz! A lövedékek nem tudnak behatolni.'
      },
      // Gold-Leaf Electroscope bouncer
      {
        id: 'scope_boss',
        type: 'electroscope',
        x: 1580,
        y: 254,
        width: 26,
        height: 36,
        active: true,
        charge: 1.0,
        infoTitle: 'Rezonanciás Elektroszkóp',
        infoDesc: 'A maximális töltéstaszítás révén extra magas ugrást biztosít!'
      },
      // Final Leyden Trophy
      {
        id: 'leyden_boss',
        type: 'leyden_jar',
        x: 1840,
        y: 250,
        width: 24,
        height: 40,
        active: true,
        charge: 1.0,
        infoTitle: 'Mesterszintű Leydeni Palack',
        infoDesc: 'Gratulálunk! Az elektrosztatika minden kísérleti eszközét sikeresen meghódítottad!'
      }
    ],
    enemies: [
      // Turret 1 ceiling
      {
        id: 'turret_boss_1',
        type: 'spark_turret',
        x: 690,
        y: 40,
        vx: 0,
        vy: 0,
        width: 24,
        height: 28,
        health: 2,
        maxHealth: 2,
        shootCooldown: 40,
        shootInterval: 75,
        facing: 'left',
        isAlive: true,
        animTimer: 0
      },
      // Flying Drone 1
      {
        id: 'drone_boss_1',
        type: 'flying_drone',
        x: 520,
        y: 260,
        vx: 1.8,
        vy: 0.8,
        startY: 260,
        minX: 440,
        maxX: 640,
        width: 24,
        height: 24,
        health: 2,
        maxHealth: 2,
        shootCooldown: 50,
        shootInterval: 85,
        facing: 'left',
        isAlive: true,
        animTimer: 0
      },
      // Sentry on mid deck
      {
        id: 'sentry_boss_mid',
        type: 'sentry',
        x: 970,
        y: 474,
        vx: 1.5,
        vy: 0,
        minX: 930,
        maxX: 1060,
        width: 26,
        height: 26,
        health: 3,
        maxHealth: 3,
        shootCooldown: 50,
        shootInterval: 80,
        facing: 'left',
        isAlive: true,
        animTimer: 0
      },
      // Turret 2 ceiling
      {
        id: 'turret_boss_2',
        type: 'spark_turret',
        x: 1390,
        y: 40,
        vx: 0,
        vy: 0,
        width: 24,
        height: 28,
        health: 2,
        maxHealth: 2,
        shootCooldown: 40,
        shootInterval: 70,
        facing: 'left',
        isAlive: true,
        animTimer: 0
      },
      // Flying Drone 2 near finish
      {
        id: 'drone_boss_2',
        type: 'flying_drone',
        x: 1600,
        y: 190,
        vx: 2.0,
        vy: 0.9,
        startY: 190,
        minX: 1500,
        maxX: 1720,
        width: 24,
        height: 24,
        health: 2,
        maxHealth: 2,
        shootCooldown: 40,
        shootInterval: 75,
        facing: 'left',
        isAlive: true,
        animTimer: 0
      }
    ],
    collectibles: [
      { id: 'c4_1', x: 190, y: 580, type: 'coulomb_charge', collected: false, pulseTimer: 0 },
      { id: 'c4_2', x: 330, y: 390, type: 'leyden_shard', collected: false, pulseTimer: 0 },
      { id: 'c4_3', x: 480, y: 400, type: 'health_spark', collected: false, pulseTimer: 0 },
      { id: 'c4_4', x: 750, y: 260, type: 'coulomb_charge', collected: false, pulseTimer: 0 },
      { id: 'c4_5', x: 880, y: 310, type: 'leyden_shard', collected: false, pulseTimer: 0 },
      { id: 'c4_6', x: 1040, y: 450, type: 'health_spark', collected: false, pulseTimer: 0 },
      { id: 'c4_7', x: 1200, y: 390, type: 'coulomb_charge', collected: false, pulseTimer: 0 },
      { id: 'c4_8', x: 1340, y: 370, type: 'coulomb_charge', collected: false, pulseTimer: 0 },
      { id: 'c4_9', x: 1460, y: 300, type: 'leyden_shard', collected: false, pulseTimer: 0 },
      { id: 'c4_10', x: 1710, y: 210, type: 'coulomb_charge', collected: false, pulseTimer: 0 }
    ]
  }
];
