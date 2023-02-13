Once we have [[Loading a texture|loaded a texture]] we can easily apply effects on it. A simple effect would be changing the color channels in the fragment shader:

```c

#version 300 es  
  
precision highp float;
  
uniform sampler2D u_image;
  
in vec2 v_texCoord;
out vec4 outColor;
  
void main() {
	outColor = texture(u_image, v_texCoord).bgra;
}
```

This is nice but still a bit basic. To apply more complex effect we will need to get information of the pixels around the current pixel. We can easily do that by getting the equivalent of 1 pixel in the **texture space**, which is simply: 1 / resolution.

For instance, let's take the pixels to the left and to the right of the current one and compute the average color between the three.

```c
#version 300 es  
  
precision highp float;
  
uniform sampler2D u_image;
  
in vec2 v_texCoord;
  
out vec4 outColor;
  
void main() {
	vec2 onePixel = vec2(1) / vec2(textureSize(u_image, 0));
	vec2 rightPixelLoc = v_texCoord + vec2(onePixel.x, 0.0);
	vec2 leftPixelLoc = v_texCoord - vec2(onePixel.x, 0.0);
	
	vec4 currentPixel = texture(u_image, v_texCoord);
	vec4 rightPixel = texture(u_image, rightPixelLoc);
	vec4 leftPixel = texture(u_image, leftPixelLoc);
	
	vec4 averageColor = (currentPixel + rightPixel + leftPixel) / 3.0
	
	outColor = averageColor;
}
```

Now that we know how to reference pixels we can just use convolution kernels to apply effects. A convolution kernel is just a 3x3 matrix where each entry is a value used to multiply the 8 pixels around the current pixel. We then divide the result by the weight of the kernel (the sum of all the values of the kernel) if it's greater than 1. 

___
[Here](https://docs.gimp.org/2.6/en/plug-in-convmatrix.html) is a nice article about kernels and [here](https://www.codeproject.com/Articles/6534/Convolution-of-Bitmaps) some example kernels.
___

Let's use an edge detection kernel and apply it:

```c
#version 300 es  
  
precision highp float;
  
uniform sampler2D u_image;
  
in vec2 v_texCoord;
  
uniform float u_kernel[9];
uniform float u_kernelWeight
  
out vec4 outColor;
  
void main() {
	vec2 onePixel = vec2(1) / vec2(textureSize(u_image, 0));
	
	vec2 leftTop = v_texCoord + onePixel * vec2(-1, -1);
	vec2 top = v_texCoord + onePixel * vec2(0, -1)
	vec2 rightTop = v_texCoord + onePixel * vec2(1, -1);
	vec2 left = v_texCoord + onePixel * vec2(-1, 0);
	vec2 center = v_texCoord + onePixel * vec2(0, 0);
	vec2 right = v_texCoord + onePixel * vec2(1, 0)
	vec2 leftBottom = v_texCoord + onePixel * vec2(-1, 1);
	vec2 bottom = v_texCoord + onePixel * vec2(0, 1);
	vec2 rightBottom = v_texCoord + onePixel * vec2(1, 1);
	
	vec4 colorSum = texture(u_image, leftTop) * u_kernel[0] +
		texture(u_image, top) * u_kernel[1] +
		texture(u_image, rightTop) * u_kernel[2] +
		texture(u_image, left) * u_kernel[3] +
		texture(u_image, center) * u_kernel[4] +
		texture(u_image, right) * u_kernel[5] +
		texture(u_image, leftBottom) * u_kernel[6] +
		texture(u_image, bottom) * u_kernel[7] +
		texture(u_image, rightBottom) * u_kernel[8];
	 
	outColor = vec4((colorSum / u_kernelWeight).rgb, 1);
}
```

And we can use it from JavaScript like this:

```js
function setupKernel(gl, program) {
	const kernelLoc = gl.getUniformLocation(program, "u_kernel[0]");
	const weightLoc = gl.getUniformLocation(program, "u_kernelWeight");
	
	// prettier-ignore
	const edgeDetectKernel = [
		-1, -1, -1,
		-1,  8, -1,
		-1, -1, -1
	];
	
	const weight = computeKernelWeight(edgeDetectKernel);
	
	gl.uniform1fv(kernelLoc, edgeDetectKernel);
	gl.uniform1f(weightLoc, weight);
}
```

