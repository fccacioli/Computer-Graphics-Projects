function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY)
{
    
    var T = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        translationX, translationY, translationZ, 1
    ];

    
    var cx = Math.cos(rotationX);
    var sx = Math.sin(rotationX);
    var Rx = [
        1,   0,  0, 0,
        0,  cx, sx, 0,
        0, -sx, cx, 0,
        0,   0,  0, 1
    ];

    
    var cy = Math.cos(rotationY);
    var sy = Math.sin(rotationY);
    var Ry = [
         cy, 0, -sy, 0,
          0, 1,   0, 0,
         sy, 0,  cy, 0,
          0, 0,   0, 1
    ];

    
    var mvp = MatrixMult(projectionMatrix, MatrixMult(T, MatrixMult(Rx, Ry)));
    return mvp;
}


class MeshDrawer
{
    constructor()
    {
        this.prog = InitShaderProgram(meshVS, meshFS);

        this.posLoc      = gl.getAttribLocation(this.prog, 'pos');
        this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');

        this.mvpLoc     = gl.getUniformLocation(this.prog, 'mvp');
        this.swapLoc    = gl.getUniformLocation(this.prog, 'swapYZ');
        this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');
        this.samplerLoc = gl.getUniformLocation(this.prog, 'tex');

        this.vbuf = gl.createBuffer();
        this.tbuf = gl.createBuffer();

        this.tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.tex);

        
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
            gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([255, 255, 255, 255])
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this.numVerts = 0;

        gl.useProgram(this.prog);
        gl.uniform1i(this.swapLoc, 0);
        gl.uniform1i(this.showTexLoc, 1);
        gl.uniform1i(this.samplerLoc, 0);
    }

    setMesh(vertPos, texCoords)
    {
        this.numVerts = vertPos.length / 3;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tbuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    }

    swapYZ(swap)
    {
        gl.useProgram(this.prog);
        gl.uniform1i(this.swapLoc, swap ? 1 : 0);
    }

    draw(trans)
    {
        gl.useProgram(this.prog);
        gl.uniformMatrix4fv(this.mvpLoc, false, trans);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuf);
        gl.vertexAttribPointer(this.posLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.posLoc);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tbuf);
        gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.texCoordLoc);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.uniform1i(this.samplerLoc, 0);

        gl.drawArrays(gl.TRIANGLES, 0, this.numVerts);
    }

    setTexture(img)
    {
        gl.bindTexture(gl.TEXTURE_2D, this.tex);

        
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

        
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.useProgram(this.prog);
        gl.uniform1i(this.showTexLoc, 1);
    }

    showTexture(show)
    {
        gl.useProgram(this.prog);
        gl.uniform1i(this.showTexLoc, show ? 1 : 0);
    }
}


var meshVS = `
    attribute vec3 pos;
    attribute vec2 texCoord;

    uniform mat4 mvp;
    uniform bool swapYZ;

    varying vec2 vTex;

    void main()
    {
        vec3 p = pos;
        if (swapYZ) {
            p = vec3(pos.x, pos.z, pos.y);
        }
        gl_Position = mvp * vec4(p, 1.0);
        vTex = texCoord;
    }
`;

var meshFS = `
    precision mediump float;

    uniform bool showTex;
    uniform sampler2D tex;

    varying vec2 vTex;

    void main()
    {
        if (showTex) {
            gl_FragColor = texture2D(tex, vTex);
        } else {
            gl_FragColor = vec4(1.0, gl_FragCoord.z * gl_FragCoord.z, 0.0, 1.0);
        }
    }
`;