We have seen that [[Clip space projection#3D perspective|perspective in WebGL]] is the opposite to perspective in the real world; we literally scale down geometry in the $Z$ axis. Cameras work similarly: instead of moving around a camera in our 3D world, we will move the world around a static camera. Why? Because the math is much simpler!

The easiest way to do this is to use the **inverse matrix**. Knowing that [[Introduction to transformations|the inverse of a transformation matrix is the opposite transformation]], we can apply the inverse of the transformation of the camera to the world, and the result will be exactly the same as if we moved the camera. 

```
This can sound counfusing at first, but it's really easy: moving the camera 30 units in X looks exactly the same as moving the entire world but the camera -30 units in X.
```

The inverse matrix of the camera transformation is called **view matrix**, because it's the matrix that define the point of view of the camera. We can apply it to the rest of transformation matrices just like this:

