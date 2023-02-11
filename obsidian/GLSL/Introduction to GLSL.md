GLSL stands for **Graphics Library Shader Language** and is the language in which [[Shaders|shaders]] are written. It is similar to C and is designed to do the mathematical operations necessary to rasterize graphics.

### Types

The most common types are `float` (used very often), `int` and `bool` (used ocasionally).  It also has other types like `vec2`, `vec3` and `vec4` for vectors and `mat2`, `mat3` and `mat4` for square arrays. 

Variables can also have **type qualifiers** preceding the types to define [[Shaders|input data]] for that shader file.

```c
varying vec4 example1;
uniform vec4 example2;
```

GLSL has very strong typing. Even literals have types. The following example will give an error because literal 1 is an `int`, and we are trying to assign it to a float.

```c
float f = 1;
```

There are two ways to do this without errors:

```c
// Option 1 - Use a float
float f = 1.0;

// Option 2 - Cast to a float
float f = float(1);
```

It should be noted that constructors such as `vec4()` do the casting to `float` internally.

### Operators

GLSL has the usual arithmetic operators. These operators are generally **component wise**, applying the following rules:

```c
vec4 a = vec4(1, 2, 3, 4);
vec4 b = a * 2.0;
// b is vec4(2, 4, 6, 8)

vec c = vec4(1, 2, 3, 4);
vec d = a * c;
// d is vec4(1*1, 2*2, 3*3, 4*4)
```

There is only one exception to this: all the operations regarding matrices. In this case, the mathematical operations will apply (e.g. matrix product). To make matrix component wise multiplication we have to use the built-in function `matrixCompMult`.

```c
mat4 m1 = ...
mat4 m2 = ...
mat4 m3 = ...

// Normal matrix multiplication
m1 = m2 * m3;

// Component wise matrix multiplication
m1 = matrixCompMult(m2, m3);
```


### Control flow

We can use `if` and `else` like in C++. 

```c
if(condition) {
	// ...
} else if(more_condition) {
	// ...
} else {
	// ...
}
```

### Loops

The standard loops are supported. They are similar to C++, and we can use `break`, `continue` and `return`.

```c
for(int i = 0; i < 10; i++) {
	// ...
}

int i = 0;
while(i < 10) {
	// ...
	i++;
}

```

### Functions

GLSL also allows to declare and use functions with the following syntax:

```c
vec4 getColor() {
	return vec4(1.0);
}

vec4 color = getColor();
```

We can also define parameters for the function as **value type** (using `in`) and as **reference type** (using `out`). This is useful for functions that return multiple values. For instance:

```c
vec4 getColor(in vec4 color, out vec4 final) {
	final = color * vec4(0.5);
}

vec4 final;
getColor(vec4(1.0), final);
```

### Accessors

There are several selectors to access the elements of a `vec`: 

> `v.x` o `v.s` o `v.r` o `v[0]` : First element.

> `v.y` o `v.t` o `v.g` o `v[1]` : Second element.

>`v.z` o `v.p` o `v.b` o `v[2]` : Third element.

>`v.w` o `v.q` o `v.a` o `v[3]` : Fourth element.

There is also syntax to copy the values of a vector in an agile way. This syntax is quite flexible and allows to express the same thing with much less code:

```c
// Option 1 - Long syntax

vec4 b = vec4(a.y, a.y, a.y, a.y);
vec4 c = vec4(a.r, a.g, a.b, a.a);
vec4 d = vec4(a.x, a.y, a.z, a.w);

// Option 2 - Short syntax

vec4 b = a.yyyy;
vec4 c = a.rgba;
vec4 d = vec4(a.xyz, a.w);
```

### Built-in functions

GLSL has many built-in functions. Some of them allow operating on multiple data simultaneously. For example, the function to calculate the sento has this form:

```c
T sin(T angle);
```

`T` can be `float`, `vec2`, `vec3` or `vec4`. If we pass a `vec4`, we get a new `vec4` in which each element is the sine of the element of the initial `vec4`.

```c
vec4 s = sin(v);
```

Sometimes one argument is a `float` and the rest is `T`. This means that the `float` will be applied to all elements of the rest arguments. For example:

```c
// This:
vec4 m = mix(v1, v2, f);

// Is the same as this:
vec4 m = vec4(
	mix(v1.x, v2.x, f),
	mix(v1.y, v2.y, f),
	mix(v1.z, v2.z, f),
	mix(v1.w, v2.w, f)
);
```

