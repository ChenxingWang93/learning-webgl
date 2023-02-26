Bezier curves are one of the most common curves in computer graphics. The idea behind them is very simple. Let's imagine 4 points that define 3 segments. We can define a number between 0 and 1 called $t$ that defines a point along these 3 segments (0 being the start and 1 being the end). In other words, a **linear interpolation**.
贝塞尔曲线与线性插值，定义的 $t$ 在 0 & 1之间插入一个点

<iframe style="width: 400px; height: 300px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/bezier-curve-diagram.html?maxDepth=1"></iframe>

If use the same $t$ to make a linear interpolation with the 2 new segments, we can define a new segment. Applying the $t$ linear interpolation to that segment defines all the bezier curve points.

<iframe style="width: 400px; height: 300px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/bezier-curve-diagram.html?maxDepth=4"></iframe>

So this consists of making 3 points from 4, then 2 points from 3 and finally 1 point from 2. If we compute the formula using $t$ as a variable and simplify, we'll end up with this expression (where `P1`, `P2`, `P3` and `P4`) are the 4 points that define the curve.

```js
invT = (1 - t) 
P = P1 * invT^3 + P2 * 3 * t * invT^2 + P3 * 3 * invT * t^2 + P4 * t^3
```

We can concatenate multiple curves to build more complex ones. We just have to keep in mind that if the slope of the segments that connect is not the same, the transition between curves won't be smooth.

<iframe style="width: 400px; height: 300px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/bezier-curve-edit.html"></iframe>

WebGL can't represent curves directly, so we need to split it into segments. One of the benefits of the bezier curves is that all the points are defined by the normalized variable $t$, so we can easily create a function that gets the points along it depending on an offset.

>In the following code `points` is the array of points defining the curve (or curves). The parameter `offset` is a number that allows us to define multiple curves inside `points` (like the previous graph).

```js
function getPointsOnBezierCurve(points, offset, numPoints) {
	const cpoints = [];
	for (let i = 0; i < numPoints; ++i) {
		const t = i / (numPoints - 1);
		cpoints.push(getPointOnBezierCurve(points, offset, t));
	}
	return cpoints;
}


function getPointOnBezierCurve(points, offset, t) {
	const invT = (1 - t);
	return vectorAdd(
		vectorScalarMult(points[offset + 0], invT * invT * invT),
		vectorScalarMult(points[offset + 1], 3 * t * invT * invT),
		vectorScalarMult(points[offset + 2], 3 * invT * t * t),
		vectorScalarMult(points[offset + 3], t * t *t)
	);
}
```

<iframe style="width: 400px; height: 300px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/bezier-curve-diagram.html?maxDepth=0&showCurve=true&showPoints=true"></iframe>

This would already work, but it is not very efficient. Ideally, we want more points when the curve is sharper, and less points when it is straighter. An easy solution is to check the sharpness of the curve: if it's too sharp, split it in 2 curves. Doing this recursively should make sure that we have enough points.

Splitting a bezier curve is quite easy, because the points that we generated as linear interpolations to generate the curve can be used to define a new bezier curve that is a segment of the original one.

<iframe style="width: 400px; height: 300px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/bezier-curve-diagram.html?maxDepth=4&show2Curves=true"></iframe>

