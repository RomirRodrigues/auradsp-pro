async function checkSize() {
  const res = await fetch("https://aac.saavncdn.com/708/223b695ccfcbb841ea84022d763d79ee_320.mp4", { method: 'HEAD' });
  console.log("Content-Length:", res.headers.get("content-length"));
}
checkSize();
