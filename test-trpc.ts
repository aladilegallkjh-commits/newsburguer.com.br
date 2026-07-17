async function run() {
  try {
    const res = await fetch('https://newsburguer-com-br.onrender.com/api/trpc/menu.getAll');
    const json = await res.json();
    console.log("Full json:", JSON.stringify(json, null, 2));
  } catch (e) {
    console.error(e);
  }
}
run();
