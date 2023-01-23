GLSL stands for **Graphics Library Shader Language** and is the language in which [[Shaders|shaders]] are written. It is similar to C and is designed to do the mathematical operations necessary to rasterize graphics.

It has types like `vec2`, `vec3` and `vec4` for vectors and `mat2`, `mat3` and `mat4` for square arrays. In addition, it has the most common arithmetic operators. As long as it makes mathematical sense, it is possible to do operations between elements of different types (e.g. number-vector, number-matrix, vector-matrix).

```c
vec4 a = vec4(1, 2, 3, 4);
vec4 b = a * 2.0;
// b is vec4(2, 4, 6, 8);
```

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
