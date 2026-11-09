export type Polarity = 'positive' | 'negative';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  facing: 'left' | 'right';
  jumpCount: number;
  maxJumps: number;
  polarity: Polarity;
  
  // Dash mechanics
  isDashing: boolean;
  dashTimeRemaining: number;
  dashCooldown: number;
  canDash: boolean;
  dashDirection: { x: number; y: number };
  
  // Combat & Stats
  health: number;
  maxHealth: number;
  invincibleTimer: number;
  isAlive: boolean;
  
  // Animation state
  animFrame: number;
  animTimer: number;
  state: 'idle' | 'run' | 'jump' | 'fall' | 'dash';
}

export type EnemyType = 'sentry' | 'flying_drone' | 'spark_turret';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  minX?: number;
  maxX?: number;
  startY?: number;
  health: number;
  maxHealth: number;
  shootCooldown: number;
  shootInterval: number;
  facing: 'left' | 'right';
  isAlive: boolean;
  animTimer: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  polarity: Polarity | 'neutral';
  lifetime: number;
  fromPlayer: boolean;
}

export type ApparatusType = 
  | 'van_de_graaff' 
  | 'leyden_jar' 
  | 'wimshurst' 
  | 'electroscope' 
  | 'faraday_cage';

export interface ElectroApparatus {
  id: string;
  type: ApparatusType;
  x: number;
  y: number;
  width: number;
  height: number;
  polarity?: Polarity;
  active: boolean;
  charge: number; // 0 to 1
  cooldown?: number;
  pulseTimer?: number;
  infoTitle: string;
  infoDesc: string;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'one_way' | 'repel_pos' | 'repel_neg' | 'insulator' | 'hazard_spark';
  moving?: {
    dx: number;
    dy: number;
    speed: number;
    range: number;
    progress: number;
  };
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  type: 'leyden_shard' | 'coulomb_charge' | 'health_spark';
  collected: boolean;
  pulseTimer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'dash_ghost' | 'electricity' | 'ring';
  extra?: any;
}

export interface LevelData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  apparatusFeatured: ApparatusType[];
  width: number;
  height: number;
  playerSpawn: Vector2D;
  goal: Rect;
  checkpoints: Vector2D[];
  platforms: Platform[];
  apparatuses: ElectroApparatus[];
  enemies: Enemy[];
  collectibles: Collectible[];
}

export interface GameStats {
  score: number;
  deaths: number;
  collectiblesCollected: number;
  totalCollectibles: number;
  timeElapsed: number;
}
