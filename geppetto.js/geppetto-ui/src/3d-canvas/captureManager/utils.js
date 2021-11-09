export function formatDate (d) {
  return `${d.getFullYear()}${(d.getMonth() + 1)}${d.getDate()}-${pad(d.getHours(), 2)}${pad(d.getMinutes(), 2)}${pad(d.getSeconds(), 2)}`;
}

function pad (num, size) {
  let s = num + "";
  while (s.length < size) {
    s = "0" + s;
  }
  return s;
}