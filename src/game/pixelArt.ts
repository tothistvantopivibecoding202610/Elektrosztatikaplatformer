/**
 * Pixel Art Procedural Canvas Renderer
 * Renders all sprites, tiles, electrostatics apparatus, enemies, and particles
 * with pixelated crispness without blurry scaling.
 */

import { Player, Enemy, ElectroApparatus, Platform, Projectile, Collectible, Particle } from './types';

export class PixelRenderer {
  // Helper to draw a pixel rect
  private static pixelRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  // Draw Player
  public static drawPlayer(ctx: CanvasRenderingContext2D, player: Player, time: number) {
    ctx.save();
    const x = Math.floor(player.x);
    const y = Math.floor(player.y);
    const w = player.width;
    const h = player.height;

    // Invincible flashing
    if (player.invincibleTimer > 0 && Math.floor(time * 20) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Direction flip
    if (player.facing === 'left') {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(x, y);
    }

    const posColor = '#38bdf8'; // Cyan for (+)
    const negColor = '#fb923c'; // Amber/Orange for (-)
    const chargeColor = player.polarity === 'positive' ? posColor : negColor;

    // Dash aura & blur
    if (player.isDashing) {
      ctx.fillStyle = chargeColor;
      ctx.globalAlpha = 0.4;
      ctx.fillRect(-4, -4, w + 8, h + 8);
      ctx.globalAlpha = 1.0;
    }

    // Electro-Pack on back
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 8, 5, 12);
    // Insulator coils on pack
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(1, 9, 3, 2);
    ctx.fillRect(1, 13, 3, 2);
    ctx.fillRect(1, 17, 3, 2);
    
    // Glowing Charge Bulb on Pack
    ctx.fillStyle = chargeColor;
    ctx.fillRect(1, 5, 4, 4);
    // Tiny spark from pack
    if (Math.random() < 0.4) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1 + Math.random() * 3, 3 - Math.random() * 3, 2, 2);
    }

    // Legs animation
    const isMoving = Math.abs(player.vx) > 0.3 && player.isGrounded;
    const runFrame = isMoving ? Math.floor((player.animTimer * 10) % 4) : 0;
    
    // Boots / Legs
    ctx.fillStyle = '#1e293b'; // Dark trousers
    if (!player.isGrounded) {
      // In air - tucked
      ctx.fillRect(6, 18, 4, 6);
      ctx.fillRect(12, 17, 4, 5);
      // Boots
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(6, 23, 5, 3);
      ctx.fillRect(12, 21, 5, 3);
    } else if (isMoving) {
      // Running cycle
      if (runFrame === 0) {
        ctx.fillRect(5, 18, 4, 5);
        ctx.fillRect(12, 18, 4, 5);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(5, 23, 5, 3);
        ctx.fillRect(12, 23, 5, 3);
      } else if (runFrame === 1) {
        ctx.fillRect(4, 17, 4, 5);
        ctx.fillRect(14, 18, 4, 4);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(3, 22, 5, 3);
        ctx.fillRect(15, 22, 5, 3);
      } else if (runFrame === 2) {
        ctx.fillRect(7, 18, 4, 5);
        ctx.fillRect(11, 18, 4, 5);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(7, 23, 5, 3);
        ctx.fillRect(11, 23, 5, 3);
      } else {
        ctx.fillRect(12, 17, 4, 5);
        ctx.fillRect(5, 18, 4, 4);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(13, 22, 5, 3);
        ctx.fillRect(4, 22, 5, 3);
      }
    } else {
      // Idle standing
      ctx.fillRect(6, 18, 4, 5);
      ctx.fillRect(12, 18, 4, 5);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(6, 23, 5, 3);
      ctx.fillRect(12, 23, 5, 3);
    }

    // Scientist Coat / Torso
    ctx.fillStyle = '#f1f5f9'; // White lab coat
    ctx.fillRect(5, 9, 12, 10);
    // Coat trim & collar
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(10, 9, 2, 10);

    // Charge symbol on chest badge: (+) or (-)
    ctx.fillStyle = chargeColor;
    if (player.polarity === 'positive') {
      ctx.fillRect(12, 11, 3, 1);
      ctx.fillRect(13, 10, 1, 3);
    } else {
      ctx.fillRect(12, 11, 3, 1);
    }

    // Head
    ctx.fillStyle = '#fed7aa'; // Skin
    ctx.fillRect(7, 2, 10, 7);

    // Hair / Cap
    ctx.fillStyle = '#475569';
    ctx.fillRect(6, 0, 11, 3);
    ctx.fillRect(5, 2, 3, 2);

    // Brass Electro-Goggles
    ctx.fillStyle = '#b45309'; // Brass frames
    ctx.fillRect(10, 3, 6, 4);
    // Goggle Lens glowing
    ctx.fillStyle = chargeColor;
    ctx.fillRect(11, 4, 4, 2);

    // Spark rod in hand (reaching out forward)
    ctx.fillStyle = '#78716c'; // Rod
    ctx.fillRect(14, 12, 6, 2);
    ctx.fillStyle = '#f59e0b'; // Brass tip
    ctx.fillRect(20, 11, 2, 4);
    
    // Spark at rod tip
    if (Math.random() < 0.6) {
      ctx.fillStyle = chargeColor;
      ctx.fillRect(22, 11 + Math.floor(Math.random() * 3) - 1, 2, 2);
    }

    ctx.restore();
  }

  // Draw Van de Graaff Generator
  public static drawVanDeGraaff(ctx: CanvasRenderingContext2D, app: ElectroApparatus, time: number) {
    const x = Math.floor(app.x);
    const y = Math.floor(app.y);
    const w = app.width;
    const h = app.height;

    // 1. Base pedestal (Motor & Lower pulley housing)
    ctx.fillStyle = '#334155'; // Dark industrial steel
    ctx.fillRect(x + 2, y + h - 14, w - 4, 14);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 4, y + h - 12, w - 8, 10);
    // Motor vent / grill
    ctx.fillStyle = '#1e293b';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x + 6, y + h - 10 + i * 3, w - 12, 1);
    }

    // 2. Clear Insulating Glass Column
    const colX = x + Math.floor(w / 2) - 6;
    const colW = 12;
    const colH = h - 34;
    const colY = y + 20;

    // Glass tube borders
    ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.fillRect(colX - 1, colY, colW + 2, colH);

    // Running Rubber Belt inside column
    const beltOffset = (time * 60) % 8;
    ctx.fillStyle = '#78350f'; // Dark rubber belt
    ctx.fillRect(colX + 2, colY, colW - 4, colH);
    // Belt texture dashes moving upward (carrying charge)
    ctx.fillStyle = '#ca8a04';
    for (let py = colY + (beltOffset % 8); py < colY + colH; py += 8) {
      ctx.fillRect(colX + 4, py, 4, 2);
    }

    // 3. Top High-Voltage Metal Sphere / Dome
    const domeR = 14;
    const domeCX = x + Math.floor(w / 2);
    const domeCY = y + 14;

    // Metal Dome shading
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(domeCX, domeCY, domeR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(domeCX - 3, domeCY - 3, domeR - 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(domeCX - 6, domeCY - 7, 4, 3); // Specular highlight

    // Electrostatic Force Field Glow / Arcs radiating from dome
    const pulse = 0.5 + 0.5 * Math.sin(time * 5);
    ctx.strokeStyle = app.polarity === 'positive' ? `rgba(56, 189, 248, ${0.4 + pulse * 0.4})` : `rgba(251, 146, 60, ${0.4 + pulse * 0.4})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(domeCX, domeCY, domeR + 6 + pulse * 4, 0, Math.PI * 2);
    ctx.stroke();

    // Spontaneous sparks from dome
    if (Math.random() < 0.4) {
      const angle = Math.random() * Math.PI * 2;
      const dist = domeR + 2;
      const sparkX = domeCX + Math.cos(angle) * dist;
      const sparkY = domeCY + Math.sin(angle) * dist;
      const sparkLen = 6 + Math.random() * 8;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(sparkX, sparkY);
      ctx.lineTo(sparkX + Math.cos(angle) * sparkLen, sparkY + Math.sin(angle) * sparkLen);
      ctx.stroke();
    }

    // Polarity Sign on Dome
    ctx.fillStyle = app.polarity === 'positive' ? '#0284c7' : '#c2410c';
    if (app.polarity === 'positive') {
      ctx.fillRect(domeCX - 3, domeCY - 1, 6, 2);
      ctx.fillRect(domeCX - 1, domeCY - 3, 2, 6);
    } else {
      ctx.fillRect(domeCX - 3, domeCY - 1, 6, 2);
    }
  }

  // Draw Leyden Jar (Leydeni palack)
  public static drawLeydenJar(ctx: CanvasRenderingContext2D, app: ElectroApparatus, time: number) {
    const x = Math.floor(app.x);
    const y = Math.floor(app.y);
    const w = app.width;
    const h = app.height;

    // Brass top ball
    const ballX = x + Math.floor(w / 2);
    const ballY = y + 4;
    ctx.fillStyle = '#f59e0b'; // Gold / brass
    ctx.beginPath();
    ctx.arc(ballX, ballY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(ballX - 1, ballY - 2, 2, 2);

    // Brass central rod
    ctx.fillStyle = '#b45309';
    ctx.fillRect(ballX - 1, ballY + 4, 2, 10);

    // Cork Stopper
    ctx.fillStyle = '#78350f';
    ctx.fillRect(ballX - 5, ballY + 12, 10, 4);

    // Glass Jar Body
    const jarX = x + 3;
    const jarY = ballY + 16;
    const jarW = w - 6;
    const jarH = h - (jarY - y) - 2;

    ctx.fillStyle = 'rgba(186, 230, 253, 0.35)'; // Glass
    ctx.fillRect(jarX, jarY, jarW, jarH);

    // Inner Tin Foil & Outer Tin Foil
    ctx.fillStyle = '#94a3b8'; // Metal foil
    ctx.fillRect(jarX + 1, jarY + 6, jarW - 2, jarH - 8);

    // Stored Electrical Charge Pulse inside jar
    const chargeAlpha = 0.3 + 0.4 * Math.sin(time * 6);
    ctx.fillStyle = `rgba(56, 189, 248, ${chargeAlpha})`;
    ctx.fillRect(jarX + 3, jarY + 8, jarW - 6, jarH - 12);

    // Sparks snapping at top rod
    if (Math.random() < 0.5) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ballX - 3 + Math.random() * 6, ballY - 4 - Math.random() * 4, 2, 2);
    }
  }

  // Draw Wimshurst Machine (Wimshurst gép)
  public static drawWimshurst(ctx: CanvasRenderingContext2D, app: ElectroApparatus, time: number) {
    const x = Math.floor(app.x);
    const y = Math.floor(app.y);
    const w = app.width;
    const h = app.height;

    // Mahogany Wooden Base
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x + 2, y + h - 8, w - 4, 8);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 4, y + h - 7, w - 8, 2);

    // Miniature Leyden Jars on each side of Wimshurst
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 3, y + h - 18, 5, 10);
    ctx.fillRect(x + w - 8, y + h - 18, 5, 10);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 4, y + h - 22, 3, 4);
    ctx.fillRect(x + w - 7, y + h - 22, 3, 4);

    // Dual Counter-rotating Discs in Center
    const discCX = x + Math.floor(w / 2);
    const discCY = y + 16;
    const discR = 14;

    // Disc rim
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(discCX, discCY, discR, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating radial foil sectors
    const rot1 = time * 4;
    const rot2 = -time * 4;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const a1 = rot1 + (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(discCX + Math.cos(a1) * 4, discCY + Math.sin(a1) * 4);
      ctx.lineTo(discCX + Math.cos(a1) * (discR - 2), discCY + Math.sin(a1) * (discR - 2));
      ctx.stroke();

      const a2 = rot2 + (i * Math.PI) / 3;
      ctx.strokeStyle = '#ca8a04';
      ctx.beginPath();
      ctx.moveTo(discCX + Math.cos(a2) * 5, discCY + Math.sin(a2) * 5);
      ctx.lineTo(discCX + Math.cos(a2) * (discR - 3), discCY + Math.sin(a2) * (discR - 3));
      ctx.stroke();
    }

    // Brass Spark Gap Electrodes (crossing in front)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    // Left arm
    ctx.beginPath();
    ctx.moveTo(x + 6, y + h - 22);
    ctx.lineTo(discCX - 4, discCY);
    ctx.stroke();
    // Right arm
    ctx.beginPath();
    ctx.moveTo(x + w - 6, y + h - 22);
    ctx.lineTo(discCX + 4, discCY);
    ctx.stroke();

    // Brass spark balls
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(discCX - 4, discCY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(discCX + 4, discCY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // High Voltage Spark snapping between the gap
    if (Math.sin(time * 12) > 0.4) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(discCX - 4, discCY);
      ctx.lineTo(discCX, discCY + (Math.random() * 4 - 2));
      ctx.lineTo(discCX + 4, discCY);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(discCX - 2, discCY - 2, 4, 4);
    }
  }

  // Draw Gold-Leaf Electroscope (Aranylemezes elektroszkóp)
  public static drawElectroscope(ctx: CanvasRenderingContext2D, app: ElectroApparatus, time: number, playerDist: number) {
    const x = Math.floor(app.x);
    const y = Math.floor(app.y);
    const w = app.width;
    const h = app.height;

    // Top brass collection plate / disc
    const topCX = x + Math.floor(w / 2);
    const topCY = y + 3;
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(topCX - 6, topCY, 12, 3);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(topCX - 4, topCY, 8, 1);

    // Insulating cork & brass rod down into flask
    ctx.fillStyle = '#78350f';
    ctx.fillRect(topCX - 4, topCY + 3, 8, 3);

    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(topCX - 1, topCY + 6, 2, 10);

    // Glass Flask Bell jar
    const flaskX = x + 2;
    const flaskY = topCY + 6;
    const flaskW = w - 4;
    const flaskH = h - (flaskY - y) - 2;

    ctx.fillStyle = 'rgba(224, 242, 254, 0.3)';
    ctx.fillRect(flaskX, flaskY, flaskW, flaskH);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(flaskX, flaskY, flaskW, flaskH);

    // Gold Leaves at bottom of rod inside flask!
    // When player gets close (electrostatic induction), leaves repel and spread apart!
    const leafSpread = Math.min(8, Math.max(2, 12 - playerDist / 12));
    const rodEndY = topCY + 15;

    ctx.strokeStyle = '#eab308'; // Pure gold foil
    ctx.lineWidth = 1.5;

    // Left gold leaf
    ctx.beginPath();
    ctx.moveTo(topCX, rodEndY);
    ctx.lineTo(topCX - leafSpread, rodEndY + 10);
    ctx.stroke();

    // Right gold leaf
    ctx.beginPath();
    ctx.moveTo(topCX, rodEndY);
    ctx.lineTo(topCX + leafSpread, rodEndY + 10);
    ctx.stroke();

    // Gold sheen
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(topCX - leafSpread - 1, rodEndY + 8, 2, 2);
    ctx.fillRect(topCX + leafSpread - 1, rodEndY + 8, 2, 2);

    // Small repulsion field glow at leaves when activated
    if (leafSpread > 4) {
      ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
      ctx.beginPath();
      ctx.arc(topCX, rodEndY + 6, leafSpread + 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw Faraday Cage (Faraday-kalitka - Safe Zone & Checkpoint)
  public static drawFaradayCage(ctx: CanvasRenderingContext2D, app: ElectroApparatus, time: number, playerInside: boolean) {
    const x = Math.floor(app.x);
    const y = Math.floor(app.y);
    const w = app.width;
    const h = app.height;

    // Steel base plate
    ctx.fillStyle = '#334155';
    ctx.fillRect(x, y + h - 4, w, 4);

    // Grounding wire to earth
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + h - 2);
    ctx.lineTo(x - 6, y + h + 4);
    ctx.stroke();

    // Metal Dome Frame / Pillars
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 6);

    // Wire Mesh Grid (Conductive electrostatic shield)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.lineWidth = 1;
    // Vertical mesh wires
    for (let px = x + 6; px < x + w - 2; px += 6) {
      ctx.beginPath();
      ctx.moveTo(px, y + 2);
      ctx.lineTo(px, y + h - 4);
      ctx.stroke();
    }
    // Horizontal mesh wires
    for (let py = y + 6; py < y + h - 4; py += 6) {
      ctx.beginPath();
      ctx.moveTo(x + 2, py);
      ctx.lineTo(x + w - 2, py);
      ctx.stroke();
    }

    // Active Shield Glow when player is inside
    if (playerInside) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fillRect(x + 2, y + 2, w - 4, h - 6);

      // Deflected spark arcs on exterior mesh
      if (Math.random() < 0.6) {
        ctx.strokeStyle = '#ffffff';
        const sx = x + Math.random() * w;
        ctx.beginPath();
        ctx.moveTo(sx, y + 2);
        ctx.lineTo(sx + (Math.random() * 8 - 4), y + 6);
        ctx.stroke();
      }
    }
  }

  // Draw Enemies (Coulomb Sentry, Flying Drone, Spark Turret)
  public static drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number) {
    ctx.save();
    const x = Math.floor(enemy.x);
    const y = Math.floor(enemy.y);
    const w = enemy.width;
    const h = enemy.height;

    if (enemy.type === 'sentry') {
      // Ground Coulomb Sentry Robot
      if (enemy.facing === 'left') {
        ctx.translate(x + w, y);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(x, y);
      }

      // Wheels / treads
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2, h - 6, w - 4, 6);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(4, h - 4, 4, 3);
      ctx.fillRect(w - 8, h - 4, 4, 3);

      // Chassis
      ctx.fillStyle = '#334155';
      ctx.fillRect(3, 8, w - 6, h - 14);

      // Copper armor plate
      ctx.fillStyle = '#b45309';
      ctx.fillRect(5, 10, w - 10, 4);

      // Eye / Scanner (charges up as shootCooldown decreases)
      const chargeRatio = 1 - Math.max(0, enemy.shootCooldown / enemy.shootInterval);
      ctx.fillStyle = chargeRatio > 0.8 ? '#ef4444' : '#eab308';
      ctx.fillRect(w - 7, 10, 5, 4);

      // Spark Cannon on front
      ctx.fillStyle = '#64748b';
      ctx.fillRect(w - 4, 12, 6, 3);

      // Antenna with spark at tip
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(6, 2, 2, 6);
      ctx.fillStyle = chargeRatio > 0.7 ? '#ef4444' : '#38bdf8';
      ctx.fillRect(5, 0, 4, 2);

      if (chargeRatio > 0.85) {
        // Charging sparks
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(w + 1 + Math.random() * 3, 11 + Math.random() * 4, 2, 2);
      }
    } else if (enemy.type === 'flying_drone') {
      // Hovering Wimshurst Drone
      ctx.translate(x, y);
      const bob = Math.sin(time * 6) * 2;

      // Central Orb Chassis
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 + bob, 8, 0, Math.PI * 2);
      ctx.fill();

      // Glowing core
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 + bob, 4, 0, Math.PI * 2);
      ctx.fill();

      // Spinning side rotor discs
      const discW = 6;
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, h / 2 - 2 + bob, discW, 4);
      ctx.fillRect(w - discW, h / 2 - 2 + bob, discW, 4);

      // Plasma emitter nozzle pointing down/player
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(w / 2 - 2, h - 4 + bob, 4, 4);

      // Small sparks trailing
      if (Math.random() < 0.4) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(w / 2 - 1, h + bob + Math.random() * 4, 2, 2);
      }
    } else if (enemy.type === 'spark_turret') {
      // Wall / Ceiling mounted Tesla Turret
      ctx.translate(x, y);

      // Base mount
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2, 0, w - 4, 6);

      // Swivel sphere
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(w / 2, 10, 7, 0, Math.PI * 2);
      ctx.fill();

      // Insulator ribs
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(w / 2 - 4, 16, 8, 2);
      ctx.fillRect(w / 2 - 3, 20, 6, 2);

      // Gun barrel
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(w / 2 - 2, 14, 4, 8);

      // Glow when ready to shoot
      const chargeRatio = 1 - Math.max(0, enemy.shootCooldown / enemy.shootInterval);
      if (chargeRatio > 0.8) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(w / 2 - 3, 22, 6, 3);
      }
    }

    ctx.restore();
  }

  // Draw Projectiles
  public static drawProjectile(ctx: CanvasRenderingContext2D, proj: Projectile, time: number) {
    const x = Math.floor(proj.x);
    const y = Math.floor(proj.y);
    const r = proj.radius;

    // Glowing spark / plasma projectile
    const color = proj.polarity === 'positive' ? '#38bdf8' : proj.polarity === 'negative' ? '#fb923c' : '#f59e0b';

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Hot white center core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, Math.max(1, r - 1.5), 0, Math.PI * 2);
    ctx.fill();

    // Electric plasma tails
    ctx.fillStyle = color;
    ctx.fillRect(x - proj.vx * 1.5, y - proj.vy * 1.5, 2, 2);
  }

  // Draw Platforms & Electro-Plates
  public static drawPlatform(ctx: CanvasRenderingContext2D, plat: Platform, time: number) {
    const x = Math.floor(plat.x);
    const y = Math.floor(plat.y);
    const w = plat.width;
    const h = plat.height;

    if (plat.type === 'solid') {
      // Industrial Lab Floor / Wall
      ctx.fillStyle = '#1e293b'; // Slate 800
      ctx.fillRect(x, y, w, h);
      
      // Top brass border rim
      ctx.fillStyle = '#475569';
      ctx.fillRect(x, y, w, 2);

      // Rivets along platform edges
      ctx.fillStyle = '#64748b';
      for (let rx = x + 8; rx < x + w - 4; rx += 24) {
        ctx.fillRect(rx, y + 4, 2, 2);
      }
    } else if (plat.type === 'repel_pos') {
      // Positively Charged Repulsion Plate (+ Anode)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y, w, h);

      // Cyan Glowing Anode Surface
      const glow = 0.6 + 0.4 * Math.sin(time * 6);
      ctx.fillStyle = `rgba(56, 189, 248, ${glow})`;
      ctx.fillRect(x, y, w, 3);

      // Repeating (+) symbols along plate
      ctx.fillStyle = '#38bdf8';
      for (let px = x + 10; px < x + w - 8; px += 20) {
        ctx.fillRect(px, y + 4, 5, 1);
        ctx.fillRect(px + 2, y + 2, 1, 5);
      }
    } else if (plat.type === 'repel_neg') {
      // Negatively Charged Repulsion Plate (- Cathode)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y, w, h);

      // Amber/Orange Glowing Cathode Surface
      const glow = 0.6 + 0.4 * Math.sin(time * 6);
      ctx.fillStyle = `rgba(251, 146, 60, ${glow})`;
      ctx.fillRect(x, y, w, 3);

      // Repeating (-) symbols along plate
      ctx.fillStyle = '#fb923c';
      for (let px = x + 10; px < x + w - 8; px += 20) {
        ctx.fillRect(px, y + 4, 5, 1);
      }
    } else if (plat.type === 'hazard_spark') {
      // High-voltage electrode hazard
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(x, y, w, h);

      // Lightning sparks dancing over surface
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x, y, w, 2);

      for (let sx = x + 4; sx < x + w - 4; sx += 8) {
        const sparkH = Math.sin(time * 15 + sx) > 0.2 ? 6 + Math.random() * 4 : 2;
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(sx, y - sparkH + 2, 2, sparkH);
      }
    } else if (plat.type === 'one_way') {
      // Grated one-way catwalk
      ctx.fillStyle = '#475569';
      ctx.fillRect(x, y, w, 4);
      ctx.fillStyle = '#1e293b';
      for (let gx = x + 4; gx < x + w; gx += 8) {
        ctx.fillRect(gx, y + 1, 2, 3);
      }
    } else if (plat.type === 'insulator') {
      // Porcelain / Amber Insulator block (cannot be electrified)
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    }
  }

  // Draw Collectibles
  public static drawCollectible(ctx: CanvasRenderingContext2D, item: Collectible, time: number) {
    if (item.collected) return;
    const x = Math.floor(item.x);
    const y = Math.floor(item.y + Math.sin(time * 5) * 3);

    if (item.type === 'leyden_shard') {
      // Miniature glowing Leyden capacitor
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x - 4, y - 6, 8, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 2, y - 4, 4, 8);
      // Top brass ball
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x - 1, y - 9, 2, 3);
    } else if (item.type === 'coulomb_charge') {
      // Rotating diamond spark
      const size = 6;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(time * 3);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-size / 4, -size / 4, size / 2, size / 2);
      ctx.restore();
    } else if (item.type === 'health_spark') {
      // Electrostatic health battery
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x - 5, y - 5, 10, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 1, y - 4, 2, 8);
      ctx.fillRect(x - 4, y - 1, 8, 2);
    }
  }

  // Draw Particles
  public static drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    for (const p of particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'spark') {
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      } else if (p.type === 'dash_ghost') {
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size * 2, p.size * 4);
      } else if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (1 - alpha) * 20, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      }
    }
    ctx.globalAlpha = 1.0;
  }
}
