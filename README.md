WebGL Mesh Renderer & Texture Mapping

Un visualizzatore di mesh 3D interattivo sviluppato in WebGL, capace di caricare modelli in formato OBJ e applicare texture dinamiche.

Funzionalità principali
- **Pipeline di Trasformazione:** Implementazione della matrice Model-View-Projection per il corretto posizionamento e la prospettiva degli oggetti nello spazio 3D.
- **Mesh Drawing:** Gestione di vertex buffer complessi per il rendering di geometrie 3D caricate dinamicamente (parser OBJ integrato).
- **Texture Mapping:** Implementazione di UV mapping per applicare immagini 2D sulle superfici 3D, con switch per visualizzazione wireframe/texture.
- **Supporto Assi:** Gestione della trasformazione degli assi Y-Z per modelli con diversi orientamenti.

Dettagli Tecnici
- **GLSL Shaders:** Utilizzo di vertex e fragment shader custom per il calcolo della profondità e il rendering del colore basato sulle coordinate texture.
- **Geometria:** Gestione di triangoli e vertici per il rendering di mesh poligonali complesse (es. Utah Teapot).
