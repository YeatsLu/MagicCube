window.onload = function () {
    var scene, camera, renderer, controls;
    var raycaster, mouse, intersect;
    var lastPostion, position, moving;
    var moveMatrix = new THREE.Matrix4();
    var moveMap = {
        'R' : [ 'y',  1 ],
        'L' : [ 'y', -1 ],
        'XU': [ 'x', -1 ],
        'XD': [ 'x',  1 ],
        'ZU': [ 'z',  1 ],
        'ZD': [ 'z', -1 ]
    };
    var moveEye = new THREE.Vector3();
    var moveRight = new THREE.Vector3();
    var moveUp = new THREE.Vector3();
    var moveCenter = new THREE.Vector3();

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
            ctx.quadraticCurveTo ( x, y + height, x, y + height - radius );
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

    function genDirection( offsetX, offsetY ) {
        var direction; // XU, XD, ZU, ZD, R, L

        var pos = camera.position;

        // camera face to x axis
        if ( Math.abs( pos.x / pos.y ) > 1.732 && Math.abs( pos.x / pos.z ) > 1.732 ) {
           if ( Math.abs( offsetX ) > Math.abs( offsetY ) ) {
                direction = offsetX > 0 ? 'R' : 'L';
            } else {
                direction = offsetY > 0 
                    ? pos.x > 0 ? 'ZD' : 'ZU'
                    : pos.x > 0 ? 'ZU' : 'ZD';
            }

            console.log('face to x axis');

            return direction;
        }

        // camera face to y axis
        if ( Math.abs( pos.y / pos.x ) > 1.732 && Math.abs( pos.y / pos.z ) > 1.732 ) {
            console.log('face to y axis');

            moveEye.subVectors( camera.position, moveCenter ).normalize();
            moveRight.crossVectors( camera.up, moveEye ).normalize();
            moveUp.crossVectors( moveEye, moveRight );

            console.log('moveVector', moveUp);

            // up to z axis
            if ( Math.abs( moveUp.z ) >= Math.abs( moveUp.x ) ) {
                if ( moveUp.z <= 0 ) {
                    if ( Math.abs( offsetX ) > Math.abs( offsetY ) ) {
                        direction = offsetX > 0 
                            ? pos.y > 0 ? 'ZD' : 'ZU'
                            : pos.y > 0 ? 'ZU' : 'ZD';
                    } else {
                        direction = offsetY > 0 
                            ? pos.y > 0 ? 'XD' : 'XU'
                            : pox.y > 0 ? 'XU' : 'XD';
                    }

                    return direction;
                } else {
                    if ( Math.abs( offsetX ) > Math.abs( offsetY ) ) {
                        direction = offsetX > 0 
                            ? pos.y > 0 ? 'ZU' : 'ZD'
                            : pos.y > 0 ? 'ZD' : 'ZU';
                    } else {
                        direction = offsetY > 0 
                            ? pos.y > 0 ? 'XU' : 'XD'
                            : pos.y > 0 ? 'XD' : 'XU';
                    }

                    return direction;
                }
            }
            // up to x axis 
            else {
                if ( moveUp.x < 0 ) {
                    if ( Math.abs( offsetX ) > Math.abs( offsetY ) ) {
                        direction = offsetX > 0
                            ? pos.y > 0 ? 'XU' : 'XD'
                            : pos.y > 0 ? 'XD' : 'XU';
                    } else {
                        direction = offsetY > 0 
                            ? pos.y > 0 ? 'ZD' : 'ZU'
                            : pos.y > 0 ? 'ZU' : 'ZD';
                    }

                    return direction;
                } else {
                    if ( Math.abs( offsetX ) > Math.abs( offsetY ) ) {
                        direction = offsetX > 0 
                            ? pos.y > 0 ? 'XU' : 'XD'
                            : pos.y > 0 ? 'XD' : 'XU';
                    } else {
                        direction = offsetY > 0 
                            ? pos.y > 0 ? 'ZU' : 'ZD'
                            : pos.y > 0 ? 'ZD' : 'ZU';
                    }

                    return direction;
                }
            }

            if ( Math.abs( offsetX ) > Math.abs( offsetY ) ) {
                direction = offsetX > 0 
                    ? pos.y > 0 ? 'ZD' : 'ZU'
                    : pos.y > 0 ? 'ZU' : 'ZD';
            } else {
                direction = offsetY > 0 ? 'XD' : 'XU';
            }
        }

        // camera face to z axis
        if ( Math.abs( pos.z / pos.x ) > 1.732 && Math.abs( pos.z / pos.y ) > 1.732 ) {
            if ( Math.abs( offsetX ) > Math.abs( offsetY ) ) {
                direction = offsetX > 0 ? 'R' : 'L';
            } else {
                direction = offsetY > 0 
                    ? pos.z > 0 ? 'XD' : 'XU'
                    : pos.z > 0 ? 'XU' : 'XD';
            }

            console.log('face to z axis');

            return direction;
        }

        if ( Math.abs( offsetX ) / Math.abs( offsetY ) > 1.732 ) {
            direction = offsetX >= 0 ? 'R' : 'L';
        } else {
            if ( offsetX >= 0 ) {
                direction = offsetY > 0 ? 'ZD' : 'XU';
            } else {
                direction = offsetY > 0 ? 'XD' : 'ZU';
            }
        }

        return direction;
    }

    function mousedown( e ) {
        lastPostion = { x: e.offsetX, y: e.offsetY };

        mouse.x = ( e.offsetX / container.width ) * 2 - 1;
        mouse.y = -( e.offsetY / container.height ) * 2 + 1;

        raycaster.setFromCamera( mouse, camera );

        var intersects = raycaster.intersectObjects( scene.children );

        if ( intersects.length === 0 ) return;

        controls.enabled = false;

        intersect = intersects[ 0 ];
        position = intersect.object.position;

        moving = false;
      
        console.log('mousedown', intersects);
    };

    function mouseup( e ) {
        controls.enabled = true;
        console.log('mouseup');
    };

    function mousemove( e ) {
        if ( controls.enabled ) return;

        if ( moving ) return;

        var offsetX = e.offsetX - lastPostion.x;
        var offsetY = e.offsetY - lastPostion.y;

        if ( offsetX === 0 && offsetY === 0 ) return ;

        moving = true;

        console.log('offsetX', offsetX);
        console.log('offsetY', offsetY);


        var direction = genDirection( offsetX, offsetY );

        console.log('direction', direction);
        console.log('mousemove');


        var moveDir = moveMap[ direction ];
        var moveAxis = moveDir[ 0 ];
        var moveDiff = moveDir[ 1 ] * 3 * THREE.Math.DEG2RAD;

        moveMatrix[ 'makeRotation' + moveAxis.toUpperCase() ]( moveDiff );

        var interval = null, count = 0;

        var selected = scene.children.filter( function( child ) {
            return Math.abs( child.position[ moveAxis ] - position[ moveAxis ] ) < 0.01;
        });

        interval = setInterval( function() {
            selected.forEach( function( v ) {
                v.applyMatrix( moveMatrix );
            });

            if ( ++count === 30 ) {
                clearInterval( interval );
                interval = null;
            }

            render();
        }, 10 );

        render();
    };

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
        controls.addEventListener( 'change', render );
        controls.enableZoom = false;
        controls.enablePan = false;

        document.body.appendChild( renderer.domElement );

        renderer.domElement.addEventListener( 'mousedown', mousedown );
        renderer.domElement.addEventListener( 'mouseup', mouseup );
        renderer.domElement.addEventListener( 'mousemove', mousemove );

        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2( -1, -1 );

        createCube();
    }

    function render () {
        // let up = new THREE.Vector3().copy( camera.up );
        // console.log('camera', up.applyMatrix4( camera.matrixWorldInverse ) );

        renderer.render( scene, camera );
    }

    init();
    render();
};