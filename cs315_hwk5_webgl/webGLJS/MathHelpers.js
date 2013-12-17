
var UNIT_X = [1, 0, 0];
var UNIT_Y = [0, 1, 0];
var UNIT_Z = [0, 0, 1];


function deg2rad(ang) {
	return ang / 57.2957795;
}


// returns an array of length 0, 1, or 2 based on how many values the equation results in
function quadratic(a, b, c) {
	var dis = b*b - 4 * a * c;

	if (dis < 0) {
		return [];
	}
	else if (dis == 0) {
		return [ -b / (2*a) ];
	}
	else {
		dis = Math.sqrt(dis);
		return [
			(-b + dis) / (2*a),
			(-b - dis) / (2*a),
		];
	}
}


// takes a vec2 point and 2 vec2 pts defining the upper left and lower right
// points of a rectangle and returns true if that point is inside the rectangle
function pointInRectangle(pt, a, b) {
	return (pt[0] >= a[0] && pt[0] <= b[0] &&
			pt[1] <= a[1] && pt[1] >= b[1]);
}


// takes a vec2 pt, a vec2 center, and a radius, and returns true if the point is
// inside the circle defined by that center and radius
function pointInCircle(pt, center, radius) {
	var squaredRadius = radius * radius;
	var ptDistSquared = vec2.squaredDistance(pt, center);
	return (squaredRadius <= ptDistSquared);
}


// takes a line defined by two vec2s a and b, and a circle defined by a vec2 center
// and a radius, and returns true if that line intersects with that circle
function lineIntersectsCircle(a, b, center, radius) {
	var d = [0, 0];
	vec2.sub(d, b, a);

	var f = [0, 0];
	vec2.sub(f, a, center);

	var t = quadratic(
		vec2.dot(d, d),
		2 * vec2.dot(f, d),
		vec2.dot(f, f) - radius * radius
	);

	if (t.length == 0) {
		return false;
	}
	else {
		if (t[0] >= 0 && t[0] <= 1) {
			return true;
		}

		if (t.length == 2 && t[1] >=0 && t[1] <= 1) {
			return true;
		}

		return false;
	}
}
