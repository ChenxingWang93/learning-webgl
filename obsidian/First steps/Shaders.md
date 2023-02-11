WebGL requires instructions to create graphics. These instructions are given as a pair of functions called **shaders**: [[Shaders#Vertex shader|Vertex shader]] and [[Shaders#Fragment shader|Fragment shader]]. The combination of both is called **program**. WebGL applications are usually composed of many **programs**.  Shaders are run on the GPU and are written in a language called **GLSL** (GL Shader Language), which is very similar to C. 

>Both the vertex and the fragment shader have an entry point: a `main` function with no parameters and no return type (`void`).

There are 4 ways to pass data to the **shaders** (labels indicate which type of shader can receive that input):

**✅ Buffers/attributes** ` Vertex `

**Buffers** are arrays of binary data. They typically contain data such as vertex positions, normals, UV coordinates, vertex colour, etc. The GPU reads them sequentially; a **vertex shader** is executed repeatedly and at each iteration the corresponding value is extracted from each buffer.

The **attributes** are used to determine how to extract data from the buffers. For example, the vertex positions can be defined as an array of 32-bit floats in which there are 3 numbers assigned to each vertex (the x, y, and z coordinates). The offset of the data in the array can also be specified.

The state of the **attributes**, which **buffers** are assigned to each one and how to extract data from those buffers are data that are stored in objects called **vertex array object** or **VAO**.

**✅ Uniforms** ` Vertex ` ` Fragment `

Global variables that remain constant throughout the draw call, unlike **varyings**.

**✅ Textures** ` Vertex ` ` Fragment `

Textures are arrays of data. They are usually images, but they can contain any type of data.

**✅ Varyings** ` Fragment `

The **varyings** are a means for the **vertex shader** to pass data to the **fragment shader**. They are interpolated at each iteration of the shader, unlike **uniforms**. 