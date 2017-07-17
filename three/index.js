window.onload = function () {
    var scene, camera, renderer, controls;

    var container = { width: 500, height: 500 };
    var options = { size: 60 };

    function genTexture( width, height ) {
        var faceColors = [
            '#ff0000', // right
            '#ff8000', // left
            '#ffff00', // top
            '#ffffff', // bottom
            '#0000ff', // front
            '#00ff00'  // back
        ];

        var canvas = document.createElement( 'canvas' ),
            ctx = canvas.getContext( '2d' );

        canvas.width = width;
        canvas.height = height;

        function _drawRoundRect( x, y, width, height, radius ){
            ctx.beginPath();
            ctx.moveTo( x + radius, y );
            ctx.lineTo( x + width - radius, y );
            ctx.quadraticCurveTo( x + width, y, x + width, y + radius );
            ctx.lineTo( x + width, y + height - radius );
            ctx.quadraticCurveTo( x + width, y + height, x + width - radius, y + height );
            ctx.lineTo( x + radius, y + height );
            ctx.quadraticCurveTo (x, y + height, x, y + height - radius );
            ctx.lineTo( x, y + radius );
            ctx.quadraticCurveTo( x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
        }

        return faceColors.map( function( color ) {
            ctx.fillStyle = '#000';
            ctx.fillRect( 0, 0, width, height );

            ctx.fillStyle = color;
            _drawRoundRect( 1, 1, width - 2, height - 2, 3 );

            var img = new Image();
            img.src = canvas.toDataURL();

            var texture = new THREE.Texture( img );
            texture.anisotropy = 4;
            texture.needsUpdate = true;

            return texture;
        });
    }


    function createCube () {
        var materials = genTexture( 32, 32 ).map( function( texture ) {
            return new THREE.MeshBasicMaterial({ map: texture, overdraw: 1 });
        });

        var size = options.size / 3;

        var box = new THREE.BoxGeometry( size, size, size );

        for ( var x = 0; x < 3; x++ ) {
            for ( var y = 0; y < 3; y++ ) {
                for ( var z = 0; z < 3; z++ ) {
                    if ( x === 1 && y === 1 && z === 1 ) continue;

                    var cube = new THREE.Mesh( box, materials );
                    cube.position.set( size * (x - 1), size * (y - 1), size * (z - 1) );

                    scene.add( cube );
                }
            }
        }
    }


    function init () {
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 75, container.width / container.height, 0.1, 10000 );
        camera.position.set( 60, 60, 100 );
        // camera.lookAt(0, 0, 0);

        // var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
        // scene.add( directionalLight );

        // var light = new THREE.AmbientLight( 0x404040 ); // soft white light
        // scene.add( light );

        // var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
        // scene.add( light );


        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize( container.width, container.height );
        renderer.setClearColor( 0x1d1f20, 1 );

        controls = new THREE.OrbitControls( camera, renderer.domElement );
        controls.addEventListener( 'change', render ); // remove when using animation loop

        document.body.appendChild( renderer.domElement );

        createCube();

        console.log('scene', scene);
    }

    function render () {
        renderer.render( scene, camera );
    }

    init();
    render();
};