Nesting means creating a parent-child relationship between two geometries. That is, all transformations of the parent are applied to the child. For example, when in a video game a character carries an object, we usually want that every time the character moves, the object goes with it. In other words, the object would be nested in the character.

Nesting coordinates is very easy thanks to transformation matrices. If an object is a child of another, to find the total transformation of the child, it is enough to multiply the total transformation of the parent to the local transformation of the child. If P is the parent and C is the child:

$$C_{global} = C_{local} \times P_{global}$$

>The order is fundamental: **the parent must be to the right** of the product, since transformations are always applied from right to left, and the starting point of the child is the transformation of the parent.
