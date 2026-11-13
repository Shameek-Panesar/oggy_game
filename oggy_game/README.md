# Oggy’s House · 3D Map

Open **Play House.html** in a desktop browser with WebGL 2. The preview runs offline.

| Input | Action |
| --- | --- |
| WASD or arrow keys | Move the exploration marker |
| Drag on the scene | Orbit the camera |
| E | Operate the closest interactive object |
| C | Crouch to enter vents or move beneath the bed |
| M | Toggle the top-down floor plan |
| 1 / 2 | Exterior / Explore |

From the garden, approach the turquoise front door and press E. The hallway connects to the living room, kitchen, bedroom, and bathroom. The garage connects to the bathroom and utility room. The floor plan and room picker provide shortcuts to all areas.

## Project files

- **house-map.glb** is the editable/importable 3D scene with named room, shell, roof, furniture, door pivot, and duct nodes. The GLB contains geometry and materials. 
- **house-layout.json** describes units, spawn, rooms, duct connections, default collider footprints, and interaction targets. Browser interaction behavior lives in the JavaScript source. A receiving engine needs to bind its own input, colliders, and gameplay behavior to the imported nodes.
- **assets/** contains the procedural geometry and palette for exterior, interior, walls, furniture, props, and materials.
- **scripts/** contains the scene assembly, browser controller, asset export, and offline bundle build.

The building uses a meter-scale, Y-up coordinate system. The preview uses a small marker with swept-in-steps planar collision and door state checks. Its vent links use paired transitions. Bed legs have independent footprints so the crouched marker can pass between them. No character models are included.

## Rebuild after editing

With Node.js and an esbuild executable, run:

```text
node scripts/export.js
node scripts/bundle.js PATH_TO_ESBUILD_EXECUTABLE
```

The assets are modelled from scratch using the supplied screenshots as colour and layout references. The screenshots are not bundled. The vendored Three.js files are MIT-licensed. See vendor/LICENSE.
