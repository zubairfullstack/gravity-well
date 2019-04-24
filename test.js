const vnorth = [0, 1]
const v1 = [1, 1]

function v2Normalize(p) {
  const mag = Math.sqrt((p[0] * p[0]) + (p[1] * p[1]));
  const r = []
  r[0] = p[0] / mag;
  r[1] = p[1] / mag;

  return r;
}

function v2Dot(p1, p2) {
  const r = p1[0] * p2[0] + p1[1] * p2[1]
  return r;
}

const n = v2Normalize(v1);
const d = v2Dot(vnorth, n)
console.log(n);
console.log(d);
console.log(Math.acos(d));

