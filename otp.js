document.getElementById("send-otp-btn").addEventListener("click", function () {
  let email = document.getElementById("email").value;
  if (email === "") {
      alert("Please enter your email.");
      return;
  }

  fetch("/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email }),
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          document.getElementById("otp-status").innerText = "OTP sent to your email.";
          document.getElementById("verify-form").style.display = "block";
      } else {
          document.getElementById("otp-status").innerText = "Failed to send OTP. Try again.";
      }
  });
});

document.getElementById("verify-otp-btn").addEventListener("click", function () {
  let email = document.getElementById("email").value;
  let otp = document.getElementById("otp").value;

  fetch("/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, otp: otp }),
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          document.getElementById("verify-status").innerText = "OTP Verified!";
          document.getElementById("signup-form").style.display = "block";
      } else {
          document.getElementById("verify-status").innerText = "Invalid OTP. Try again.";
      }
  });
});
