# infrastructure-three

Wraps Three.js (scene, renderer, animation loop) behind `ThreeSceneEngine`
so `presentation-*` libs never import Three.js directly. Real scene
content is implemented in a later plan. May depend on `domain` and
`shared-util`. Only the app composition root imports this lib directly.
