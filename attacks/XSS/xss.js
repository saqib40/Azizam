// works fine
(async () => {
    const url = "http://172.20.10.14:4000/v1/userLogin";
    const payload = { username: "admin", password: "<script>alert(1)</script>" };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    console.log(`XSS Test: ${response.status} - ${text}`);
  })();