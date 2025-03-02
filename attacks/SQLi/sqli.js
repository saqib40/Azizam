// works fine 
(async () => {
    const url = "http://172.20.10.14:4000/v1/userlogin";
    const payload = { username: "admin", password: "SELECT * FROM users" };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    console.log(`SQLi Test: ${response.status} - ${text}`);
  })();