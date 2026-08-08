async function checkAudius() {
  const res = await fetch("https://discoveryprovider.audius.co/v1/tracks/search?query=vasaikar+masala&app_name=auradsp");
  const json = await res.json();
  console.log("Audius results:", json.data.map(t => t.title));
}
checkAudius();