The next step is to determine the "flatness" of the curve to decide whether to subdivide it or not. [Here](https://seant23.files.wordpress.com/2010/11/piecewise_linear_approzimation.pdf) is a cool algorith to achieve that. It just defines a maximum distance (called **tolerance**) between the curve and a segment defined by the start and end point. If the actual distance is greater than the given tolerance, it subdivides it. 

The implementation looks like this:

```js
function flatness(points, offset) {
	const p1 = points[offset + 0];
	const p2 = points[offset + 1];
	const p3 = points[offset + 2];
	const p4 = points[offset + 3];
	let ux = 3 * p2[0] - 2 * p1[0] - p4[0]; ux *= ux;
	let uy = 3 * p2[1] - 2 * p1[1] - p4[1]; uy *= uy;
	let vx = 3 * p3[0] - 2 * p4[0] - p1[0]; vx *= vx;
	let vy = 3 * p3[1] - 2 * p4[1] - p1[1]; vy *= vy;
	if(ux < vx) {
		ux = vx;
	}
	if(uy < vy) {
		uy = vy;
	}
	return ux + uy;
}
```

We can use this to check if the curve is too curvy. If so, we'll subdivide. If not, we'll save the points.

```js

// gets points across all segments
function getPointsOnBezierCurves(points, tolerance) {
	const newPoints = [];
	const numSegments = (points.length - 1) / 3;
	for (let i = 0; i < numSegments; ++i) {
		const offset = i * 3;
		getPointsOnCurveSubdiv(points, offset, tolerance, newPoints);
	}
	return newPoints;
}

function getPointsOnCurveSubdiv(points, offset, tolerance, newPoints) {
	const outPoints = newPoints || [];
	if (flatness(points, offset) < tolerance) {
		// just add the end points of this curve
		outPoints.push(points[offset + 0]);
		outPoints.push(points[offset + 3]);
	} else {
		// subdivide
		const t = .5;
		const p1 = points[offset + 0];
		const p2 = points[offset + 1];
		const p3 = points[offset + 2];
		const p4 = points[offset + 3];
		const q1 = v2.lerp(p1, p2, t);
		const q2 = v2.lerp(p2, p3, t);
		const q3 = v2.lerp(p3, p4, t);
		const r1 = v2.lerp(q1, q2, t);
		const r2 = v2.lerp(q2, q3, t);
		const red = v2.lerp(r1, r2, t);
		// do 1st half
		getPointsOnCurveSubdiv([p1, q1, r1, red], 0, tolerance, outPoints);
		// do 2nd half
		getPointsOnCurveSubdiv([red, r2, q3, p4], 0, tolerance, outPoints);
	}
	return outPoints;
}
```


<iframe style="width: 400px; height: 300px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/bezier-curve-diagram.html?maxDepth=0&showCurve=true&showTolerance=true"></iframe>

This algorithm makes a good job making sure that we have enough points, but doesn't get rid of unneeded points. For cleaning up the curve we can use the [Ramer Douglas Peucker algorithm](https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm). 

It's simple: given an array of points, we define a segment between the first and the last one, and compute the distance from that segment to the point that is further away from it (let's call it $P$). If the distance is smaller than some tolerance, we get rid of all the points and just keep the start and end points. Otherwise we run the algo two times more recursively: from the start point to $P$, and from the end point to $P$. 

>We don't care about computing the exact distance: just about finding out the farthest point. For that reason, The functions to compute the distance are squared to avoid making the square root, which is an expensive operation.

```js
function simplifyPoints(points, start, end, epsilon, newPoints) {
	const outPoints = newPoints || [];
	// find the most distance point from the endpoints
	const s = points[start];
	const e = points[end - 1];
	let maxDistSq = 0;
	let maxNdx = 1;
	for (let i = start + 1; i < end - 1; ++i) {
		const distSq = v2.distanceToSegmentSq(points[i], s, e);
		if (distSq > maxDistSq) {
			maxDistSq = distSq;
			maxNdx = i;
		}
	}
	// if that point is too far
	if (Math.sqrt(maxDistSq) > epsilon) {
		// split
		simplifyPoints(points, start, maxNdx + 1, epsilon, outPoints);
		simplifyPoints(points, maxNdx, end, epsilon, outPoints);
	} else {
		// add the 2 end points
		outPoints.push(s, e);
	}
	return outPoints;
}

// compute the distance squared from p to the line segment
// formed by v and w
function distanceToSegmentSq(p, v, w) {
	// Handle if the line vw has no length
	const l2 = distanceSq(v, w);
	if (l2 === 0) {
		return distanceSq(p, v);
	}
	const x = (p[0] - v[0]) * (w[0] - v[0]);
	const y = (p[1] - v[1]) * (w[1] - v[1]);
	let t = (x + y) / l2;
	// Force t to be between 0 and 1
	t = Math.max(0, Math.min(1, t));
	return distanceSq(p, lerp(v, w, t));
}

// compute the distance squared between a and b
function distanceSq(a, b) {
	const dx = a[0] - b[0];
	const dy = a[1] - b[1];
	return dx * dx + dy * dy;
}

// linear interpolation of two points by a factor of t
function lerp(a, b, t) {
	return [
		a[0] + (b[0] - a[0]) * t,
		a[1] + (b[1] - a[1]) * t,
	];
}
```

And it looks like this. With this post-clean up step, now we get way less points, so the curve is way more efficient.

<iframe style="width: 400px; height: 300px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/bezier-curve-diagram.html?maxDepth=0&showCurve=true&showDistance=true"></iframe>

Now, let's see this in action. We'll create a  bowling pin mesh by spinning a bezier curve around a vertical axis, and generating all the vertices. Then, we'll define all the triangles using indices.
