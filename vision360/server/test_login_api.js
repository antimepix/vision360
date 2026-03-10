async function test() {
    const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "ponassie", role: "damien" })
    });
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}
test();
