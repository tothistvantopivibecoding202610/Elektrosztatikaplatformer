import { Player, Enemy, Projectile, Particle, LevelData, Polarity, GameStats, ElectroApparatus } from './types';
import { PixelRenderer } from './pixelArt';
import { soundEngine } from './audio';

export interface GameEngineCallbacks {
  onLevelComplete: (stats: GameStats) => void;
  onGameOver: () => void;
  onApparatusInspect: (app: ElectroApparatus) => void;
  onStatsUpdate: (stats: GameStats, player: Player) => void;
}

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public level: LevelData;
  public player: Player;
  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public stats: GameStats = {
    score: 0,
    deaths: 0,
    collectiblesCollected: 0,
    totalCollectibles: 0,
    timeElapsed: 0
  };

  // Camera
  public camera = { x: 0, y: 0, width: 800, height: 450 };

  // Inputs
  public keys: { [key: string]: boolean } = {};
  private jumpBuffered: number = 0;
  private coyoteTimer: number = 0;

  // State
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  private lastTime: number = 0;
  private animId: number = 0;
  private callbacks: GameEngineCallbacks;
  private currentCheckpoint: { x: number; y: number };

  constructor(canvas: HTMLCanvasElement, level: LevelData, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.level = JSON.parse(JSON.stringify(level)); // Deep copy level
    this.callbacks = callbacks;
    this.currentCheckpoint = { ...this.level.playerSpawn };

    this.player = this.createPlayer(this.level.playerSpawn.x, this.level.playerSpawn.y);
    this.stats.totalCollectibles = this.level.collectibles.length;

    this.enemies = JSON.parse(JSON.stringify(this.level.enemies));

    this.setupInputs();
  }

  private createPlayer(x: number, y: number): Player {
    return {
      x,
      y,
      vx: 0,
      vy: 0,
      width: 22,
      height: 26,
      isGrounded: false,
      facing: 'right',
      jumpCount: 0,
      maxJumps: 2,
      polarity: 'positive',
      isDashing: false,
      dashTimeRemaining: 0,
      dashCooldown: 0,
      canDash: true,
      dashDirection: { x: 1, y: 0 },
      health: 3,
      maxHealth: 3,
      invincibleTimer: 0,
      isAlive: true,
      animFrame: 0,
      animTimer: 0,
      state: 'idle'
    };
  }

  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      this.keys[e.code.toLowerCase()] = true;

      // Jump buffer
      if (['arrowup', 'keyw', 'space'].includes(e.code.toLowerCase())) {
        this.jumpBuffered = 8; // 8 frames
      }

      // Dash trigger
      if (['shiftleft', 'shiftright', 'keyj', 'keyx'].includes(e.code.toLowerCase())) {
        this.triggerDash();
      }

      // Polarity toggle
      if (['keyc', 'keye'].includes(e.code.toLowerCase())) {
        this.togglePolarity();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      this.keys[e.code.toLowerCase()] = false;

      // Variable jump height: release early cuts upward velocity
      if (['arrowup', 'keyw', 'space'].includes(e.code.toLowerCase())) {
        if (this.player.vy < -3) {
          this.player.vy = -3;
        }
      }
    });
  }

  // Public methods for on-screen touch controls
  public pressMoveLeft(pressed: boolean) {
    this.keys['arrowleft'] = pressed;
    this.keys['keya'] = pressed;
  }

  public pressMoveRight(pressed: boolean) {
    this.keys['arrowright'] = pressed;
    this.keys['keyd'] = pressed;
  }

  public triggerJump() {
    this.jumpBuffered = 8;
  }

  public releaseJump() {
    if (this.player.vy < -3) {
      this.player.vy = -3;
    }
  }

  public triggerDash() {
    if (!this.player.canDash || this.player.isDashing || this.player.dashCooldown > 0) return;

    let dirX = 0;
    if (this.keys['arrowright'] || this.keys['keyd']) dirX = 1;
    else if (this.keys['arrowleft'] || this.keys['keya']) dirX = -1;
    else dirX = this.player.facing === 'right' ? 1 : -1;

    this.player.isDashing = true;
    this.player.dashTimeRemaining = 12; // 12 frames duration
    this.player.dashCooldown = 45; // 45 frames cooldown
    this.player.canDash = false;
    this.player.dashDirection = { x: dirX, y: 0 };
    this.player.vx = dirX * 12;
    this.player.vy = 0;

    soundEngine.playDash();

    // Dash particle burst
    for (let i = 0; i < 16; i++) {
      this.particles.push({
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height / 2,
        vx: -dirX * (Math.random() * 5 + 2) + (Math.random() * 2 - 1),
        vy: (Math.random() * 4 - 2),
        size: Math.floor(Math.random() * 3 + 2),
        color: this.player.polarity === 'positive' ? '#38bdf8' : '#fb923c',
        life: 18,
        maxLife: 18,
        type: 'spark'
      });
    }
  }

  public togglePolarity() {
    this.player.polarity = this.player.polarity === 'positive' ? 'negative' : 'positive';
    soundEngine.playPolarity(this.player.polarity);

    // Polarity shockwave particle ring
    this.particles.push({
      x: this.player.x + this.player.width / 2,
      y: this.player.y + this.player.height / 2,
      vx: 0,
      vy: 0,
      size: 1,
      color: this.player.polarity === 'positive' ? '#38bdf8' : '#fb923c',
      life: 14,
      maxLife: 14,
      type: 'ring'
    });
  }

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.lastTime = performance.now();
      this.gameLoop(this.lastTime);
    }
  }

  public stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animId);
  }

  public restart() {
    this.player = this.createPlayer(this.currentCheckpoint.x, this.currentCheckpoint.y);
    this.enemies = JSON.parse(JSON.stringify(this.level.enemies));
    this.projectiles = [];
    this.particles = [];
  }

  private gameLoop = (time: number) => {
    if (!this.isRunning) return;

    if (!this.isPaused) {
      this.update(time);
      this.render(time);
    }

    this.animId = requestAnimationFrame(this.gameLoop);
  };

  private update(time: number) {
    this.stats.timeElapsed += 1 / 60;
    const p = this.player;

    if (!p.isAlive) {
      this.respawnTimer--;
      if (this.respawnTimer <= 0) {
        this.respawn();
      }
      return;
    }

    // Invincible timer & dash cooldown
    if (p.invincibleTimer > 0) p.invincibleTimer--;
    if (p.dashCooldown > 0) p.dashCooldown--;

    // 1. Dash handling
    if (p.isDashing) {
      p.dashTimeRemaining--;
      p.vx = p.dashDirection.x * 12;
      p.vy = 0; // Freeze vertical gravity during dash

      // Ghost trail particle
      if (p.dashTimeRemaining % 3 === 0) {
        this.particles.push({
          x: p.x,
          y: p.y,
          vx: 0,
          vy: 0,
          size: 6,
          color: p.polarity === 'positive' ? '#38bdf8' : '#fb923c',
          life: 10,
          maxLife: 10,
          type: 'dash_ghost'
        });
      }

      if (p.dashTimeRemaining <= 0) {
        p.isDashing = false;
        p.vx = p.dashDirection.x * 3.5; // Smooth momentum exit
      }
    } else {
      // 2. Normal Horizontal Movement
      const moveLeft = this.keys['arrowleft'] || this.keys['keya'];
      const moveRight = this.keys['arrowright'] || this.keys['keyd'];

      const accel = p.isGrounded ? 0.8 : 0.45;
      const friction = p.isGrounded ? 0.78 : 0.92;
      const maxSpeed = 4.2;

      if (moveLeft && !moveRight) {
        p.vx -= accel;
        p.facing = 'left';
      } else if (moveRight && !moveLeft) {
        p.vx += accel;
        p.facing = 'right';
      } else {
        p.vx *= friction;
      }

      p.vx = Math.max(-maxSpeed, Math.min(maxSpeed, p.vx));

      // 3. Gravity
      p.vy += 0.52; // Gravity constant
      if (p.vy > 12) p.vy = 12; // Terminal velocity
    }

    // 4. Coyote Time & Jump Buffering
    if (p.isGrounded) {
      this.coyoteTimer = 6;
      p.jumpCount = 0;
      p.canDash = true; // Refresh dash on ground touch
    } else {
      if (this.coyoteTimer > 0) this.coyoteTimer--;
    }

    if (this.jumpBuffered > 0) {
      this.jumpBuffered--;
      // Can ground jump
      if (p.isGrounded || this.coyoteTimer > 0) {
        p.vy = -10.5;
        p.isGrounded = false;
        this.coyoteTimer = 0;
        this.jumpBuffered = 0;
        p.jumpCount = 1;
        soundEngine.playJump();
      } else if (p.jumpCount < p.maxJumps) {
        // Double jump
        p.vy = -9.2;
        p.jumpCount++;
        this.jumpBuffered = 0;
        soundEngine.playDoubleJump();

        // Spark explosion beneath feet
        for (let i = 0; i < 8; i++) {
          this.particles.push({
            x: p.x + p.width / 2,
            y: p.y + p.height,
            vx: (Math.random() * 4 - 2),
            vy: Math.random() * 3 + 1,
            size: 2,
            color: '#38bdf8',
            life: 12,
            maxLife: 12,
            type: 'spark'
          });
        }
      }
    }

    // 5. Update Platforms (moving platforms)
    for (const plat of this.level.platforms) {
      if (plat.moving) {
        plat.moving.progress += 0.02 * plat.moving.speed;
        const offset = Math.sin(plat.moving.progress);
        const curX = plat.x;
        const curY = plat.y;
        plat.x = plat.x + Math.cos(plat.moving.progress) * (plat.moving.dx * 0.02);
        plat.y = plat.y + Math.cos(plat.moving.progress) * (plat.moving.dy * 0.02);

        // If player is on this moving platform, carry player along
        if (p.isGrounded && p.y + p.height <= curY + 4 && p.x + p.width > curX && p.x < curX + plat.width) {
          p.x += plat.x - curX;
          p.y += plat.y - curY;
        }
      }
    }

    // 6. X Collision
    p.x += p.vx;
    this.checkPlatformCollisionsX();

    // 7. Y Collision
    p.y += p.vy;
    p.isGrounded = false;
    this.checkPlatformCollisionsY();

    // 8. Apparatus Interactions (Van de Graaff, Electroscope, Faraday Cage)
    this.handleApparatusInteractions();

    // 9. Check Collectibles
    for (const item of this.level.collectibles) {
      if (!item.collected) {
        const dx = (p.x + p.width / 2) - item.x;
        const dy = (p.y + p.height / 2) - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 18) {
          item.collected = true;
          this.stats.collectiblesCollected++;
          this.stats.score += 150;
          soundEngine.playPickup();

          if (item.type === 'health_spark' && p.health < p.maxHealth) {
            p.health = Math.min(p.maxHealth, p.health + 1);
          }

          // Spark particle burst
          for (let i = 0; i < 10; i++) {
            this.particles.push({
              x: item.x,
              y: item.y,
              vx: (Math.random() * 4 - 2),
              vy: (Math.random() * 4 - 2),
              size: 3,
              color: item.type === 'health_spark' ? '#22c55e' : '#f59e0b',
              life: 15,
              maxLife: 15,
              type: 'spark'
            });
          }
        }
      }
    }

    // 10. Check Goal
    const goal = this.level.goal;
    if (
      p.x < goal.x + goal.width &&
      p.x + p.width > goal.x &&
      p.y < goal.y + goal.height &&
      p.y + p.height > goal.y
    ) {
      soundEngine.playVictory();
      this.callbacks.onLevelComplete(this.stats);
      this.isRunning = false;
      return;
    }

    // 11. Pit / Hazard check
    if (p.y > this.level.height + 40) {
      this.damagePlayer(1);
    }

    // 12. Enemies AI & Shoot
    this.updateEnemies();

    // 13. Projectiles
    this.updateProjectiles();

    // 14. Particles
    this.updateParticles();

    // 15. Smooth Camera Tracking
    const targetCamX = p.x + p.width / 2 - this.camera.width / 2;
    const targetCamY = p.y + p.height / 2 - this.camera.height / 2;
    this.camera.x += (targetCamX - this.camera.x) * 0.1;
    this.camera.y += (targetCamY - this.camera.y) * 0.1;

    // Clamp camera within level bounds
    this.camera.x = Math.max(0, Math.min(this.level.width - this.camera.width, this.camera.x));
    this.camera.y = Math.max(0, Math.min(this.level.height - this.camera.height, this.camera.y));

    // Animation timer
    p.animTimer += 1 / 60;

    // Update stats callback
    this.callbacks.onStatsUpdate(this.stats, p);
  }

  private checkPlatformCollisionsX() {
    const p = this.player;
    for (const plat of this.level.platforms) {
      if (plat.type === 'one_way' || plat.type === 'hazard_spark') continue;

      if (
        p.x < plat.x + plat.width &&
        p.x + p.width > plat.x &&
        p.y < plat.y + plat.height &&
        p.y + p.height > plat.y
      ) {
        if (p.vx > 0) {
          p.x = plat.x - p.width;
        } else if (p.vx < 0) {
          p.x = plat.x + plat.width;
        }
        p.vx = 0;
      }
    }
  }

  private checkPlatformCollisionsY() {
    const p = this.player;
    for (const plat of this.level.platforms) {
      if (plat.type === 'hazard_spark') {
        // Hazard collision
        if (
          p.x < plat.x + plat.width &&
          p.x + p.width > plat.x &&
          p.y < plat.y + plat.height &&
          p.y + p.height > plat.y
        ) {
          if (!p.isDashing) {
            this.damagePlayer(1);
          }
        }
        continue;
      }

      if (plat.type === 'one_way') {
        // One-way platform: only land on top when falling down
        if (
          p.vy > 0 &&
          p.y + p.height >= plat.y &&
          p.y + p.height <= plat.y + p.vy + 6 &&
          p.x + p.width > plat.x + 2 &&
          p.x < plat.x + plat.width - 2
        ) {
          p.y = plat.y - p.height;
          p.vy = 0;
          p.isGrounded = true;
        }
        continue;
      }

      // Solid & Repel plates
      if (
        p.x < plat.x + plat.width &&
        p.x + p.width > plat.x &&
        p.y < plat.y + plat.height &&
        p.y + p.height > plat.y
      ) {
        if (p.vy > 0) {
          p.y = plat.y - p.height;
          p.vy = 0;
          p.isGrounded = true;

          // Electrostatic Repulsion Super-Bounce
          if (plat.type === 'repel_pos' && p.polarity === 'positive') {
            p.vy = -14.5; // Massive electrostatic boost!
            p.isGrounded = false;
            soundEngine.playBounce();
            for (let i = 0; i < 12; i++) {
              this.particles.push({
                x: p.x + p.width / 2,
                y: p.y + p.height,
                vx: (Math.random() * 6 - 3),
                vy: -Math.random() * 5,
                size: 3,
                color: '#38bdf8',
                life: 16,
                maxLife: 16,
                type: 'spark'
              });
            }
          } else if (plat.type === 'repel_neg' && p.polarity === 'negative') {
            p.vy = -14.5;
            p.isGrounded = false;
            soundEngine.playBounce();
            for (let i = 0; i < 12; i++) {
              this.particles.push({
                x: p.x + p.width / 2,
                y: p.y + p.height,
                vx: (Math.random() * 6 - 3),
                vy: -Math.random() * 5,
                size: 3,
                color: '#fb923c',
                life: 16,
                maxLife: 16,
                type: 'spark'
              });
            }
          }
        } else if (p.vy < 0) {
          p.y = plat.y + plat.height;
          p.vy = 0;
        }
      }
    }
  }

  private isPlayerInFaradayCage(): boolean {
    const p = this.player;
    for (const app of this.level.apparatuses) {
      if (app.type === 'faraday_cage') {
        if (
          p.x + p.width / 2 >= app.x &&
          p.x + p.width / 2 <= app.x + app.width &&
          p.y + p.height >= app.y &&
          p.y <= app.y + app.height
        ) {
          return true;
        }
      }
    }
    return false;
  }

  private handleApparatusInteractions() {
    const p = this.player;

    for (const app of this.level.apparatuses) {
      const appCX = app.x + app.width / 2;
      const appCY = app.y + app.height / 2;
      const dx = (p.x + p.width / 2) - appCX;
      const dy = (p.y + p.height / 2) - appCY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gold-Leaf Electroscope bounce mechanism
      if (app.type === 'electroscope') {
        if (
          p.x + p.width > app.x &&
          p.x < app.x + app.width &&
          p.y + p.height >= app.y &&
          p.y + p.height <= app.y + 12 &&
          p.vy > 0
        ) {
          p.vy = -13.0; // Spring bounce!
          p.isGrounded = false;
          soundEngine.playBounce();

          // Gold leaf spark shower
          for (let i = 0; i < 10; i++) {
            this.particles.push({
              x: appCX,
              y: app.y + 4,
              vx: (Math.random() * 6 - 3),
              vy: -Math.random() * 4 - 2,
              size: 2,
              color: '#fef08a',
              life: 14,
              maxLife: 14,
              type: 'spark'
            });
          }
        }
      }

      // Van de Graaff Repulsion Lift
      if (app.type === 'van_de_graaff') {
        const domeX = appCX;
        const domeY = app.y + 14;
        const domeDist = Math.hypot((p.x + p.width / 2) - domeX, (p.y + p.height / 2) - domeY);
        if (domeDist < 50) {
          // If polarity matches, huge anti-gravity electrostatic push!
          if (p.polarity === app.polarity) {
            p.vy -= 1.1; // Electrostatic levitation
            if (p.vy < -11) p.vy = -11;
          }
        }
      }

      // Checkpoint Faraday Cage
      if (app.type === 'faraday_cage') {
        if (dist < 40) {
          this.currentCheckpoint = { x: app.x + 10, y: app.y + app.height - 30 };
        }
      }
    }
  }

  private updateEnemies() {
    const p = this.player;

    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;

      enemy.animTimer += 1 / 60;
      enemy.shootCooldown--;

      if (enemy.type === 'sentry') {
        // Move back and forth
        enemy.x += enemy.vx;
        if (enemy.minX && enemy.x <= enemy.minX) {
          enemy.vx = Math.abs(enemy.vx);
          enemy.facing = 'right';
        } else if (enemy.maxX && enemy.x >= enemy.maxX) {
          enemy.vx = -Math.abs(enemy.vx);
          enemy.facing = 'left';
        }

        // Shoot when player is nearby
        const dist = Math.hypot((p.x + p.width / 2) - enemy.x, (p.y + p.height / 2) - enemy.y);
        if (dist < 320 && enemy.shootCooldown <= 0) {
          enemy.shootCooldown = enemy.shootInterval;
          const shootDir = p.x < enemy.x ? -1 : 1;
          enemy.facing = shootDir < 0 ? 'left' : 'right';
          this.projectiles.push({
            id: 'proj_' + Math.random(),
            x: enemy.facing === 'left' ? enemy.x - 4 : enemy.x + enemy.width + 4,
            y: enemy.y + 12,
            vx: shootDir * 3.8,
            vy: 0,
            radius: 4,
            polarity: 'positive',
            lifetime: 140,
            fromPlayer: false
          });
          soundEngine.playEnemyShoot();
        }
      } else if (enemy.type === 'flying_drone') {
        // Sine wave hovering
        enemy.x += enemy.vx;
        if (enemy.minX && enemy.x <= enemy.minX) {
          enemy.vx = Math.abs(enemy.vx);
        } else if (enemy.maxX && enemy.x >= enemy.maxX) {
          enemy.vx = -Math.abs(enemy.vx);
        }
        if (enemy.startY) {
          enemy.y = enemy.startY + Math.sin(enemy.animTimer * 3) * 20;
        }

        // Shoot aimed electro-plasma
        const dist = Math.hypot((p.x + p.width / 2) - enemy.x, (p.y + p.height / 2) - enemy.y);
        if (dist < 340 && enemy.shootCooldown <= 0) {
          enemy.shootCooldown = enemy.shootInterval;
          const angle = Math.atan2((p.y + p.height / 2) - enemy.y, (p.x + p.width / 2) - enemy.x);
          this.projectiles.push({
            id: 'proj_' + Math.random(),
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height + 2,
            vx: Math.cos(angle) * 3.4,
            vy: Math.sin(angle) * 3.4,
            radius: 5,
            polarity: 'neutral',
            lifetime: 150,
            fromPlayer: false
          });
          soundEngine.playEnemyShoot();
        }
      } else if (enemy.type === 'spark_turret') {
        // Ceiling turret shoots downwards/angled towards player
        const dist = Math.hypot((p.x + p.width / 2) - enemy.x, (p.y + p.height / 2) - enemy.y);
        if (dist < 360 && enemy.shootCooldown <= 0) {
          enemy.shootCooldown = enemy.shootInterval;
          const angle = Math.atan2((p.y + p.height / 2) - (enemy.y + 20), (p.x + p.width / 2) - enemy.x);
          this.projectiles.push({
            id: 'proj_' + Math.random(),
            x: enemy.x + enemy.width / 2,
            y: enemy.y + 22,
            vx: Math.cos(angle) * 4.0,
            vy: Math.sin(angle) * 4.0,
            radius: 4,
            polarity: 'negative',
            lifetime: 140,
            fromPlayer: false
          });
          soundEngine.playEnemyShoot();
        }
      }

      // Check collision with player
      if (
        p.x < enemy.x + enemy.width &&
        p.x + p.width > enemy.x &&
        p.y < enemy.y + enemy.height &&
        p.y + p.height > enemy.y
      ) {
        // Can defeat enemy by dashing through or jumping on top!
        if (p.isDashing) {
          this.defeatEnemy(enemy);
        } else if (p.vy > 0 && p.y + p.height - p.vy <= enemy.y + 8) {
          // Stomp on enemy head
          p.vy = -9.5; // Rebound
          this.defeatEnemy(enemy);
        } else {
          this.damagePlayer(1);
        }
      }
    }
  }

  private defeatEnemy(enemy: Enemy) {
    enemy.isAlive = false;
    soundEngine.playEnemyDefeat();
    this.stats.score += 250;

    // Disintegration sparks
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height / 2,
        vx: (Math.random() * 6 - 3),
        vy: (Math.random() * 6 - 3),
        size: Math.floor(Math.random() * 3 + 2),
        color: Math.random() < 0.5 ? '#f59e0b' : '#38bdf8',
        life: 20,
        maxLife: 20,
        type: 'spark'
      });
    }
  }

  private updateProjectiles() {
    const p = this.player;
    const inFaraday = this.isPlayerInFaradayCage();

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.lifetime--;

      // Hit wall or expired
      if (proj.lifetime <= 0 || proj.x < 0 || proj.x > this.level.width || proj.y < 0 || proj.y > this.level.height) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check Faraday cage barrier
      if (!proj.fromPlayer && inFaraday) {
        const dx = proj.x - (p.x + p.width / 2);
        const dy = proj.y - (p.y + p.height / 2);
        if (Math.hypot(dx, dy) < 35) {
          // Deflected by Faraday shield!
          this.projectiles.splice(i, 1);
          this.particles.push({
            x: proj.x,
            y: proj.y,
            vx: -proj.vx * 0.5,
            vy: -proj.vy * 0.5,
            size: 3,
            color: '#38bdf8',
            life: 8,
            maxLife: 8,
            type: 'spark'
          });
          continue;
        }
      }

      // Hit player
      if (!proj.fromPlayer && !inFaraday) {
        const dx = proj.x - (p.x + p.width / 2);
        const dy = proj.y - (p.y + p.height / 2);
        if (Math.hypot(dx, dy) < proj.radius + p.width / 2) {
          this.projectiles.splice(i, 1);
          // Dash provides invulnerability frames
          if (!p.isDashing) {
            this.damagePlayer(1);
          }
          continue;
        }
      }
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const part = this.particles[i];
      part.x += part.vx;
      part.y += part.vy;
      part.life--;
      if (part.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public damagePlayer(amount: number) {
    const p = this.player;
    if (p.invincibleTimer > 0 || !p.isAlive) return;

    p.health -= amount;
    p.invincibleTimer = 50; // 50 frames i-frames
    soundEngine.playHurt();

    // Red damage sparks
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x: p.x + p.width / 2,
        y: p.y + p.height / 2,
        vx: (Math.random() * 6 - 3),
        vy: (Math.random() * 6 - 3),
        size: 3,
        color: '#ef4444',
        life: 15,
        maxLife: 15,
        type: 'spark'
      });
    }

    if (p.health <= 0) {
      p.isAlive = false;
      this.stats.deaths++;
      this.respawnTimer = 40;
    }
  }

  private respawnTimer = 0;

  private respawn() {
    this.player = this.createPlayer(this.currentCheckpoint.x, this.currentCheckpoint.y);
    this.player.invincibleTimer = 60; // Safe period upon respawn

    // Reforming spark aura
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height / 2,
        vx: (Math.random() * 4 - 2),
        vy: (Math.random() * 4 - 2),
        size: 3,
        color: '#38bdf8',
        life: 18,
        maxLife: 18,
        type: 'spark'
      });
    }
  }

  // Render everything onto canvas
  public render(time: number) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Dark laboratory background with subtle blueprint grid
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    // Apply camera translation
    ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));

    // Draw Lab Background Grid & Chalkboard formulas
    this.drawLabBackground(ctx, time);

    // 1. Draw Platforms
    for (const plat of this.level.platforms) {
      PixelRenderer.drawPlatform(ctx, plat, time / 1000);
    }

    // 2. Draw Electrostatic Apparatus
    const pInsideCage = this.isPlayerInFaradayCage();
    for (const app of this.level.apparatuses) {
      if (app.type === 'van_de_graaff') {
        PixelRenderer.drawVanDeGraaff(ctx, app, time / 1000);
      } else if (app.type === 'leyden_jar') {
        PixelRenderer.drawLeydenJar(ctx, app, time / 1000);
      } else if (app.type === 'wimshurst') {
        PixelRenderer.drawWimshurst(ctx, app, time / 1000);
      } else if (app.type === 'electroscope') {
        const playerDist = Math.hypot((this.player.x + this.player.width / 2) - (app.x + app.width / 2), (this.player.y + this.player.height / 2) - (app.y + app.height / 2));
        PixelRenderer.drawElectroscope(ctx, app, time / 1000, playerDist);
      } else if (app.type === 'faraday_cage') {
        PixelRenderer.drawFaradayCage(ctx, app, time / 1000, pInsideCage);
      }
    }

    // 3. Draw Collectibles
    for (const item of this.level.collectibles) {
      PixelRenderer.drawCollectible(ctx, item, time / 1000);
    }

    // 4. Draw Goal Portal (High-Voltage Core)
    this.drawGoalPortal(ctx, this.level.goal, time / 1000);

    // 5. Draw Enemies
    for (const enemy of this.enemies) {
      if (enemy.isAlive) {
        PixelRenderer.drawEnemy(ctx, enemy, time / 1000);
      }
    }

    // 6. Draw Player
    if (this.player.isAlive) {
      PixelRenderer.drawPlayer(ctx, this.player, time / 1000);
    }

    // 7. Draw Projectiles
    for (const proj of this.projectiles) {
      PixelRenderer.drawProjectile(ctx, proj, time / 1000);
    }

    // 8. Draw Particles
    PixelRenderer.drawParticles(ctx, this.particles);

    ctx.restore();
  }

  private drawLabBackground(ctx: CanvasRenderingContext2D, time: number) {
    const camX = this.camera.x;
    const camY = this.camera.y;

    // Subtle background grid
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    const startX = Math.floor(camX / 32) * 32;
    const endX = camX + this.camera.width + 32;
    const startY = Math.floor(camY / 32) * 32;
    const endY = camY + this.camera.height + 32;

    for (let x = startX; x <= endX; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, camY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    for (let y = startY; y <= endY; y += 32) {
      ctx.beginPath();
      ctx.moveTo(camX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    // Scientific Electrostatic formulas drawn in subtle retro font on background wall
    ctx.font = '12px "VT323", monospace';
    ctx.fillStyle = 'rgba(71, 85, 105, 0.35)';
    ctx.fillText('F = k·|q1·q2| / r²', 120, 200);
    ctx.fillText('∮ E · dA = Q / ε₀', 550, 160);
    ctx.fillText('C = Q / V (Leyden)', 980, 220);
    ctx.fillText('E_inside = 0 (Faraday)', 1350, 180);
  }

  private drawGoalPortal(ctx: CanvasRenderingContext2D, goal: { x: number; y: number; width: number; height: number }, time: number) {
    const x = Math.floor(goal.x);
    const y = Math.floor(goal.y);
    const w = goal.width;
    const h = goal.height;

    // Brass Arch Frame
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x - 2, y, 4, h);
    ctx.fillRect(x + w - 2, y, 4, h);
    ctx.fillRect(x - 2, y, w + 4, 4);

    // Whirling High-Voltage Electric Core
    const pulse = 0.5 + 0.5 * Math.sin(time * 6);
    ctx.fillStyle = `rgba(56, 189, 248, ${0.4 + pulse * 0.4})`;
    ctx.fillRect(x + 2, y + 4, w - 4, h - 4);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + Math.floor(w / 2) - 2, y + Math.floor(h / 2) - 10, 4, 20);

    // Sparks around portal
    if (Math.random() < 0.6) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + Math.random() * w, y + Math.random() * h, 2, 2);
    }
  }
}
