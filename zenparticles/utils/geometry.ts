import { ShapeType } from '../types';

export const generatePoints = (type: ShapeType, count: number, customPoints?: [number, number, number][]): Float32Array => {
  const points = new Float32Array(count * 3);

  if (type === ShapeType.CUSTOM && customPoints && customPoints.length > 0) {
    // If we have very few points (e.g. AI generated 150), we need more jitter to fill the volume.
    // If we have many points (e.g. Face Mesh ~478), we need less jitter to keep details sharp.
    const isSparse = customPoints.length < 200;
    const jitterAmount = isSparse ? 0.15 : 0.02;

    for (let i = 0; i < count; i++) {
      const sourceIndex = i % customPoints.length;
      const [sx, sy, sz] = customPoints[sourceIndex];
      
      // Add random jitter to create volume/cloud effect around the base points
      points[i * 3] = sx + (Math.random() - 0.5) * jitterAmount;
      points[i * 3 + 1] = sy + (Math.random() - 0.5) * jitterAmount;
      points[i * 3 + 2] = sz + (Math.random() - 0.5) * jitterAmount;
    }
    return points;
  }

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    const idx = i * 3;

    switch (type) {
      case ShapeType.SPHERE: {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        x = Math.cos(theta) * Math.sin(phi);
        y = Math.sin(theta) * Math.sin(phi);
        z = Math.cos(phi);
        break;
      }
      case ShapeType.HEART: {
        const t = Math.random() * Math.PI * 2;
        const u = Math.random() * Math.PI;
        x = 1.6 * Math.sin(u)**3 * Math.sin(t);
        z = 1.6 * Math.sin(u)**3 * Math.cos(t); // Swap y/z for upright
        y = 1.3 * Math.cos(u) - 0.5*Math.cos(2*u) - 0.2*Math.cos(3*u) - 0.1*Math.cos(4*u);
        break;
      }
      case ShapeType.FLOWER: {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI;
        const r = 1 + 0.5 * Math.sin(5 * u) * Math.sin(5 * v);
        x = r * Math.sin(v) * Math.cos(u);
        y = r * Math.sin(v) * Math.sin(u);
        z = r * Math.cos(v);
        break;
      }
      case ShapeType.SATURN: {
        if (i < count * 0.3) {
          const phi = Math.acos(-1 + (2 * i) / (count * 0.3));
          const theta = Math.sqrt(count * 0.3 * Math.PI) * phi;
          x = 0.8 * Math.cos(theta) * Math.sin(phi);
          y = 0.8 * Math.sin(theta) * Math.sin(phi);
          z = 0.8 * Math.cos(phi);
        } else {
          const angle = Math.random() * Math.PI * 2;
          const dist = 1.4 + Math.random() * 0.8;
          x = dist * Math.cos(angle);
          z = dist * Math.sin(angle);
          y = (Math.random() - 0.5) * 0.1;
          const tilt = 0.4;
          const newY = y * Math.cos(tilt) - z * Math.sin(tilt);
          const newZ = y * Math.sin(tilt) + z * Math.cos(tilt);
          y = newY;
          z = newZ;
        }
        break;
      }
      case ShapeType.BUDDHA: {
         const r = Math.random();
         if (r < 0.2) {
            const u = Math.random() * Math.PI * 2;
            const v = Math.random() * Math.PI;
            x = 0.3 * Math.sin(v) * Math.cos(u);
            y = 0.8 + 0.3 * Math.sin(v) * Math.sin(u);
            z = 0.3 * Math.cos(v);
         } else if (r < 0.6) {
            const u = Math.random() * Math.PI * 2;
            const v = Math.random() * Math.PI;
            x = 0.5 * Math.sin(v) * Math.cos(u);
            y = 0.1 + 0.6 * Math.sin(v) * Math.sin(u);
            z = 0.4 * Math.cos(v);
         } else {
            const u = Math.random() * Math.PI * 2;
            const dist = Math.random() * 0.8;
            x = dist * Math.cos(u);
            z = dist * Math.sin(u);
            y = -0.4 + (Math.random() * 0.3);
         }
         break;
      }
      case ShapeType.FIREWORKS: {
         const u = Math.random() * Math.PI * 2;
         const v = Math.random() * Math.PI;
         const rad = 0.2 + Math.pow(Math.random(), 0.5) * 1.8;
         x = rad * Math.sin(v) * Math.cos(u);
         y = rad * Math.sin(v) * Math.sin(u);
         z = rad * Math.cos(v);
         break;
      }
      default:
        x = (Math.random() - 0.5) * 2;
        y = (Math.random() - 0.5) * 2;
        z = (Math.random() - 0.5) * 2;
    }

    points[idx] = x;
    points[idx + 1] = y;
    points[idx + 2] = z;
  }

  return points;
};